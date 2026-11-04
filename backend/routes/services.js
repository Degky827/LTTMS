const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  submitService,
  approveService,
  rejectService,
  publishService,
  archiveService,
  featureService,
  addServiceImage,
  updateServiceImage,
  deleteServiceImage,
  reorderServiceImages,
  getServicePricing,
  updateServicePricing,
  getServiceAvailability,
  updateServiceAvailability,
  getServiceAvailabilityCalendar,
  checkQuickAvailability
} = require('../controllers/serviceController');

const router = express.Router();

const { protect, authorize, requireApprovedVendor, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  serviceQuerySchema,
  createServiceSchema,
  updateServiceSchema,
  servicePricingSchema,
  serviceAvailabilitySchema,
  serviceImageSchema,
  serviceImageUpdateSchema,
  serviceImageReorderSchema,
  serviceModerationSchema
} = require('../validation/serviceSchemas');

/**
 * @openapi
 * /services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Discover and list tourism services
 *     description: Search and filter tourism services with caching, pagination, price range, eco-friendly filtering, category, destination, and rating.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: destination
 *         schema: { type: string }
 *       - in: query
 *         name: serviceType
 *         schema: { type: string }
 *       - in: query
 *         name: ecoFriendly
 *         schema: { type: boolean }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: rating
 *         schema: { type: number }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [featured, newest, oldest, price-low, price-high, rating, alpha] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 8 }
 *     responses:
 *       200:
 *         description: Paginated service catalog
 *   post:
 *     tags:
 *       - Services
 *     summary: Create a new tourism service (Approved vendors only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Service created successfully
 *       403:
 *         description: 'Forbidden - Vendor not approved (code: VENDOR_NOT_APPROVED)'
 */
router
  .route('/')
  .get(optionalAuth, validate(serviceQuerySchema), getServices)
  .post(protect, authorize('vendor', 'admin', 'super_admin'), requireApprovedVendor, validate(createServiceSchema), createService);

/**
 * @openapi
 * /services/{id}:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get single service details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Service details with populated vendor information
 *       404:
 *         description: Service not found
 *   patch:
 *     tags:
 *       - Services
 *     summary: Update an existing tourism service
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Service updated successfully
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete a service listing
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Service deleted successfully
 */
router
  .route('/:id')
  .get(optionalAuth, getService)
  .patch(protect, authorize('vendor', 'admin', 'super_admin'), requireApprovedVendor, validate(updateServiceSchema), updateService)
  .delete(protect, authorize('vendor', 'admin', 'super_admin'), requireApprovedVendor, deleteService);

// ==================== WORKFLOW LIFECYCLE ====================

router.post('/:id/submit', protect, authorize('vendor'), submitService);
router.patch('/:id/approve', protect, authorize('admin', 'super_admin'), approveService);
router.patch('/:id/reject', protect, authorize('admin', 'super_admin'), validate(serviceModerationSchema), rejectService);
router.patch('/:id/publish', protect, authorize('vendor', 'admin', 'super_admin'), publishService);
router.patch('/:id/archive', protect, authorize('vendor', 'admin', 'super_admin'), archiveService);
router.patch('/:id/feature', protect, authorize('admin', 'super_admin'), featureService);

// ==================== MEDIA & GALLERY ====================

router.post('/:id/images', protect, authorize('vendor', 'admin', 'super_admin'), validate(serviceImageSchema), addServiceImage);
router.patch('/:id/images/reorder', protect, authorize('vendor', 'admin', 'super_admin'), validate(serviceImageReorderSchema), reorderServiceImages);
router.patch('/:id/images/:imageId', protect, authorize('vendor', 'admin', 'super_admin'), validate(serviceImageUpdateSchema), updateServiceImage);
router.delete('/:id/images/:imageId', protect, authorize('vendor', 'admin', 'super_admin'), deleteServiceImage);

// ==================== PRICING & AVAILABILITY ====================

router
  .route('/:id/pricing')
  .get(getServicePricing)
  .put(protect, authorize('vendor', 'admin', 'super_admin'), validate(servicePricingSchema), updateServicePricing);

/**
 * @openapi
 * /services/{id}/availability/calendar:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get calendar availability matrix across a date range
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date, example: '2026-12-01' }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date, example: '2026-12-31' }
 *     responses:
 *       200:
 *         description: Date-by-date availability array
 * /services/{id}/availability/check:
 *   get:
 *     tags:
 *       - Services
 *     summary: Fast availability and capacity check for specific date and guests
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date, example: '2026-12-15' }
 *       - in: query
 *         name: participants
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Real-time availability result
 * /services/{id}/availability:
 *   get:
 *     tags:
 *       - Services
 *     summary: Get service availability config or live capacity calculation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: timeSlot
 *         schema: { type: string }
 *       - in: query
 *         name: participants
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Availability details
 */
router.get('/:id/availability/calendar', getServiceAvailabilityCalendar);
router.get('/:id/availability/check', checkQuickAvailability);

router
  .route('/:id/availability')
  .get(getServiceAvailability)
  .put(protect, authorize('vendor', 'admin', 'super_admin'), validate(serviceAvailabilitySchema), updateServiceAvailability);

module.exports = router;
