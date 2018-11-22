const assert = require('assert').strict;

const { resolveAfter } = require('../helpers');

module.exports = [{
  name: 'server-ext-pre-handler',
  register(server) {
    server.ext('onPreHandler', async (request, h) => {
      const { req } = request.raw;
      h.asyncContextStore.log(`<EXT> server.ext.onPreHandler(${req._id},${req._ua})...`);

      assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
      assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

      await resolveAfter(100, `server.ext.onPreHandler(${req._id},${req._ua})`);

      assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
      assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

      return h.continue;
    });
  },
}, {
  name: 'server-ext-post-handler',
  register(server) {
    server.ext('onPostHandler', async (request, h) => {
      const { req } = request.raw;
      h.asyncContextStore.log(`<EXT> server.ext.onPostHandler(${req._id},${req._ua})...`);

      assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
      assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

      await resolveAfter(100, `server.ext.onPostHandler(${req._id},${req._ua})`);

      assert.strictEqual(h.asyncContextStore.get('request.id'), req._id);
      assert.strictEqual(h.asyncContextStore.get('request.ua'), req._ua);

      return h.continue;
    });
  },
}];
