const path = require('path');

module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    path.resolve(__dirname, '../frontend')
  ],
  setupFiles: ['<rootDir>/tests/setup/jest.setup.js'],
  moduleNameMapper: {
    '^otplib$': '<rootDir>/tests/setup/otplibMock.js',
    '^node:test$': '<rootDir>/tests/setup/nodeTestBridge.js'
  },
  verbose: true,
  forceExit: true,
  testTimeout: 20000
};
