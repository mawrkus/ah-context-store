function resolveAfterFactory(logSync) {
  function resolveAfter(ms, callerId) {
    return new Promise((resolve) => {
      const randMs = Math.ceil(Math.random() * ms);

      logSync(`${callerId} -> ${randMs}ms...`);

      setTimeout(
        () => {
          logSync(`<- ${callerId} done in ${randMs}ms.`);
          resolve();
        },
        randMs,
      );
    });
  }
  return (ms, callerId) => resolveAfter(ms, callerId);
}

function helpersFactory(asyncContextStore) {
  process.on('unhandledRejection', (error) => {
    asyncContextStore.log('Unhandled promise rejection!');
    asyncContextStore.log(error);
    process.exit(1);
  });

  return {
    resolveAfter: resolveAfterFactory(asyncContextStore.log.bind(asyncContextStore)),
  };
}

module.exports = {
  helpersFactory,
};
