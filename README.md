# QueueCTL

CLI-based background job queue with SQLite persistence.

## Requirements

- Node.js 18 or later
- npm

## Setup

```bash
npm install
```

The SQLite database is created automatically on first run at `data/queuectl.db`.

## Usage

Run commands through npm:

```bash
node src/index.js <command>
```

Or link the CLI globally:

```bash
npm link
queuectl <command>
```

## Commands

### `enqueue`

Store a shell command as a pending job.

```bash
queuectl enqueue echo hello world
queuectl enqueue npm test
```

Output includes the job ID, command, and state.

### `worker start`

Start one or more workers that poll for pending jobs, execute shell commands, and update job state.

```bash
queuectl worker start
queuectl worker start --count 3
```

- With `--count 1` (default), the worker runs in the foreground. Press `Ctrl+C` to shut down gracefully.
- With `--count N` where `N > 1`, workers run as detached background child processes.

Workers register in SQLite, send heartbeats, and support graceful shutdown via `SIGINT` / `SIGTERM`.

### `worker stop`

Send `SIGTERM` to all active workers for graceful shutdown.

```bash
queuectl worker stop
```

### `status`

Read queue statistics and active workers from SQLite.

```bash
queuectl status
queuectl status --json
```

Shows job counts by state and a list of active workers with PID and last heartbeat.

### `list`

List stored jobs.

```bash
queuectl list
queuectl list --state pending
queuectl list --json
queuectl list --state completed --json
```

Valid states: `pending`, `processing`, `completed`, `failed`, `dead`.

## Example Workflow

Terminal 1 — start workers:

```bash
queuectl worker start --count 2
```

Terminal 2 — enqueue and monitor:

```bash
queuectl enqueue echo job-one
queuectl enqueue echo job-two
queuectl status
queuectl list --state completed
```

Stop workers:

```bash
queuectl worker stop
```

## Project Structure

```text
queuectl/
├── src/
│   ├── commands/     # CLI command handlers
│   ├── config/       # Configuration loading
│   ├── db/           # Database initialization and schema
│   ├── models/       # Data access layer
│   ├── worker/       # Worker loop and job execution
│   └── index.js      # CLI entry point
├── data/             # SQLite database files
├── package.json
└── README.md
```

## Database Schema

- **configuration** — key/value settings
- **jobs** — queued shell commands and their state
- **workers** — worker registry with PID, status, and heartbeat

## Current Phase

Phase 2 adds worker execution with polling, job claiming, shell command execution, graceful shutdown, multi-worker support, and cross-process stop signaling. Retry logic is not implemented yet — failed jobs remain failed.
