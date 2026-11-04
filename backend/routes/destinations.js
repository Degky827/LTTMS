const express = require('express');
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  publishDestination,
  featureDestination
} = require('../controllers/destinationController');

const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  destinationQuerySchema,
  createDestinationSchema,
  updateDestinationSchema
} = require('../validation/destinationSchemas');

/**
 * @openapi
 * /destinations:
 *   get:
 *     tags:
 *       - Destinations
 *     summary: Discover and list tourism destinations
 *     description: Retrieve destinations across Lake Tana, Bahir Dar, and the Amhara region. Public queries only return published destinations.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [lake, monastery, waterfall, peninsula, cultural_site, island, city, other] }
 *       - in: query
 *         name: isFeatured
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated destinations catalog
 *   post:
 *     tags:
 *       - Destinations
 *     summary: Create new destination (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name: { type: string, example: 'Tis Abay / Blue Nile Falls' }
 *               description: { type: string, example: 'Magnificent waterfall situated 30km south of Bahir Dar.' }
 *               destinationType: { type: string, example: 'waterfall' }
 *     responses:
 *       201:
 *         description: Destination created
 *       400:
 *         description: Duplicate name or validation error
 *       403:
 *         description: Forbidden - Admin role required
 */
router
  .route('/')
  .get(optionalAuth, validate(destinationQuerySchema), getDestinations)
  .post(protect, authorize('admin', 'super_admin'), validate(createDestinationSchema), createDestination);

/**
 * @openapi
 * /destinations/{id}:
 *   get:
 *     tags:
 *       - Destinations
 *     summary: Get single destination details by ID or slug
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Destination profile and associated services count
 *       404:
 *         description: Destination not found
 *   patch:
 *     tags:
 *       - Destinations
 *     summary: Update destination (Admin only)
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
 *         description: Destination updated
 *       404:
 *         description: Destination not found
 *   delete:
 *     tags:
 *       - Destinations
 *     summary: Safe delete destination (Admin only)
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
 *         description: Destination deleted
 *       400:
 *         description: Cannot delete destination if referenced by tourism services
 *       404:
 *         description: Destination not found
 */
router
  .route('/:id')
  .get(optionalAuth, getDestination)
  .patch(protect, authorize('admin', 'super_admin'), validate(updateDestinationSchema), updateDestination)
  .delete(protect, authorize('admin', 'super_admin'), deleteDestination);

/**
 * @openapi
 * /destinations/{id}/publish:
 *   patch:
 *     tags:
 *       - Destinations
 *     summary: Publish or unpublish destination (Admin only)
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
 *         description: Destination publish status toggled
 */
router.patch('/:id/publish', protect, authorize('admin', 'super_admin'), publishDestination);

/**
 * @openapi
 * /destinations/{id}/feature:
 *   patch:
 *     tags:
 *       - Destinations
 *     summary: Toggle featured status of destination (Admin only)
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
 *         description: Destination featured status toggled
 */
router.patch('/:id/feature', protect, authorize('admin', 'super_admin'), featureDestination);

module.exports = router;
