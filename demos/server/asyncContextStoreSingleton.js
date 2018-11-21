const AsyncContextStore = require('../..');

const asyncContextStore = new AsyncContextStore({
  debug: ['methods'],
}).enable();

module.exports = asyncContextStore;
