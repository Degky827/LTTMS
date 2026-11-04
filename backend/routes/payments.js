const express = require('express');
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

/**
 * @openapi
 * /payments/initialize:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Initialize Chapa payment checkout session
 *     description: Generates a unique transaction reference (txRef), calculates commission, and initializes an encrypted Chapa checkout session for a reserved booking.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: 654321000000000000000211
 *               returnUrl:
 *                 type: string
 *                 example: https://laketana.gov.et/booking/payment-status
 *     responses:
 *       200:
 *         description: Checkout session initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Payment initialized successfully' }
 *                 data: { $ref: '#/components/schemas/PaymentResponse' }
 *       400:
 *         description: Invalid booking status or capacity conflict
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Booking not found
 * /payments/checkout:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Initialize payment checkout session (alias)
 *     description: Alternate alias for /payments/initialize.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId: { type: string }
 *               returnUrl: { type: string }
 *     responses:
 *       200:
 *         description: Checkout session initialized successfully
 */
router.post('/checkout', protect, paymentController.initializeCheckout);
router.post('/initialize', protect, paymentController.initializeCheckout);

/**
 * @openapi
 * /payments/verify/{txRef}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Verify payment status with Chapa gateway
 *     description: Server-side validation of transaction reference against Chapa API. Updates payment status, commits capacity, and records ledger entries.
 *     parameters:
 *       - in: path
 *         name: txRef
 *         required: true
 *         schema:
 *           type: string
 *           example: LTTMS-PAY-2026-A1B2C3D4
 *     responses:
 *       200:
 *         description: Payment successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Payment verified successfully' }
 *                 data: { $ref: '#/components/schemas/PaymentResponse' }
 *       404:
 *         description: Transaction reference not found
 */
router.get('/verify/:txRef', paymentController.verifyPayment);
router.get('/verify/:tx_ref', paymentController.verifyPayment);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Chapa payment webhook notification endpoint
 *     description: Authenticated using HMAC-SHA256 signature in x-chapa-signature header. Processes payment confirmation asynchronously.
 *     parameters:
 *       - in: header
 *         name: x-chapa-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: HMAC-SHA256 signature calculated over the raw request payload using CHAPA_WEBHOOK_SECRET
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tx_ref: { type: string }
 *               status: { type: string, example: 'success' }
 *               amount: { type: number, example: 2500 }
 *               currency: { type: string, example: 'ETB' }
 *     responses:
 *       200:
 *         description: Webhook received and processed
 *       401:
 *         description: Invalid webhook signature
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @openapi
 * /payments/my-payments:
 *   get:
 *     tags:
 *       - Payments
 *     summary: List authenticated tourist's payments
 *     description: Retrieves payment history for the currently logged-in tourist with pagination and status filters.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of user payments
 */
router.get('/my-payments', protect, paymentController.getMyPayments);

/**
 * @openapi
 * /payments/booking/{bookingId}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment details for a specific booking
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Associated payment details
 *       404:
 *         description: Payment not found
 */
router.get('/status/:bookingId', protect, paymentController.getPaymentByBooking);
router.get('/booking/:bookingId', protect, paymentController.getPaymentByBooking);

/**
 * @openapi
 * /payments/reference/{txRef}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Lookup payment by transaction reference
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: txRef
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Transaction reference not found
 */
router.get('/reference/:txRef', protect, paymentController.getPaymentByReference);

/**
 * @openapi
 * /payments/receipt/{identifier}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Retrieve official payment receipt
 *     description: Fetches cryptographically verified PDF/JSON receipt by receiptNumber, transaction reference (txRef), or bookingId.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema: { type: string, example: 'RCP-2026-F9D1E2' }
 *     responses:
 *       200:
 *         description: Official receipt details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/ReceiptResponse' }
 *       404:
 *         description: Receipt not found
 */
router.get('/receipt/:identifier', protect, paymentController.getReceipt);

module.exports = router;
