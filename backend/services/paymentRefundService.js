const RefundRequest = require('../models/RefundRequest');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const commissionService = require('./commissionService');
const vendorLedgerService = require('./vendorLedgerService');
const { releaseCapacity } = require('./capacityService');
const logger = require('../utils/logger');

const inFlightRefunds = new Map();

/**
 * Process and execute a financial refund for an approved RefundRequest
 */
async function processRefundExecution(refundRequestId, adminUser, options = {}) {
  const key = refundRequestId.toString();
  if (inFlightRefunds.has(key)) {
    return inFlightRefunds.get(key);
  }

  const execution = (async () => {
    const refundRequest = await RefundRequest.findById(refundRequestId)
      .populate('booking')
      .populate('vendor');

    if (!refundRequest) {
      const error = new Error('Refund request not found');
      error.statusCode = 404;
      throw error;
    }

    // Idempotency: If already processed, return immediately
    if (['completed', 'processed'].includes(refundRequest.status)) {
      return {
        success: true,
        alreadyProcessed: true,
        refundRequest
      };
    }

    const booking = refundRequest.booking;
    if (!booking) {
      const error = new Error('Associated booking not found for refund request');
      error.statusCode = 400;
      throw error;
    }

    // Find payment record
    const payment = await Payment.findOne({
      $or: [
        { booking: booking._id },
        { txRef: booking.transactionId }
      ]
    });

    const refundAmount = Math.round(Number(refundRequest.amount) * 100) / 100;

    // 1. Reverse platform commission
    let commissionReversal = null;
    try {
      commissionReversal = await commissionService.reverseCommission({
        bookingId: booking._id,
        refundAmount
      });
    } catch (commErr) {
      logger.warn({ err: commErr.message }, 'Commission reversal warning');
    }

    // 2. Debit vendor ledger for the vendor's refunded portion
    const vendorId = refundRequest.vendor?._id || refundRequest.vendor || booking.vendor;
    const vendorDebitAmount = commissionReversal ? commissionReversal.reversedVendorShare : refundAmount;

    if (vendorId) {
      try {
        await vendorLedgerService.recordRefundDebit({
          vendorId,
          bookingId: booking._id,
          refundRequestId: refundRequest._id,
          amount: vendorDebitAmount,
          reference: `REF-${refundRequest._id}`,
          description: `Refund deduction for booking ${booking.bookingReference || booking._id}`
        });
      } catch (ledgerErr) {
        logger.warn({ err: ledgerErr.message }, 'Vendor ledger refund debit warning');
      }
    }

    // 3. Update payment status
    if (payment) {
      const isFullRefund = refundAmount >= payment.amount;
      payment.status = isFullRefund ? 'refunded' : 'partially_refunded';
      await payment.save();
    }

    // 4. Update booking status
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save({ validateBeforeSave: false });

    // 5. Release capacity reservation
    try {
      if (booking.service && booking.date) {
        await releaseCapacity(
          booking.service._id || booking.service,
          booking.date,
          booking.timeSlot || 'all_day',
          booking.guests || 1,
          false
        );
      }
    } catch (capErr) {
      logger.warn({ err: capErr.message }, 'Capacity release warning during refund execution');
    }

    // 6. Mark refund request as completed/processed
    refundRequest.status = 'completed';
    refundRequest.processedAt = new Date();
    if (adminUser) {
      refundRequest.processedBy = adminUser.id || adminUser._id;
    }
    await refundRequest.save();

    logger.info({ refundRequestId, refundAmount }, 'Refund execution completed successfully');

    return {
      success: true,
      alreadyProcessed: false,
      refundRequest,
      refundAmount,
      commissionReversal
    };
  })();

  inFlightRefunds.set(key, execution);
  try {
    return await execution;
  } finally {
    inFlightRefunds.delete(key);
  }
}

module.exports = {
  processRefundExecution
};
