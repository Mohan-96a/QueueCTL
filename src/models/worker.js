const { getDatabase } = require('../db/database');
const { isProcessRunning } = require('../utils/process');

function nowIso() {
  return new Date().toISOString();
}

function registerWorker(id, pid) {
  const db = getDatabase();
  const timestamp = nowIso();

  db.prepare(`
    INSERT INTO workers (id, pid, status, last_heartbeat, created_at)
    VALUES (?, ?, 'active', ?, ?)
  `).run(id, pid, timestamp, timestamp);
}

function updateHeartbeat(id) {
  const db = getDatabase();
  db.prepare(`
    UPDATE workers
    SET last_heartbeat = ?, status = 'active'
    WHERE id = ?
  `).run(nowIso(), id);
}

function markWorkerStopped(id) {
  const db = getDatabase();
  db.prepare(`
    UPDATE workers
    SET status = 'stopped', last_heartbeat = ?
    WHERE id = ?
  `).run(nowIso(), id);
}

function getActiveWorkers() {
  const db = getDatabase();
  const workers = db.prepare(`
    SELECT * FROM workers
    WHERE status = 'active'
    ORDER BY created_at ASC
  `).all();

  return workers.filter((worker) => {
    if (!isProcessRunning(worker.pid)) {
      markWorkerStopped(worker.id);
      return false;
    }

    return true;
  });
}

function getWorkerCounts() {
  const db = getDatabase();
  const total = db.prepare('SELECT COUNT(*) AS count FROM workers').get().count;
  const active = getActiveWorkers().length;

  return { total, active };
}

function listWorkers() {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM workers
    ORDER BY created_at ASC
  `).all();
}

module.exports = {
  registerWorker,
  updateHeartbeat,
  markWorkerStopped,
  getActiveWorkers,
  getWorkerCounts,
  listWorkers,
};
