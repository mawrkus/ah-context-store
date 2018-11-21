const axios = require('axios'); // eslint-disable-line import/no-extraneous-dependencies

const createAsyncContextStoreSingleton = require('./createAsyncContextStoreSingleton');

function createApiClient() {
  const client = axios.create({
    baseURL: 'http://localhost:3030',
  });

  const asyncContextStore = createAsyncContextStoreSingleton();

  client.interceptors.request.use((config) => {
    // eslint-disable-next-line no-param-reassign
    config.headers = {
      ...config.headers,
      'user-agent': 'demo-server/1.0.0',
      'x-request-id': asyncContextStore.get('request.id'),
    };
    return config;
  });

  return client;
}

module.exports = createApiClient;
