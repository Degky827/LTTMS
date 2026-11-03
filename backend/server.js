const http = require('http');
const app = require('./app');
const { config } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/database');
const { initSocket } = require('./utils/socket');
const logger = require('./utils/logger');

const server = http.createServer(app);

let io = null;
if (config.NODE_ENV !== 'test') {
  io = initSocket(server, config.ALLOWED_ORIGINS);
}
app.set('io', io);

let isShuttingDown = false;

async function startServer(port = config.PORT) {
  try {
    // Connect to MongoDB
    if (config.NODE_ENV !== 'test') {
      await connectDB();
    }

    if (!io && config.NODE_ENV !== 'test') {
      io = initSocket(server, config.ALLOWED_ORIGINS);
      app.set('io', io);
    }

    return new Promise((resolve) => {
      server.listen(port, () => {
        logger.info(
          {
            port,
            env: config.NODE_ENV,
            apiDocs: `http://localhost:${port}/api-docs`,
            health: `http://localhost:${port}/api/v1/health`,
            ready: `http://localhost:${port}/api/v1/ready`
          },
          `LTTMS API server started successfully on port ${port}`
        );
        resolve(server);
      });
    });
  } catch (err) {
    logger.fatal({ err: err.message }, 'Failed to start server');
    process.exit(1);
  }
}

async function shutdown(signal = 'SIGTERM') {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown initiated');

  // Close HTTP server to stop accepting new requests
  server.close(async () => {
    logger.info('HTTP server closed');

    // Close Socket.IO connections if open
    if (io && typeof io.close === 'function') {
      io.close(() => {
        logger.info('Socket.IO connections closed');
      });
    }

    // Disconnect database
    try {
      await disconnectDB();
      logger.info('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (err) {
      logger.error({ err: err.message }, 'Error during database disconnect in shutdown');
      process.exit(1);
    }
  });

  // Force close if graceful shutdown takes too long (10s timeout)
  setTimeout(() => {
    logger.error('Shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
}

// Process lifecycle event listeners
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason instanceof Error ? reason.message : reason, stack: reason?.stack }, 'Unhandled Promise Rejection');
  if (config.isProduction) {
    shutdown('unhandledRejection');
  }
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'Uncaught Exception');
  shutdown('uncaughtException');
});

if (require.main === module) {
  startServer();
}

module.exports = {
  server,
  app,
  startServer,
  shutdown
};
