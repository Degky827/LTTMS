const express = require('express');
const {
  register, login, getMe, refresh, logout,
  verifyEmail, forgotPassword, resetPassword, changePassword,
  enableTwoFactor, disableTwoFactor, verifyTwoFactor
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const {
  registerSchema, loginSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema, twoFactorSchema
} = require('../validation/authSchemas');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.put('/reset-password/:token', authLimiter, validate(resetPasswordSchema), resetPassword);

// 2FA (public — uses temporary 2FA token)
router.post('/verify-2fa', authLimiter, validate(twoFactorSchema), verifyTwoFactor);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validate(changePasswordSchema), changePassword);
router.post('/enable-2fa', protect, enableTwoFactor);
router.post('/disable-2fa', protect, disableTwoFactor);

module.exports = router;
