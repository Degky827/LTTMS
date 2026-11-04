const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const logger = require('../utils/logger');
const sendEmail = require('../utils/email');
const { blacklistToken } = require('../middleware/auth');
const authService = require('../services/authService');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

// ========== HELPERS ==========

const sendTokenResponse = async (user, statusCode, res, rememberMe = false, reqContext = {}) => {
  const tokenData = await authService.issueTokenPair(user, rememberMe, reqContext);
  const { accessToken, refreshToken } = tokenData;

  const accessMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
  const refreshMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

  const secure = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/'
  };

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: accessMaxAge });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: refreshMaxAge });

  logger.info({ userId: user._id, role: user.role }, 'Auth token issued');

  const safeUser = authService.sanitizeUser(user);

  res.status(statusCode).json({
    success: true,
    token: accessToken,
    refreshToken,
    user: safeUser,
    data: {
      accessToken,
      refreshToken,
      user: safeUser
    }
  });
};

const auditLog = (action, userId, details = {}) => {
  logger.info({ action, userId, ...details, timestamp: new Date().toISOString() }, 'AUDIT');
};

// ========== REGISTER ==========

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role: requestedRole,
      businessName,
      businessType,
      location,
      businessDesc
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Strict guard against public escalation to admin, super_admin, or support
    if (requestedRole && !['tourist', 'vendor'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Public registration allows only tourist or vendor roles'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const role = requestedRole === 'vendor' ? 'vendor' : 'tourist';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      isActive: true,
      isSuspended: false
    });

    // If registered as vendor, initialize pending vendor profile for admin approval workflow
    if (role === 'vendor') {
      try {
        const resolvedBusinessName = businessName || `${name}'s Tourism Services`;
        await Vendor.create({
          user: user._id,
          businessName: resolvedBusinessName,
          businessType: businessType || 'tour_operator',
          location: location || 'Bahir Dar',
          description: businessDesc || null,
          status: 'pending'
        });
        auditLog('vendor.registered.pending', user._id, { businessName: resolvedBusinessName, status: 'pending' });
      } catch (vendorErr) {
        logger.warn({ err: vendorErr.message, userId: user._id }, 'Vendor record initialization note');
      }
    }

    // Generate single-use verification token
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

    const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
    await sendTokenResponse(user, 201, res, false, reqContext);
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

    // Check if account is locked due to excessive failed attempts
    if (user.isLocked()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minute(s).`
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
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

    // Check account active and suspended status
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    if (user.isSuspended === true) {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.suspendedReason || 'Please contact support.'}`
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
      const code = authenticator.generate(user.twoFactorSecret);
      await sendEmail({
        to: user.email,
        subject: 'Your 2FA verification code',
        template: '2fa-code',
        context: { name: user.name, code }
      });

      const twoFactorToken = jwt.sign(
        { id: user._id, type: '2fa', role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        twoFactorToken,
        message: '2FA code sent to your email.'
      });
    }

    const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
    await sendTokenResponse(user, 200, res, rememberMe, reqContext);
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

    const isValid = authenticator.check(code, user.twoFactorSecret);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid 2FA code' });
    }

    auditLog('user.2fa.verify', user._id);

    const reqContext = { ip: req.ip, userAgent: req.headers['user-agent'] };
    await sendTokenResponse(user, 200, res, false, reqContext);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== ENABLE 2FA ==========

