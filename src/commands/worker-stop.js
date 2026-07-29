const {
  getActiveWorkers,
  markWorkerStopped,
} = require('../models/worker');
const { isProcessRunning, sleep } = require('../utils/process');

async function workerStop() {
  const workers = getActiveWorkers();

  if (workers.length === 0) {
    console.log('No active workers found');
    return;
  }

  for (const worker of workers) {
    if (!worker.pid) {
      markWorkerStopped(worker.id);
      console.log(`Worker ${worker.id} has no pid, marked stopped`);
      continue;
    }

    try {
      process.kill(worker.pid, 'SIGTERM');
      console.log(`Sent SIGTERM to worker ${worker.id} (pid ${worker.pid})`);
    } catch (error) {
      if (error.code === 'ESRCH') {
        markWorkerStopped(worker.id);
        console.log(`Worker ${worker.id} (pid ${worker.pid}) not running, marked stopped`);
      } else {
        throw error;
      }
    }
  }

  await sleep(1500);

  for (const worker of workers) {
    if (!isProcessRunning(worker.pid)) {
      markWorkerStopped(worker.id);
    }
  }

  console.log('Worker stop signal sent');
}

module.exports = { workerStop };
