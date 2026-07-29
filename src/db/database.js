const Database = require('better-sqlite3');
const { DB_PATH, ensureDataDir } = require('./paths');
const { SCHEMA_SQL } = require('./schema');

let dbInstance = null;

function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDataDir();
  dbInstance = new Database(DB_PATH);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');
  dbInstance.exec(SCHEMA_SQL);

  return dbInstance;
}

function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
};
