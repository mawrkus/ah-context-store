const AsyncContextStore = require('../..');

const asyncContextStore = new AsyncContextStore({
  debug: ['methods'],
});

asyncContextStore.enable();

module.exports = asyncContextStore;
