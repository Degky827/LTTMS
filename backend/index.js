const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { httpLogger, requestContext } = require('./middleware/requestContext');
const { errorHandler, notFound } = require('./middleware/errorHandlers');
const { publicLimiter } = require('./middleware/rateLimiters');
const logger = require('./utils/logger');

// Route files
const auth = require('./routes/auth');
const services = require('./routes/services');
const bookings = require('./routes/bookings');
const vendors = require('./routes/vendors');
const reviews = require('./routes/reviews');
const messages = require('./routes/messages');
const admin = require('./routes/admin');
const uploads = require('./routes/uploads');
const payments = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());
app.use(httpLogger);
app.use(requestContext);
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS origin not allowed'));
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(publicLimiter);

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => logger.info('MongoDB connected successfully'))
    .catch(err => {
      logger.error({ err: err.message }, 'MongoDB connection error');
      process.exit(1);
    });
}

// Mount routers
app.use('/api/auth', auth);
app.use('/api/services', services);
app.use('/api/bookings', bookings);
app.use('/api/vendors', vendors);
app.use('/api/reviews', reviews);
app.use('/api/messages', messages);
app.use('/api/admin', admin);
app.use('/api/uploads', uploads);
app.use('/api/payments', payments);
app.use('/uploads', express.static('uploads'));

// Basic Route
app.get('/', (req, res) => {
  res.send('LTTMS API is running...');
});

// Healthcheck endpoint for deployment probes
app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    status: dbConnected ? 'ok' : 'degraded',
    dependencies: {
      mongodb: dbConnected ? 'up' : 'down'
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', async (req, res) => {
  res.status(200).json({
    success: true,
    metrics: {
      uptime: process.uptime(),
      memoryRss: process.memoryUsage().rss,
      dbReadyState: mongoose.connection.readyState
    }
  });
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
