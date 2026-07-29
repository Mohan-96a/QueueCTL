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

### `status`

Read queue statistics from SQLite.

```bash
queuectl status
queuectl status --json
```

Shows job counts by state and worker counts (workers are not implemented yet).

### `list`

List stored jobs.

```bash
queuectl list
queuectl list --state pending
queuectl list --json
queuectl list --state pending --json
```

Valid states: `pending`, `processing`, `completed`, `failed`, `dead`.

## Project Structure

```text
queuectl/
├── src/
│   ├── commands/     # CLI command handlers
│   ├── config/       # Configuration loading
│   ├── db/           # Database initialization and schema
│   ├── models/       # Data access layer
│   └── index.js      # CLI entry point
├── data/             # SQLite database files
├── package.json
└── README.md
```

## Database Schema

- **configuration** — key/value settings
- **jobs** — queued shell commands and their state
- **workers** — worker registry (schema only in this phase)

## Current Phase

Phase 1 provides persistent job storage with `enqueue`, `status`, and `list`. Workers and job execution are not implemented yet.
