const assert = require('assert').strict;

function promiseDemo2({ asyncContextStore, resolveAfter }) {
  asyncContextStore.log('- -- --- promises: demo2 --- -- -');

  asyncContextStore.set('request.id', 42).logStore();
  assert.strictEqual(42, asyncContextStore.get('request.id'));

  return resolveAfter(10, 'timer')
    .then(() => {
      asyncContextStore.logStore();
      assert.strictEqual(42, asyncContextStore.get('request.id'));

      asyncContextStore.set('request.id', 69).logStore();
      assert.strictEqual(69, asyncContextStore.get('request.id'));

      return resolveAfter(10, 'timer');
    })
    .then(() => {
      asyncContextStore.logStore();
      assert.strictEqual(69, asyncContextStore.get('request.id'));
      asyncContextStore.logStore().disable();
    });
}

module.exports = promiseDemo2;
