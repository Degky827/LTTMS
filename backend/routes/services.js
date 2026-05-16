const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { serviceQuerySchema } = require('../validation/serviceSchemas');

router
  .route('/')
  .get(validate(serviceQuerySchema), getServices)
  .post(protect, authorize('vendor', 'admin'), createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('vendor', 'admin'), updateService)
  .delete(protect, authorize('vendor', 'admin'), deleteService);

module.exports = router;
