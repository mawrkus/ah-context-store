const AsyncContextStore = require('..');
const { helpersFactory } = require('./helpers');

const demos = require('./promises');

const asyncContextStore = new AsyncContextStore({
  debug: ['methods'],
});

asyncContextStore.enable();

const { resolveAfter } = helpersFactory(asyncContextStore);

demos.demo1({ asyncContextStore, resolveAfter });
// demos.demo2({ asyncContextStore, resolveAfter });
// demos.demo3({ asyncContextStore, resolveAfter });
