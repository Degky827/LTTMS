const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    role: z.enum(['tourist', 'vendor']).optional(),
    businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
    businessType: z.enum(['boat_operator', 'hotel', 'lodge', 'restaurant', 'guide', 'tour_operator', 'other']).optional(),
    location: z.string().optional(),
    businessDesc: z.string().optional()
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional()
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  }).strict().optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    phone: z.string().max(20).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    languagePreference: z.enum(['en', 'am']).optional(),
    avatar: z.string().optional().nullable()
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').optional()
  }).strict().optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format')
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters')
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters')
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const twoFactorSchema = z.object({
  body: z.object({
    twoFactorToken: z.string().min(1, '2FA token is required'),
    code: z.string().min(6, 'Code must be 6 digits').max(6)
  }).strict(),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const adminUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean().optional(),
    isSuspended: z.boolean().optional(),
    suspendedReason: z.string().max(500).optional(),
    lock: z.boolean().optional()
  }).strict(),
  params: z.object({
    id: z.string().min(1, 'User ID is required')
  }).optional(),
  query: z.object({}).optional()
});

const adminAssignRoleSchema = z.object({
  body: z.object({
    role: z.enum(['tourist', 'vendor', 'support', 'admin', 'super_admin'], {
      errorMap: () => ({ message: 'Invalid user role specified' })
    })
  }).strict(),
  params: z.object({
    id: z.string().min(1, 'User ID is required')
  }).optional(),
  query: z.object({}).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  twoFactorSchema,
  adminUserStatusSchema,
  adminAssignRoleSchema
};
