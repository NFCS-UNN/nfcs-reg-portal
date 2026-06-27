-- ============================================================
-- MIGRATION 005: ADD OPAY COLUMNS
-- ============================================================

ALTER TABLE payments ADD COLUMN IF NOT EXISTS opay_cashier_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS opay_order_no TEXT;
