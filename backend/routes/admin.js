const express = require('express');
const {
  updateVendorStatus,
  getStats
} = require('../controllers/adminController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.put('/vendors/:id/status', updateVendorStatus);
router.get('/stats', getStats);

module.exports = router;
