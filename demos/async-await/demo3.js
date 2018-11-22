const assert = require('assert').strict;

async function asyncDemo3({ asyncContextStore, resolveAfter }) {
  asyncContextStore.log('- -- --- async/await: demo3 --- -- -');

  async function handleRequest(requestId) {
    await resolveAfter(10, `handle(${requestId})`);
    asyncContextStore.logStore();
    assert.strictEqual(requestId, asyncContextStore.get('request.id'));
  }

  const request1P = resolveAfter(10, 'request1')
    .then(async () => {
      asyncContextStore.set('request.id', 42).logStore();
      await handleRequest(42);
      assert.strictEqual(42, asyncContextStore.get('request.id'));
    });

  const request2P = resolveAfter(10, 'request2')
    .then(async () => {
      asyncContextStore.set('request.id', 69).logStore();
      await handleRequest(69);
      assert.strictEqual(69, asyncContextStore.get('request.id'));
    });

  await Promise.all([request1P, request2P]);

  assert.strictEqual(undefined, asyncContextStore.get('request.id'));
  asyncContextStore.logStore().disable();
}

module.exports = asyncDemo3;
