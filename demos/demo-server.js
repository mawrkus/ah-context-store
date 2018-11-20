const hapi = require('hapi'); // eslint-disable-line import/no-extraneous-dependencies

const asyncContextStore = require('./server/asyncContextStoreSingleton');

const middlewares = require('./server/middlewares');
const routes = require('./server/routes');

const userAgents = require('./server/ua');
const { helpersFactory } = require('./helpers');

const { resolveAfter } = helpersFactory(asyncContextStore);
const randomUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];

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
  let requestsCount = 2;

  while (requestsCount >= 0) {
    requestsCount -= 1;

    const requestP = server
      .inject({
        url: '/demo',
        headers: { 'user-agent': randomUA() },
      })
      .then((response) => {
        asyncContextStore.log('Store size=', asyncContextStore.size);
        return response;
      });

    requestsP.push(requestP);
  }

  const responses = await Promise.all(requestsP);

  asyncContextStore.log('All requests processed ->');

  responses.forEach(({ payload, request }) => {
    asyncContextStore.log('Request  ->', request.id, request.headers);
    asyncContextStore.log('Response ->', payload);
  });
})();
