const AsyncContextStore = require('..');
const { resolveAfter } = require('./helpers');

const demos = require('./promises');

const asyncContextStore = new AsyncContextStore({
  debug: [
    'methods',
    'hooks',
  ],
});

asyncContextStore.enable();

const demo = demos[`demo${process.argv[2] || 1}`];

demo({ asyncContextStore, resolveAfter });
