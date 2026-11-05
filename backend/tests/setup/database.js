const mongoose = require('mongoose');
const logger = require('../../utils/logger');

// Test database safety guard: Ensure we NEVER touch production or development databases
const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/lttms-test-db';

async function connectTestDB() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Safety check failed: connectTestDB must only run in test environment');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 2000,
      bufferCommands: false
    });
    logger.info('Connected to isolated test database');
  } catch (err) {
    logger.warn({ err: err.message }, 'Isolated MongoDB not available; continuing in memory/stub mode');
  }
}

async function clearTestDB() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Safety check failed: clearTestDB must only run in test environment');
  }

  if (mongoose.connection.readyState !== 1) {
    return;
  }

  // Double check database name does not match production
  const dbName = mongoose.connection.name;
  if (!dbName.includes('test')) {
    throw new Error(`Safety check failed: refusing to clear non-test database '${dbName}'`);
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  TEST_DB_URI,
  connectTestDB,
  clearTestDB,
  disconnectTestDB
};
