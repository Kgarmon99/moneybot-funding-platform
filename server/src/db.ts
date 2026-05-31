import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '../data');
import { mkdirSync } from 'fs';
mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'funding.db');

export const db = new Database(dbPath);

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_name TEXT NOT NULL,
      amount REAL NOT NULL,
      deadline TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'Lead',
      last_action TEXT NOT NULL DEFAULT '',
      next_action TEXT NOT NULL DEFAULT '',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS grants_accelerators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      organization TEXT NOT NULL,
      check_size_min REAL NOT NULL,
      check_size_max REAL NOT NULL,
      stage TEXT NOT NULL,
      sector TEXT NOT NULL,
      location TEXT NOT NULL,
      deadline TEXT NOT NULL,
      description TEXT NOT NULL,
      apply_url TEXT NOT NULL,
      status TEXT DEFAULT 'Not Applied'
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      relationship_strength INTEGER NOT NULL DEFAULT 3,
      email TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_contact_id INTEGER NOT NULL,
      to_contact_id INTEGER NOT NULL,
      intro_path TEXT,
      status TEXT DEFAULT 'Pending',
      notes TEXT,
      FOREIGN KEY (from_contact_id) REFERENCES contacts(id),
      FOREIGN KEY (to_contact_id) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      folder TEXT NOT NULL DEFAULT 'Uncategorized',
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
      shareable_link TEXT,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS document_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      viewer_email TEXT,
      viewed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE TABLE IF NOT EXISTS startup_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stage TEXT NOT NULL,
      sector TEXT NOT NULL,
      location TEXT NOT NULL,
      founded_year INTEGER NOT NULL,
      team_size INTEGER NOT NULL,
      revenue REAL,
      description TEXT NOT NULL
    );
  `);
}
