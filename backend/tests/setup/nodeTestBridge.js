// Bridge to allow tests written with 'node:test' to seamlessly execute under Jest
const bridgeTest = function (name, fn) {
  if (typeof global.test === 'function') {
    return global.test(name, fn);
  }
  return null;
};

bridgeTest.beforeEach = (fn) => {
  if (typeof global.beforeEach === 'function') return global.beforeEach(fn);
};

bridgeTest.afterEach = (fn) => {
  if (typeof global.afterEach === 'function') return global.afterEach(fn);
};

bridgeTest.before = (fn) => {
  if (typeof global.beforeAll === 'function') return global.beforeAll(fn);
};

bridgeTest.after = (fn) => {
  if (typeof global.afterAll === 'function') return global.afterAll(fn);
};

bridgeTest.describe = (name, fn) => {
  if (typeof global.describe === 'function') return global.describe(name, fn);
};

bridgeTest.it = (name, fn) => {
  if (typeof global.it === 'function') return global.it(name, fn);
};

module.exports = bridgeTest;
module.exports.default = bridgeTest;
module.exports.test = bridgeTest;
module.exports.describe = bridgeTest.describe;
module.exports.it = bridgeTest.it;
module.exports.before = bridgeTest.before;
module.exports.after = bridgeTest.after;
module.exports.beforeEach = bridgeTest.beforeEach;
module.exports.afterEach = bridgeTest.afterEach;
