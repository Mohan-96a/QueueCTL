#!/usr/bin/env node

const { Command } = require('commander');
const { getDatabase, closeDatabase } = require('./db/database');
const { enqueueCommand } = require('./commands/enqueue');
const { statusCommand } = require('./commands/status');
const { listCommand } = require('./commands/list');

function handleError(error) {
  if (error.code === 'MISSING_COMMAND' || error.code === 'INVALID_STATE') {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.error('Unexpected error:', error.message);
  process.exitCode = 1;
}

function run() {
  getDatabase();

  const program = new Command();

  program
    .name('queuectl')
    .description('CLI background job queue')
    .version('1.0.0');

  program
    .command('enqueue')
    .description('Enqueue a shell command as a background job')
    .argument('<command...>', 'Shell command to run')
    .action((commandParts) => {
      enqueueCommand(commandParts);
    });

  program
    .command('status')
    .description('Show queue and worker status from SQLite')
    .option('--json', 'Output status as JSON')
    .action((options) => {
      statusCommand(options);
    });

  program
    .command('list')
    .description('List jobs in the queue')
    .option('--state <state>', 'Filter jobs by state (pending, processing, completed, failed, dead)')
    .option('--json', 'Output jobs as JSON')
    .action((options) => {
      listCommand(options);
    });

  program.parse(process.argv);
}

try {
  run();
} catch (error) {
  handleError(error);
} finally {
  closeDatabase();
}
