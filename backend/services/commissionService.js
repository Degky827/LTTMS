const CommissionRule = require('../models/CommissionRule');
const CommissionTransaction = require('../models/CommissionTransaction');
const logger = require('../utils/logger');

const DEFAULT_PLATFORM_COMMISSION_RATE = 0.08; // 8% default platform rate (5-10% range)

/**
 * Determine active commission rate for a vendor and service/category
 */
async function resolveCommissionRule({ vendorId = null, categoryId = null }) {
  const now = new Date();

  // 1. Check for vendor-specific override
  if (vendorId) {
    const vendorRule = await CommissionRule.findOne({
      vendor: vendorId,
      isActive: true,
      effectiveStartDate: { $lte: now },
      $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }]
    }).sort({ createdAt: -1 });

    if (vendorRule) {
      return {
        ruleId: vendorRule._id,
        ruleName: vendorRule.name,
        rate: vendorRule.rate,
        type: 'vendor_override'
      };
    }
  }

  // 2. Check for category-specific override
  if (categoryId) {
    const categoryRule = await CommissionRule.findOne({
      serviceCategory: categoryId,
      vendor: null,
      isActive: true,
      effectiveStartDate: { $lte: now },
      $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }]
    }).sort({ createdAt: -1 });

    if (categoryRule) {
      return {
        ruleId: categoryRule._id,
        ruleName: categoryRule.name,
        rate: categoryRule.rate,
        type: 'category_rule'
      };
    }
  }

  // 3. Check for general global active rule
  const globalRule = await CommissionRule.findOne({
    vendor: null,
    serviceCategory: null,
    isActive: true,
    effectiveStartDate: { $lte: now },
    $or: [{ effectiveEndDate: null }, { effectiveEndDate: { $gte: now } }]
  }).sort({ createdAt: -1 });

  if (globalRule) {
    return {
      ruleId: globalRule._id,
      ruleName: globalRule.name,
      rate: globalRule.rate,
      type: 'global_configured'
    };
  }

  // 4. Default hard fallback
  return {
    ruleId: null,
    ruleName: 'Default Platform Commission (8%)',
    rate: DEFAULT_PLATFORM_COMMISSION_RATE,
    type: 'standard_default'
  };
}

/**
 * Calculate and record a commission transaction for a completed payment
 */
async function calculateAndRecordCommission({ booking, payment }) {
  if (!booking || !payment) {
    throw new Error('Booking and Payment are required for commission calculation');
  }

  // Check if a commission record already exists for this payment/booking
  const existing = await CommissionTransaction.findOne({
    $or: [
      { payment: payment._id },
      { booking: booking._id }
    ]
  });

  if (existing) {
    logger.info({ bookingId: booking._id, commissionId: existing._id }, 'Commission transaction already exists');
    return existing;
  }

  const grossAmount = Math.round(Number(payment.amount || booking.totalAmount) * 100) / 100;
  const vendorId = booking.vendor || (booking.service && booking.service.vendor) || payment.vendor;
  const categoryId = booking.service?.category || null;

  const rule = await resolveCommissionRule({ vendorId, categoryId });
  const commissionRate = rule.rate;

  const commissionAmount = Math.round(grossAmount * commissionRate * 100) / 100;
  const vendorEarning = Math.round((grossAmount - commissionAmount) * 100) / 100;

  const commission = await CommissionTransaction.create({
    booking: booking._id,
    payment: payment._id,
    vendor: vendorId,
    totalBookingAmount: grossAmount,
    commissionRate,
    commissionAmount,
    vendorEarning,
    currency: payment.currency || 'ETB',
    calculationRule: rule.type,
    ruleSnapshot: {
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      rate: rule.rate,
      calculatedAt: new Date().toISOString()
    },
    status: 'earned'
  });

  logger.info(
    {
      bookingId: booking._id,
      grossAmount,
      commissionAmount,
      vendorEarning,
      commissionRate
    },
    'Commission transaction created'
  );

  return commission;
}

/**
 * Reverse or adjust commission upon refund approval
 */
async function reverseCommission({ bookingId, refundAmount }) {
  const commission = await CommissionTransaction.findOne({
    booking: bookingId,
    status: { $in: ['earned', 'pending'] }
  });

  if (!commission) {
    return null;
  }

  const grossAmount = commission.totalBookingAmount;
  const ratio = Math.min(1, refundAmount / grossAmount);

  const reversedCommission = Math.round(commission.commissionAmount * ratio * 100) / 100;
  const reversedVendorShare = Math.round(commission.vendorEarning * ratio * 100) / 100;

  if (ratio >= 0.999) {
    commission.status = 'reversed';
  }

  await commission.save();

  return {
    commissionId: commission._id,
    reversedCommission,
    reversedVendorShare,
    isFullReversal: commission.status === 'reversed'
  };
}

module.exports = {
  DEFAULT_PLATFORM_COMMISSION_RATE,
  resolveCommissionRule,
  calculateAndRecordCommission,
  reverseCommission
};
