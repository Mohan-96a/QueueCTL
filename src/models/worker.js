const { getDatabase } = require('../db/database');

function getWorkerCounts() {
  const db = getDatabase();
  const total = db.prepare('SELECT COUNT(*) AS count FROM workers').get().count;
  const active = db.prepare(`
    SELECT COUNT(*) AS count
    FROM workers
    WHERE status = 'active'
  `).get().count;

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
  getWorkerCounts,
  listWorkers,
};
