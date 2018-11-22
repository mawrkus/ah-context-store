const assert = require('assert').strict;
const repository = require('./repository');
const { resolveAfter } = require('../helpers');

function routeController() {
  return repository();
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
              const { req } = request.raw;
              h.asyncContextStore.log(`<ROUTE> ext.onPreAuth(${req._id},${req._ua})...`);

              assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
              assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

              await resolveAfter(100, `route.ext.onPreAuth(${req._id},${req._ua})`);

              assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
              assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

              return h.continue;
            }],
          },
        },
        pre: [async (request, h) => {
          const { req } = request.raw;
          h.asyncContextStore.log(`<ROUTE> pre(${req._id},${req._ua})...`);

          assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
          assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

          await resolveAfter(100, `route.pre(${req._id},${req._ua})`);

          assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
          assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

          return h.continue;
        }],
      },
      async handler(request, h) {
        const { req } = request.raw;
        h.asyncContextStore.log(`<ROUTE> handler(${req._id},${req._ua})...`);

        assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
        assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

        const response = await routeController();

        h.asyncContextStore.log('<ROUTE> response ->', response);

        assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
        assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

        assert.strictEqual(response.requestId, req._id);
        assert.strictEqual(response.ua, req._ua);

        return h.response(response).code(200);
      },
    });
  },
}, {
  name: 'api-endpoint',
  register(server) {
    server.route({
      method: 'GET',
      path: '/api/{ua}/{requestId}',
      handler(request, h) {
        const { ua, requestId } = request.params;
        h.asyncContextStore.log(`<API> GET /api/${ua}/${requestId} ->`, request.headers);
        return h.response({ status: 'green', requestId, ua }).code(200);
      },
    });
  },
}];
