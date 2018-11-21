const fs = require('fs');
const { format } = require('util');

const USER_AGENTS = require('./server/ua');

function logSync(...args) {
  fs.writeSync(1, `${format(...args)}\n`);
}

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

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

module.exports = {
  resolveAfter,
  logSync,
  getRandomUA,
};
