// Jest setup: runs before every test suite
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-at-least-32-characters-long-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-at-least-32-chars-long';
process.env.JWT_BLACKLIST_ENABLED = 'false';
process.env.CHAPA_WEBHOOK_SECRET = 'test-chapa-webhook-secret-key-32chars';

// Disable mongoose buffering to prevent hanging on disconnected databases
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
