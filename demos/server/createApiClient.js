const axios = require('axios'); // eslint-disable-line import/no-extraneous-dependencies

const asyncContextStore = require('./asyncContextStore');

function createApiClient() {
  const client = axios.create({
    baseURL: 'http://localhost:3030',
    headers: {
      'user-agent': 'demo-server/1.0.0',
    },
  });

  client.interceptors.request.use((config) => {
    // eslint-disable-next-line no-param-reassign
    config.headers = {
      ...config.headers,
      'x-request-id': asyncContextStore.get('request.id'),
    };

    const { method, baseURL, url } = config;
    asyncContextStore.log(`<APICLIENT> ${method.toUpperCase()} ${baseURL}${url}`);

    return config;
  });

  return client;
}

module.exports = createApiClient;
