const model = require('./model');

const { helpersFactory } = require('../helpers');
const asyncContextStore = require('./asyncContextStoreSingleton');

const { resolveAfter } = helpersFactory(asyncContextStore);

async function routeController(request, h) {
  const modelData = await model({
    requestId: request.id,
  });
  return h.response(modelData).code(200);
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
        return routeController(request, h, resolveAfter);
      },
    });
  },
}];
