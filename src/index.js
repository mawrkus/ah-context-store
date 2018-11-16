const AsyncContextStore = require('./AsyncContextStore');

const asyncContextStore = new AsyncContextStore({ debug: false });

asyncContextStore.enable();

process.on('unhandledRejection', (error) => {
  asyncContextStore.log(error);
  process.exit(1);
});

const resolveAfter = ms => new Promise(resolve => setTimeout(resolve, ms));

const handle = async () => {
  asyncContextStore.get('pre');
  asyncContextStore.get('post');
  return resolveAfter(10);
};

(async () => {
  asyncContextStore.set('pre', 'initializing...');

  await resolveAfter(10);
  asyncContextStore.set('post', 'you');
  await resolveAfter(100);
  handle();

  await resolveAfter(20);
  asyncContextStore.set('post', 'me');
  handle();

  asyncContextStore.disable();
  asyncContextStore.log('Data ->', asyncContextStore.data);
  asyncContextStore.log('# of items ->', asyncContextStore.size);
})();
