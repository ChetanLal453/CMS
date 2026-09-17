-- Phase 6C draft only
-- Rename-first destructive cleanup after runtime legacy fallbacks are removed.
-- Do not execute until fresh backup artifacts are captured.

START TRANSACTION;

SELECT COUNT(*) AS pages_missing_current_revision
FROM pages
WHERE current_revision_id IS NULL;

SELECT COUNT(*) AS published_pages_missing_published_revision
FROM pages
WHERE status = 'published' AND published_revision_id IS NULL;

CREATE TABLE IF NOT EXISTS backup_pages_legacy_layout_phase6 AS
SELECT id, slug, layout, published_layout, updated_at
FROM pages;

-- Rename legacy tables instead of immediate permanent drop.
-- Execute only if the source table exists and target backup name does not exist.
-- page_versions -> page_versions_legacy_backup
-- sections -> sections_legacy_backup

ALTER TABLE pages
  DROP COLUMN IF EXISTS layout,
  DROP COLUMN IF EXISTS published_layout;

COMMIT;
