const { resolveAfter } = require('../helpers');

let requestId = 42;

module.exports = [
  {
    name: 'set-request-id',
    register(server) {
      server.ext('onRequest', (request, h) => {
        request.id = requestId++; // eslint-disable-line no-plusplus

        h.asyncContextStore.log(`Executing server.ext.onRequest() -> new request.id=${request.id}`);

        h.asyncContextStore.set('request.id', request.id);
        h.asyncContextStore.set('request.ua', request.headers['user-agent']);

        h.asyncContextStore.logStore();

        return h.continue;
      });
    },
  },
  {
    name: 'pre-handler',
    register(server) {
      server.ext('onPreHandler', async (request, h) => {
        h.asyncContextStore.log(`Executing server.ext.onPreHandler(${request.id})...`);

        await resolveAfter(100, `server.ext.onPreHandler(${request.id})`);

        h.asyncContextStore.get('request.id');
        h.asyncContextStore.get('request.ua');

        return h.continue;
      });
    },
  },
];
