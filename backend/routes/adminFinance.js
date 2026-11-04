const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  reviewSettlementSchema,
  completeSettlementSchema,
  commissionRuleSchema
} = require('../validation/paymentSchemas');
const adminFinanceController = require('../controllers/adminFinanceController');

const router = express.Router();

// All admin finance routes require authentication and admin privileges
router.use(protect);
router.use(authorize('admin', 'super_admin'));

/**
 * @openapi
 * /admin/finance/overview:
 *   get:
 *     tags:
 *       - Admin Finance
 *     summary: Platform-wide executive financial summary
 *     description: Aggregates total gross payment volume, cumulative platform commissions collected, outstanding vendor balances, pending settlements, and processed refunds.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Platform-wide financial metrics
 *       403:
 *         description: Admin authorization required
 */
router.get('/overview', adminFinanceController.getPlatformFinancialOverview);

/**
 * @openapi
 * /admin/finance/payments:
 *   get:
 *     tags:
 *       - Admin Finance
 *     summary: List and search all platform payment transactions
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, successful, failed, refunded] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated payment transactions
 */
router.get('/payments', adminFinanceController.getAllPayments);

/**
 * @openapi
 * /admin/finance/commissions:
 *   get:
 *     tags:
 *       - Admin Finance
 *     summary: List platform commission earnings per transaction
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Commission ledger entries
 */
router.get('/commissions', adminFinanceController.getAllCommissions);

/**
 * @openapi
 * /admin/finance/commission-rules:
 *   get:
 *     tags:
 *       - Admin Finance
 *     summary: List active and configured platform commission rules
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Array of commission rules
 *   post:
 *     tags:
 *       - Admin Finance
 *     summary: Create new tiered or category commission rule
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommissionRuleInput'
 *     responses:
 *       201:
 *         description: Commission rule created successfully
 */
router.get('/commission-rules', adminFinanceController.getCommissionRules);
router.post(
  '/commission-rules',
  validate(commissionRuleSchema),
  adminFinanceController.createCommissionRule
);

/**
 * @openapi
 * /admin/finance/commission-rules/{ruleId}:
 *   put:
 *     tags:
 *       - Admin Finance
 *     summary: Update an existing commission rule
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommissionRuleInput'
 *     responses:
 *       200:
 *         description: Commission rule updated successfully
 */
router.put(
  '/commission-rules/:ruleId',
  validate(commissionRuleSchema),
  adminFinanceController.updateCommissionRule
);

/**
 * @openapi
 * /admin/finance/settlements:
 *   get:
 *     tags:
 *       - Admin Finance
 *     summary: List vendor settlement payout requests across platform
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [requested, approved, processing, completed, rejected] }
 *     responses:
 *       200:
 *         description: Paginated vendor settlement requests
 */
router.get('/settlements', adminFinanceController.getAllSettlements);

/**
 * @openapi
 * /admin/finance/settlements/{settlementId}/review:
 *   patch:
 *     tags:
 *       - Admin Finance
 *     summary: Review and approve/reject vendor settlement payout
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: settlementId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settlement review decision recorded
 */
router.patch(
  '/settlements/:settlementId/review',
  validate(reviewSettlementSchema),
  adminFinanceController.reviewSettlement
);

/**
 * @openapi
 * /admin/finance/settlements/{settlementId}/complete:
 *   patch:
 *     tags:
 *       - Admin Finance
 *     summary: Mark settlement payout completed with bank reference
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: settlementId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bankReference
 *             properties:
 *               bankReference:
 *                 type: string
 *                 example: CBE-TRX-20261104-98124
 *     responses:
 *       200:
 *         description: Settlement marked completed and vendor ledger updated
 */
router.patch(
  '/settlements/:settlementId/complete',
  validate(completeSettlementSchema),
  adminFinanceController.completeSettlement
);

/**
 * @openapi
 * /admin/finance/refunds/{refundId}/process:
 *   post:
 *     tags:
 *       - Admin Finance
 *     summary: Execute financial refund for approved refund request
 *     description: Debits vendor balance, rolls back platform commission, releases reserved capacity, updates payment status, and sends email notification.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: refundId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refund successfully executed
 *       400:
 *         description: Refund already executed or invalid state
 */
router.post('/refunds/:refundId/process', adminFinanceController.processRefund);

module.exports = router;
