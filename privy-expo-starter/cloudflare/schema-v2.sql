-- Drop old tables
DROP TABLE IF EXISTS recent_contacts;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS users;

-- Users table with usernames (universal profile directory)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,  -- Universal searchable username (lowercase, alphanumeric)
  display_name TEXT,      -- Display name (can have spaces, emojis, etc)
  avatar_url TEXT,
  bio TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Recent transactions table (for quick access to sending history)
CREATE TABLE IF NOT EXISTS recent_sends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_wallet_address TEXT NOT NULL,
  to_wallet_address TEXT NOT NULL,
  last_sent_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (from_wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  UNIQUE(from_wallet_address, to_wallet_address)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_recent_from ON recent_sends(from_wallet_address);
CREATE INDEX IF NOT EXISTS idx_recent_to ON recent_sends(to_wallet_address);
