const Payment = require('../models/Payment');
const CommissionTransaction = require('../models/CommissionTransaction');
const CommissionRule = require('../models/CommissionRule');
const Settlement = require('../models/Settlement');
const RefundRequest = require('../models/RefundRequest');
const settlementService = require('../services/settlementService');
const { processRefundExecution: executeRefund } = require('../services/paymentRefundService');

/**
 * Get comprehensive platform-wide financial overview
 */
async function getPlatformFinancialOverview(req, res, next) {
  try {
    const [paymentsAgg, commissionsAgg, settlementsAgg, refundsAgg] = await Promise.all([
      // Gross successful payments volume
      Payment.aggregate([
        { $match: { status: { $in: ['successful', 'success'] } } },
        {
          $group: {
            _id: null,
            totalGrossVolume: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Platform commission breakdown
      CommissionTransaction.aggregate([
        { $match: { status: { $in: ['earned', 'settled'] } } },
        {
          $group: {
            _id: null,
            totalPlatformEarnings: { $sum: '$commissionAmount' },
            totalVendorEarnings: { $sum: '$vendorEarning' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Settlements breakdown
      Settlement.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Completed refunds
      RefundRequest.aggregate([
        { $match: { status: 'completed' } },
        {
          $group: {
            _id: null,
            totalRefunded: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const grossVolume = paymentsAgg.length > 0 ? paymentsAgg[0].totalGrossVolume : 0;
    const totalPaymentsCount = paymentsAgg.length > 0 ? paymentsAgg[0].count : 0;

    const platformCommission = commissionsAgg.length > 0 ? commissionsAgg[0].totalPlatformEarnings : 0;
    const vendorEarnings = commissionsAgg.length > 0 ? commissionsAgg[0].totalVendorEarnings : 0;

    const totalRefunded = refundsAgg.length > 0 ? refundsAgg[0].totalRefunded : 0;

    let totalSettled = 0;
    let pendingSettlements = 0;
    settlementsAgg.forEach(group => {
      if (group._id === 'completed') totalSettled += group.totalAmount;
      if (['requested', 'approved', 'processing'].includes(group._id)) pendingSettlements += group.totalAmount;
    });

    res.status(200).json({
      success: true,
      data: {
        currency: 'ETB',
        grossVolume,
        totalPaymentsCount,
        platformCommission,
        vendorEarnings,
        totalRefunded,
        totalSettled,
        pendingSettlements,
        netPlatformProfit: Math.round((platformCommission - totalRefunded * 0.08) * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all payments (paginated, filterable)
 */
async function getAllPayments(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { txRef: { $regex: req.query.search, $options: 'i' } },
        { receiptNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('user', 'name email')
        .populate('vendor', 'businessName')
        .populate('booking', 'bookingReference totalAmount date')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all commissions
 */
async function getAllCommissions(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.vendorId) query.vendor = req.query.vendorId;

    const [commissions, total] = await Promise.all([
      CommissionTransaction.find(query)
        .populate('vendor', 'businessName contact')
        .populate('booking', 'bookingReference totalAmount')
        .populate('payment', 'txRef paymentMethod')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CommissionTransaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: commissions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get commission rules
 */
async function getCommissionRules(req, res, next) {
  try {
    const rules = await CommissionRule.find()
      .populate('serviceCategory', 'name')
      .populate('vendor', 'businessName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: rules
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new commission rule
 */
async function createCommissionRule(req, res, next) {
  try {
    const rule = await CommissionRule.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing commission rule
 */
async function updateCommissionRule(req, res, next) {
  try {
    const rule = await CommissionRule.findByIdAndUpdate(
      req.params.ruleId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Commission rule not found' });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all settlement payout requests
 */
async function getAllSettlements(req, res, next) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.vendorId) query.vendor = req.query.vendorId;

    const settlements = await Settlement.find(query)
      .populate('vendor', 'businessName contact phone payoutDetails')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: settlements
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin reviews a settlement payout request (approve or reject)
 */
async function reviewSettlement(req, res, next) {
  try {
    const { action, rejectionReason, notes } = req.body;
    const settlement = await settlementService.reviewSettlement({
      settlementId: req.params.settlementId,
      adminUser: req.user,
      action,
      rejectionReason,
      notes
    });

    res.status(200).json({
      success: true,
      message: `Settlement request ${action}d successfully`,
      data: settlement
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin completes settlement payout, disbursing funds and debiting ledger
 */
async function completeSettlement(req, res, next) {
  try {
    const { providerReference, notes } = req.body;
    const settlement = await settlementService.completeSettlement({
      settlementId: req.params.settlementId,
      adminUser: req.user,
      providerReference,
      notes
    });

    res.status(200).json({
      success: true,
      message: 'Settlement payout completed and vendor ledger debited successfully',
      data: settlement
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process and execute an approved financial refund
 */
async function processRefund(req, res, next) {
  try {
    const result = await executeRefund(req.params.refundId, req.user);

    res.status(200).json({
      success: true,
      message: 'Refund executed successfully: booking updated, capacity released, commission reversed, and vendor ledger debited',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlatformFinancialOverview,
  getAllPayments,
  getAllCommissions,
  getCommissionRules,
  createCommissionRule,
  updateCommissionRule,
  getAllSettlements,
  reviewSettlement,
  completeSettlement,
  processRefund
};
