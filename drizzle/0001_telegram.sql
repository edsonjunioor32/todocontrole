CREATE TABLE IF NOT EXISTS telegram_pairings (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  chat_id TEXT,
  bot_username TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  linked_at TEXT
);

CREATE INDEX IF NOT EXISTS telegram_pairings_code_idx ON telegram_pairings (code_hash, status);
CREATE INDEX IF NOT EXISTS telegram_pairings_token_idx ON telegram_pairings (token_hash);

CREATE TABLE IF NOT EXISTS telegram_connections (
  chat_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  bot_username TEXT,
  linked_at TEXT NOT NULL,
  last_update_id INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS telegram_transactions (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  update_id INTEGER NOT NULL UNIQUE,
  message_id INTEGER,
  raw_text TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  card_name TEXT,
  account_name TEXT,
  category_name TEXT,
  billing_month TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS telegram_transactions_chat_idx ON telegram_transactions (chat_id, update_id);
