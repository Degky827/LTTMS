const express = require('express');
const {
  getReviews,
  getReviewById,
  getMyReviews,
  addReview,
  updateReview,
  reportReview,
  vendorRespond,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createReviewSchema,
  updateReviewSchema,
  reportReviewSchema,
  vendorResponseSchema
} = require('../validation/reviewSchemas');

/**
 * @openapi
 * /reviews/service/{serviceId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get all approved reviews and rating breakdown for a service
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated reviews and aggregate rating distribution
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 total: { type: integer }
 *                 ratingStats: { type: array, items: { type: object } }
 *                 data: { type: array, items: { $ref: '#/components/schemas/ReviewResponse' } }
 */
router.get('/service/:serviceId', getReviews);

/**
 * @openapi
 * /reviews/my-reviews:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: List authenticated tourist's submitted reviews
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of reviews authored by logged-in user
 */
router.get('/my-reviews', protect, getMyReviews);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: Get review details by ID
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/ReviewResponse' }
 *       404:
 *         description: Review not found
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update an existing review
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               title: { type: string }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Review updated successfully
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review (Author or Admin only)
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
 *         description: Review deleted and service ratings recalculated
 */
router.get('/:reviewId', getReviewById);
router.patch('/:reviewId', protect, validate(updateReviewSchema), updateReview);
router.delete('/:id', protect, deleteReview);

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Submit a review and star rating for a tourism service
 *     description: Enforces verified booking check if booking ID provided. Enforces anti-spam single review per user per service.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review submitted and ratings recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/ReviewResponse' }
 *       400:
 *         description: Already reviewed or invalid booking status
 */
router.post('/', protect, authorize('tourist', 'admin'), validate(createReviewSchema), addReview);

/**
 * @openapi
 * /reviews/{reviewId}/report:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Report inappropriate review for moderation
 *     description: Submits a flag for spam, harassment, or fake review. Automatically transitions review to 'flagged' status if 3 or more reports are received.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 enum: [spam, harassment, fake_review, irrelevant, personal_info, other]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review report recorded
 *       400:
 *         description: Already reported by this user
 */
router.post('/:reviewId/report', protect, validate(reportReviewSchema), reportReview);

/**
 * @openapi
 * /reviews/{reviewId}/respond:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Post vendor official response to a review
 *     description: Allows the verified vendor of the reviewed service to reply officially. Blocks unauthorized vendors.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Vendor response published
 *       403:
 *         description: Only the owner vendor can respond to this review
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update vendor official response (alias)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [response]
 *             properties:
 *               response: { type: string }
 *     responses:
 *       200:
 *         description: Vendor response updated
 */
router.post('/:reviewId/respond', protect, authorize('vendor', 'admin'), validate(vendorResponseSchema), vendorRespond);
router.patch('/:reviewId/respond', protect, authorize('vendor', 'admin'), validate(vendorResponseSchema), vendorRespond);

module.exports = router;
