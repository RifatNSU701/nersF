-- NERSF runtime compatibility migration
-- Apply after database/schema.sql and 001_app_compatibility.sql.

USE nersf_db;

INSERT IGNORE INTO roles (name,description) VALUES
('CITIZEN','Registered public consumer'),
('VENDOR','Verified or pending vendor/bidder'),
('TENDER_OFFICER','Government procurement officer'),
('OFFICER','Government operational officer'),
('SUPER_ADMIN','Highest privileged system administrator'),
('SUPPORT_AGENT','24/7 help desk support agent');

-- The role column, audit fields, and support indexes are created by migration 001.
UPDATE users u JOIN roles r ON r.id = u.role_id
SET u.role = r.name
WHERE u.role IS NULL;

ALTER TABLE tenders
  ADD COLUMN budget_min DECIMAL(20,2) NULL,
  ADD COLUMN budget_max DECIMAL(20,2) NULL,
  ADD COLUMN opening_date DATETIME NULL,
  ADD COLUMN commodity_id CHAR(36) NULL,
  ADD COLUMN quantity_required_mt DECIMAL(18,4) NULL,
  ADD COLUMN created_by CHAR(36) NULL,
  ADD COLUMN attachment_url VARCHAR(255) NULL;
UPDATE tenders SET opening_date = COALESCE(opening_date, publish_date), created_by = COALESCE(created_by, created_by_user_id);
ALTER TABLE tenders MODIFY status ENUM('DRAFT','OPEN','CLOSED','PUBLISHED','EVALUATING','AWARDED','CANCELLED') NOT NULL DEFAULT 'DRAFT';

ALTER TABLE bids
  ADD COLUMN price_per_mt DECIMAL(20,2) NULL,
  ADD COLUMN delivery_days INT NULL,
  ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE bids MODIFY status ENUM('PENDING','SHORTLISTED','REJECTED','AWARDED','SUBMITTED','UNDER_REVIEW','ACCEPTED') NOT NULL DEFAULT 'PENDING';

ALTER TABLE complaints
  ADD COLUMN description TEXT NULL,
  ADD COLUMN admin_reply TEXT NULL;
UPDATE complaints SET description = COALESCE(description, details);
ALTER TABLE complaints MODIFY status ENUM('PENDING','IN_PROGRESS','RESOLVED','CLOSED','NEW','REVIEWING','DISMISSED') NOT NULL DEFAULT 'PENDING';
