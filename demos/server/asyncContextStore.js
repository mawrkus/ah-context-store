const AsyncContextStore = require('../..');

// singleton
module.exports = new AsyncContextStore({
  debug: [
    'methods',
    // 'hooks',
  ],
}).enable();
