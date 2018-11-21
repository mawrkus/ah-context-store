const hapi = require('hapi'); // eslint-disable-line import/no-extraneous-dependencies

const createAsyncContextStoreSingleton = require('./createAsyncContextStoreSingleton');

const middlewares = require('./middlewares');
const routes = require('./routes');

module.exports = async function createServer() {
  const server = new hapi.Server({
    address: 'localhost',
    port: 3030,
  });

  server.decorate('toolkit', 'asyncContextStore', createAsyncContextStoreSingleton());

  await server.register(middlewares);
  await server.register(routes);

  return server;
};
