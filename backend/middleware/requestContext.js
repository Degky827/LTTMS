const { randomUUID } = require('crypto');
const pinoHttp = require('pino-http');
const logger = require('../utils/logger');
const { config } = require('../config/env');

const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
  customProps: (req) => ({
    route: req.originalUrl,
    method: req.method,
    requestId: req.id
  }),
  // Suppress verbose access logs for healthchecks to prevent log pollution
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/ready' || req.url === '/api/v1/health' || req.url === '/api/v1/ready'
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});

const requestContext = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || req.id || randomUUID();
  req.id = reqId;
  req.requestId = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

module.exports = { httpLogger, requestContext };
