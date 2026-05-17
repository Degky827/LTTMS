const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const User = require('../models/User');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');
const { protect } = require('../middleware/auth');

const router = express.Router();

const CHAPA_API = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CALLBACK_URL = process.env.CHAPA_CALLBACK_URL || 'http://localhost:5000/api/payments/verify';

// @desc    Initialize Chapa payment
// @route   POST /api/payments/checkout
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId).populate('user service');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    const txRef = `lttms-${booking._id}-${Date.now()}`;
    const amount = booking.totalAmount;
    const currency = 'ETB';

    const payload = {
      amount: amount.toString(),
      currency,
      email: booking.user.email,
      first_name: booking.user.name.split(' ')[0],
      last_name: booking.user.name.split(' ').slice(1).join(' ') || 'N/A',
      tx_ref: txRef,
      callback_url: `${CALLBACK_URL}/${txRef}`,
      return_url: `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/booking/${booking.service?._id || bookingId}?payment=success`,
      customization: {
        title: `Lake Tana - ${booking.service?.title || 'Booking'}`,
        description: `${booking.guests} guest(s) on ${new Date(booking.date).toLocaleDateString()}`
      }
    };

    let response;
    if (CHAPA_SECRET_KEY && CHAPA_SECRET_KEY !== 'replace-this') {
      response = await axios.post(`${CHAPA_API}/transaction/initialize`, payload, {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      // Sandbox mode - simulate successful initialization
      response = {
        data: {
          status: 'success',
          data: {
            checkout_url: `https://checkout.chapa.co/checkout/pay/${txRef}`,
            tx_ref: txRef
          }
        }
      };
    }

    booking.transactionId = txRef;
    await booking.save({ validateBeforeSave: false });

    logger.info({ bookingId: booking._id, txRef }, 'Payment checkout initialized');

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: response.data.data.checkout_url,
        txRef: response.data.data.tx_ref,
        amount,
        currency
      }
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Payment checkout failed');
    res.status(400).json({ success: false, message: err.response?.data?.message || err.message });
  }
});

// @desc    Verify payment (called by Chapa webhook + return URL)
// @route   GET /api/payments/verify/:tx_ref
// @access  Public (with signature)
router.get('/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const booking = await Booking.findOne({ transactionId: tx_ref }).populate('user').populate('service');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let verified = false;
    if (CHAPA_SECRET_KEY && CHAPA_SECRET_KEY !== 'replace-this') {
      const response = await axios.get(`${CHAPA_API}/transaction/verify/${tx_ref}`, {
        headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` }
      });
      verified = response.data.data?.status === 'success';
    } else {
      verified = true;
    }

    if (verified) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save({ validateBeforeSave: false });

      await sendEmail({
        to: booking.user.email,
        subject: 'Payment Confirmed - Lake Tana Booking',
        template: 'payment-confirmation',
        context: {
          name: booking.user.name,
          service: booking.service?.title || 'Tour',
          amount: booking.totalAmount,
          date: booking.date,
          bookingId: booking._id
        }
      });

      logger.info({ bookingId: booking._id, txRef: tx_ref }, 'Payment verified successfully');
    }

    res.status(200).json({
      success: true,
      data: { verified, paymentStatus: booking.paymentStatus }
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Payment verification failed');
    res.status(400).json({ success: false, message: err.message });
  }
});

// @desc    Chapa webhook
// @route   POST /api/payments/webhook
// @access  Public (validated via signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-chapa-signature'];
    const secret = process.env.CHAPA_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;

    if (secret && secret !== 'replace-this') {
      const hash = crypto.createHmac('sha256', secret).digest('hex');
      if (signature !== hash) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }
    }

    const event = req.body;
    const txRef = event?.data?.tx_ref || event?.tx_ref;

    if (!txRef) {
      return res.status(400).json({ success: false, message: 'Missing tx_ref' });
    }

    const booking = await Booking.findOne({ transactionId: txRef });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (event?.event === 'charge.completed' || event?.status === 'completed') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save({ validateBeforeSave: false });

      const user = await User.findById(booking.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: 'Payment Confirmed via Webhook - Lake Tana',
          template: 'payment-confirmation',
          context: {
            name: user.name,
            service: 'Booking',
            amount: booking.totalAmount,
            date: booking.date,
            bookingId: booking._id
          }
        });
      }

      logger.info({ bookingId: booking._id, txRef }, 'Webhook payment confirmed');
    }

    res.status(200).json({ success: true });
  } catch (err) {
    logger.error({ err: err.message }, 'Webhook processing failed');
    res.status(200).json({ success: false, message: err.message });
  }
});

// @desc    Get payment status for a booking
// @route   GET /api/payments/status/:bookingId
// @access  Private
router.get('/status/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).select('paymentStatus transactionId totalAmount');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
