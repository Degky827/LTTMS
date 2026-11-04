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
const { authLimiter } = require('../middleware/rateLimiters');
const {
  registerSchema, loginSchema, refreshSchema, updateProfileSchema,
  resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema,
  changePasswordSchema, twoFactorSchema
} = require('../validation/authSchemas');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), resendVerification);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', authLimiter, validate(resetPasswordSchema), resetPassword);

// 2FA (public — uses temporary 2FA token)
router.post('/verify-2fa', authLimiter, validate(twoFactorSchema), verifyTwoFactor);

// Protected routes (require valid JWT access token)
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);
router.put('/me', protect, validate(updateProfileSchema), updateProfile);
router.get('/status', protect, getAccountStatus);
router.get('/sessions', protect, getActiveSessions);
router.delete('/sessions/:id', protect, revokeSession);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/enable-2fa', protect, enableTwoFactor);
router.post('/disable-2fa', protect, disableTwoFactor);

module.exports = router;
