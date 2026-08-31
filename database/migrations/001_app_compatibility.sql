-- NERSF compatibility migration
-- Aligns the original schema with the current application RBAC and audit implementation.

USE nersf_db;

-- Canonical roles are seeded by database/schema.sql. Migration 001 intentionally does not insert role IDs.

-- Current backend stores the role as a string. Keep this column synchronized
-- with the application during migration; role_id remains for legacy compatibility.
ALTER TABLE users ADD COLUMN role VARCHAR(50) NULL AFTER role_id;

-- Current audit API/middleware fields.
ALTER TABLE audit_logs
  ADD COLUMN action VARCHAR(100) NULL AFTER user_id,
  ADD COLUMN entity VARCHAR(100) NULL AFTER action,
  ADD COLUMN details JSON NULL AFTER entity_id;

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Helpful indexes for high-volume support operations.
CREATE INDEX idx_support_user_updated ON support_tickets(user_id,updated_at);
CREATE INDEX idx_support_status_updated ON support_tickets(status,updated_at);
CREATE INDEX idx_chat_ticket_sent ON chat_messages(ticket_id,sent_at);
