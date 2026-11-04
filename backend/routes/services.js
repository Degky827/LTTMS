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

/**
 * @openapi
 * /services:
 *   get:
 *     tags:
 *       - Services
 *     summary: Discover and list tourism services
 *     description: Search and filter tourism services with caching, pagination, price range, eco-friendly filtering, and category selection.
 *     parameters:
 *       - in: query
 *         name: category
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
 *         name: search
 *         schema: { type: string }
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
 *     description: Publishes a new service listing. Vendor account MUST be approved by an administrator before listing creation is permitted.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['title', 'description', 'price', 'category']
 *             properties:
 *               title: { type: string, example: 'Lake Tana Monasteries Half-Day Boat Tour' }
 *               description: { type: string, example: 'Explore 14th-century island monasteries with certified local guides.' }
 *               price: { type: number, example: 1200 }
 *               category: { type: string, example: 'boat_tour' }
 *               duration: { type: string, example: '4 hours' }
 *               maxGroupSize: { type: integer, example: 12 }
 *               ecoFriendly: { type: boolean, example: true }
 *     responses:
 *       201:
 *         description: Service created successfully
 *       403:
 *         description: 'Forbidden - Vendor not approved (code: VENDOR_NOT_APPROVED)'
 */
router
  .route('/')
  .get(validate(serviceQuerySchema), getServices)
  .post(protect, authorize('vendor', 'admin'), requireApprovedVendor, validate(createServiceSchema), createService);

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
 *   put:
 *     tags:
 *       - Services
 *     summary: Update an existing tourism service
 *     description: Restricted to the service owner vendor or administrator.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       401:
 *         description: Not authorized to update this service
 *       404:
 *         description: Service not found
 *   delete:
 *     tags:
 *       - Services
 *     summary: Delete a service listing
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       401:
 *         description: Not authorized to delete this service
 *       404:
 *         description: Service not found
 */
router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('vendor', 'admin'), requireApprovedVendor, validate(updateServiceSchema), updateService)
  .delete(protect, authorize('vendor', 'admin'), requireApprovedVendor, deleteService);

module.exports = router;
