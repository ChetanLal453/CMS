-- Migration 007: Multi-Site Tenant Isolation Groundwork

-- 1. Ensure sites table has domain index for fast hostname resolution
SET @idx_domain_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'sites'
    AND INDEX_NAME = 'idx_sites_domain'
);

SET @sql_sites_domain_idx = IF(
  @idx_domain_exists = 0,
  'ALTER TABLE sites ADD INDEX idx_sites_domain (domain)',
  'SELECT "Index idx_sites_domain already exists on sites"'
);
PREPARE stmt_domain_idx FROM @sql_sites_domain_idx;
EXECUTE stmt_domain_idx;
DEALLOCATE PREPARE stmt_domain_idx;

-- 2. Add site_id to media_library if table exists
SET @media_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'media_library'
    AND COLUMN_NAME = 'site_id'
);
SET @sql_media = IF(
  @media_has_site_id = 0,
  'ALTER TABLE media_library ADD COLUMN site_id BIGINT UNSIGNED NULL AFTER id, ADD INDEX idx_media_site_id (site_id)',
  'SELECT "Column site_id already exists in media_library"'
);
PREPARE stmt_media FROM @sql_media;
EXECUTE stmt_media;
DEALLOCATE PREPARE stmt_media;

-- 3. Add site_id to headers if table exists
SET @headers_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'headers'
    AND COLUMN_NAME = 'site_id'
);
SET @sql_headers = IF(
  @headers_has_site_id = 0,
  'ALTER TABLE headers ADD COLUMN site_id BIGINT UNSIGNED NULL AFTER id, ADD INDEX idx_headers_site_id (site_id)',
  'SELECT "Column site_id already exists in headers"'
);
PREPARE stmt_headers FROM @sql_headers;
EXECUTE stmt_headers;
DEALLOCATE PREPARE stmt_headers;

-- 4. Add site_id to footers if table exists
SET @footers_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'footers'
    AND COLUMN_NAME = 'site_id'
);
SET @sql_footers = IF(
  @footers_has_site_id = 0,
  'ALTER TABLE footers ADD COLUMN site_id BIGINT UNSIGNED NULL AFTER id, ADD INDEX idx_footers_site_id (site_id)',
  'SELECT "Column site_id already exists in footers"'
);
PREPARE stmt_footers FROM @sql_footers;
EXECUTE stmt_footers;
DEALLOCATE PREPARE stmt_footers;

-- 5. Add site_id to banners if table exists
SET @banners_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'banners'
    AND COLUMN_NAME = 'site_id'
);
SET @sql_banners = IF(
  @banners_has_site_id = 0,
  'ALTER TABLE banners ADD COLUMN site_id BIGINT UNSIGNED NULL AFTER id, ADD INDEX idx_banners_site_id (site_id)',
  'SELECT "Column site_id already exists in banners"'
);
PREPARE stmt_banners FROM @sql_banners;
EXECUTE stmt_banners;
DEALLOCATE PREPARE stmt_banners;

-- 6. Add site_id to page_templates if table exists
SET @templates_has_site_id = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'page_templates'
    AND COLUMN_NAME = 'site_id'
);
SET @sql_templates = IF(
  @templates_has_site_id = 0,
  'ALTER TABLE page_templates ADD COLUMN site_id BIGINT UNSIGNED NULL AFTER id, ADD INDEX idx_templates_site_id (site_id)',
  'SELECT "Column site_id already exists in page_templates"'
);
PREPARE stmt_templates FROM @sql_templates;
EXECUTE stmt_templates;
DEALLOCATE PREPARE stmt_templates;

-- 7. Backfill existing null site_id with primary site id
SET @default_site_id = (SELECT id FROM sites ORDER BY id ASC LIMIT 1);

UPDATE pages SET site_id = @default_site_id WHERE site_id IS NULL AND @default_site_id IS NOT NULL;
UPDATE contact SET site_id = @default_site_id WHERE site_id IS NULL AND @default_site_id IS NOT NULL;
UPDATE site_settings SET site_id = @default_site_id WHERE site_id IS NULL AND @default_site_id IS NOT NULL;

-- 8. Scope pages unique constraint to (site_id, slug) instead of global (slug)
-- Drop global unique index on slug if present
SET @global_slug_idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pages'
    AND INDEX_NAME = 'slug'
    AND NON_UNIQUE = 0
);
SET @sql_drop_slug_idx = IF(
  @global_slug_idx_exists > 0,
  'ALTER TABLE pages DROP INDEX slug',
  'SELECT "Global slug unique index not present on pages"'
);
PREPARE stmt_drop_slug_idx FROM @sql_drop_slug_idx;
EXECUTE stmt_drop_slug_idx;
DEALLOCATE PREPARE stmt_drop_slug_idx;

-- Add composite unique index (site_id, slug) on pages
SET @site_slug_idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'pages'
    AND INDEX_NAME = 'uq_pages_site_id_slug'
);
SET @sql_add_site_slug_idx = IF(
  @site_slug_idx_exists = 0,
  'ALTER TABLE pages ADD UNIQUE KEY uq_pages_site_id_slug (site_id, slug)',
  'SELECT "uq_pages_site_id_slug already exists on pages"'
);
PREPARE stmt_add_site_slug_idx FROM @sql_add_site_slug_idx;
EXECUTE stmt_add_site_slug_idx;
DEALLOCATE PREPARE stmt_add_site_slug_idx;
