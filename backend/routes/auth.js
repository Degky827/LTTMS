const express = require('express');
const {
  register, login, getMe, updateProfile, getAccountStatus,
  refresh, logout, logoutAll,
  getActiveSessions, revokeSession,
  verifyEmail, resendVerification,
  forgotPassword, resetPassword, changePassword,
  enableTwoFactor, disableTwoFactor, verifyTwoFactor
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  authLimiter,
  passwordResetLimiter,
  verificationLimiter,
  refreshLimiter
} = require('../middleware/rateLimiters');
const {
  registerSchema, loginSchema, refreshSchema, updateProfileSchema,
  resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema,
  changePasswordSchema, twoFactorSchema
} = require('../validation/authSchemas');

const router = express.Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new tourist or vendor account
 *     description: Creates a user account with secure bcrypt hashing (12 rounds). Tourists are immediately active; vendor registrations initiate a vendor profile requiring administrator approval. Public injection of admin, super_admin, or support roles is strictly forbidden.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Account successfully registered and initial token pair issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Validation error or invalid inputs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email address already registered
 *       429:
 *         description: Rate limit exceeded (max 20 attempts per 15 minutes)
 */
router.post('/register', authLimiter, validate(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Authenticate with email and password
 *     description: Validates user credentials, enforces account lockout after 5 consecutive failures, issues short-lived JWT access token and rotated HTTP-only refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Successfully authenticated; sets HTTP-only cookies and returns token payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account deactivated or suspended (ACCOUNT_SUSPENDED)
 *       423:
 *         description: Account locked due to excessive failed attempts
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/login', authLimiter, validate(loginSchema), login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token using refresh-token rotation
 *     description: Accepts refresh token via HTTP-only cookie or request body. Validates token hash, detects token reuse, invalidates compromised families, and issues a newly rotated token pair.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Optional if provided via HTTP-only cookie
 *     responses:
 *       200:
 *         description: Successfully rotated token pair
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Invalid, expired, or reused refresh token
 *       403:
 *         description: Account inactive or suspended
 */
router.post('/refresh', refreshLimiter, validate(refreshSchema), refresh);

/**
 * @openapi
 * /auth/verify-email/{token}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify account email address
 *     description: Consumes a single-use verification token, validates SHA-256 hash against database, sets isVerified to true, and invalidates the token.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw unhashed verification token received via email
 *     responses:
 *       200:
 *         description: Email successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid, expired, or already consumed verification token
 */
router.get('/verify-email/:token', verificationLimiter, verifyEmail);

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend verification email
 *     description: Dispatches a new single-use 24-hour verification token. Employs user-enumeration defense by returning a generic 200 OK message regardless of account existence.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendVerificationInput'
 *     responses:
 *       200:
 *         description: Generic confirmation response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Account is already verified or input is invalid
 */
router.post('/resend-verification', verificationLimiter, validate(resendVerificationSchema), resendVerification);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset link
 *     description: Generates a 10-minute expiring cryptographic reset token, stores its SHA-256 hash, and sends instructions. Always returns generic success response to prevent email harvesting.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Generic success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       429:
 *         description: Rate limit exceeded (max 5 requests per 15 minutes)
 */
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), forgotPassword);

/**
 * @openapi
 * /auth/reset-password/{token}:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password with token
 *     description: Validates unexpired single-use reset token hash, updates password with bcrypt (12 rounds), revokes all active user sessions, and sends confirmation email.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successful; user can log in with new password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid, expired, or reused token
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Reset password with token (PUT alias)
 *     description: Backward-compatible PUT alias for reset password.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.route('/reset-password/:token')
  .post(passwordResetLimiter, validate(resetPasswordSchema), resetPassword)
  .put(passwordResetLimiter, validate(resetPasswordSchema), resetPassword);

/**
 * @openapi
 * /auth/verify-2fa:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify TOTP 2FA code
 *     description: Verifies time-based one-time password during login challenge and issues authenticated session tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['twoFactorToken', 'code']
 *             properties:
 *               twoFactorToken: { type: 'string' }
 *               code: { type: 'string', minLength: 6, maxLength: 6, example: '123456' }
 *     responses:
 *       200:
 *         description: 2FA verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       400:
 *         description: Invalid or expired 2FA code
 */
router.post('/verify-2fa', authLimiter, validate(twoFactorSchema), verifyTwoFactor);

// ============================================================================
// PROTECTED ROUTES (Require Bearer Token or Cookie Authentication)
// ============================================================================

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from current session
 *     description: Revokes the caller's active refresh token in database, blacklists access token, and clears auth cookies.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/logout', protect, logout);

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from all active sessions
 *     description: Revokes all refresh tokens issued across all devices for this user and invalidates all active sessions.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post('/logout-all', protect, logoutAll);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get current authenticated user profile
 *     description: Returns sanitized user profile without passwords, tokens, or security metadata.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 data: { $ref: '#/components/schemas/SafeUser' }
 *                 user: { $ref: '#/components/schemas/SafeUser' }
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags:
 *       - User Management
 *     summary: Update profile (mass-assignment protected)
 *     description: Updates safe profile fields (name, phone, bio, languagePreference, avatar). Privileged fields (role, isActive, isSuspended, password) are strictly rejected.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 message: { type: 'string', example: 'Profile updated successfully' }
 *                 data: { $ref: '#/components/schemas/SafeUser' }
 */
router.route('/me')
  .get(protect, getMe)
  .put(protect, validate(updateProfileSchema), updateProfile);

/**
 * @openapi
 * /auth/status:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get account diagnostic status
 *     description: Returns safe diagnostic account flags (isActive, isSuspended, isVerified, isLocked, loginAttempts).
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account status details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 data: { $ref: '#/components/schemas/AccountStatus' }
 */
router.get('/status', protect, getAccountStatus);

/**
 * @openapi
 * /auth/sessions:
 *   get:
 *     tags:
 *       - User Management
 *     summary: List user active sessions
 *     description: Lists metadata for all active unexpired device sessions belonging to the authenticated user.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 count: { type: 'integer', example: 2 }
 *                 data:
 *                   type: 'array'
 *                   items:
 *                     $ref: '#/components/schemas/SessionItem'
 */
router.get('/sessions', protect, getActiveSessions);

/**
 * @openapi
 * /auth/sessions/{id}:
 *   delete:
 *     tags:
 *       - User Management
 *     summary: Revoke a specific active session
 *     description: Terminates a selected device session by ID, ensuring ownership before invalidating.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID to revoke
 *     responses:
 *       200:
 *         description: Session revoked successfully
 *       404:
 *         description: Session not found or already revoked
 */
router.delete('/sessions/:id', protect, revokeSession);

/**
 * @openapi
 * /auth/change-password:
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Change password for authenticated user
 *     description: Validates current password, applies new password with bcrypt (12 rounds), revokes all existing refresh sessions, and sends security alert.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 */
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);

/**
 * @openapi
 * /auth/enable-2fa:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Enable two-factor authentication (TOTP)
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns TOTP secret and QR code URI
 */
router.post('/enable-2fa', protect, enableTwoFactor);

/**
 * @openapi
 * /auth/disable-2fa:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Disable two-factor authentication
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */
router.post('/disable-2fa', protect, disableTwoFactor);

module.exports = router;
