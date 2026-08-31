-- NERSF runtime compatibility migration
-- Apply after database/schema.sql and 001_app_compatibility.sql.

USE nersf_db;

-- Canonical application roles. IDs are intentionally database-assigned.
INSERT IGNORE INTO roles (name,description) VALUES
('CITIZEN','Registered public consumer'),
('VENDOR','Verified or pending vendor/bidder'),
('TENDER_OFFICER','Government procurement officer'),
('OFFICER','Government operational officer'),
('SUPER_ADMIN','Highest privileged system administrator'),
('SUPPORT_AGENT','24/7 help desk support agent');

-- User role string used by the application JWT/RBAC layer.
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NULL AFTER role_id;
UPDATE users u JOIN roles r ON r.id=u.role_id SET u.role=r.name WHERE u.role IS NULL;
ALTER TABLE users ADD INDEX idx_users_role (role);

-- Tender fields/statuses used by current procurement APIs.
ALTER TABLE tenders
  ADD COLUMN IF NOT EXISTS budget_min DECIMAL(20,2) NULL,
  ADD COLUMN IF NOT EXISTS budget_max DECIMAL(20,2) NULL,
  ADD COLUMN IF NOT EXISTS opening_date DATETIME NULL,
  ADD COLUMN IF NOT EXISTS commodity_id CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS quantity_required_mt DECIMAL(18,4) NULL,
  ADD COLUMN IF NOT EXISTS created_by CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(255) NULL;

UPDATE tenders SET opening_date=COALESCE(opening_date,publish_date), created_by=COALESCE(created_by,created_by_user_id);
ALTER TABLE tenders MODIFY status ENUM('DRAFT','OPEN','CLOSED','PUBLISHED','EVALUATING','AWARDED','CANCELLED') NOT NULL DEFAULT 'DRAFT';

-- Bid fields/statuses used by current vendor workflow.
ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS price_per_mt DECIMAL(20,2) NULL,
  ADD COLUMN IF NOT EXISTS delivery_days INT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bids MODIFY status ENUM('PENDING','SHORTLISTED','REJECTED','AWARDED','SUBMITTED','UNDER_REVIEW','ACCEPTED') NOT NULL DEFAULT 'PENDING';

-- CRM fields/statuses used by current complaint APIs.
ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS admin_reply TEXT NULL;
UPDATE complaints SET description=COALESCE(description,details);
ALTER TABLE complaints MODIFY status ENUM('PENDING','IN_PROGRESS','RESOLVED','CLOSED','NEW','REVIEWING','DISMISSED') NOT NULL DEFAULT 'PENDING';

-- Audit API compatibility.
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS action VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS entity VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS details JSON NULL;
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_support_user_updated ON support_tickets(user_id,updated_at);
CREATE INDEX IF NOT EXISTS idx_support_status_updated ON support_tickets(status,updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_ticket_sent ON chat_messages(ticket_id,sent_at);
