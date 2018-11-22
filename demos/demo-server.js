const createServer = require('./server/createServer');
const { resolveAfter, logSync } = require('./helpers');

process.on('unhandledRejection', (error) => {
  logSync('Unhandled promise rejection!');
  logSync(error);
  process.exit(1);
});

(async () => {
  await Promise.all([
    resolveAfter(100, 'cacheSystem.init'),
    resolveAfter(100, 'eventsPublisher.init'),
  ]);

  const server = await createServer();

  await server.start();
})();
