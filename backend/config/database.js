const mongoose = require('mongoose');
const { config } = require('./env');
const logger = require('../utils/logger');

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 2,
  autoIndex: config.isDevelopment
};

let connectionPromise = null;
let retryTimeout = null;

async function connectDB(uri = config.MONGODB_URI, options = {}) {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If currently connecting, await existing promise
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  const mergedOptions = { ...MONGO_OPTIONS, ...options };

  connectionPromise = mongoose.connect(uri, mergedOptions)
    .then((conn) => {
      logger.info({ host: conn.connection.host, database: conn.connection.name }, 'MongoDB connected successfully');
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
      }
      return conn.connection;
    })
    .catch((err) => {
      logger.error({ err: err.message }, 'Failed to connect to MongoDB');
      connectionPromise = null;
      // In production/development, schedule automatic retry in background
      if (config.NODE_ENV !== 'test' && !retryTimeout) {
        retryTimeout = setTimeout(() => {
          retryTimeout = null;
          connectDB(uri, options).catch(() => {});
        }, 10000);
      }
      throw err;
    });

  return connectionPromise;
}

async function disconnectDB() {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
      connectionPromise = null;
      logger.info('MongoDB disconnected gracefully');
    } catch (err) {
      logger.error({ err: err.message }, 'Error closing MongoDB connection');
      throw err;
    }
  }
}

function checkDBHealth() {
  const state = mongoose.connection.readyState;
  const stateLabels = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const isConnected = state === 1;

  return {
    status: isConnected ? 'up' : 'down',
    readyState: state,
    stateLabel: stateLabels[state] || 'unknown',
    database: isConnected ? mongoose.connection.name : null,
    host: isConnected ? mongoose.connection.host : null
  };
}

// Global connection event listeners
mongoose.connection.on('error', (err) => {
  logger.error({ err: err.message }, 'MongoDB connection runtime error');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB connection lost/disconnected');
});

module.exports = {
  connectDB,
  disconnectDB,
  checkDBHealth
};
