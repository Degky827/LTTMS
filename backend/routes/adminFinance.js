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

router.get('/overview', adminFinanceController.getPlatformFinancialOverview);
router.get('/payments', adminFinanceController.getAllPayments);
router.get('/commissions', adminFinanceController.getAllCommissions);

// Commission rule management
router.get('/commission-rules', adminFinanceController.getCommissionRules);
router.post(
  '/commission-rules',
  validate(commissionRuleSchema),
  adminFinanceController.createCommissionRule
);
router.put(
  '/commission-rules/:ruleId',
  validate(commissionRuleSchema),
  adminFinanceController.updateCommissionRule
);

// Settlement payout workflow
router.get('/settlements', adminFinanceController.getAllSettlements);
router.patch(
  '/settlements/:settlementId/review',
  validate(reviewSettlementSchema),
  adminFinanceController.reviewSettlement
);
router.patch(
  '/settlements/:settlementId/complete',
  validate(completeSettlementSchema),
  adminFinanceController.completeSettlement
);

// Financial refund execution
router.post('/refunds/:refundId/process', adminFinanceController.processRefund);

module.exports = router;
