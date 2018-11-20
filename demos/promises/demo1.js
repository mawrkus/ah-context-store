const assert = require('assert').strict;

async function asyncDemo({ asyncContextStore, resolveAfter }) {
  asyncContextStore.log('- -- --- promises: demo1 --- -- -');

  asyncContextStore.set('request.id', 42).logStore();

  resolveAfter(10, 'timer')
    .then(() => {
      asyncContextStore.logStore();
      assert.strictEqual(42, asyncContextStore.get('request.id'));
    })
    .then(() => {
      asyncContextStore.logStore().disable();
    });
}

module.exports = asyncDemo;
