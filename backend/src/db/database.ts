import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.resolve(dataDir, 'app.db');

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    pseudocode TEXT NOT NULL DEFAULT '',
    mindmap TEXT,
    problem_statement TEXT NOT NULL DEFAULT '',
    thinking_time INTEGER NOT NULL DEFAULT 15,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    note_id TEXT NOT NULL,
    thinking_score INTEGER,
    authenticity_score INTEGER,
    thinking_time INTEGER NOT NULL DEFAULT 15,
    problem_statement TEXT,
    edit_count INTEGER DEFAULT 0,
    rewrite_count INTEGER DEFAULT 0,
    ai_analysis_result TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    note_id TEXT,
    type TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE SET NULL
  );
`);

function migrateColumn(table: string, column: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

migrateColumn('notes', 'problem_statement', "TEXT NOT NULL DEFAULT ''");
migrateColumn('sessions', 'problem_statement', 'TEXT');
migrateColumn('sessions', 'edit_count', 'INTEGER DEFAULT 0');
migrateColumn('sessions', 'rewrite_count', 'INTEGER DEFAULT 0');
migrateColumn('sessions', 'ai_analysis_result', 'TEXT');

export default db;
