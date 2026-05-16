const { randomUUID } = require('crypto');
const pinoHttp = require('pino-http');
const logger = require('../utils/logger');

const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => req.headers['x-request-id'] || randomUUID(),
  customProps: (req) => ({
    route: req.originalUrl,
    method: req.method
  })
});

const requestContext = (req, res, next) => {
  req.requestId = req.id || randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
};

module.exports = { httpLogger, requestContext };
