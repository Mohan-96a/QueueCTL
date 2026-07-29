const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../db/database');

const VALID_STATES = ['pending', 'processing', 'completed', 'failed', 'dead'];

function nowIso() {
  return new Date().toISOString();
}

function createJob(command) {
  const db = getDatabase();
  const id = uuidv4();
  const timestamp = nowIso();

  db.prepare(`
    INSERT INTO jobs (id, command, state, created_at, updated_at)
    VALUES (?, ?, 'pending', ?, ?)
  `).run(id, command, timestamp, timestamp);

  return getJobById(id);
}

function getJobById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) || null;
}

function listJobs({ state } = {}) {
  const db = getDatabase();

  if (state) {
    if (!VALID_STATES.includes(state)) {
      const error = new Error(`Invalid state: ${state}. Valid states: ${VALID_STATES.join(', ')}`);
      error.code = 'INVALID_STATE';
      throw error;
    }

    return db.prepare(`
      SELECT * FROM jobs
      WHERE state = ?
      ORDER BY created_at ASC
    `).all(state);
  }

  return db.prepare(`
    SELECT * FROM jobs
    ORDER BY created_at ASC
  `).all();
}

function getJobCountsByState() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT state, COUNT(*) AS count
    FROM jobs
    GROUP BY state
  `).all();

  const counts = VALID_STATES.reduce((acc, state) => {
    acc[state] = 0;
    return acc;
  }, {});

  for (const row of rows) {
    counts[row.state] = row.count;
  }

  counts.total = rows.reduce((sum, row) => sum + row.count, 0);
  return counts;
}

function claimNextJob() {
  const db = getDatabase();

  return db.transaction(() => {
    const job = db.prepare(`
      SELECT * FROM jobs
      WHERE state = 'pending'
      ORDER BY created_at ASC
      LIMIT 1
    `).get();

    if (!job) {
      return null;
    }

    const timestamp = nowIso();
    const result = db.prepare(`
      UPDATE jobs
      SET state = 'processing', updated_at = ?
      WHERE id = ? AND state = 'pending'
    `).run(timestamp, job.id);

    if (result.changes === 0) {
      return null;
    }

    return getJobById(job.id);
  })();
}

function completeJob(id) {
  const db = getDatabase();
  db.prepare(`
    UPDATE jobs
    SET state = 'completed', updated_at = ?
    WHERE id = ?
  `).run(nowIso(), id);
}

function failJob(id) {
  const db = getDatabase();
  db.prepare(`
    UPDATE jobs
    SET state = 'failed', updated_at = ?
    WHERE id = ?
  `).run(nowIso(), id);
}

module.exports = {
  VALID_STATES,
  createJob,
  getJobById,
  listJobs,
  getJobCountsByState,
  claimNextJob,
  completeJob,
  failJob,
};
