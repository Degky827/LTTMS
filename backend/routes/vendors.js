const express = require('express');
const {
  registerVendor,
  getVendors,
  getVendor
} = require('../controllers/vendorController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getVendors)
  .post(protect, registerVendor);

router.get('/:id', getVendor);

module.exports = router;
