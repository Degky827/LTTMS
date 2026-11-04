const Settlement = require('../models/Settlement');
const vendorLedgerService = require('./vendorLedgerService');
const logger = require('../utils/logger');

const MIN_SETTLEMENT_AMOUNT = 50; // Minimum 50 ETB threshold
const inFlightSettlements = new Map();

/**
 * Vendor initiates a settlement payout request
 */
async function requestSettlement({ vendorId, userId, amount, payoutMethod, payoutDetails, notes }) {
  const vendorKey = vendorId ? vendorId.toString() : 'global';
  if (inFlightSettlements.has(vendorKey)) {
    // Await previous in-flight request to prevent balance double-spend
    await inFlightSettlements.get(vendorKey).catch(() => {});
  }

  const execution = (async () => {
    const reqAmount = Math.round(Number(amount) * 100) / 100;

    if (isNaN(reqAmount) || reqAmount < MIN_SETTLEMENT_AMOUNT) {
      const error = new Error(`Minimum settlement payout request is ${MIN_SETTLEMENT_AMOUNT} ETB`);
      error.statusCode = 400;
      throw error;
    }

    // Check available balance
    const { availableBalance } = await vendorLedgerService.getAvailableBalance(vendorId);

    if (reqAmount > availableBalance) {
      const error = new Error(
        `Insufficient available balance (${availableBalance} ETB) for requested settlement payout of ${reqAmount} ETB`
      );
      error.statusCode = 400;
      throw error;
    }

    const settlement = await Settlement.create({
      vendor: vendorId,
      amount: reqAmount,
      currency: 'ETB',
      status: 'requested',
      payoutMethod: payoutMethod || 'bank_transfer',
      payoutDetails: payoutDetails || {},
      requestedBy: userId,
      notes: notes || null
    });

    logger.info({ vendorId, settlementId: settlement._id, amount: reqAmount }, 'Settlement payout requested');
    return settlement;
  })();

  inFlightSettlements.set(vendorKey, execution);
  try {
    return await execution;
  } finally {
    inFlightSettlements.delete(vendorKey);
  }
}

/**
 * Admin review (approve or reject) a settlement payout request
 */
async function reviewSettlement({ settlementId, adminUser, action, rejectionReason, notes }) {
  const settlement = await Settlement.findById(settlementId).populate('vendor');
  if (!settlement) {
    const error = new Error('Settlement request not found');
    error.statusCode = 404;
    throw error;
  }

  if (settlement.status !== 'requested') {
    const error = new Error(`Settlement cannot be reviewed because it is in status '${settlement.status}'`);
    error.statusCode = 400;
    throw error;
  }

  if (action === 'approve') {
    settlement.status = 'approved';
    settlement.approvedBy = adminUser.id || adminUser._id;
    settlement.approvedAt = new Date();
    if (notes) settlement.notes = (settlement.notes ? `${settlement.notes} | ` : '') + notes;
  } else if (action === 'reject') {
    settlement.status = 'rejected';
    settlement.rejectedBy = adminUser.id || adminUser._id;
    settlement.rejectedAt = new Date();
    settlement.rejectionReason = rejectionReason || 'Settlement request declined by administrator';
    if (notes) settlement.notes = (settlement.notes ? `${settlement.notes} | ` : '') + notes;
  } else {
    const error = new Error("Action must be either 'approve' or 'reject'");
    error.statusCode = 400;
    throw error;
  }

  await settlement.save();
  logger.info({ settlementId, action, status: settlement.status }, 'Settlement reviewed');
  return settlement;
}

/**
 * Admin marks settlement payout completed, debits the vendor financial ledger
 */
async function completeSettlement({ settlementId, adminUser, providerReference, notes }) {
  const settlement = await Settlement.findById(settlementId).populate('vendor');
  if (!settlement) {
    const error = new Error('Settlement request not found');
    error.statusCode = 404;
    throw error;
  }

  if (!['requested', 'approved', 'processing'].includes(settlement.status)) {
    const error = new Error(`Settlement cannot be completed from status '${settlement.status}'`);
    error.statusCode = 400;
    throw error;
  }

  // Debit ledger
  const ledgerEntry = await vendorLedgerService.recordSettlementDebit({
    vendorId: settlement.vendor._id || settlement.vendor,
    settlementId: settlement._id,
    amount: settlement.amount,
    reference: providerReference || settlement.settlementReference,
    description: `Payout via ${settlement.payoutMethod}: ${settlement.settlementReference}`
  });

  settlement.status = 'completed';
  settlement.completedAt = new Date();
  settlement.processedBy = adminUser.id || adminUser._id;
  settlement.processedAt = new Date();
  settlement.providerReference = providerReference || settlement.settlementReference;
  settlement.ledgerEntry = ledgerEntry._id;
  if (notes) settlement.notes = (settlement.notes ? `${settlement.notes} | ` : '') + notes;

  await settlement.save();
  logger.info({ settlementId, amount: settlement.amount }, 'Settlement completed and ledger debited');

  return settlement;
}

module.exports = {
  MIN_SETTLEMENT_AMOUNT,
  requestSettlement,
  reviewSettlement,
  completeSettlement
};
