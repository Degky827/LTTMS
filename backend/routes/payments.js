const express = require('express');
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Initialize payment (both /checkout and /initialize supported for full compatibility)
router.post('/checkout', protect, paymentController.initializeCheckout);
router.post('/initialize', protect, paymentController.initializeCheckout);

// Public verification callback endpoint (both :tx_ref and :txRef supported)
router.get('/verify/:txRef', paymentController.verifyPayment);
router.get('/verify/:tx_ref', paymentController.verifyPayment);

// Webhook endpoint from Chapa (uses raw buffer captured via express.json verify hook)
router.post('/webhook', paymentController.handleWebhook);

// Tourist payment history
router.get('/my-payments', protect, paymentController.getMyPayments);

// Status and details lookup
router.get('/status/:bookingId', protect, paymentController.getPaymentByBooking);
router.get('/booking/:bookingId', protect, paymentController.getPaymentByBooking);
router.get('/reference/:txRef', protect, paymentController.getPaymentByReference);

// Official receipt retrieval
router.get('/receipt/:identifier', protect, paymentController.getReceipt);

module.exports = router;
