const http = require('http');
const hapi = require('hapi'); // eslint-disable-line import/no-extraneous-dependencies

const asyncContextStore = require('./asyncContextStore');
const routes = require('./routes');
const middlewares = require('./middlewares');

function createServerListener() {
  let currentRequestId = 1;

  function initRequestContext(req) {
    const { method, url, headers } = req;
    const requestId = headers['x-request-id'] || currentRequestId;

    // testing purposes only
    req._id = String(requestId);
    req._ua = headers['user-agent'];

    asyncContextStore.log(`<REQUEST> ${method} ${url} from "${req._ua}" -> request.id=${req._id}`, headers);

    asyncContextStore
      .set('request.id', req._id)
      .set('request.ua', req._ua);

    asyncContextStore.log(`# contexts in store=${asyncContextStore.size}`);

    currentRequestId += 1;
  }

  return http.createServer({}, initRequestContext);
}

module.exports = async function createServer() {
  const server = new hapi.Server({
    listener: createServerListener(),
    address: 'localhost',
    port: 3030,
  });

  server.decorate('toolkit', 'asyncContextStore', asyncContextStore);

  await Promise.all([
    server.register(middlewares),
    server.register(routes),
  ]);

  return server;
};
