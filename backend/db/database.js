const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'campus_maintenance.sqlite');

let db = null;
let SQL = null;

async function initDB() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
    saveDB();
  }

  // Safe migrations for new mobile/community features
  try {
    db.run("ALTER TABLE maintenance_requests ADD COLUMN upvotes INTEGER DEFAULT 1;");
    saveDB();
  } catch (e) {}
  try {
    db.run("ALTER TABLE users ADD COLUMN reputation_points INTEGER DEFAULT 150;");
    saveDB();
  } catch (e) {}

  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  saveDB();
}

function all(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function exec(sql) {
  if (!db) throw new Error('Database not initialized');
  db.exec(sql);
  saveDB();
}

module.exports = {
  initDB,
  saveDB,
  run,
  all,
  get,
  exec,
  DB_FILE
};
