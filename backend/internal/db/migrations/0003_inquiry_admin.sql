-- VENTIS — admin upgrade: track inquiry status changes + faster status filter

-- Records the last time an inquiry's status (or any field) was touched by an
-- admin, so the inbox can show "đã xử lý" recency independently of created_at.
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Private back-office notes an admin can attach to a lead (call logs, etc.).
-- Never exposed on the public site — admin-only.
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';

-- Keep the composite (status, created_at) hot for the filtered + sorted inbox.
CREATE INDEX IF NOT EXISTS idx_inquiries_status_created ON inquiries(status, created_at DESC);
