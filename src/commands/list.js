const { listJobs } = require('../models/job');

function formatJobTable(jobs) {
  if (jobs.length === 0) {
    return 'No jobs found.';
  }

  const header = ['ID', 'STATE', 'COMMAND', 'CREATED'];
  const rows = jobs.map((job) => [
    job.id,
    job.state,
    job.command,
    job.created_at,
  ]);

  const widths = header.map((column, index) => {
    const maxCellWidth = rows.reduce((max, row) => Math.max(max, row[index].length), 0);
    return Math.max(column.length, maxCellWidth);
  });

  const formatRow = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ');

  return [formatRow(header), formatRow(widths.map((width) => '-'.repeat(width))), ...rows.map(formatRow)].join('\n');
}

function listCommand(options = {}) {
  const jobs = listJobs({ state: options.state });

  if (options.json) {
    console.log(JSON.stringify(jobs, null, 2));
    return;
  }

  console.log(formatJobTable(jobs));
}

module.exports = {
  formatJobTable,
  listCommand,
};
