const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function executeCommand(command) {
  const result = await execAsync(command, {
    shell: true,
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

module.exports = { executeCommand };
