const assert = require('assert').strict;

async function asyncDemo2({ asyncContextStore, resolveAfter }) {
  asyncContextStore.log('- -- --- async/await: demo2 --- -- -');

  asyncContextStore.set('request.id', 42).logStore();
  assert.strictEqual(42, asyncContextStore.get('request.id'));

  await resolveAfter(10, 'timer');

  asyncContextStore.logStore();
  assert.strictEqual(42, asyncContextStore.get('request.id'));

  asyncContextStore.set('request.id', 69);
  assert.strictEqual(69, asyncContextStore.get('request.id'));

  await resolveAfter(10, 'timer');

  asyncContextStore.logStore();
  assert.strictEqual(69, asyncContextStore.get('request.id'));
  asyncContextStore.logStore().disable();
}

module.exports = asyncDemo2;
