const { getJobCountsByState } = require('../models/job');
const { getWorkerCounts } = require('../models/worker');

function formatStatus({ json = false } = {}) {
  const jobCounts = getJobCountsByState();
  const workerCounts = getWorkerCounts();

  const payload = {
    jobs: {
      pending: jobCounts.pending,
      processing: jobCounts.processing,
      completed: jobCounts.completed,
      failed: jobCounts.failed,
      dead: jobCounts.dead,
      total: jobCounts.total,
    },
    workers: {
      active: workerCounts.active,
      total: workerCounts.total,
    },
  };

  if (json) {
    return JSON.stringify(payload, null, 2);
  }

  const lines = [
    'QueueCTL Status',
    '===============',
    '',
    'Jobs:',
    `  pending:    ${payload.jobs.pending}`,
    `  processing: ${payload.jobs.processing}`,
    `  completed:  ${payload.jobs.completed}`,
    `  failed:     ${payload.jobs.failed}`,
    `  dead:       ${payload.jobs.dead}`,
    `  total:      ${payload.jobs.total}`,
    '',
    'Workers:',
    `  active: ${payload.workers.active}`,
    `  total:  ${payload.workers.total}`,
  ];

  return lines.join('\n');
}

function statusCommand(options = {}) {
  console.log(formatStatus(options));
}

module.exports = {
  formatStatus,
  statusCommand,
};
