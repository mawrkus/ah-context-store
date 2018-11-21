const AsyncContextStore = require('../..');

let asyncContextStore;

function createAsyncContextStoreSingleton() {
  if (!asyncContextStore) {
    asyncContextStore = new AsyncContextStore({
      debug: [
        'methods',
        // 'hooks',
      ],
    }).enable();
  }

  return asyncContextStore;
}

module.exports = createAsyncContextStoreSingleton;
