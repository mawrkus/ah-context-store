const hapi = require('hapi'); // eslint-disable-line import/no-extraneous-dependencies

const asyncContextStore = require('./asyncContextStore');
const middlewares = require('./middlewares');
const routes = require('./routes');
const { logSync, resolveAfter, randomUA } = require('./helpers');

process.on('unhandledRejection', (error) => {
  logSync(error);
  process.exit(1);
});

(async () => {
  const server = new hapi.Server();

  server.decorate('toolkit', 'asyncContextStore', asyncContextStore);

  await Promise.all([
    resolveAfter(100, 'cacheSystem'),
    resolveAfter(100, 'eventsPublisher'),
  ]);

  await server.register(middlewares);
  await server.register(routes);

  await server.start();

  const requestsP = [];
  let requestsCount = 10;

  while (requestsCount >= 0) {
    requestsCount -= 1;

    const requestP = server
      .inject({
        url: '/demo',
        headers: { 'user-agent': randomUA() },
      })
      .then((response) => {
        logSync('Store size=', asyncContextStore.size);
        return response;
      });

    requestsP.push(requestP);
  }

  const responses = await Promise.all(requestsP);

  logSync('All requests processed ->');

  responses.forEach(({ payload, request }) => {
    logSync('Request  ->', request.id, request.headers);
    logSync('Response ->', payload);
  });

  asyncContextStore.logStore();
})();
