const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { settlementRequestSchema } = require('../validation/paymentSchemas');
const vendorFinanceController = require('../controllers/vendorFinanceController');

const router = express.Router();

// All vendor finance routes require authentication and vendor/admin authorization
router.use(protect);
router.use(authorize('vendor', 'admin', 'super_admin'));

/**
 * @openapi
 * /vendor/finance/overview:
 *   get:
 *     tags:
 *       - Vendor Finance
 *     summary: Vendor financial balance, revenue, and pending payouts overview
 *     description: Returns current available ledger balance, gross revenues, platform commissions paid, and pending settlements for the authenticated vendor.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Vendor balance metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/VendorFinanceOverview' }
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Vendor authorization required
 */
router.get('/overview', vendorFinanceController.getOverview);

/**
 * @openapi
 * /vendor/finance/transactions:
 *   get:
 *     tags:
 *       - Vendor Finance
 *     summary: View vendor financial ledger transaction history
 *     description: Paginated chronological entries of credits (booking payments) and debits (settlements, commission deductions, refunds).
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: entryType
 *         schema: { type: string, enum: [credit, debit] }
 *     responses:
 *       200:
 *         description: Paginated ledger transaction entries
 */
router.get('/transactions', vendorFinanceController.getTransactions);

/**
 * @openapi
 * /vendor/finance/commissions:
 *   get:
 *     tags:
 *       - Vendor Finance
 *     summary: View commission breakdown per booking
 *     description: Detailed accounting of gross booking totals, platform commission percentage, and net vendor payout earnings.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Commission transaction history
 */
router.get('/commissions', vendorFinanceController.getCommissions);

/**
 * @openapi
 * /vendor/finance/settlements:
 *   get:
 *     tags:
 *       - Vendor Finance
 *     summary: List vendor payout settlement requests and history
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [requested, approved, processing, completed, rejected] }
 *     responses:
 *       200:
 *         description: List of vendor settlements
 *   post:
 *     tags:
 *       - Vendor Finance
 *     summary: Request a new payout settlement
 *     description: Submits a withdrawal request against available ledger balance. Verifies that the vendor has sufficient non-pending funds.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SettlementRequest'
 *     responses:
 *       201:
 *         description: Settlement request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/SettlementResponse' }
 *       400:
 *         description: Insufficient available balance or invalid bank details
 */
router.get('/settlements', vendorFinanceController.getSettlements);
router.post(
  '/settlements',
  validate(settlementRequestSchema),
  vendorFinanceController.requestSettlement
);

module.exports = router;
