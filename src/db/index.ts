import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'data', 'chisto.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

export function createTables() {
  // Drizzle doesn't auto-create — we do it manually
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','owner','cleaner','inspector')),
      color TEXT DEFAULT '#0F172A',
      sub TEXT DEFAULT '',
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      addr TEXT DEFAULT '',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      type TEXT DEFAULT 'apartment' CHECK(type IN ('apartment','studio','house','office','villa')),
      owner_id TEXT REFERENCES users(id),
      radius INTEGER DEFAULT 75,
      access TEXT DEFAULT '',
      utils TEXT DEFAULT '',
      zones TEXT DEFAULT '[]',
      vacant_since INTEGER,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      module TEXT NOT NULL CHECK(module IN ('cleaning','inspection')),
      mins INTEGER NOT NULL,
      icon TEXT DEFAULT '📋',
      season TEXT DEFAULT 'all' CHECK(season IN ('all','winter','summer')),
      items TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      template_id TEXT REFERENCES templates(id),
      assignee_id TEXT REFERENCES users(id),
      planned_at INTEGER NOT NULL,
      status TEXT DEFAULT 'planned' CHECK(status IN ('planned','in_progress','done','approved','disputed')),
      check_in INTEGER,
      check_out INTEGER,
      in_zone INTEGER,
      gps_acc INTEGER,
      items TEXT DEFAULT '[]',
      plan_id TEXT,
      review TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      template_id TEXT REFERENCES templates(id),
      name TEXT NOT NULL,
      module TEXT NOT NULL CHECK(module IN ('cleaning','inspection')),
      season TEXT DEFAULT 'all' CHECK(season IN ('all','winter','summer')),
      per_month INTEGER DEFAULT 1,
      price INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      started_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      property_id TEXT REFERENCES properties(id),
      reported_by_id TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      text TEXT DEFAULT '',
      photos TEXT DEFAULT '[]',
      status TEXT DEFAULT 'reported' CHECK(status IN ('reported','quoted','accepted','declined')),
      offer TEXT,
      decision TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      task_id TEXT REFERENCES tasks(id),
      property_id TEXT REFERENCES properties(id),
      reported_by_id TEXT REFERENCES users(id),
      text TEXT NOT NULL,
      photos TEXT DEFAULT '[]',
      open INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);
}
