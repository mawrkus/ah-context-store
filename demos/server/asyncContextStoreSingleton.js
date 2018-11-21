const AsyncContextStore = require('../..');

module.exports = new AsyncContextStore({
  debug: [
    'methods',
    'hooks',
  ],
}).enable();
