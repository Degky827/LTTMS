const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { settlementRequestSchema } = require('../validation/paymentSchemas');
const vendorFinanceController = require('../controllers/vendorFinanceController');

const router = express.Router();

// All vendor finance routes require authentication and vendor/admin authorization
router.use(protect);
router.use(authorize('vendor', 'admin', 'super_admin'));

router.get('/overview', vendorFinanceController.getOverview);
router.get('/transactions', vendorFinanceController.getTransactions);
router.get('/commissions', vendorFinanceController.getCommissions);
router.get('/settlements', vendorFinanceController.getSettlements);
router.post(
  '/settlements',
  validate(settlementRequestSchema),
  vendorFinanceController.requestSettlement
);

module.exports = router;
