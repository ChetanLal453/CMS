SET @pages_slug_collation_ok := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND column_name = 'slug'
    AND collation_name = 'utf8mb4_0900_ai_ci'
);
SET @pages_slug_collation_sql := IF(
  @pages_slug_collation_ok = 0,
  'ALTER TABLE pages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci',
  'SELECT 1'
);
PREPARE pages_slug_collation_stmt FROM @pages_slug_collation_sql;
EXECUTE pages_slug_collation_stmt;
DEALLOCATE PREPARE pages_slug_collation_stmt;

UPDATE pages p
LEFT JOIN headers h ON h.slug = p.header_slug
SET p.header_id = h.id
WHERE p.header_id IS NULL
  AND p.header_slug IS NOT NULL
  AND h.id IS NOT NULL;

UPDATE pages p
LEFT JOIN footers f ON f.slug = p.footer_slug
SET p.footer_id = f.id
WHERE p.footer_id IS NULL
  AND p.footer_slug IS NOT NULL
  AND f.id IS NOT NULL;

UPDATE pages p
LEFT JOIN banners b ON b.slug = p.banner_slug
SET p.banner_id = b.id
WHERE p.banner_id IS NULL
  AND p.banner_slug IS NOT NULL
  AND b.id IS NOT NULL;

SET @idx_pages_current_revision_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND index_name = 'idx_pages_current_revision_id'
);
SET @idx_pages_current_revision_id_sql := IF(
  @idx_pages_current_revision_id_exists = 0,
  'ALTER TABLE pages ADD INDEX idx_pages_current_revision_id (current_revision_id)',
  'SELECT 1'
);
PREPARE idx_pages_current_revision_id_stmt FROM @idx_pages_current_revision_id_sql;
EXECUTE idx_pages_current_revision_id_stmt;
DEALLOCATE PREPARE idx_pages_current_revision_id_stmt;

SET @idx_pages_published_revision_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND index_name = 'idx_pages_published_revision_id'
);
SET @idx_pages_published_revision_id_sql := IF(
  @idx_pages_published_revision_id_exists = 0,
  'ALTER TABLE pages ADD INDEX idx_pages_published_revision_id (published_revision_id)',
  'SELECT 1'
);
PREPARE idx_pages_published_revision_id_stmt FROM @idx_pages_published_revision_id_sql;
EXECUTE idx_pages_published_revision_id_stmt;
DEALLOCATE PREPARE idx_pages_published_revision_id_stmt;

SET @idx_pages_header_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND index_name = 'idx_pages_header_id'
);
SET @idx_pages_header_id_sql := IF(
  @idx_pages_header_id_exists = 0,
  'ALTER TABLE pages ADD INDEX idx_pages_header_id (header_id)',
  'SELECT 1'
);
PREPARE idx_pages_header_id_stmt FROM @idx_pages_header_id_sql;
EXECUTE idx_pages_header_id_stmt;
DEALLOCATE PREPARE idx_pages_header_id_stmt;

SET @idx_pages_footer_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND index_name = 'idx_pages_footer_id'
);
SET @idx_pages_footer_id_sql := IF(
  @idx_pages_footer_id_exists = 0,
  'ALTER TABLE pages ADD INDEX idx_pages_footer_id (footer_id)',
  'SELECT 1'
);
PREPARE idx_pages_footer_id_stmt FROM @idx_pages_footer_id_sql;
EXECUTE idx_pages_footer_id_stmt;
DEALLOCATE PREPARE idx_pages_footer_id_stmt;

SET @idx_pages_banner_id_exists := (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'pages'
    AND index_name = 'idx_pages_banner_id'
);
SET @idx_pages_banner_id_sql := IF(
  @idx_pages_banner_id_exists = 0,
  'ALTER TABLE pages ADD INDEX idx_pages_banner_id (banner_id)',
  'SELECT 1'
);
PREPARE idx_pages_banner_id_stmt FROM @idx_pages_banner_id_sql;
EXECUTE idx_pages_banner_id_stmt;
DEALLOCATE PREPARE idx_pages_banner_id_stmt;
