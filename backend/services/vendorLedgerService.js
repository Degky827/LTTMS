const VendorLedger = require('../models/VendorLedger');
const Settlement = require('../models/Settlement');
const CommissionTransaction = require('../models/CommissionTransaction');
const logger = require('../utils/logger');

/**
 * Get current balance from the latest ledger entry
 */
async function getCurrentBalance(vendorId) {
  const latestEntry = await VendorLedger.findOne({ vendor: vendorId })
    .sort({ createdAt: -1, _id: -1 });

  return latestEntry ? latestEntry.balanceAfter : 0;
}

/**
 * Get available balance taking into account pending settlements
 */
async function getAvailableBalance(vendorId) {
  const currentBalance = await getCurrentBalance(vendorId);

  // Sum pending settlements that have not yet been marked completed or rejected
  const pendingSettlements = await Settlement.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: { $in: ['requested', 'approved', 'processing'] }
      }
    },
    {
      $group: {
        _id: null,
        totalPending: { $sum: '$amount' }
      }
    }
  ]);

  const pendingAmount = pendingSettlements.length > 0 ? pendingSettlements[0].totalPending : 0;
  const available = Math.max(0, Math.round((currentBalance - pendingAmount) * 100) / 100);

  return {
    currentBalance,
    pendingAmount,
    availableBalance: available
  };
}

/**
 * Record vendor earning for a confirmed/paid booking
 */
async function recordBookingCredit({
  vendorId,
  bookingId,
  paymentId,
  amount,
  reference,
  description = 'Booking earnings credit'
}) {
  if (!vendorId || !amount) {
    throw new Error('vendorId and amount are required to credit vendor ledger');
  }

  // Prevent duplicate credit for the exact same payment
  if (paymentId) {
    const existing = await VendorLedger.findOne({
      vendor: vendorId,
      payment: paymentId,
      entryType: 'booking_credit'
    });
    if (existing) {
      logger.info({ vendorId, paymentId, existingId: existing._id }, 'Ledger credit already recorded');
      return existing;
    }
  }

  const currentBalance = await getCurrentBalance(vendorId);
  const creditAmount = Math.round(Number(amount) * 100) / 100;
  const balanceAfter = Math.round((currentBalance + creditAmount) * 100) / 100;

  const entry = await VendorLedger.create({
    vendor: vendorId,
    entryType: 'booking_credit',
    amount: creditAmount,
    currency: 'ETB',
    balanceAfter,
    reference: reference || `BK-CREDIT-${bookingId}`,
    description,
    booking: bookingId,
    payment: paymentId
  });

  logger.info({ vendorId, creditAmount, balanceAfter }, 'Recorded booking credit to vendor ledger');
  return entry;
}

/**
 * Record a refund debit from vendor balance
 */
async function recordRefundDebit({
  vendorId,
  bookingId,
  refundRequestId,
  amount,
  reference,
  description = 'Refund debit'
}) {
  if (!vendorId || !amount) {
    throw new Error('vendorId and amount are required to debit vendor ledger');
  }

  const currentBalance = await getCurrentBalance(vendorId);
  const debitAmount = Math.round(Number(amount) * 100) / 100;
  const balanceAfter = Math.round((currentBalance - debitAmount) * 100) / 100;

  const entry = await VendorLedger.create({
    vendor: vendorId,
    entryType: 'refund_debit',
    amount: debitAmount,
    currency: 'ETB',
    balanceAfter,
    reference: reference || `REF-DEBIT-${bookingId}`,
    description,
    booking: bookingId,
    refundRequest: refundRequestId
  });

  logger.info({ vendorId, debitAmount, balanceAfter }, 'Recorded refund debit to vendor ledger');
  return entry;
}

/**
 * Record a settlement payout debit
 */
async function recordSettlementDebit({
  vendorId,
  settlementId,
  amount,
  reference,
  description = 'Settlement payout completed'
}) {
  if (!vendorId || !amount) {
    throw new Error('vendorId and amount are required for settlement debit');
  }

  const currentBalance = await getCurrentBalance(vendorId);
  const debitAmount = Math.round(Number(amount) * 100) / 100;

  if (currentBalance < debitAmount) {
    throw new Error(`Insufficient ledger balance (${currentBalance} ETB) to debit settlement (${debitAmount} ETB)`);
  }

  const balanceAfter = Math.round((currentBalance - debitAmount) * 100) / 100;

  const entry = await VendorLedger.create({
    vendor: vendorId,
    entryType: 'settlement_debit',
    amount: debitAmount,
    currency: 'ETB',
    balanceAfter,
    reference: reference || `SET-DEBIT-${settlementId}`,
    description,
    settlement: settlementId
  });

  logger.info({ vendorId, debitAmount, balanceAfter }, 'Recorded settlement debit to vendor ledger');
  return entry;
}

/**
 * Comprehensive vendor financial overview
 */
async function getFinancialOverview(vendorId) {
  const { currentBalance, pendingAmount, availableBalance } = await getAvailableBalance(vendorId);

  // Total earned from commissions
  const earningsAgg = await CommissionTransaction.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: { $in: ['earned', 'settled'] }
      }
    },
    {
      $group: {
        _id: null,
        totalGross: { $sum: '$totalBookingAmount' },
        totalCommissionPaid: { $sum: '$commissionAmount' },
        totalVendorNet: { $sum: '$vendorEarning' }
      }
    }
  ]);

  const earnings = earningsAgg.length > 0
    ? earningsAgg[0]
    : { totalGross: 0, totalCommissionPaid: 0, totalVendorNet: 0 };

  // Total completed settlements
  const settledAgg = await Settlement.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalSettled: { $sum: '$amount' }
      }
    }
  ]);

  const totalSettled = settledAgg.length > 0 ? settledAgg[0].totalSettled : 0;

  // Recent 10 ledger transactions
  const recentTransactions = await VendorLedger.find({ vendor: vendorId })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('booking', 'bookingReference totalAmount date')
    .populate('payment', 'txRef paymentMethod');

  return {
    currency: 'ETB',
    currentBalance,
    pendingSettlementAmount: pendingAmount,
    availableBalance,
    totalGrossRevenue: earnings.totalGross,
    totalPlatformFeesPaid: earnings.totalCommissionPaid,
    totalNetEarnings: earnings.totalVendorNet,
    totalSettledAmount: totalSettled,
    recentTransactions
  };
}

module.exports = {
  getCurrentBalance,
  getAvailableBalance,
  recordBookingCredit,
  recordRefundDebit,
  recordSettlementDebit,
  getFinancialOverview
};
