const model = require('./model');
const { logSync, resolveAfter } = require('./helpers');

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
              logSync(`Executing route.ext.onPreAuth(${request.id})...`);

              await resolveAfter(100, `route.ext.onPreAuth(${request.id})`);
              h.asyncContextStore.get('request.id');
              h.asyncContextStore.get('request.ua');

              return h.continue;
            }],
          },
        },
        pre: [async (request, h) => {
          logSync(`Executing route.pre(${request.id})...`);

          await resolveAfter(100, `route.pre(${request.id})`);
          h.asyncContextStore.get('request.id');
          h.asyncContextStore.get('request.ua');

          return h.continue;
        }],
      },
      async handler(request, h) {
        logSync(`Executing route.handler(${request.id})...`);
        return routeController(request, h, resolveAfter);
      },
    });
  },
}];
