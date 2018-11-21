const createAsyncContextStoreSingleton = require('./createAsyncContextStoreSingleton');
const createApiClient = require('./createApiClient');

const asyncContextStore = createAsyncContextStoreSingleton();
const apiClient = createApiClient();

module.exports = {
  async getStatus({ requestId }) {
    const ua = asyncContextStore.get('request.ua');
    const { data } = await apiClient.get(`/api/${ua}/${requestId}`);

    return {
      requestId: asyncContextStore.get('request.id'),
      ua,
      ...data,
    };
  },
};
