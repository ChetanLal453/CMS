CREATE TABLE IF NOT EXISTS sites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  domain VARCHAR(255) NULL,
  status ENUM('live', 'draft') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sites_slug (slug),
  KEY idx_sites_status (status)
);

-- Seed default primary site if none exists
INSERT INTO sites (name, slug, domain, status)
SELECT 'CurveMetrics', 'curvemetrics', 'curvemetrics.com', 'live'
WHERE NOT EXISTS (SELECT 1 FROM sites WHERE slug = 'curvemetrics');

-- Add site_id to pages table if not present
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND column_name = 'site_id'
);

SET @add_col_sql := IF(
  @col_exists = 0,
  'ALTER TABLE pages ADD COLUMN site_id BIGINT UNSIGNED NULL, ADD INDEX idx_pages_site_id (site_id)',
  'SELECT 1'
);

PREPARE add_col_stmt FROM @add_col_sql;
EXECUTE add_col_stmt;
DEALLOCATE PREPARE add_col_stmt;

-- Link existing pages to the primary site
UPDATE pages
SET site_id = (SELECT id FROM sites WHERE slug = 'curvemetrics' LIMIT 1)
WHERE site_id IS NULL;
