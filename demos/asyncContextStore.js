const AsyncContextStore = require('..');

module.exports = new AsyncContextStore({
  debug: {
    methods: true,
    // hooks: true,
  },
}).enable();
