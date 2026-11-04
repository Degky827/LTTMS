const express = require('express');
const {
  registerVendor,
  getMyVendorProfile,
  updateMyVendorProfile,
  getVendors,
  getVendor,
  uploadVerificationDocument,
  getVerificationStatus,
  submitVerification,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor
} = require('../controllers/vendorController');

const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  vendorProfileSchema,
  updateVendorProfileSchema,
  uploadDocumentSchema,
  vendorStatusUpdateSchema
} = require('../validation/vendorSchemas');

/**
 * @openapi
 * /vendors:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: Discover and list verified tourism vendors
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: businessType
 *         schema: { type: string, enum: [boat_operator, hotel, lodge, restaurant, guide, tour_operator, other] }
 *       - in: query
 *         name: ecoCertification
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated vendor list
 *   post:
 *     tags:
 *       - Vendors
 *     summary: Register a new vendor business profile
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, location, phone]
 *     responses:
 *       201:
 *         description: Vendor business profile created
 */
router
  .route('/')
  .get(optionalAuth, getVendors)
  .post(protect, validate(vendorProfileSchema), registerVendor);

/**
 * @openapi
 * /vendors/profile:
 *   post:
 *     tags:
 *       - Vendors
 *     summary: Create vendor business profile
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       201:
 *         description: Vendor profile created
 */
router.post('/profile', protect, validate(vendorProfileSchema), registerVendor);

/**
 * @openapi
 * /vendors/profile/me:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: Get current authenticated vendor's own full business profile
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Full profile with documents and verification history
 *       404:
 *         description: Vendor profile not found
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Update current vendor's permitted business details
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile updated
 */
router
  .route('/profile/me')
  .get(protect, getMyVendorProfile)
  .patch(protect, validate(updateVendorProfileSchema), updateMyVendorProfile);

/**
 * @openapi
 * /vendors/verification/documents:
 *   post:
 *     tags:
 *       - Vendors
 *     summary: Upload KYC verification document
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documentType, fileUrl, originalFilename, mimeType, fileSize]
 *     responses:
 *       201:
 *         description: KYC document uploaded
 */
router.post('/verification/documents', protect, validate(uploadDocumentSchema), uploadVerificationDocument);

/**
 * @openapi
 * /vendors/verification/status:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: Check KYC verification status and document review history
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current verification status and history
 */
router.get('/verification/status', protect, getVerificationStatus);

/**
 * @openapi
 * /vendors/verification/submit:
 *   post:
 *     tags:
 *       - Vendors
 *     summary: Submit vendor profile and documents for administrative review
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Application submitted for review
 */
router.post('/verification/submit', protect, submitVerification);

/**
 * @openapi
 * /vendors/{id}:
 *   get:
 *     tags:
 *       - Vendors
 *     summary: Get single vendor profile details and published services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Vendor details
 *       404:
 *         description: Vendor not found
 */
router.get('/:id', optionalAuth, getVendor);

/**
 * @openapi
 * /vendors/{id}/approve:
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Approve vendor application (Admin only)
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
 *         description: Vendor approved
 */
router.patch('/:id/approve', protect, authorize('admin', 'super_admin'), approveVendor);

/**
 * @openapi
 * /vendors/{id}/reject:
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Reject vendor application with reason (Admin only)
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
 *             required: [reason]
 *     responses:
 *       200:
 *         description: Vendor rejected
 */
router.patch('/:id/reject', protect, authorize('admin', 'super_admin'), validate(vendorStatusUpdateSchema), rejectVendor);

/**
 * @openapi
 * /vendors/{id}/suspend:
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Suspend vendor account and hide active services (Admin only)
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
 *             required: [reason]
 *     responses:
 *       200:
 *         description: Vendor suspended
 */
router.patch('/:id/suspend', protect, authorize('admin', 'super_admin'), validate(vendorStatusUpdateSchema), suspendVendor);

/**
 * @openapi
 * /vendors/{id}/reactivate:
 *   patch:
 *     tags:
 *       - Vendors
 *     summary: Reactivate suspended vendor (Admin only)
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
 *         description: Vendor reactivated
 */
router.patch('/:id/reactivate', protect, authorize('admin', 'super_admin'), reactivateVendor);

module.exports = router;
