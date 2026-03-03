-- Migration 3: Add not_interested_reason column
ALTER TABLE customers ADD COLUMN not_interested_reason TEXT DEFAULT '';
