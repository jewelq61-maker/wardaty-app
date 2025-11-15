import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { randomUUID } from 'crypto';

// Create database file in project root
const sqlite = new Database('./wardiya.db');
export const db = drizzle(sqlite, { schema });

// Helper function to generate UUIDs
export function generateId(): string {
  return randomUUID();
}

// Initialize database with tables
export function initializeDatabase() {
  // Create profiles table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      persona TEXT NOT NULL DEFAULT 'single',
      locale TEXT NOT NULL DEFAULT 'ar',
      theme TEXT NOT NULL DEFAULT 'light',
      is_premium INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create cycles table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      length INTEGER,
      duration INTEGER,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Create cycle_days table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cycle_days (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      flow TEXT,
      symptoms TEXT,
      mood TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Create beauty_actions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS beauty_actions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      beauty_category TEXT,
      phase TEXT,
      scheduled_at TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Create fasting_entries table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS fasting_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Create daughters table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS daughters (
      id TEXT PRIMARY KEY,
      mother_id TEXT NOT NULL,
      name TEXT NOT NULL,
      birth_date TEXT,
      cycle_start_age INTEGER,
      is_pregnant INTEGER DEFAULT 0,
      pregnancy_lmp TEXT,
      pregnancy_edd TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (mother_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  // Create share_links table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      share_code TEXT NOT NULL UNIQUE,
      partner_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      expires_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (partner_id) REFERENCES profiles(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ Database initialized successfully');
}

// Initialize on import
initializeDatabase();
