# Phase 6 Rollback Plan

This rollback plan assumes the draft SQL in `database/phase6/006_phase6_destructive_cleanup_draft.sql` created backup tables before removing legacy objects.

## Immediate Recovery Goals

1. Restore `pages.layout` and `pages.published_layout`
2. Restore `page_versions` if any hidden dependency appears
3. Restore the `sections` table if compatibility consumers still require it
4. Re-enable compatibility flags temporarily

## Emergency Flags

Set these in `.env` before restarting the app if you need to temporarily widen compatibility:
- `CMS_DUAL_WRITE_LEGACY_PAGE_JSON=1`
- `CMS_DISABLE_LEGACY_SECTION_SYNC=0`
- Keep revision flags enabled:
  - `CMS_REVISION_WRITES=1`
  - `CMS_EDITOR_READS_CURRENT_REVISION=1`
  - `CMS_PUBLIC_READS_PUBLISHED_REVISION=1`

## SQL Rollback Steps

### 1. Restore dropped columns on `pages`
```sql
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS layout JSON NULL,
  ADD COLUMN IF NOT EXISTS published_layout JSON NULL;
```

### 2. Rehydrate legacy page JSON from the backup table
```sql
UPDATE pages p
JOIN backup_pages_legacy_layout_phase6_20260406 b ON b.id = p.id
SET p.layout = b.layout,
    p.published_layout = b.published_layout,
    p.updated_at = NOW();
```

### 3. Restore `page_versions` if needed
```sql
CREATE TABLE IF NOT EXISTS page_versions LIKE backup_page_versions_phase6_20260406;
INSERT INTO page_versions
SELECT *
FROM backup_page_versions_phase6_20260406;
```

If duplicates are possible, clear `page_versions` first or restore into a fresh table name and swap carefully.

### 4. Restore `sections`
If the first destructive pass only renamed the table:
```sql
RENAME TABLE sections_legacy_retired_phase6_20260406 TO sections;
```

If it was fully dropped later:
```sql
CREATE TABLE IF NOT EXISTS sections LIKE backup_sections_phase6_20260406;
INSERT INTO sections
SELECT *
FROM backup_sections_phase6_20260406;
```

## App-Level Rollback

After the SQL rollback:
1. Restart the app with the emergency flags above.
2. Re-run verification scripts adjusted for legacy mode.
3. Check these routes manually:
   - public page route
   - page editor load
   - autosave
   - publish
   - choose route
   - section duplicate / bulk update routes

## Safer Long-Term Rollback Alternative

Instead of restoring from legacy backups, you can also rebuild `pages.layout` and `pages.published_layout` from `page_revisions` if the backup tables are unavailable. That path should be scripted separately before Phase 6C is approved.
