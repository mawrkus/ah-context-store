async function asyncDemo({ asyncContextStore, resolveAfter }) {
  asyncContextStore.set('request.id', 42);
  asyncContextStore.logStore();

  await resolveAfter(10, 'timer');

  asyncContextStore.logStore();
  asyncContextStore.get('request.id');

  asyncContextStore.disable();
}

module.exports = asyncDemo;
