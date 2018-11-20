const asyncContextStore = require('./asyncContextStore');
const userAgents = require('./ua');

function logSync(...args) {
  const currentId = asyncContextStore._asyncHooks.executionAsyncId();
  asyncContextStore.log(`[${currentId}]`, ...args);
}

function resolveAfter(ms, callerId) {
  return new Promise((resolve) => {
    const randMs = Math.ceil(Math.random() * ms);
    logSync(`${callerId} -> ${randMs}ms...`);
    setTimeout(() => { logSync(`<- ${callerId} done in ${randMs}ms.`); resolve(); }, randMs);
  });
}

function randomUA() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

module.exports = {
  logSync,
  resolveAfter,
  randomUA,
};
