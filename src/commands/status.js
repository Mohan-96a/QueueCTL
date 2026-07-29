const { getJobCountsByState } = require('../models/job');
const { getWorkerCounts, getActiveWorkers } = require('../models/worker');

function formatWorkerTable(workers) {
  if (workers.length === 0) {
    return '  (none)';
  }

  const header = ['ID', 'PID', 'STATUS', 'LAST HEARTBEAT'];
  const rows = workers.map((worker) => [
    worker.id,
    String(worker.pid ?? '-'),
    worker.status,
    worker.last_heartbeat ?? '-',
  ]);

  const widths = header.map((column, index) => {
    const maxCellWidth = rows.reduce((max, row) => Math.max(max, row[index].length), 0);
    return Math.max(column.length, maxCellWidth);
  });

  const formatRow = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ');

  return [
    `  ${formatRow(header)}`,
    `  ${formatRow(widths.map((width) => '-'.repeat(width)))}`,
    ...rows.map((row) => `  ${formatRow(row)}`),
  ].join('\n');
}

function formatStatus({ json = false } = {}) {
  const jobCounts = getJobCountsByState();
  const workerCounts = getWorkerCounts();
  const activeWorkers = getActiveWorkers();

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
      list: activeWorkers,
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
    '',
    formatWorkerTable(activeWorkers),
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
