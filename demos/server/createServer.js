const hapi = require('hapi'); // eslint-disable-line import/no-extraneous-dependencies

const asyncContextStore = require('./asyncContextStoreSingleton');
const middlewares = require('./middlewares');
const routes = require('./routes');

module.exports = async function createServer() {
  const server = new hapi.Server();

  server.decorate('toolkit', 'asyncContextStore', asyncContextStore);

  await server.register(middlewares);
  await server.register(routes);

  return server;
};
