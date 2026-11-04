const { z } = require('zod');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').default('mongodb://localhost:27017/lttms'),

  // JWT configuration
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required').default('default-dev-secret-key-change-in-production-64char'),
  JWT_REFRESH_SECRET: z.string().min(1).optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  JWT_ISSUER: z.string().default('lttms-api'),
  JWT_AUDIENCE: z.string().default('lttms-client'),

  // Frontend origin(s) for CORS & redirect URLs
  FRONTEND_ORIGIN: z.string().default('http://localhost:3000,http://localhost:8080'),

  // Chapa Payment Gateway (https://chapa.co)
  CHAPA_SECRET_KEY: z.string().optional().default(''),
  CHAPA_API_URL: z.string().url().default('https://api.chapa.co/v1'),
  CHAPA_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/payments/verify'),
  CHAPA_WEBHOOK_SECRET: z.string().optional().default(''),

  // SMTP Email
  SMTP_HOST: z.string().default('smtp.ethereal.email'),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().default('"Lake Tana Eco-Tourism" <noreply@laketana.com>'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info')
});

function loadConfig(env = process.env, throwOnError = false) {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errorDetails = result.error.issues.map(issue => `  - ${issue.path.join('.')}: ${issue.message}`).join('\n');
    const errorMessage = `[Config Error] Invalid environment configuration:\n${errorDetails}`;

    if (throwOnError || process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test') {
      throw new Error(errorMessage);
    }
    console.error(errorMessage);
    process.exit(1);
  }

  const parsed = result.data;

  // In production, enforce stronger secret length
  if (parsed.NODE_ENV === 'production') {
    if (!parsed.JWT_SECRET || parsed.JWT_SECRET.length < 32 || parsed.JWT_SECRET.includes('default-dev-secret')) {
      const msg = '[Config Error] Production requires a secure JWT_SECRET of at least 32 characters.';
      if (throwOnError || process.env.NODE_ENV === 'test') {
        throw new Error(msg);
      }
      console.error(msg);
      process.exit(1);
    }
  }

  // Fallback JWT_REFRESH_SECRET to JWT_SECRET if not explicitly set
  const jwtRefreshSecret = parsed.JWT_REFRESH_SECRET || parsed.JWT_SECRET;

  const allowedOrigins = parsed.FRONTEND_ORIGIN
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  return Object.freeze({
    ...parsed,
    JWT_REFRESH_SECRET: jwtRefreshSecret,
    ALLOWED_ORIGINS: allowedOrigins,
    isProduction: parsed.NODE_ENV === 'production',
    isDevelopment: parsed.NODE_ENV === 'development',
    isTest: parsed.NODE_ENV === 'test'
  });
}

const config = loadConfig(process.env, false);

module.exports = {
  config,
  loadConfig,
  envSchema
};
