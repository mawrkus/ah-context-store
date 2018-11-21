const AsyncContextStore = require('..');
const { resolveAfter } = require('./helpers');

const demos = require('./async-await');

const asyncContextStore = new AsyncContextStore({
  debug: [
    'methods',
    'hooks',
  ],
}).enable();

const demo = demos[`demo${process.argv[2] || 1}`];

demo({ asyncContextStore, resolveAfter });
