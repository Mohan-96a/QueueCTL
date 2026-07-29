const { v4: uuidv4 } = require('uuid');
const { getDatabase, closeDatabase } = require('../db/database');
const {
  registerWorker,
  updateHeartbeat,
  markWorkerStopped,
} = require('../models/worker');
const {
  claimNextJob,
  completeJob,
  failJob,
} = require('../models/job');
const { executeCommand } = require('./executor');

const POLL_INTERVAL_MS = 1000;
const HEARTBEAT_INTERVAL_MS = 5000;

let shuttingDown = false;
let workerId = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initiateShutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Worker ${workerId} shutting down (${signal})...`);
}

async function runWorker() {
  getDatabase();

  workerId = uuidv4();
  registerWorker(workerId, process.pid);
  console.log(`Worker started: ${workerId} (pid ${process.pid})`);

  const heartbeatTimer = setInterval(() => {
    if (!shuttingDown) {
      updateHeartbeat(workerId);
    }
  }, HEARTBEAT_INTERVAL_MS);

  process.on('SIGINT', () => initiateShutdown('SIGINT'));
  process.on('SIGTERM', () => initiateShutdown('SIGTERM'));

  while (!shuttingDown) {
    const job = claimNextJob();

    if (!job) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    console.log(`Processing job ${job.id}: ${job.command}`);

    try {
      await executeCommand(job.command);
      completeJob(job.id);
      console.log(`Job ${job.id} completed`);
    } catch (error) {
      failJob(job.id);
      const detail = error.stderr || error.message;
      console.error(`Job ${job.id} failed: ${detail}`.trim());
    }
  }

  clearInterval(heartbeatTimer);
  markWorkerStopped(workerId);
  console.log(`Worker ${workerId} stopped`);
  closeDatabase();
}

if (require.main === module) {
  runWorker().catch((error) => {
    console.error('Worker crashed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { runWorker };
