-- NERSF runtime compatibility migration
-- Apply after database/schema.sql and 001_app_compatibility.sql.

USE nersf_db;

-- Canonical roles are seeded by database/schema.sql. Keep this migration data-safe and schema-only.

-- The role column, audit fields, and support indexes are created by migration 001.
UPDATE users u JOIN roles r ON r.id = u.role_id
SET u.role = r.name
WHERE u.role IS NULL;

ALTER TABLE tenders
  ADD COLUMN IF NOT EXISTS budget_min DECIMAL(20,2) NULL,
  ADD COLUMN IF NOT EXISTS budget_max DECIMAL(20,2) NULL,
  ADD COLUMN IF NOT EXISTS opening_date DATETIME NULL,
  ADD COLUMN IF NOT EXISTS commodity_id CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS quantity_required_mt DECIMAL(18,4) NULL,
  ADD COLUMN IF NOT EXISTS created_by CHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS attachment_url VARCHAR(255) NULL;
UPDATE tenders SET opening_date = COALESCE(opening_date, publish_date), created_by = COALESCE(created_by, created_by_user_id);
ALTER TABLE tenders MODIFY status ENUM('DRAFT','OPEN','CLOSED','PUBLISHED','EVALUATING','AWARDED','CANCELLED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS price_per_mt DECIMAL(20,2) NULL,
  ADD COLUMN IF NOT EXISTS delivery_days INT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bids MODIFY status ENUM('PENDING','SHORTLISTED','REJECTED','AWARDED','SUBMITTED','UNDER_REVIEW','ACCEPTED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE complaints
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS admin_reply TEXT NULL;
UPDATE complaints SET description = COALESCE(description, details);
ALTER TABLE complaints MODIFY status ENUM('PENDING','IN_PROGRESS','RESOLVED','CLOSED','NEW','REVIEWING','DISMISSED') NOT NULL DEFAULT 'PENDING';
