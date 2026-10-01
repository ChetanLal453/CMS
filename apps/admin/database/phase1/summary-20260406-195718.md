# Phase 1 Database Audit

Generated at: 20260406-195718
Database: admin

## Outputs

- Schema snapshot: `schema-snapshot-20260406-195718.json`
- Data health report: `data-health-20260406-195718.json`
- SQL backup: `backup-20260406-195718.sql`

## Current State

- Pages: 3
- Draft pages: 2
- Published pages: 1
- page_revisions rows: 10
- page_versions rows: 0
- page_templates rows: 0
- custom_templates rows: 0
- Sections snapshot rows: 0

## Key Findings

- Pages missing current_revision_id: 0
- Published pages missing published_revision_id: 0
- Pages with blank title or name fields: 3
- Slug collation mismatches detected: 0

## Relation Coverage

- header_slug matches: 3/3
- footer_slug matches: 3/3
- banner_slug matches: 3/3
- pages already using header_id: 3/3
- pages already using footer_id: 3/3
- pages already using banner_id: 3/3

## Backup Status

- SQL backup completed successfully.
