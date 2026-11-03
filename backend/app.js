const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const { config } = require('./config/env');
const { httpLogger, requestContext } = require('./middleware/requestContext');
const { errorHandler, notFound } = require('./middleware/errorHandlers');
const { publicLimiter } = require('./middleware/rateLimiters');
const { checkDBHealth } = require('./config/database');

// Import route modules
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const bookingsRoutes = require('./routes/bookings');
const vendorsRoutes = require('./routes/vendors');
const reviewsRoutes = require('./routes/reviews');
const messagesRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const uploadsRoutes = require('./routes/uploads');
const paymentsRoutes = require('./routes/payments');

const app = express();

// Security and request context middleware
app.use(httpLogger);
app.use(requestContext);
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    if (config.ALLOWED_ORIGINS.includes('*') || config.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    // In development mode, allow localhost gracefully
    if (config.isDevelopment && origin.includes('localhost')) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly fallback
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(publicLimiter);

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root landing endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Lake Tana Tourism Management System (LTTMS) API',
    version: '1.0.0',
    status: 'online',
    docs: '/api-docs',
    endpoints: {
      v1: '/api/v1',
      legacy: '/api'
    }
  });
});

// Health check handler (liveness probe)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

// Readiness check handler (readiness probe)
const readinessHandler = (req, res) => {
  const dbHealth = checkDBHealth();
  const isReady = dbHealth.status === 'up';
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    success: isReady,
    status: isReady ? 'ready' : 'not_ready',
    dependencies: {
      database: dbHealth
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

// Metrics handler
const metricsHandler = (req, res) => {
  const dbHealth = checkDBHealth();
  res.status(200).json({
    success: true,
    metrics: {
      uptime: process.uptime(),
      memoryUsageRss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
      databaseReadyState: dbHealth.readyState
    },
    timestamp: new Date().toISOString()
  });
};

// Mount health and readiness routes (both at root and under /api/v1)
app.get('/health', healthHandler);
app.get('/ready', readinessHandler);
app.get('/metrics', metricsHandler);

// Create API v1 Router
const v1Router = express.Router();
v1Router.get('/health', healthHandler);
v1Router.get('/ready', readinessHandler);
v1Router.get('/metrics', metricsHandler);

v1Router.use('/auth', authRoutes);
v1Router.use('/services', servicesRoutes);
v1Router.use('/bookings', bookingsRoutes);
v1Router.use('/vendors', vendorsRoutes);
v1Router.use('/reviews', reviewsRoutes);
v1Router.use('/messages', messagesRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/uploads', uploadsRoutes);
v1Router.use('/payments', paymentsRoutes);

// Mount v1 router at /api/v1
app.use('/api/v1', v1Router);

// BACKWARD COMPATIBILITY: Mount the exact same router at /api
// This ensures that existing frontend calls (which target /api/*) continue to work seamlessly!
app.use('/api', v1Router);

// 404 and global error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
