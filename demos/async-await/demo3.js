async function asyncDemo({ asyncContextStore, resolveAfter }) {
  async function handleRequest(requestId) {
    await resolveAfter(10, `handle(${requestId})`);
    asyncContextStore.logStore();
    asyncContextStore.get('request.id');
  }

  const request1P = resolveAfter(10, 'request1')
    .then(async () => {
      asyncContextStore.set('request.id', 42);
      asyncContextStore.logStore();
      await handleRequest(42);
    });

  const request2P = resolveAfter(10, 'request2')
    .then(async () => {
      asyncContextStore.set('request.id', 69);
      asyncContextStore.logStore();
      await handleRequest(69);
    });

  await Promise.all([request1P, request2P]);

  asyncContextStore.get('request.id');

  asyncContextStore.disable();
}

module.exports = asyncDemo;
