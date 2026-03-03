-- Migration 2: Add next_call_date and call_notes columns
ALTER TABLE customers ADD COLUMN next_call_date TEXT DEFAULT '';
ALTER TABLE customers ADD COLUMN call_notes TEXT DEFAULT '';
