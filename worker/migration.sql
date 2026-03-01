CREATE TABLE customers_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'hot',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  amount REAL NOT NULL DEFAULT 0,
  location TEXT DEFAULT '',
  restaurant_type TEXT NOT NULL DEFAULT 'restaurant',
  product_type TEXT NOT NULL DEFAULT 'petpooja',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO customers_new SELECT id, name, whatsapp, status, payment_status, amount, location, restaurant_type, product_type, created_at, updated_at FROM customers;

DROP TABLE customers;

ALTER TABLE customers_new RENAME TO customers;

CREATE INDEX IF NOT EXISTS idx_customers_payment ON customers(payment_status);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(restaurant_type);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);
