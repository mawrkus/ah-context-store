const fs = require('fs');
const { format } = require('util');

function logSync(...args) {
  fs.writeSync(1, `${format(...args)}\n`);
}

function resolveAfter(ms, callerId) {
  return new Promise((resolve) => {
    const randMs = Math.ceil(Math.random() * ms);

    logSync(` -> ${callerId} -> ${randMs}ms...`);

    setTimeout(
      () => {
        logSync(` <- ${callerId} <- done in ${randMs}ms.`);
        resolve();
      },
      randMs,
    );
  });
}

module.exports = {
  resolveAfter,
  logSync,
};
