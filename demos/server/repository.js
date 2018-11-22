const asyncContextStore = require('./asyncContextStore');
const createApiClient = require('./createApiClient');

const apiClient = createApiClient();

module.exports = async () => {
  const requestId = asyncContextStore.get('request.id');
  const requestUa = asyncContextStore.get('request.ua');

  const { data } = await apiClient.request({
    method: 'GET',
    url: `/api/${requestUa}/${requestId}`,
  });

  return data;
};
