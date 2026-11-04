const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const router = express.Router();

const { protect, authorize, requireApprovedVendor } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { serviceQuerySchema, createServiceSchema, updateServiceSchema } = require('../validation/serviceSchemas');

router
  .route('/')
  .get(validate(serviceQuerySchema), getServices)
  .post(protect, authorize('vendor', 'admin'), requireApprovedVendor, validate(createServiceSchema), createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('vendor', 'admin'), requireApprovedVendor, validate(updateServiceSchema), updateService)
  .delete(protect, authorize('vendor', 'admin'), requireApprovedVendor, deleteService);

module.exports = router;
