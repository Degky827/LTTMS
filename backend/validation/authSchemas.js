const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
    role: z.enum(['tourist', 'vendor']).optional()
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

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  twoFactorSchema
};
