const assert = require('assert').strict;

async function asyncDemo({ asyncContextStore, resolveAfter }) {
  asyncContextStore.log('- -- --- promises: demo3 --- -- -');

  function handleRequest(requestId) {
    return resolveAfter(10, `handle(${requestId})`)
      .then(() => {
        asyncContextStore.logStore();
        assert.strictEqual(requestId, asyncContextStore.get('request.id'));
      });
  }

  const request1P = resolveAfter(10, 'request1')
    .then(() => {
      asyncContextStore.set('request.id', 42).logStore();
      assert.strictEqual(42, asyncContextStore.get('request.id'));
      return handleRequest(42);
    });

  const request2P = resolveAfter(10, 'request2')
    .then(() => {
      asyncContextStore.set('request.id', 69).logStore();
      assert.strictEqual(69, asyncContextStore.get('request.id'));
      return handleRequest(69);
    });

  Promise.all([request1P, request2P])
    .then(() => {
      assert.strictEqual(undefined, asyncContextStore.get('request.id'));
    })
    .then(() => {
      asyncContextStore.logStore().disable();
    });
}

module.exports = asyncDemo;
