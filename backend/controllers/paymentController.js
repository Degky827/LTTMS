const Payment = require('../models/Payment');
const PaymentEvent = require('../models/PaymentEvent');
const Booking = require('../models/Booking');
const chapaService = require('../services/chapaService');
const { processPaymentVerification } = require('../services/paymentVerificationService');
const { getPaymentReceipt } = require('../services/receiptService');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Initialize payment checkout
 */
async function initializeCheckout(req, res, next) {
  try {
    const { bookingId, callbackUrl, returnUrl } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('user', 'name email phone')
      .populate('service', 'title vendor category');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Authorization: only the tourist owner or admin can initiate checkout
    const touristId = booking.user?._id ? booking.user._id.toString() : booking.user.toString();
    if (touristId !== req.user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking is already paid' });
    }

    // Check if there is an existing pending payment for this booking
    let payment = await Payment.findOne({
      booking: booking._id,
      status: 'pending'
    });

    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const txRef = payment ? payment.txRef : `LTTMS-PAY-${year}-${randomHex}`;

    const vendorId = booking.vendor || (booking.service && booking.service.vendor);

    if (!payment) {
      payment = await Payment.create({
        booking: booking._id,
        user: touristId,
        vendor: vendorId,
        service: booking.service?._id || null,
        txRef,
        amount: booking.totalAmount,
        currency: booking.currency || 'ETB',
        status: 'pending'
      });
    }

    // Call Chapa Hosted Checkout initialize API
    const touristName = booking.user?.name || 'Tourist Guest';
    const nameParts = touristName.trim().split(' ');
    const firstName = nameParts[0] || 'Tourist';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const chapaResult = await chapaService.initializePayment({
      amount: booking.totalAmount,
      currency: booking.currency || 'ETB',
      email: booking.user?.email || 'tourist@laketana.com',
      firstName,
      lastName,
      phone: booking.user?.phone || '',
      txRef,
      callbackUrl,
      returnUrl,
      title: `Lake Tana - ${booking.service?.title || 'Tour Reservation'}`,
      description: `Reservation ${booking.bookingReference || booking._id} for ${booking.guests} guest(s)`
    });

    payment.checkoutUrl = chapaResult.checkoutUrl;
    payment.providerResponseMetadata = chapaResult.rawResponse;
    await payment.save();

    booking.transactionId = txRef;
    await booking.save({ validateBeforeSave: false });

    logger.info({ bookingId: booking._id, txRef, paymentId: payment._id }, 'Payment checkout initialized successfully');

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: chapaResult.checkoutUrl,
        txRef,
        paymentId: payment._id,
        amount: booking.totalAmount,
        currency: booking.currency || 'ETB'
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify payment with Chapa and synchronize system state
 */
async function verifyPayment(req, res, next) {
  try {
    const txRef = req.params.txRef || req.params.tx_ref;
    if (!txRef) {
      return res.status(400).json({ success: false, message: 'Transaction reference is required' });
    }

    const io = req.app.get('io');
    const result = await processPaymentVerification(txRef, { io });

    res.status(200).json({
      success: true,
      data: {
        verified: result.verified,
        alreadyVerified: result.alreadyVerified,
        paymentStatus: result.payment.status,
        receiptNumber: result.payment.receiptNumber,
        booking: {
          id: result.booking?._id,
          reference: result.booking?.bookingReference,
          status: result.booking?.status,
          paymentStatus: result.booking?.paymentStatus
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process Chapa Webhook notification
 */
async function handleWebhook(req, res, next) {
  const signature = req.headers['x-chapa-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  // 1. Signature verification
  const isSignatureValid = chapaService.verifyWebhookSignature(rawBody, signature);

  const eventPayload = req.body || {};
  const eventType = eventPayload.event || eventPayload.type || 'charge.completed';
  const txRef = eventPayload.data?.tx_ref || eventPayload.tx_ref || eventPayload.reference;

  // 2. Log webhook event for audit trail
  const paymentEvent = await PaymentEvent.create({
    eventType,
    provider: 'chapa',
    rawPayload: eventPayload,
    headers: req.headers,
    signatureHeader: signature || null,
    isSignatureValid,
    processingStatus: isSignatureValid ? 'processing' : 'failed'
  }).catch(e => logger.error({ err: e.message }, 'Failed to record PaymentEvent'));

  if (!isSignatureValid) {
    logger.warn({ signature }, 'Rejected webhook due to invalid Chapa signature');
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }

  if (!txRef) {
    if (paymentEvent) {
      paymentEvent.processingStatus = 'ignored';
      await paymentEvent.save();
    }
    return res.status(400).json({ success: false, message: 'Missing transaction reference in webhook payload' });
  }

  try {
    const io = req.app.get('io');
    const result = await processPaymentVerification(txRef, { io });

    if (paymentEvent) {
      paymentEvent.processingStatus = 'processed';
      paymentEvent.relatedPayment = result.payment?._id;
      paymentEvent.relatedBooking = result.booking?._id;
      await paymentEvent.save();
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    if (paymentEvent) {
      paymentEvent.processingStatus = 'failed';
      paymentEvent.errorMessage = error.message;
      await paymentEvent.save();
    }
    logger.error({ error: error.message, txRef }, 'Error handling webhook verification');
    // Return 200 with error flag so provider doesn't endlessly spam unprocessable callbacks
    res.status(200).json({ success: false, message: error.message });
  }
}

/**
 * Get payment by transaction reference
 */
async function getPaymentByReference(req, res, next) {
  try {
    const { txRef } = req.params;
    const payment = await Payment.findOne({ txRef })
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    const isOwner = payment.user && payment.user._id.toString() === req.user.id;
    const isVendor = payment.vendor && req.user.vendorId && payment.vendor.toString() === req.user.vendorId.toString();
    const isStaff = ['admin', 'super_admin', 'support'].includes(req.user.role);

    if (!isOwner && !isVendor && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
}

/**
 * Get payment status for a booking
 */
async function getPaymentByBooking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).select('paymentStatus transactionId totalAmount user');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'support'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking payment status' });
    }

    const payment = await Payment.findOne({
      $or: [
        { booking: bookingId },
        { txRef: booking.transactionId }
      ]
    }).select('-rawWebhookPayload');

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId,
        totalAmount: booking.totalAmount,
        payment
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user's payments
 */
async function getMyPayments(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ user: req.user.id })
        .populate('booking', 'bookingReference date guests totalAmount')
        .populate('service', 'title category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ user: req.user.id })
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
 * Get official payment receipt
 */
async function getReceipt(req, res, next) {
  try {
    const { identifier } = req.params;
    const receipt = await getPaymentReceipt(identifier, req.user);
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  initializeCheckout,
  verifyPayment,
  handleWebhook,
  getPaymentByReference,
  getPaymentByBooking,
  getMyPayments,
  getReceipt
};
