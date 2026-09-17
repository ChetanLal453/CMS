# Custom Templates Status

Date: 2026-04-06
Status: Recommendation ready.

## Current State

Live database counts at audit time:
- `page_templates`: 0 rows
- `custom_templates`: 0 rows

Current app behavior now prefers `page_templates` whenever that table exists.
`custom_templates` is kept only as a legacy fallback path.

## Recommendation

Recommended decision: retire `custom_templates`.

Why:
- there is no live template data to preserve in `custom_templates`
- `page_templates` already exists as the cleaner canonical table
- keeping both tables increases ambiguity in template writes and future maintenance
- the runtime no longer needs legacy-style dual model behavior for pages, so templates should follow the same simplification

## Safe Retirement Path

1. Keep `custom_templates` untouched until manual UI QA of template create/update/apply passes.
2. If QA passes and no hidden dependency appears, remove the fallback from `page-template-repository.js`.
3. Take a backup of `custom_templates`.
4. Rename `custom_templates` to `custom_templates_legacy_backup` before any hard drop.
5. Update verification scripts/docs so `page_templates` is the only active template store.

## Short-Term Guidance

For now:
- write new templates to `page_templates`
- do not add any new dependency on `custom_templates`
- treat `custom_templates` as legacy only
