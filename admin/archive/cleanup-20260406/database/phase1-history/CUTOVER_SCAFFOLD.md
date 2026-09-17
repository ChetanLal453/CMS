# Database Cutover Scaffold

This file is a non-destructive scaffold for the next migration phase. Nothing here has been applied yet.

## Locked Rules

- Canonical revision table: `page_revisions`
- Canonical template table: `page_templates`
- `published_revision_id` must only be populated when `pages.status = 'published'`
- All schema/data steps must be idempotent

## Ordered Rollout

1. Review the generated Phase 1 audit files in `database/phase1/`
2. Remove hardcoded DB secret fallbacks from runtime and utility scripts
3. Standardize collation for CMS tables and slug relation columns
4. Keep `page_revisions` as the only revision source
5. Keep `page_templates` as the only template source
6. Backfill `page_revisions` from `pages.layout`
7. Populate `current_revision_id` for pages that do not have one
8. Populate `published_revision_id` only for rows where `pages.status = 'published'`
9. Backfill `header_id`, `footer_id`, `banner_id` from existing slug matches
10. Add indexes and foreign keys after data is clean
11. Switch app code to final tables only
12. Remove public fallback from draft layout
13. Retire legacy tables only after verification

## Data Decisions Before Applying

- Confirm whether any existing page should be marked `published` before revision backfill
- Confirm whether `sections` will remain as a derived snapshot/cache table or be retired
- Confirm whether the target collation should be `utf8mb4_0900_ai_ci` across all CMS tables

## Migration Shape

The actual cutover should be split into small idempotent steps:

1. Schema normalization
2. Revision backfill
3. Relation backfill
4. Constraint/index addition
5. App cutover
6. Legacy cleanup

## Idempotency Notes

- Columns: add only if missing
- Indexes: add only if missing
- Foreign keys: add only if missing
- Revision backfill: insert only for pages that do not already have the relevant revision link
- Relation backfill: update `*_id` only when it is `NULL` and a valid slug match exists
- Cleanup: only after verification scripts pass
