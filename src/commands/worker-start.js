const path = require('path');
const { fork } = require('child_process');
const { runWorker } = require('../worker/entry');

function parseCount(value) {
  const count = Number.parseInt(value, 10);

  if (Number.isNaN(count) || count < 1) {
    const error = new Error('Count must be a positive integer');
    error.code = 'INVALID_COUNT';
    throw error;
  }

  return count;
}

async function workerStart(options = {}) {
  const count = parseCount(options.count ?? 1);

  if (count === 1) {
    await runWorker();
    return;
  }

  const entryPath = path.join(__dirname, '..', 'worker', 'entry.js');

  for (let i = 0; i < count; i += 1) {
    const child = fork(entryPath, [], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  }

  console.log(`Started ${count} workers in background`);
  console.log('Use "queuectl worker stop" to shut them down');
}

module.exports = { workerStart };
