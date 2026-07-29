#!/usr/bin/env node

const { Command } = require('commander');
const { getDatabase, closeDatabase } = require('./db/database');
const { enqueueCommand } = require('./commands/enqueue');
const { statusCommand } = require('./commands/status');
const { listCommand } = require('./commands/list');
const { workerStart } = require('./commands/worker-start');
const { workerStop } = require('./commands/worker-stop');

function handleError(error) {
  if (error.code === 'MISSING_COMMAND' || error.code === 'INVALID_STATE' || error.code === 'INVALID_COUNT') {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  console.error('Unexpected error:', error.message);
  process.exitCode = 1;
}

async function run() {
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

  const worker = program
    .command('worker')
    .description('Manage background workers');

  worker
    .command('start')
    .description('Start worker process(es) to execute pending jobs')
    .option('--count <n>', 'Number of worker processes to start', '1')
    .action(async (options) => {
      await workerStart(options);
    });

  worker
    .command('stop')
    .description('Gracefully stop all active workers via SIGTERM')
    .action(async () => {
      await workerStop();
    });

  await program.parseAsync(process.argv);
}

run()
  .catch((error) => {
    handleError(error);
  })
  .finally(() => {
    closeDatabase();
  });
