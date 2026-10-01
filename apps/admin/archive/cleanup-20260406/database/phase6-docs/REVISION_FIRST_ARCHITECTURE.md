# CMS Revision-First Architecture

Date: 2026-04-06
Status: Current production architecture after Phase 6 cutover.

## Source Of Truth

`page_revisions` is the only source of truth for page layout data.

The `pages` table now stores page metadata and revision pointers only:
- `slug`
- `title`
- `name`
- `status`
- `header_id`
- `footer_id`
- `banner_id`
- `meta_*`
- `current_revision_id`
- `published_revision_id`
- timestamps

Legacy layout columns were removed during Phase 6:
- `pages.layout`
- `pages.published_layout`

Legacy runtime tables were retired:
- `page_versions` -> `page_versions_legacy_backup`
- `sections` -> `sections_legacy_backup`

## Revision Model

Each page can point at two important revisions:
- `current_revision_id`
  The latest editable working copy used by the editor and preview flows.
- `published_revision_id`
  The published revision used by public rendering.

Revision rows live in `page_revisions` and include:
- `page_id`
- `revision_number`
- `revision_type`
- `layout_json`
- `created_by`
- `created_at`

Supported revision types currently in use:
- `draft`
- `autosave`
- `published`
- `restore`
- `template_import`

## Runtime Flows

### Editor Load
1. Load page metadata from `pages`.
2. Resolve `current_revision_id`.
3. Read `layout_json` from `page_revisions`.
4. Normalize to editor layout shape.

### Draft Save
1. Normalize the incoming editor layout.
2. Create a new `draft` revision in `page_revisions`.
3. Update `pages.current_revision_id` to the new revision id.
4. Keep page metadata changes on `pages` only.

### Autosave
1. Normalize the current editor layout.
2. Create a new `autosave` revision.
3. Update `pages.current_revision_id` to the autosave revision id.

### Restore
1. Read the selected historical revision.
2. Create a new `restore` revision using that layout.
3. Update `pages.current_revision_id`.

### Publish
1. Read the current draft revision from `pages.current_revision_id`.
2. Validate that the layout is publishable.
3. Create a new `published` revision.
4. Update `pages.published_revision_id` and publish metadata.

### Public Render
1. Load page metadata by slug.
2. Resolve `published_revision_id`.
3. Render from that revision's `layout_json`.
4. If no published revision exists, public render returns an empty normalized layout rather than reading legacy JSON.

### Preview Render
1. Load page metadata by slug.
2. Use explicit `revisionId` if present, otherwise use `current_revision_id`.
3. Render revision layout without publishing it.

## Templates

Current preferred template table:
- `page_templates`

Legacy template table:
- `custom_templates`

Current application behavior prefers `page_templates` whenever it exists. `custom_templates` is retained only as a legacy fallback.

## Verification Rules

The healthy state is:
- every page has `current_revision_id`
- every published page has `published_revision_id`
- runtime code does not read from removed legacy layout columns
- public and editor APIs derive layouts from `page_revisions`

## Rollback Assets

Phase 6 rollback assets are stored in `database/phase6` and `database/phase6/backups`.

Important rollback data:
- `backup_pages_legacy_layout_phase6`
- `page_versions_legacy_backup`
- `sections_legacy_backup`
- fresh SQL dumps in `database/phase6/backups`
