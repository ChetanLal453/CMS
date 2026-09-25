-- Migration 006: Add site_id scoping to contact and site_settings tables

-- 1. Add site_id to contact table if not exists
SET @contact_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'contact' 
    AND COLUMN_NAME = 'site_id'
);

SET @sql_contact = IF(
  @contact_has_site_id = 0,
  'ALTER TABLE contact ADD COLUMN site_id BIGINT UNSIGNED DEFAULT 1 AFTER id, ADD INDEX idx_contact_site_id (site_id)',
  'SELECT "Column site_id already exists in contact"'
);
PREPARE stmt_contact FROM @sql_contact;
EXECUTE stmt_contact;
DEALLOCATE PREPARE stmt_contact;

-- 2. Add site_id to site_settings table if not exists
SET @settings_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'site_settings' 
    AND COLUMN_NAME = 'site_id'
);

SET @sql_settings = IF(
  @settings_has_site_id = 0,
  'ALTER TABLE site_settings ADD COLUMN site_id BIGINT UNSIGNED DEFAULT 1 AFTER id, ADD INDEX idx_settings_site_id (site_id)',
  'SELECT "Column site_id already exists in site_settings"'
);
PREPARE stmt_settings FROM @sql_settings;
EXECUTE stmt_settings;
DEALLOCATE PREPARE stmt_settings;
