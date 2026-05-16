const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

// ========== HELPERS ==========

const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  const accessExpiry = rememberMe ? '7d' : process.env.JWT_EXPIRES_IN || '15m';
  const refreshExpiry = rememberMe ? '90d' : process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  const accessMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
  const refreshMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: accessExpiry
  });
  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: refreshExpiry }
  );

  const secure = process.env.NODE_ENV === 'production';
  const cookieOptions = { httpOnly: true, secure, sameSite: 'strict' };

  res.cookie('accessToken', token, { ...cookieOptions, maxAge: accessMaxAge });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: refreshMaxAge });

  logger.info({ userId: user._id, role: user.role }, 'Auth token issued');

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled
    }
  });
};

const auditLog = (action, userId, details = {}) => {
  logger.info({ action, userId, ...details, timestamp: new Date().toISOString() }, 'AUDIT');
};

// ========== REGISTER ==========

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role: requestedRole } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const role = requestedRole === 'vendor' ? 'vendor' : 'tourist';

    const user = await User.create({ name, email, password, phone, role });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your Lake Tana account',
      template: 'email-verification',
      context: { name: user.name, url: verifyUrl }
    });

    auditLog('user.register', user._id, { role: user.role });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== LOGIN ==========

exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if locked
    if (user.isLocked()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minute(s).`
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_DURATION;
        await user.save({ validateBeforeSave: false });
        auditLog('user.locked', user._id, { reason: 'Max login attempts' });
        return res.status(423).json({
          success: false,
          message: `Account locked due to ${MAX_LOGIN_ATTEMPTS} failed attempts. Try again in 30 minutes.`
        });
      }
      await user.save({ validateBeforeSave: false });
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt(s) remaining.`
      });
    }

    // Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    auditLog('user.login', user._id, { role: user.role });

    // Check 2FA
    if (user.twoFactorEnabled) {
      const twoFactorToken = jwt.sign(
        { id: user._id, type: '2fa', role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        twoFactorToken,
        message: '2FA code required. Check your email or phone.'
      });
    }

    sendTokenResponse(user, 200, res, rememberMe);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== VERIFY 2FA ==========

exports.verifyTwoFactor = async (req, res) => {
  try {
    const { twoFactorToken, code } = req.body;
    if (!twoFactorToken || !code) {
      return res.status(400).json({ success: false, message: 'Token and code are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired 2FA token' });
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Simple code comparison (in production, use TOTP)
    if (code !== user.twoFactorSecret) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }

    auditLog('user.2fa.verify', user._id);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== ENABLE 2FA ==========

exports.enableTwoFactor = async (req, res) => {
  try {
    const secret = Math.floor(100000 + Math.random() * 900000).toString();
    req.user.twoFactorEnabled = true;
    req.user.twoFactorSecret = secret;
    await req.user.save({ validateBeforeSave: false });

    auditLog('user.2fa.enable', req.user._id);

    res.status(200).json({
      success: true,
      secret,
      message: '2FA enabled. Save this code for verification.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== DISABLE 2FA ==========

exports.disableTwoFactor = async (req, res) => {
  try {
    req.user.twoFactorEnabled = false;
    req.user.twoFactorSecret = undefined;
    await req.user.save({ validateBeforeSave: false });

    auditLog('user.2fa.disable', req.user._id);

    res.status(200).json({ success: true, message: '2FA disabled.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== VERIFY EMAIL ==========

exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    auditLog('user.verify', user._id);

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== FORGOT PASSWORD ==========

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password reset request for Lake Tana',
      template: 'password-reset',
      context: { name: user.name, url: resetUrl }
    });

    auditLog('user.forgotPassword', user._id);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== RESET PASSWORD ==========

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    auditLog('user.resetPassword', user._id);

    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== CHANGE PASSWORD ==========

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    auditLog('user.changePassword', user._id);

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== REFRESH TOKEN ==========

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// ========== LOGOUT ==========

exports.logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  auditLog('user.logout', req.user?._id);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ========== GET ME ==========

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
};
