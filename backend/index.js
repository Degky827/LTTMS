// LTTMS Backend Entry Point
// Maintains backward compatibility with external scripts, deployment blueprints, and test harnesses
const app = require('./app');
const { server, startServer, shutdown } = require('./server');

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.server = server;
module.exports.startServer = startServer;
module.exports.shutdown = shutdown;
