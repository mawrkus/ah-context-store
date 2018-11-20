async function asyncDemo({ asyncContextStore, resolveAfter }) {
  function handleRequest(requestId) {
    return resolveAfter(10, `handle(${requestId})`)
    .then(() => {
      asyncContextStore.logStore();
      asyncContextStore.get('request.id');
    });
  }

  const request1P = resolveAfter(10, 'request1')
    .then(() => {
      asyncContextStore.set('request.id', 42);
      asyncContextStore.logStore();
      return handleRequest(42);
    });

  const request2P = resolveAfter(10, 'request2')
    .then(() => {
      asyncContextStore.set('request.id', 69);
      asyncContextStore.logStore();
      return handleRequest(69);
    });

  Promise.all([request1P, request2P]).then(() => {
    asyncContextStore.get('request.id');
    asyncContextStore.disable();
  });
}

module.exports = asyncDemo;
