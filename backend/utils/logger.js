const pino = require('pino');
const { config } = require('../config/env');

const sensitiveFields = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-chapa-signature"]',
  'password',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'twoFactorToken',
  'twoFactorSecret',
  'secret',
  'secretKey',
  'chapaSecret',
  'creditCard',
  'cardNumber',
  '*.password',
  '*.token',
  '*.refreshToken',
  '*.twoFactorSecret'
];

const logger = pino({
  level: config.LOG_LEVEL || (config.isTest ? 'silent' : 'info'),
  redact: {
    paths: sensitiveFields,
    censor: '[REDACTED]'
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  }
});

module.exports = logger;
