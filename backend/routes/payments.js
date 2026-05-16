const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const incomingSignature = req.headers['x-payment-signature'];
  if (!process.env.PAYMENT_WEBHOOK_SECRET || incomingSignature !== process.env.PAYMENT_WEBHOOK_SECRET) {
    return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
  }

  const { bookingId, transactionId, status } = req.body;
  if (!bookingId || !transactionId) {
    return res.status(400).json({ success: false, message: 'bookingId and transactionId are required' });
  }

  const paymentStatus = status === 'paid' ? 'paid' : 'unpaid';
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { paymentStatus, transactionId },
    { new: true }
  );
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  return res.status(200).json({ success: true });
});

module.exports = router;
