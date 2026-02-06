-- =============================================================================
-- DATABASE: National Energy Resource & Security Framework (NERSF)
-- TYPE: National Government Infrastructure
-- ARCHITECT: Senior System Architect
-- ENGINE: MySQL 8.x (InnoDB)
-- SECURITY LEVEL: High (UUIDs, Audit Trails, Soft Deletes, Strict FKs)
-- =============================================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Database Creation
-- -----------------------------------------------------
CREATE DATABASE IF NOT EXISTS `nersf_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nersf_db`;

-- =============================================================================
-- MODULE 1: AUTHENTICATION & ACCESS CONTROL (RBAC)
-- =============================================================================

-- Table: roles
-- Description: Normalized role definitions for strict access control.
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT NOT NULL, -- Static IDs (1-5) for core roles to prevent UUID overhead on constant lookups
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `role_name_UNIQUE` (`name` ASC)
) ENGINE = InnoDB;

-- Seeding Core Roles (Mandatory)
INSERT IGNORE INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'VISITOR', 'Public anonymous user with read-only access to public data'),
(2, 'TENDER_USER', 'Verified vendor/company capable of bidding'),
(3, 'AUDITOR', 'Government appointed auditor for financial and operational oversight'),
(4, 'ADMIN', 'System administrator with high-level privileges'),
(5, 'HELP_DESK', 'Support agent for user assistance');

-- Table: users
-- Description: Central identity store using UUIDs for security.
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL, -- UUID
  `role_id` INT NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `phone_number` VARCHAR(20) NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_verified` TINYINT(1) DEFAULT 0,
  `mfa_secret` VARCHAR(255) NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL, -- Soft Delete
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  INDEX `fk_users_roles_idx` (`role_id` ASC),
  CONSTRAINT `fk_users_roles`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB;

-- Table: sessions
-- Description: Database-backed sessions for strict timeout enforcement and device management.
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `payload` LONGTEXT NULL, -- Session data
  `last_activity` INT NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_sessions_users_idx` (`user_id` ASC),
  CONSTRAINT `fk_sessions_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- =============================================================================
-- MODULE 2: VENDOR & KYC MANAGEMENT
-- =============================================================================

-- Table: vendors
-- Description: Company profiles for Tender Users.
CREATE TABLE IF NOT EXISTS `vendors` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `registration_number` VARCHAR(100) NOT NULL COMMENT 'Trade License No.',
  `tax_id_number` VARCHAR(100) NOT NULL COMMENT 'TIN',
  `company_address` TEXT NOT NULL,
  `contact_person` VARCHAR(100) NOT NULL,
  `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'BLACKLISTED') DEFAULT 'PENDING',
  `verified_by_user_id` CHAR(36) NULL,
  `trade_license_doc_path` VARCHAR(255) NOT NULL,
  `tin_certificate_doc_path` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_id_UNIQUE` (`user_id` ASC),
  UNIQUE INDEX `registration_number_UNIQUE` (`registration_number` ASC),
  CONSTRAINT `fk_vendors_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_vendors_verifier`
    FOREIGN KEY (`verified_by_user_id`)
    REFERENCES `users` (`id`)
    ON DELETE SET NULL
) ENGINE = InnoDB;

-- =============================================================================
-- MODULE 3: ENERGY INFRASTRUCTURE & OPERATIONS
-- =============================================================================

-- Table: energy_resources
-- Description: Definition of energy types managed by the nation.
CREATE TABLE IF NOT EXISTS `energy_resources` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'e.g., Natural Gas, Thermal Coal, Solar Grid A',
  `type` ENUM('FOSSIL_FUEL', 'RENEWABLE', 'NUCLEAR', 'HYDRO', 'GRID') NOT NULL,
  `unit_of_measure` VARCHAR(20) NOT NULL COMMENT 'e.g., MW, MT, Liters',
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Table: energy_production
-- Description: Daily/Hourly production logs from national sources.
CREATE TABLE IF NOT EXISTS `energy_production` (
  `id` CHAR(36) NOT NULL,
  `resource_id` CHAR(36) NOT NULL,
  `production_date` DATE NOT NULL,
  `quantity_produced` DECIMAL(18, 4) NOT NULL,
  `source_location` VARCHAR(150) NOT NULL,
  `recorded_by_user_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_prod_resource_idx` (`resource_id` ASC),
  CONSTRAINT `fk_prod_resource`
    FOREIGN KEY (`resource_id`)
    REFERENCES `energy_resources` (`id`),
  CONSTRAINT `fk_prod_user`
    FOREIGN KEY (`recorded_by_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- Table: energy_consumption
