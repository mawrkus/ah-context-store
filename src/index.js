const EventsEmitter = require('events');
const AsyncContext = require('./AsyncContext');

const asyncContext = new AsyncContext({ debug: false });

asyncContext.enable();

process.on('unhandledRejection', (error) => {
  asyncContext.log(error);
  process.exit(1);
});

const resolveAfter = (randMs, fixedMs) => new Promise((resolve) => {
  setTimeout(resolve, randMs ? Math.ceil(Math.random() * randMs) : fixedMs);
});

const handle = async () => {
  asyncContext.get('init');
  asyncContext.get('loop-post-resolve');
  return resolveAfter(10);
};

const listener = new EventsEmitter();

listener.on('request', async (event) => {
  asyncContext.set('loop-post-resolve', event);

  await handle();

  asyncContext.get('init');
  asyncContext.get('loop-post-resolve');
});

(async () => {
  asyncContext.set('init', 'here we gooo...');

  for (let i = 0; i < 2; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await resolveAfter(10);
    listener.emit('request', `request #${i + 1}`);
  }

  await resolveAfter(null, 100);

  asyncContext.disable();
  asyncContext.log('Data ->', asyncContext.data);
  asyncContext.log('# of items ->', asyncContext.size);
})();
