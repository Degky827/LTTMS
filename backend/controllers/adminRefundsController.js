const RefundRequest = require('../models/RefundRequest');
const Payment = require('../models/Payment');
const paymentRefundService = require('../services/paymentRefundService');
const { notifyUser } = require('../utils/socket');
const sendEmail = require('../utils/email');
const logger = require('../utils/logger');

// @desc    Admin: List refund requests
// @route   GET /api/v1/admin/refunds
// @access  Private (Admin)
exports.getRefundRequests = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.vendorId) query.vendor = req.query.vendorId;

    const [refunds, total] = await Promise.all([
      RefundRequest.find(query)
        .populate('user', 'name email')
        .populate('vendor', 'businessName')
        .populate('booking', 'bookingReference totalAmount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RefundRequest.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: refunds.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: refunds
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Get single refund request detail
// @route   GET /api/v1/admin/refunds/:refundId
// @access  Private (Admin)
exports.getRefundRequestDetail = async (req, res, next) => {
  try {
    const refund = await RefundRequest.findById(req.params.refundId || req.params.id)
      .populate('user', 'name email phone')
      .populate('vendor', 'businessName contact phone')
      .populate({
        path: 'booking',
        populate: [{ path: 'service', select: 'title price category' }]
      });

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    // Associated payment
    const payment = await Payment.findOne({
      $or: [
        { booking: refund.booking?._id },
        { txRef: refund.booking?.transactionId }
      ]
    }).select('-rawWebhookPayload');

    res.status(200).json({
      success: true,
      data: {
        refund,
        payment
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Approve refund request
// @route   PATCH /api/v1/admin/refunds/:refundId/approve
// @access  Private (Admin)
exports.approveRefund = async (req, res, next) => {
  try {
    const refund = await RefundRequest.findById(req.params.refundId || req.params.id)
      .populate('user')
      .populate('booking');

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    if (['approved', 'completed', 'processed'].includes(refund.status)) {
      return res.status(400).json({ success: false, message: `Refund is already in status '${refund.status}'` });
    }

    refund.status = 'approved';
    refund.reviewedBy = req.user.id;
    refund.reviewedAt = new Date();
    if (req.body.adminNote) refund.adminNote = req.body.adminNote;
    await refund.save();

    // Trigger financial execution (Step 7)
    const execution = await paymentRefundService.processRefundExecution(refund._id, req.user);

    // Notify user
    if (refund.user) {
      notifyUser(refund.user._id, 'refund:approved', {
        refundId: refund._id,
        amount: refund.amount,
        status: 'approved'
      });

      if (refund.user.email) {
        sendEmail({
          to: refund.user.email,
          subject: 'Refund Approved - Lake Tana Booking',
          template: 'refund-update',
          context: {
            name: refund.user.name,
            amount: refund.amount,
            status: 'Approved',
            statusText: 'Your refund has been approved and processed',
            note: req.body.adminNote || 'Refund has been credited back to your account'
          }
        }).catch(e => logger.warn({ err: e.message }, 'Failed to dispatch refund email'));
      }
    }

    res.status(200).json({
      success: true,
      message: 'Refund approved and executed successfully',
      data: {
        refund,
        execution
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Reject refund request
// @route   PATCH /api/v1/admin/refunds/:refundId/reject
// @access  Private (Admin)
exports.rejectRefund = async (req, res, next) => {
  try {
    const { reason, adminNote } = req.body;
    const refund = await RefundRequest.findById(req.params.refundId || req.params.id).populate('user');

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    if (['completed', 'processed'].includes(refund.status)) {
      return res.status(400).json({ success: false, message: 'Completed refunds cannot be rejected' });
    }

    refund.status = 'rejected';
    refund.reviewedBy = req.user.id;
    refund.reviewedAt = new Date();
    refund.rejectionReason = reason || 'Refund request declined according to booking cancellation policy';
    if (adminNote) refund.adminNote = adminNote;
    await refund.save();

    // Notify user
    if (refund.user) {
      notifyUser(refund.user._id, 'refund:rejected', {
        refundId: refund._id,
        reason: refund.rejectionReason
      });

      if (refund.user.email) {
        sendEmail({
          to: refund.user.email,
          subject: 'Refund Request Update - Lake Tana',
          template: 'refund-update',
          context: {
            name: refund.user.name,
            amount: refund.amount,
            status: 'Declined',
            statusText: 'Refund Request Declined',
            note: refund.rejectionReason
          }
        }).catch(e => logger.warn({ err: e.message }, 'Failed to dispatch refund rejection email'));
      }
    }

    res.status(200).json({
      success: true,
      message: 'Refund request rejected',
      data: refund
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin: Retry failed refund execution
// @route   POST /api/v1/admin/refunds/:refundId/retry
// @access  Private (Admin)
exports.retryRefund = async (req, res, next) => {
  try {
    const execution = await processRefundExecution(req.params.refundId || req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Refund execution retried successfully',
      data: execution
    });
  } catch (err) {
    next(err);
  }
};
