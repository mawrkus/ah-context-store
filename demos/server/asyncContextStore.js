const AsyncContextStore = require('../..');

// singleton
const asyncContextStore = new AsyncContextStore({
  debug: [
    'methods',
    // 'hooks',
  ],
});

asyncContextStore.enable();

module.exports = asyncContextStore;