exports.enableTwoFactor = async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    req.user.twoFactorSecret = secret;
    await req.user.save({ validateBeforeSave: false });

    const otpauth = authenticator.keyuri(req.user.email, 'Lake Tana Eco-Tourism', secret);

    auditLog('user.2fa.enable', req.user._id);

    res.status(200).json({
      success: true,
      secret,
      otpauth,
      message: '2FA enabled. Scan the QR code or use the secret key in your authenticator app.'
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

// ========== RESEND VERIFICATION EMAIL ==========

exports.resendVerification = async (req, res) => {
  try {
    const email = req.body?.email || req.user?.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    // Prevent user enumeration: generic success response
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a verification link has been sent.'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account has already been verified'
      });
    }

    // Generate single-use verification token with 24h expiration
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your Lake Tana account',
      template: 'email-verification',
      context: { name: user.name, url: verifyUrl }
    });

    auditLog('user.resendVerification', user._id);

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a verification link has been sent.'
    });
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
    user.passwordChangedAt = new Date();
    await user.save();

    // Invalidate all existing sessions on password reset
    await authService.revokeAllUserTokens(user._id, 'password_reset');

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Your Password Has Been Reset - Lake Tana',
      template: 'password-reset-success',
      context: { name: user.name }
    });

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
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password cannot be the same as current password' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Revoke all existing refresh sessions for this user
    await authService.revokeAllUserTokens(user._id, 'password_change');

    // Blacklist current access token
    if (req.token) {
      blacklistToken(req.token);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // Send security notification email
    await sendEmail({
      to: user.email,
      subject: 'Security Alert: Password Changed - Lake Tana',
      template: 'password-changed',
      context: { name: user.name }
    });

    auditLog('user.changePassword', user._id);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== REFRESH TOKEN ==========

exports.refresh = async (req, res) => {
  try {
    // Extract refresh token from HTTP-only cookie OR request body (supporting both modern cookie & client storage)
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const reqContext = {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    const rotationResult = await authService.rotateRefreshToken(refreshToken, reqContext);

    if (rotationResult.status === 'reuse_detected') {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: rotationResult.message,
        code: 'TOKEN_REUSE_DETECTED'
      });
    }

    if (rotationResult.status === 'user_inactive') {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(403).json({
        success: false,
        message: rotationResult.message
      });
    }

    if (rotationResult.status !== 'success') {
      return res.status(401).json({
        success: false,
        message: rotationResult.message || 'Invalid or expired refresh token'
      });
    }

    const { tokens, user } = rotationResult;
    const safeUser = authService.sanitizeUser(user);

    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      path: '/'
    };

    res.cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });

    logger.info({ userId: user._id, family: tokens.family }, 'Refresh token rotated successfully');

    res.status(200).json({
      success: true,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: safeUser,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: safeUser
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// ========== LOGOUT ==========

exports.logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken, 'user_logout');
  }

  if (req.token) {
    blacklistToken(req.token);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  auditLog('user.logout', req.user?._id);

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ========== LOGOUT ALL SESSIONS ==========

exports.logoutAll = async (req, res) => {
  if (req.user?._id) {
    await authService.revokeAllUserTokens(req.user._id, 'logout_all');
    req.user.passwordChangedAt = new Date();
    await req.user.save({ validateBeforeSave: false });
  }

  if (req.token) {
    blacklistToken(req.token);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  auditLog('user.logoutAll', req.user?._id);

  res.status(200).json({ success: true, message: 'Logged out from all sessions successfully' });
};

// ========== GET ME (USER PROFILE) ==========

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  const safeUser = authService.sanitizeUser(user || req.user);

  res.status(200).json({
    success: true,
    data: safeUser,
    user: safeUser
  });
};

// ========== UPDATE PROFILE (MASS ASSIGNMENT PROTECTED) ==========

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, bio, languagePreference, avatar } = req.body;

    // Apply only whitelisted safe fields (strict mass-assignment protection)
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (languagePreference !== undefined) user.languagePreference = languagePreference;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const safeUser = authService.sanitizeUser(user);
    auditLog('user.profile.update', user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
      user: safeUser
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== GET ACCOUNT STATUS ==========

exports.getAccountStatus = async (req, res) => {
  const user = await User.findById(req.user.id);
  const target = user || req.user;

  res.status(200).json({
    success: true,
    data: {
      id: target._id || target.id,
      email: target.email,
      role: target.role,
      isActive: target.isActive !== false,
      isSuspended: Boolean(target.isSuspended),
      suspendedReason: target.suspendedReason || null,
      isVerified: Boolean(target.isVerified),
      twoFactorEnabled: Boolean(target.twoFactorEnabled),
      isLocked: target.isLocked ? target.isLocked() : false,
      loginAttempts: target.loginAttempts || 0,
      createdAt: target.createdAt
    }
  });
};

// ========== GET ACTIVE SESSIONS ==========

exports.getActiveSessions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const sessions = await authService.getUserActiveSessions(userId);

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ========== REVOKE SPECIFIC SESSION ==========

exports.revokeSession = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const sessionId = req.params.id;

    const revoked = await authService.revokeSessionById(userId, sessionId);
    if (!revoked) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already revoked'
      });
    }

    auditLog('user.session.revoke', userId, { sessionId });

    res.status(200).json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
