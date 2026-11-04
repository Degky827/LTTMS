const Vendor = require('../models/Vendor');
const VendorLedger = require('../models/VendorLedger');
const CommissionTransaction = require('../models/CommissionTransaction');
const Settlement = require('../models/Settlement');
const vendorLedgerService = require('../services/vendorLedgerService');
const settlementService = require('../services/settlementService');

/**
 * Helper to resolve the authenticated vendor profile
 */
async function resolveVendor(userId) {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    const error = new Error('Vendor profile not found for this user account');
    error.statusCode = 404;
    throw error;
  }
  return vendor;
}

/**
 * Get vendor financial dashboard overview
 */
async function getOverview(req, res, next) {
  try {
    const vendor = await resolveVendor(req.user.id);
    const overview = await vendorLedgerService.getFinancialOverview(vendor._id);

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          payoutDetails: vendor.payoutDetails || null
        },
        ...overview
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get vendor financial ledger transactions (paginated)
 */
async function getTransactions(req, res, next) {
  try {
    const vendor = await resolveVendor(req.user.id);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { vendor: vendor._id };
    if (req.query.entryType) {
      query.entryType = req.query.entryType;
    }

    const [entries, total] = await Promise.all([
      VendorLedger.find(query)
        .populate('booking', 'bookingReference totalAmount date')
        .populate('payment', 'txRef paymentMethod status')
        .populate('settlement', 'settlementReference status payoutMethod')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VendorLedger.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: entries,
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
 * Get vendor commission records
 */
async function getCommissions(req, res, next) {
  try {
    const vendor = await resolveVendor(req.user.id);

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { vendor: vendor._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [commissions, total] = await Promise.all([
      CommissionTransaction.find(query)
        .populate('booking', 'bookingReference totalAmount date')
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
 * Get vendor settlement payout requests
 */
async function getSettlements(req, res, next) {
  try {
    const vendor = await resolveVendor(req.user.id);

    const query = { vendor: vendor._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const settlements = await Settlement.find(query)
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
 * Vendor requests a settlement payout
 */
async function requestSettlement(req, res, next) {
  try {
    const vendor = await resolveVendor(req.user.id);
    const { amount, payoutMethod, payoutDetails, notes } = req.body;

    const settlement = await settlementService.requestSettlement({
      vendorId: vendor._id,
      userId: req.user.id,
      amount,
      payoutMethod: payoutMethod || vendor.payoutDetails?.method || 'bank_transfer',
      payoutDetails: payoutDetails || vendor.payoutDetails || {},
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Settlement payout request submitted successfully',
      data: settlement
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getTransactions,
  getCommissions,
  getSettlements,
  requestSettlement
};
