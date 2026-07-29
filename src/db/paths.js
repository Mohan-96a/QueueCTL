const path = require('path');
const fs = require('fs');

const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'queuectl.db');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

module.exports = {
  DATA_DIR,
  DB_PATH,
  ensureDataDir,
};
