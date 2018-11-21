const assert = require('assert').strict;
const repository = require('./repository');
const { resolveAfter } = require('../helpers');

function routeController(request) {
  return repository.getStatus({
    requestId: request.id,
  });
}

module.exports = [{
  name: 'demo-route',
  register(server) {
    server.route({
      method: 'GET',
      path: '/demo',
      config: {
        ext: {
          onPreAuth: {
            method: [async (request, h) => {
              h.asyncContextStore.log(`Executing route.ext.onPreAuth(${request.id})...`);

              await resolveAfter(100, `route.ext.onPreAuth(${request.id})`);

              h.asyncContextStore.get('request.id');
              h.asyncContextStore.get('request.ua');

              return h.continue;
            }],
          },
        },
        pre: [async (request, h) => {
          h.asyncContextStore.log(`Executing route.pre(${request.id})...`);

          await resolveAfter(100, `route.pre(${request.id})`);

          h.asyncContextStore.get('request.id');
          h.asyncContextStore.get('request.ua');

          return h.continue;
        }],
      },
      async handler(request, h) {
        h.asyncContextStore.log(`Executing route.handler(${request.id})...`);

        const payload = await routeController(request);

        const { id: requestId, headers } = request;

        assert.strictEqual(requestId, payload.requestId);
        assert.strictEqual(headers['user-agent'], payload.ua);

        return h.response(payload).code(200);
      },
    });
  },
}, {
  name: 'api-endpoint',
  register(server) {
    server.route({
      method: 'GET',
      path: '/api/{nickname}/{requestId}',
      handler(request, h) {
        const { nickname, requestId } = request.params;
        h.asyncContextStore.log(`* API request received from "${nickname}/${requestId}" ->`, request.headers);
        return h.response({ status: 'green', fromId: requestId }).code(200);
      },
    });
  },
}];
