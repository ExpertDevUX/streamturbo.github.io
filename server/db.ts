import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema-sqlite";

// Create or connect to local SQLite database
const sqlite = new Database('streamvibe.db');

// Enable WAL mode for better performance and concurrency
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export function initializeDatabase() {
  try {
    // Create sessions table for authentication
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire INTEGER NOT NULL
      )
    `);

    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE,
        password TEXT,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        username TEXT UNIQUE,
        bio TEXT,
        follower_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0,
        stream_key TEXT UNIQUE,
        is_streaming INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user',
        last_login_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);

    // Create categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        description TEXT,
        stream_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    // Create streams table
    db.run(`
      CREATE TABLE IF NOT EXISTS streams (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category_id TEXT,
        language TEXT DEFAULT 'en',
        tags TEXT DEFAULT '[]',
        thumbnail_url TEXT,
        viewer_count INTEGER DEFAULT 0,
        is_live BOOLEAN DEFAULT FALSE,
        started_at INTEGER,
        ended_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Create chat_messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        stream_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (stream_id) REFERENCES streams(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create follows table
    db.run(`
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        follower_id TEXT NOT NULL,
        followed_id TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(follower_id, followed_id),
        FOREIGN KEY (follower_id) REFERENCES users(id),
        FOREIGN KEY (followed_id) REFERENCES users(id)
      )
    `);

    // Create indexes for better query performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_stream_key ON users(stream_key)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_streams_user_id ON streams(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_streams_category_id ON streams(category_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_streams_is_live ON streams(is_live)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_chat_messages_stream_id ON chat_messages(stream_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_follows_followed_id ON follows(followed_id)`);

    console.log('Local SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}