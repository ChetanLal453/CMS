CREATE TABLE IF NOT EXISTS page_revisions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  page_id BIGINT UNSIGNED NOT NULL,
  revision_number INT UNSIGNED NOT NULL,
  revision_type ENUM('draft','published','autosave','restore','template_import') NOT NULL DEFAULT 'draft',
  layout_json JSON NOT NULL,
  created_by VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_page_revisions_page_revision_number (page_id, revision_number),
  KEY idx_page_revisions_page_id_created_at (page_id, created_at),
  KEY idx_page_revisions_page_id_revision_type (page_id, revision_type)
);

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS header_id BIGINT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS footer_id BIGINT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS banner_id BIGINT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS meta_image_id BIGINT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS current_revision_id BIGINT UNSIGNED NULL,
  ADD COLUMN IF NOT EXISTS published_revision_id BIGINT UNSIGNED NULL;

CREATE TABLE IF NOT EXISTS page_templates (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(150) NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NULL,
  thumbnail VARCHAR(500) NULL,
  thumbnail_media_id BIGINT UNSIGNED NULL,
  header_id BIGINT UNSIGNED NULL,
  footer_id BIGINT UNSIGNED NULL,
  banner_id BIGINT UNSIGNED NULL,
  layout_json JSON NOT NULL,
  tags JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_page_templates_slug (slug),
  KEY idx_page_templates_category (category)
);
