# Pre-Destructive Runtime Cleanup Status

Date: 2026-04-06
Status: Completed without destructive DB changes.

## What Changed

The runtime app path now treats revisions as the single source of truth for page layout data.

Completed:
- `src/lib/services/page-render-service.js`
  - removed fallback reads from `pages.layout` and `pages.published_layout`
- `src/lib/layout-sync.js`
  - removed `sections` snapshot maintenance from runtime behavior
  - layout reads now come from revisions only
  - legacy `saveLayoutForPage()` now delegates to revision save flow
- `src/lib/repositories/page-repository.js`
  - shared page reads no longer select `layout` or `published_layout`
- `src/lib/services/page-editor-service.js`
  - draft/autosave/restore no longer dual-write legacy page JSON
  - no runtime `sections` sync
- `src/lib/services/page-publish-service.js`
  - publish now requires current revision and writes published revision only
- `src/app/api/pages/[page_id]/route.js`
  - admin page payload is revision-backed
  - no legacy `published_layout` field in admin page response
- `src/app/api/page/[slug]/route.js`
  - removed `oldFormat`
- `src/app/api/choose/route.js`
  - removed `sections` table lookup
  - now reads home page layout through revision-backed record lookup
- `src/app/api/pages/[page_id]/publish/route.js`
  - response payload now returns `layout` instead of legacy `published_layout`

## Remaining Before Destructive SQL

Still intentionally present or still needing cleanup:
- public route still returns `published_layout`, but it is revision-derived now, not column-derived
- verification/audit scripts still inspect:
  - `page_versions`
  - `sections`
  - `pages.layout`
  - `pages.published_layout`
- DB still physically contains the legacy columns/tables

## Safe Next Step

Before running destructive SQL:
1. update verification and audit scripts for post-legacy mode
2. take fresh backup + schema snapshot
3. run the drafted destructive migration in a controlled window
4. keep rollback tables and rollback plan ready
