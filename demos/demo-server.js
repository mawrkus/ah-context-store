const createServer = require('./server/createServer');
const { resolveAfter, logSync, getRandomUA } = require('./helpers');

process.on('unhandledRejection', (error) => {
  logSync('Unhandled promise rejection!');
  logSync(error);
  process.exit(1);
});

/* async function injectRequests(server) {
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

  await Promise.all(requestsP);

  logSync('All requests processed.');
} */

(async () => {
  await Promise.all([
    resolveAfter(100, 'cacheSystem'),
    resolveAfter(100, 'eventsPublisher'),
  ]);

  const server = await createServer();
  await server.start();

  // await injectRequests(server);
})();
