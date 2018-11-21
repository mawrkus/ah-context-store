const AsyncContextStore = require('..');
const { helpersFactory } = require('./helpers');

const demos = require('./async-await');

const asyncContextStore = new AsyncContextStore({
  debug: [
    'methods',
    'hooks',
  ],
}).enable();

const { resolveAfter } = helpersFactory(asyncContextStore);

const demo = demos[`demo${process.argv[2] || 1}`];

demo({ asyncContextStore, resolveAfter });
