import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const sqlite = new Database('./wardiya.db');
const db = sqlite;

// Initialize database tables (same as client.ts)
function initializeDatabase() {
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
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

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

  console.log('✅ Database initialized');
}

initializeDatabase();

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = randomUUID();

    db.prepare(`
      INSERT INTO profiles (id, email, password, persona, locale)
      VALUES (?, ?, ?, 'single', 'ar')
    `).run(userId, email, passwordHash);

    const user = db.prepare('SELECT * FROM profiles WHERE id = ?').get(userId);
    const { password: _, ...userWithoutPassword } = user;
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Generic query endpoints
app.get('/api/:table', (req, res) => {
  try {
    const { table } = req.params;
    const { userId } = req.query;
    
    let query = `SELECT * FROM ${table}`;
    const params = [];
    
    if (userId) {
      query += ` WHERE user_id = ?`;
      params.push(userId);
    }
    
    const data = db.prepare(query).all(...params);
    res.json(data);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

app.post('/api/:table', (req, res) => {
  try {
    const { table } = req.params;
    const data = req.body;
    
    if (!data.id) {
      data.id = randomUUID();
    }
    
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`).run(...values);
    
    const inserted = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(data.id);
    res.json(inserted);
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: 'Insert failed' });
  }
});

app.put('/api/:table/:id', (req, res) => {
  try {
    const { table, id } = req.params;
    const data = req.body;
    
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...values);
    
    const updated = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/:table/:id', (req, res) => {
  try {
    const { table, id } = req.params;
    
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
