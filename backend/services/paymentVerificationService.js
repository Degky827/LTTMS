const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const chapaService = require('./chapaService');
const commissionService = require('./commissionService');
const vendorLedgerService = require('./vendorLedgerService');
const sendEmail = require('../utils/email');
const logger = require('../utils/logger');
const crypto = require('crypto');

const inFlightVerifications = new Map();

/**
 * Perform idempotent server-side verification and status synchronization
 */
async function processPaymentVerification(txRef, options = {}) {
  if (inFlightVerifications.has(txRef)) {
    return inFlightVerifications.get(txRef);
  }

  const execution = (async () => {
    const io = options.io || null;

    // 1. Locate payment record
    let payment = await Payment.findOne({ txRef })
      .populate('booking')
      .populate('user');

    // Fallback: If not found in Payment table, check Booking transactionId
    if (!payment) {
      const booking = await Booking.findOne({ transactionId: txRef })
        .populate('user')
        .populate('service');

      if (!booking) {
        const error = new Error(`Transaction reference ${txRef} not found in system`);
        error.statusCode = 404;
        throw error;
      }

      // Create corresponding Payment document
      payment = await Payment.create({
        booking: booking._id,
        user: booking.user._id || booking.user,
        vendor: booking.vendor || (booking.service && booking.service.vendor),
        service: booking.service?._id || null,
        txRef,
        amount: booking.totalAmount,
        currency: booking.currency || 'ETB',
        status: 'pending'
      });
      payment.booking = booking;
    }

    // 2. IDEMPOTENCY CHECK:
    // If payment has already been verified and marked successful, return immediately!
    if (['successful', 'success'].includes(payment.status)) {
      logger.info({ txRef, paymentId: payment._id }, 'Payment already verified (idempotent return)');
      return {
        verified: true,
        alreadyVerified: true,
        payment,
        booking: payment.booking
      };
    }

    // 3. Verify directly with Chapa Gateway v1
    const verification = await chapaService.verifyPayment(txRef);

    if (!verification.verified) {
      payment.status = 'failed';
      payment.failedAt = new Date();
      payment.failureReason = verification.rawData?.message || 'Verification rejected by gateway';
      await payment.save();

      return {
        verified: false,
        payment,
        booking: payment.booking
      };
    }

    // 4. Update Payment to successful
    payment.status = 'successful';
    payment.verifiedAt = new Date();
    payment.paidAt = new Date();
    payment.chapaReference = verification.reference;
    payment.processorReference = verification.reference;
    payment.providerAmount = verification.amount;
    payment.providerCurrency = verification.currency;
    payment.paymentMethod = verification.paymentMethod || 'chapa';
    payment.providerResponseMetadata = verification.rawData;

    if (!payment.receiptNumber) {
      const year = new Date().getFullYear();
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      payment.receiptNumber = `RCP-${year}-${randomHex}`;
    }

    await payment.save();

    // 5. Update associated Booking
    const booking = await Booking.findById(payment.booking._id || payment.booking)
      .populate('service')
      .populate('user');

    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      if (!booking.transactionId) {
        booking.transactionId = txRef;
      }
      await booking.save({ validateBeforeSave: false });
    }

    // 6. Calculate & Record Platform Commission
    let commission = null;
    if (booking) {
      try {
        commission = await commissionService.calculateAndRecordCommission({
          booking,
          payment
        });
      } catch (commErr) {
        logger.error({ err: commErr.message, txRef }, 'Error calculating commission during verification');
      }
    }

    // 7. Credit Vendor Ledger
    const vendorId = payment.vendor || booking?.vendor || booking?.service?.vendor;
    if (vendorId && commission) {
      try {
        await vendorLedgerService.recordBookingCredit({
          vendorId,
          bookingId: booking._id,
          paymentId: payment._id,
          amount: commission.vendorEarning,
          reference: txRef,
          description: `Earning from booking ${booking.bookingReference || booking._id}`
        });
      } catch (ledgerErr) {
        logger.error({ err: ledgerErr.message, txRef }, 'Error crediting vendor ledger');
      }
    }

    // 8. Real-time updates via Socket.IO
    if (io) {
      const userId = booking?.user?._id || payment.user?._id || payment.user;
      if (userId) {
        io.to(`user:${userId}`).emit('payment:update', {
          bookingId: booking?._id,
          paymentStatus: 'paid',
          status: 'confirmed',
          receiptNumber: payment.receiptNumber
        });
        io.to(`user:${userId}`).emit('booking:update', booking);
      }
      io.to('admin').emit('payment:update', {
        bookingId: booking?._id,
        totalAmount: payment.amount,
        txRef
      });
    }

    // 9. Send Confirmation Email
    const user = booking?.user || await User.findById(payment.user);
    if (user && user.email) {
      sendEmail({
        to: user.email,
        subject: 'Payment Confirmed - Lake Tana Booking',
        template: 'payment-confirmation',
        context: {
          name: user.name,
          service: booking?.service?.title || 'Tour Service',
          amount: payment.amount,
          receiptNumber: payment.receiptNumber,
          date: booking?.date || new Date().toISOString(),
          bookingId: booking?._id
        }
      }).catch(mailErr => logger.warn({ err: mailErr.message }, 'Failed to send payment email'));
    }

    logger.info({ txRef, paymentId: payment._id, receiptNumber: payment.receiptNumber }, 'Payment verification completed');

    return {
      verified: true,
      alreadyVerified: false,
      payment,
      booking,
      commission
    };
  })();

  inFlightVerifications.set(txRef, execution);
  try {
    return await execution;
  } finally {
    inFlightVerifications.delete(txRef);
  }
}

module.exports = {
  processPaymentVerification
};
