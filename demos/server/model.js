const asyncContextStore = require('./asyncContextStoreSingleton');
const { resolveAfter } = require('../helpers');

module.exports = async ({ requestId }) => {
  await resolveAfter(100, `model(${requestId})`);

  return {
    requestId: asyncContextStore.get('request.id'),
    ua: asyncContextStore.get('request.ua'),
    status: 'processed',
  };
};
