const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const crypto = require('crypto');

/**
 * Generate or retrieve official receipt details for a payment
 */
async function getPaymentReceipt(identifier, currentUser) {
  // Can look up by _id, receiptNumber, or txRef
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId
    ? { $or: [{ _id: identifier }, { receiptNumber: identifier }, { txRef: identifier }] }
    : { $or: [{ receiptNumber: identifier }, { txRef: identifier }] };

  const payment = await Payment.findOne(query)
    .populate('user', 'name email phone')
    .populate({
      path: 'booking',
      populate: [
        { path: 'service', select: 'title category location pricing' },
        { path: 'vendor', select: 'businessName contact phone' }
      ]
    });

  if (!payment) {
    const error = new Error('Receipt or payment record not found');
    error.statusCode = 404;
    throw error;
  }

  // Access control
  if (currentUser) {
    const isOwner = payment.user && payment.user._id.toString() === currentUser.id;
    const isVendor = payment.booking?.vendor && payment.booking.vendor._id.toString() === currentUser.vendorId;
    const isStaff = ['admin', 'super_admin', 'support'].includes(currentUser.role);

    if (!isOwner && !isVendor && !isStaff) {
      const error = new Error('Not authorized to access this receipt');
      error.statusCode = 403;
      throw error;
    }
  }

  // Ensure receiptNumber exists
  if (!payment.receiptNumber) {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    payment.receiptNumber = `RCP-${year}-${randomHex}`;
    await payment.save();
  }

  const booking = payment.booking || {};
  const service = booking.service || {};
  const vendor = booking.vendor || {};
  const tourist = payment.user || {};

  return {
    success: true,
    receiptNumber: payment.receiptNumber,
    txRef: payment.txRef,
    bookingReference: booking.bookingReference || 'N/A',
    issuedAt: payment.paidAt || payment.updatedAt || new Date(),
    paymentStatus: payment.status,
    paymentMethod: payment.paymentMethod || 'chapa',
    currency: payment.currency || 'ETB',
    breakdown: {
      subtotal: payment.amount,
      serviceFee: payment.serviceFee || 0,
      totalAmount: (payment.amount || 0) + (payment.serviceFee || 0)
    },
    tourist: {
      name: tourist.name || 'Tourist',
      email: tourist.email || 'N/A',
      phone: tourist.phone || 'N/A'
    },
    service: {
      title: service.title || 'Lake Tana Tourism Service',
      category: service.category || 'Tourism',
      date: booking.date || null,
      guests: booking.guests || 1
    },
    vendor: {
      businessName: vendor.businessName || 'Lake Tana Verified Vendor',
      contact: vendor.contact || 'N/A'
    },
    issuer: {
      platform: 'Lake Tana Tourism Management System (LTTMS)',
      verificationUrl: `https://laketana.gov.et/verify-receipt/${payment.receiptNumber}`
    }
  };
}

module.exports = {
  getPaymentReceipt
};
