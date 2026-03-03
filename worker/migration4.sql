-- Migration 4: Add paid_amount column for partial payment tracking
ALTER TABLE customers ADD COLUMN paid_amount REAL DEFAULT 0;
