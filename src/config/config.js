const { getDatabase } = require('../db/database');

function getConfig(key, defaultValue = null) {
  const db = getDatabase();
  const row = db.prepare('SELECT value FROM configuration WHERE key = ?').get(key);

  if (!row) {
    return defaultValue;
  }

  return row.value;
}

function getAllConfig() {
  const db = getDatabase();
  const rows = db.prepare('SELECT key, value FROM configuration ORDER BY key').all();

  return rows.reduce((config, row) => {
    config[row.key] = row.value;
    return config;
  }, {});
}

function setConfig(key, value) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO configuration (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

module.exports = {
  getConfig,
  getAllConfig,
  setConfig,
};
