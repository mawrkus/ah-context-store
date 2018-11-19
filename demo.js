const AsyncContextStore = require('./src/AsyncContextStore');

const asyncContextStore = new AsyncContextStore({
  debug: {
    // methods: true,
    // hooks: true,
  },
});

asyncContextStore.enable();

process.on('unhandledRejection', (error) => {
  asyncContextStore.log(error);
  process.exit(1);
});

const resolveAfter = (ms, callerId) => new Promise((resolve) => {
  const randMs = Math.ceil(Math.random() * ms);

  asyncContextStore.log('%s -> waiting for %dms...', callerId, randMs);

  setTimeout(() => {
    asyncContextStore.log('%s -> done waiting for %dms!', callerId, randMs);
    resolve();
  }, randMs);
});

const getResource = async (resourceId) => {
  asyncContextStore.log('Getting %s resource...', resourceId);
  asyncContextStore.get('request-id');

  await resolveAfter(100, resourceId);

  asyncContextStore.log('Done getting %s resource!', resourceId);
  asyncContextStore.get('request-id');
};

const model = async () => {
  const resourceP = getResource('main');
  const linkedResourceP = resourceP.then(() => getResource('linked'));
  const extraResourceP = getResource('extra');
  return Promise.all([resourceP, linkedResourceP, extraResourceP]);
};

let currentId = 42;

const controller = async () => {
  await resolveAfter(10, 'controller');
  asyncContextStore.set('request-id', currentId);
  currentId += 1;
  await model();
};

(async () => {
  const request1P = controller();
  const request2P = controller();

  await Promise.all([request1P, request2P]);

  asyncContextStore.disable(false);
  asyncContextStore.log('Data ->', asyncContextStore.data);
  asyncContextStore.log('# of items ->', asyncContextStore.size);
})();
