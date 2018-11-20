async function asyncDemo({ asyncContextStore, resolveAfter }) {
  asyncContextStore.set('request.id', 42);
  asyncContextStore.logStore();

  resolveAfter(10, 'timer')
    .then(() => {
      asyncContextStore.logStore();
      asyncContextStore.get('request.id');
      asyncContextStore.disable();
    });
}

module.exports = asyncDemo;
