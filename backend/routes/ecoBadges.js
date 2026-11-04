const express = require('express');
const {
  getEcoBadges,
  createEcoBadge,
  getVendorEcoBadges,
  applyForEcoBadge,
  getMyBadgeApplications,
  getAdminBadgeApplications,
  approveBadgeApplication,
  rejectBadgeApplication
} = require('../controllers/ecoBadgeController');

const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBadgeSchema,
  applyBadgeSchema,
  reviewBadgeApplicationSchema
} = require('../validation/ecoBadgeSchemas');

/**
 * @openapi
 * /eco-badges:
 *   get:
 *     tags:
 *       - Eco-Tourism
 *     summary: List all defined eco-badges and sustainability criteria
 *     responses:
 *       200:
 *         description: List of eco-badges
 *   post:
 *     tags:
 *       - Eco-Tourism
 *     summary: Define a new eco-badge (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Eco-badge created
 */
router
  .route('/')
  .get(optionalAuth, getEcoBadges)
  .post(protect, authorize('admin', 'super_admin'), validate(createBadgeSchema), createEcoBadge);

/**
 * @openapi
 * /eco-badges/vendor/{id}:
 *   get:
 *     tags:
 *       - Eco-Tourism
 *     summary: Get all eco-badges awarded to a specific vendor
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Badges awarded to vendor
 *       404:
 *         description: Vendor not found
 */
router.get('/vendor/:id', getVendorEcoBadges);

/**
 * @openapi
 * /eco-badges/applications:
 *   get:
 *     tags:
 *       - Eco-Tourism
 *     summary: List all eco-badge applications for moderation (Admin only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of badge applications
 *   post:
 *     tags:
 *       - Eco-Tourism
 *     summary: Apply for an eco-badge with sustainability evidence (Vendor only)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Application submitted
 */
router
  .route('/applications')
  .get(protect, authorize('admin', 'super_admin'), getAdminBadgeApplications)
  .post(protect, authorize('vendor'), validate(applyBadgeSchema), applyForEcoBadge);

/**
 * @openapi
 * /eco-badges/applications/me:
 *   get:
 *     tags:
 *       - Eco-Tourism
 *     summary: Get current vendor's own eco-badge application history
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Applications history
 */
router.get('/applications/me', protect, authorize('vendor'), getMyBadgeApplications);

/**
 * @openapi
 * /eco-badges/applications/{id}/approve:
 *   patch:
 *     tags:
 *       - Eco-Tourism
 *     summary: Approve eco-badge application and award badge (Admin only)
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
 *         description: Badge awarded
 */
router.patch('/applications/:id/approve', protect, authorize('admin', 'super_admin'), validate(reviewBadgeApplicationSchema), approveBadgeApplication);

/**
 * @openapi
 * /eco-badges/applications/{id}/reject:
 *   patch:
 *     tags:
 *       - Eco-Tourism
 *     summary: Reject eco-badge application with feedback (Admin only)
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
 *         description: Application rejected
 */
router.patch('/applications/:id/reject', protect, authorize('admin', 'super_admin'), validate(reviewBadgeApplicationSchema), rejectBadgeApplication);

module.exports = router;
