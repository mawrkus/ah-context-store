const assert = require('assert').strict;

const createServer = require('./server/createServer');
const asyncContextStore = require('./server/asyncContextStoreSingleton');
const { resolveAfter, logSync, getRandomUA } = require('./helpers');

process.on('unhandledRejection', (error) => {
  logSync('Unhandled promise rejection!');
  logSync(error);
  process.exit(1);
});

(async () => {
  await Promise.all([
    resolveAfter(100, 'cacheSystem'),
    resolveAfter(100, 'eventsPublisher'),
  ]);

  const server = await createServer();
  await server.start();

  const requestsP = [];
  let requestsCount = 2;

  while (requestsCount-- >= 0) { // eslint-disable-line no-plusplus
    const requestP = server
      .inject({
        url: '/demo',
        headers: { 'user-agent': getRandomUA() },
      });

    requestsP.push(requestP);
  }

  const responses = await Promise.all(requestsP);

  logSync('All requests processed ->');

  responses.forEach(({ payload, request }) => {
    logSync('Request  ->', request.id, request.headers);
    logSync('Response ->', payload);

    assert.strictEqual(request.id, payload.requestId);
    assert.strictEqual(request.headers['user-agent'], payload.ua);
  });

  asyncContextStore.logStore();
})();
