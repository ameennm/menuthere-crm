-- MenuThere CRM - D1 Database Schema

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'warm' CHECK(status IN ('hot', 'warm')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('paid', 'pending')),
  amount REAL NOT NULL DEFAULT 0,
  location TEXT DEFAULT '',
  restaurant_type TEXT NOT NULL DEFAULT 'cafe' CHECK(restaurant_type IN ('cafe', 'juice-shop', 'hotel')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_customers_payment ON customers(payment_status);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(restaurant_type);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);
