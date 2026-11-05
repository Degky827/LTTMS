const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const CommissionTransaction = require('../models/CommissionTransaction');
const Settlement = require('../models/Settlement');
const RefundRequest = require('../models/RefundRequest');
const SupportTicket = require('../models/SupportTicket');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');

// @desc    Platform-wide comprehensive executive overview
// @route   GET /api/v1/admin/dashboard/overview
// @access  Private (Admin)
exports.getOverview = async (req, res, next) => {
  try {
    const [
      touristCount,
      vendorStats,
      serviceStats,
      bookingStats,
      paymentStats,
      commissionStats,
      settlementStats,
      refundCount,
      ticketStats,
      reviewStats,
      recentActivity
    ] = await Promise.all([
      // 1. Tourists
      User.countDocuments({ role: 'tourist' }),

      // 2. Vendors by status
      Vendor.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
      ]),

      // 3. Services
      Service.aggregate([
        { $group: { _id: '$isActive', count: { $sum: 1 } } }
      ]),

      // 4. Bookings by status
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 5. Verified Payments volume
      Payment.aggregate([
        { $match: { status: { $in: ['successful', 'success'] } } },
        {
          $group: {
            _id: null,
            totalGross: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),

      // 6. Platform Commissions
      CommissionTransaction.aggregate([
        { $match: { status: { $in: ['earned', 'settled'] } } },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: '$commissionAmount' },
            totalVendorEarning: { $sum: '$vendorEarning' }
          }
        }
      ]),

      // 7. Settlements
      Settlement.aggregate([
        { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),

      // 8. Pending refunds
      RefundRequest.countDocuments({ status: { $in: ['submitted', 'requested', 'under_review'] } }),

      // 9. Support tickets
      SupportTicket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 10. Reviews
      Review.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // 11. Recent audit activity
      AuditLog.find()
        .populate('actor', 'name email role')
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    // Format vendors
    let totalVendors = 0, approvedVendors = 0, pendingVendors = 0, suspendedVendors = 0;
    vendorStats.forEach(v => {
      totalVendors += v.count;
      if (v._id === 'approved') approvedVendors = v.count;
      if (v._id === 'pending') pendingVendors = v.count;
      if (v._id === 'suspended') suspendedVendors = v.count;
    });

    // Format bookings
    let totalBookings = 0, pendingBookings = 0, confirmedBookings = 0, completedBookings = 0, cancelledBookings = 0;
    bookingStats.forEach(b => {
      totalBookings += b.count;
      if (b._id === 'pending') pendingBookings = b.count;
      if (b._id === 'confirmed') confirmedBookings = b.count;
      if (b._id === 'completed') completedBookings = b.count;
      if (b._id === 'cancelled') cancelledBookings = b.count;
    });

    // Format support tickets
    let openTickets = 0;
    ticketStats.forEach(t => {
      if (['open', 'assigned', 'in_progress', 'reopened'].includes(t._id)) openTickets += t.count;
    });

    // Format reviews
    let pendingReviews = 0;
    reviewStats.forEach(r => {
      if (['pending', 'flagged'].includes(r._id)) pendingReviews += r.count;
    });

    const grossVolume = paymentStats.length > 0 ? paymentStats[0].totalGross : 0;
    const verifiedPaymentsCount = paymentStats.length > 0 ? paymentStats[0].count : 0;
    const platformCommission = commissionStats.length > 0 ? commissionStats[0].totalCommission : 0;
    const vendorEarning = commissionStats.length > 0 ? commissionStats[0].totalVendorEarning : 0;

    res.status(200).json({
      success: true,
      data: {
        currency: 'ETB',
        tourists: {
          total: touristCount
        },
        vendors: {
          total: totalVendors,
          approved: approvedVendors,
          pending: pendingVendors,
          suspended: suspendedVendors
        },
        services: {
          total: (serviceStats[0]?.count || 0) + (serviceStats[1]?.count || 0)
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings
        },
        financials: {
          grossVolume,
          verifiedPaymentsCount,
          platformCommission,
          vendorEarning
        },
        actionItems: {
          pendingVendors,
          pendingRefunds: refundCount,
          openTickets,
          pendingReviews
        },
        recentActivity
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Bookings analysis
// @route   GET /api/v1/admin/dashboard/bookings
// @access  Private (Admin)
exports.getBookingsAnalysis = async (req, res, next) => {
  try {
    const [statusBreakdown, recentBookings] = await Promise.all([
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Booking.find()
        .populate('user', 'name email')
        .populate('service', 'title')
        .populate('vendor', 'businessName')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown,
        recentBookings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Revenue analysis
// @route   GET /api/v1/admin/dashboard/revenue
// @access  Private (Admin)
exports.getRevenueAnalysis = async (req, res, next) => {
  try {
    const [payments, commissions, settlements] = await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: ['successful', 'success'] } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      CommissionTransaction.aggregate([
        { $match: { status: { $in: ['earned', 'settled'] } } },
        { $group: { _id: null, totalCommission: { $sum: '$commissionAmount' }, totalVendor: { $sum: '$vendorEarning' } } }
      ]),
      Settlement.aggregate([
        { $group: { _id: '$status', total: { $sum: '$amount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        currency: 'ETB',
        grossRevenue: payments[0]?.total || 0,
        transactionsCount: payments[0]?.count || 0,
        platformCommission: commissions[0]?.totalCommission || 0,
        vendorEarnings: commissions[0]?.totalVendor || 0,
        settlementsBreakdown: settlements
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Vendors analysis
// @route   GET /api/v1/admin/dashboard/vendors
// @access  Private (Admin)
exports.getVendorsAnalysis = async (req, res, next) => {
  try {
    const [statusBreakdown, businessTypes] = await Promise.all([
      Vendor.aggregate([
        { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
      ]),
      Vendor.aggregate([
        { $group: { _id: '$businessType', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown,
        businessTypes
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Tourists analysis
// @route   GET /api/v1/admin/dashboard/tourists
// @access  Private (Admin)
exports.getTouristsAnalysis = async (req, res, next) => {
  try {
    const totalTourists = await User.countDocuments({ role: 'tourist' });
    const verifiedTourists = await User.countDocuments({ role: 'tourist', isEmailVerified: true });

    res.status(200).json({
      success: true,
      data: {
        totalTourists,
        verifiedTourists,
        unverifiedTourists: totalTourists - verifiedTourists
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Services analysis
// @route   GET /api/v1/admin/dashboard/services
// @access  Private (Admin)
exports.getServicesAnalysis = async (req, res, next) => {
  try {
    const servicesByCategory = await Service.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        servicesByCategory
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Reviews analysis
// @route   GET /api/v1/admin/dashboard/reviews
// @access  Private (Admin)
exports.getReviewsAnalysis = async (req, res, next) => {
  try {
    const [statusBreakdown, ratingBreakdown] = await Promise.all([
      Review.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Review.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$rating', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        statusBreakdown,
        ratingBreakdown
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Refunds analysis
// @route   GET /api/v1/admin/dashboard/refunds
// @access  Private (Admin)
exports.getRefundsAnalysis = async (req, res, next) => {
  try {
    const refundStats = await RefundRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        refundStats
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Support Tickets analysis
// @route   GET /api/v1/admin/dashboard/support
// @access  Private (Admin)
exports.getSupportAnalysis = async (req, res, next) => {
  try {
    const [byStatus, byCategory, byPriority] = await Promise.all([
      SupportTicket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      SupportTicket.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      SupportTicket.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        byCategory,
        byPriority
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dashboard Recent Activity from Audit Logs
// @route   GET /api/v1/admin/dashboard/recent-activity
// @access  Private (Admin)
exports.getRecentActivity = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};
