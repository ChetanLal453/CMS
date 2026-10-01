-- Phase 6 rollback SQL draft
-- Assumes backup_pages_legacy_layout_phase6, page_versions_legacy_backup, and sections_legacy_backup exist.

ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS layout JSON NULL,
  ADD COLUMN IF NOT EXISTS published_layout JSON NULL;

UPDATE pages p
JOIN backup_pages_legacy_layout_phase6 b ON b.id = p.id
SET p.layout = b.layout,
    p.published_layout = b.published_layout,
    p.updated_at = NOW();

-- Restore legacy tables by renaming them back if needed.
-- RENAME TABLE page_versions_legacy_backup TO page_versions;
-- RENAME TABLE sections_legacy_backup TO sections;