-- Description: National consumption metrics.
CREATE TABLE IF NOT EXISTS `energy_consumption` (
  `id` CHAR(36) NOT NULL,
  `resource_id` CHAR(36) NOT NULL,
  `record_date` DATE NOT NULL,
  `region` VARCHAR(100) NOT NULL,
  `quantity_consumed` DECIMAL(18, 4) NOT NULL,
  `peak_load_time` TIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_cons_resource`
    FOREIGN KEY (`resource_id`)
    REFERENCES `energy_resources` (`id`)
) ENGINE = InnoDB;

-- Table: storage_facilities
-- Description: Warehouses, grids, or tanks for reserves.
CREATE TABLE IF NOT EXISTS `storage_facilities` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `location_geo` POINT NULL COMMENT 'GPS Coordinates', -- Spatial data support
  `address` TEXT NOT NULL,
  `max_capacity` DECIMAL(18, 4) NOT NULL,
  `current_level` DECIMAL(18, 4) DEFAULT 0.0000,
  `resource_id` CHAR(36) NOT NULL,
  `status` ENUM('ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED') DEFAULT 'ACTIVE',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_storage_resource`
    FOREIGN KEY (`resource_id`)
    REFERENCES `energy_resources` (`id`)
) ENGINE = InnoDB;

-- Table: imports
-- Description: International energy purchases.
CREATE TABLE IF NOT EXISTS `imports` (
  `id` CHAR(36) NOT NULL,
  `resource_id` CHAR(36) NOT NULL,
  `origin_country` VARCHAR(100) NOT NULL,
  `supplier_name` VARCHAR(150) NOT NULL,
  `quantity` DECIMAL(18, 4) NOT NULL,
  `cost_total` DECIMAL(20, 2) NOT NULL,
  `arrival_date` DATE NOT NULL,
  `status` ENUM('ORDERED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED') DEFAULT 'ORDERED',
  `created_by_user_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_import_resource`
    FOREIGN KEY (`resource_id`)
    REFERENCES `energy_resources` (`id`),
  CONSTRAINT `fk_import_user`
    FOREIGN KEY (`created_by_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- Table: exports
-- Description: International energy sales.
CREATE TABLE IF NOT EXISTS `exports` (
  `id` CHAR(36) NOT NULL,
  `resource_id` CHAR(36) NOT NULL,
  `destination_country` VARCHAR(100) NOT NULL,
  `buyer_name` VARCHAR(150) NOT NULL,
  `quantity` DECIMAL(18, 4) NOT NULL,
  `revenue_total` DECIMAL(20, 2) NOT NULL,
  `shipment_date` DATE NOT NULL,
  `status` ENUM('PENDING', 'SHIPPED', 'COMPLETED') DEFAULT 'PENDING',
  `authorized_by_user_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_export_resource`
    FOREIGN KEY (`resource_id`)
    REFERENCES `energy_resources` (`id`),
  CONSTRAINT `fk_export_user`
    FOREIGN KEY (`authorized_by_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- =============================================================================
-- MODULE 4: TENDERS & PROCUREMENT
-- =============================================================================

-- Table: tenders
-- Description: Government projects open for bidding.
CREATE TABLE IF NOT EXISTS `tenders` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `reference_no` VARCHAR(50) NOT NULL,
  `publish_date` DATETIME NOT NULL,
  `closing_date` DATETIME NOT NULL,
  `min_budget` DECIMAL(20, 2) NULL,
  `max_budget` DECIMAL(20, 2) NULL,
  `status` ENUM('DRAFT', 'PUBLISHED', 'EVALUATING', 'AWARDED', 'CANCELLED') DEFAULT 'DRAFT',
  `created_by_user_id` CHAR(36) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reference_no_UNIQUE` (`reference_no` ASC),
  CONSTRAINT `fk_tenders_creator`
    FOREIGN KEY (`created_by_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- Table: bids
-- Description: Vendor proposals for tenders.
CREATE TABLE IF NOT EXISTS `bids` (
  `id` CHAR(36) NOT NULL,
  `tender_id` CHAR(36) NOT NULL,
  `vendor_id` CHAR(36) NOT NULL,
  `bid_amount` DECIMAL(20, 2) NOT NULL,
  `proposal_path` VARCHAR(255) NOT NULL COMMENT 'Secure file path',
  `technical_score` DECIMAL(5, 2) NULL,
  `financial_score` DECIMAL(5, 2) NULL,
  `status` ENUM('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED') DEFAULT 'SUBMITTED',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_bids_tender`
    FOREIGN KEY (`tender_id`)
    REFERENCES `tenders` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_bids_vendor`
    FOREIGN KEY (`vendor_id`)
    REFERENCES `vendors` (`id`)
) ENGINE = InnoDB;

-- Table: contracts
-- Description: Legal agreements resulting from tenders.
CREATE TABLE IF NOT EXISTS `contracts` (
  `id` CHAR(36) NOT NULL,
  `tender_id` CHAR(36) NOT NULL,
  `vendor_id` CHAR(36) NOT NULL,
  `contract_ref_no` VARCHAR(50) NOT NULL,
  `contract_value` DECIMAL(20, 2) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `signed_doc_path` VARCHAR(255) NOT NULL,
  `is_public` TINYINT(1) DEFAULT 0 COMMENT 'If true, visible to visitors',
  `status` ENUM('ACTIVE', 'COMPLETED', 'TERMINATED') DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `contract_ref_no_UNIQUE` (`contract_ref_no` ASC),
  CONSTRAINT `fk_contracts_tender`
    FOREIGN KEY (`tender_id`)
    REFERENCES `tenders` (`id`),
  CONSTRAINT `fk_contracts_vendor`
    FOREIGN KEY (`vendor_id`)
    REFERENCES `vendors` (`id`)
) ENGINE = InnoDB;

-- =============================================================================
-- MODULE 5: FINANCE & AUDIT
-- =============================================================================

-- Table: financial_transactions
-- Description: Ledger for all monetary flows (Tender fees, taxes, payments).
CREATE TABLE IF NOT EXISTS `financial_transactions` (
  `id` CHAR(36) NOT NULL,
  `reference_type` ENUM('TENDER_FEE', 'TAX_PAYMENT', 'IMPORT_COST', 'EXPORT_REVENUE', 'PENALTY') NOT NULL,
  `reference_id` CHAR(36) NOT NULL COMMENT 'Polymorphic ID linked to related table',
  `amount` DECIMAL(20, 2) NOT NULL,
  `transaction_type` ENUM('DEBIT', 'CREDIT') NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `transaction_date` DATETIME NOT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_finance_ref` (`reference_id` ASC, `reference_type` ASC)
) ENGINE = InnoDB;

-- Table: tax_records
-- Description: Specific tracking for vendor tax compliance.
CREATE TABLE IF NOT EXISTS `tax_records` (
  `id` CHAR(36) NOT NULL,
  `vendor_id` CHAR(36) NOT NULL,
  `fiscal_year` VARCHAR(10) NOT NULL,
  `amount_due` DECIMAL(20, 2) NOT NULL,
  `amount_paid` DECIMAL(20, 2) DEFAULT 0.00,
  `status` ENUM('DUE', 'PAID', 'OVERDUE') DEFAULT 'DUE',
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tax_vendor`
    FOREIGN KEY (`vendor_id`)
    REFERENCES `vendors` (`id`)
) ENGINE = InnoDB;

-- Table: audit_logs
-- Description: Immutable system-wide activity trail. WRITE-ONLY.
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NULL COMMENT 'Nullable for system events',
  `event_type` VARCHAR(50) NOT NULL COMMENT 'LOGIN, VIEW_SENSITIVE, UPDATE_CONTRACT',
  `entity_table` VARCHAR(50) NULL COMMENT 'Table affected',
  `entity_id` CHAR(36) NULL COMMENT 'Row ID affected',
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` TEXT NULL,
  `severity` ENUM('INFO', 'WARNING', 'CRITICAL') DEFAULT 'INFO',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_user` (`user_id` ASC),
  INDEX `idx_audit_entity` (`entity_table` ASC, `entity_id` ASC)
) ENGINE = InnoDB;

-- =============================================================================
-- MODULE 6: PUBLIC INTERACTION & SUPPORT
-- =============================================================================

-- Table: notices
-- Description: Public announcements and legal notices.
CREATE TABLE IF NOT EXISTS `notices` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `is_published` TINYINT(1) DEFAULT 0,
  `published_by_user_id` CHAR(36) NOT NULL,
  `publish_date` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_notices_admin`
    FOREIGN KEY (`published_by_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- Table: complaints
-- Description: Public grievances.
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NULL COMMENT 'Nullable for anonymous public submission',
  `email` VARCHAR(150) NULL COMMENT 'Required if user_id is null',
  `subject` VARCHAR(200) NOT NULL,
  `details` TEXT NOT NULL,
  `status` ENUM('NEW', 'REVIEWING', 'RESOLVED', 'DISMISSED') DEFAULT 'NEW',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Table: advice_box
-- Description: Suggestions from the public.
CREATE TABLE IF NOT EXISTS `advice_box` (
  `id` CHAR(36) NOT NULL,
  `sender_name` VARCHAR(100) NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) NULL,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Table: support_tickets
-- Description: Registered user help requests.
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `assigned_agent_id` CHAR(36) NULL,
  `subject` VARCHAR(200) NOT NULL,
  `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tickets_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`),
  CONSTRAINT `fk_tickets_agent`
    FOREIGN KEY (`assigned_agent_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- Table: chat_messages
-- Description: Real-time text chat for tickets.
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` CHAR(36) NOT NULL,
  `ticket_id` CHAR(36) NOT NULL,
  `sender_user_id` CHAR(36) NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_internal_note` TINYINT(1) DEFAULT 0 COMMENT 'Agents can leave private notes',
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_chat_ticket`
    FOREIGN KEY (`ticket_id`)
    REFERENCES `support_tickets` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_chat_sender`
    FOREIGN KEY (`sender_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

-- Table: system_reports
-- Description: Archive of generated government reports.
CREATE TABLE IF NOT EXISTS `system_reports` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `type` ENUM('FINANCIAL', 'ENERGY', 'AUDIT', 'USER_ACTIVITY') NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `generated_by_user_id` CHAR(36) NOT NULL,
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reports_creator`
    FOREIGN KEY (`generated_by_user_id`)
    REFERENCES `users` (`id`)
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- End of Script