# Phase 6A Legacy Cleanup Audit

Date: 2026-04-06
Status: Audit and draft only. No destructive changes executed.

## Executive Summary

The codebase is not yet ready for direct removal of `pages.layout`, `pages.published_layout`, or the `sections` table.

What is safe today:
- `page_versions` appears to have no active runtime dependency inside `src/app` or `src/lib`.
- `layout.sections` is the canonical editor/rendering shape and is not, by itself, a legacy problem.

What is not safe yet:
- `pages.layout` is still read as a legacy fallback in runtime services.
- `pages.published_layout` is still read and returned by runtime APIs.
- `sections` is still used as an optional snapshot/cache table and is still queried by the `choose` API.
- `oldFormat` is still returned by the public page API for compatibility.
- verification and audit scripts still query legacy columns/tables and would fail after destructive cleanup unless updated first.

## Runtime-Critical Legacy Dependencies

### `pages.layout`
- `src/lib/services/page-render-service.js:214`
  Reads `page.layout` as the draft legacy fallback when no draft revision is resolved.
- `src/lib/layout-sync.js:31`
  Selects `layout` from `pages` in `getPageRecord()`.
- `src/lib/layout-sync.js:63`
  Uses `page.layout` as the initial draft source before checking revisions.
- `src/lib/layout-sync.js:270`
  `saveLayoutForPage()` writes `layout = ?` back to `pages`.
- `src/lib/repositories/page-repository.js:20`
  Includes `layout` in the shared page select clause used by page repository reads.
- `src/app/api/pages/[page_id]/route.js:40`
  Parses `page.layout` into the admin response shape before the revision override happens.
- `src/app/api/pages/route.js:140`
  New page creation can still dual-write `layout` if `CMS_DUAL_WRITE_LEGACY_PAGE_JSON=1` is explicitly enabled.
- `src/lib/services/page-editor-service.js:13`
  Draft saves can still write `payload.layout` when legacy dual-write is enabled.

### `pages.published_layout`
- `src/lib/services/page-render-service.js:215`
  Reads `page.published_layout` as the published legacy fallback.
- `src/lib/services/page-render-service.js:249`
  Returns `published_layout` in the render bundle output.
- `src/lib/repositories/page-repository.js:21`
  Includes `published_layout` in the shared page select clause.
- `src/lib/layout-sync.js:32`
  Selects `published_layout` from `pages` in `getPageRecord()`.
- `src/lib/layout-sync.js:64`
  Uses `page.published_layout` as the initial published source before checking revisions.
- `src/lib/services/page-publish-service.js:61`
  Publish flow can still write `published_layout` if `CMS_DUAL_WRITE_LEGACY_PAGE_JSON=1` is enabled.
- `src/app/api/pages/[page_id]/route.js:41`
  Parses `page.published_layout` into the admin response shape.
- `src/app/api/page/[slug]/route.js:34`
  Public page API still returns a `published_layout` field.
- `src/app/api/pages/[page_id]/publish/route.js:56`
  Publish API still returns `published_layout` in its response body.

### `sections` table
- `src/lib/layout-sync.js:136-228`
  Maintains the `sections` table as a derived snapshot cache with delete/insert/update flows.
- `src/lib/services/page-editor-service.js:8,89`
  Draft save flow still imports and runs `syncSectionsSnapshot()` unless `CMS_DISABLE_LEGACY_SECTION_SYNC=1` is enabled.
- `src/app/api/choose/route.js:16-24`
  Still queries the `sections` table first for the `choose` section, then falls back to revision-backed layout.
- `scripts/verify-schema.cjs:53`
  Still treats `sections` as an expected schema object.
- `scripts/db-phase1-audit.cjs:120,179,334`
  Still reports `sections` row counts and snapshot health.

## Runtime Compatibility Outputs Still Exposed

### `oldFormat`
- `src/app/api/page/[slug]/route.js:39`
  The public page API still returns `oldFormat`, which is generated from `bundle.sections`.

### Legacy response fields
- `src/app/api/page/[slug]/route.js:34`
  Returns `published_layout` in the public page response.
- `src/app/api/pages/[page_id]/route.js:40-41`
  Admin page response still contains `layout` and `published_layout` fields shaped from legacy columns before revision normalization.
- `src/app/api/pages/[page_id]/publish/route.js:56`
  Publish response still contains `published_layout`.

## Revision-Backed Code That Only Uses Canonical Layout Shape

These files use `layout.sections`, but they are not evidence of legacy DB coupling. They are built on the canonical page layout object already returned from revisions:
- `src/app/api/page/[slug]/sections/route.js`
- `src/app/api/sections/bulk-update/route.js`
- `src/app/api/sections/duplicate/route.js`
- editor and renderer components under `src/components/PageEditor/**`
- `src/components/PageRenderer.tsx`
- `src/lib/page-layout-normalizer.js`

`layout.sections` should not be used as a reason to delay dropping legacy columns by itself.

## `page_versions` Status

No active runtime read/write dependency was found in `src/app` or `src/lib`.

Remaining references are historical or tooling-only:
- `scripts/verify-schema.cjs:51`
- `scripts/db-phase1-audit.cjs:112,176,318`
- `create-tables.sql:129`
- `src/migrations/001_fix_schema.sql:20,27,31,317,319`
- `COMPREHENSIVE_PAGE_EDITOR_PLAN.md:96`

This means `page_versions` is the closest candidate for actual removal, but scripts/docs still need to be updated in the same cleanup wave.

## Migration Tooling That Still Depends On Legacy Columns

These are expected for rollback/backfill or verification, but they will need to be revised once destructive cleanup is applied:
- `scripts/backfill-revisions.cjs`
  Reads `pages.layout` and `pages.published_layout` to seed `page_revisions`.
- `scripts/verify-revision-cutover.cjs`
  Counts legacy layout columns and will break after those columns are dropped.
- `scripts/db-phase1-audit.cjs`
  Reports on `page_versions`, `sections`, `layout`, and `published_layout`.
- `check-db.js`, `check-details.js`, `check-layout.js`, `fix-database.js`, `simple-fix.js`, `backfill-layout.js`
  Legacy diagnostics and one-off scripts still inspect raw `page.layout`.

## Safe Readiness Checklist Before Phase 6C

1. Remove runtime fallback reads of `pages.layout` and `pages.published_layout` from:
   - `src/lib/services/page-render-service.js`
   - `src/lib/layout-sync.js`
   - `src/lib/repositories/page-repository.js`
   - `src/app/api/pages/[page_id]/route.js`
2. Decide whether public/admin APIs should keep or remove compatibility response fields:
   - `published_layout`
   - `oldFormat`
3. Decide whether `sections` should be:
   - fully retired now, or
   - temporarily kept as a cache table for compatibility/reporting
4. Update verification/audit scripts so they do not require legacy columns after cleanup.
5. Only after those changes are merged should destructive SQL be applied.
