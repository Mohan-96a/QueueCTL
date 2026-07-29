const { createJob } = require('../models/job');

function enqueueCommand(commandParts) {
  const command = commandParts.join(' ').trim();

  if (!command) {
    const error = new Error('Command is required. Usage: queuectl enqueue <command>');
    error.code = 'MISSING_COMMAND';
    throw error;
  }

  const job = createJob(command);

  console.log(`Job enqueued: ${job.id}`);
  console.log(`  command: ${job.command}`);
  console.log(`  state:   ${job.state}`);

  return job;
}

module.exports = { enqueueCommand };
