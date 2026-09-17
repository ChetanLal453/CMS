# Single Source Of Truth

## Purpose

This document defines the architecture rules for the current Curve Metrics platform.

The goal is to keep the project stable as a single-site, admin-driven system where:

- `admin` owns content and publishing
- `shared/` owns content interpretation
- `curvemetricswebsite` only fetches and renders

This is not a guideline. These rules are intended to be treated as project law.

## System Scope

This document applies to the current single frontend only:

- authoring app: `admin`
- public site: `curvemetricswebsite`
- shared interpretation layer: `shared/`

Multi-site support is explicitly out of scope for this phase.

## Ownership Rules

### `admin`

`admin` is the only write authority for CMS-managed content.

`admin` owns:

- pages
- revisions
- header/footer/banner relations
- SEO content
- publish state
- save, autosave, preview, and publish workflows

`admin` must not define content interpretation rules that are duplicated elsewhere once those rules are moved into `shared/`.

### `shared/`

`shared/` is the only authority for content interpretation.

`shared/` will own:

- content contracts
- block schemas
- block defaults
- normalization
- view-model generation
- block registry
- page bundle contract
- bundle validation
- schema version hooks

If content meaning exists in more than one place, the architecture is already drifting.

### `curvemetricswebsite`

`curvemetricswebsite` is render-only.

It may:

- fetch page bundles
- render supported blocks
- render explicit fallback UI defined by policy

It may not:

- repair invalid CMS data
- invent defaults for CMS-managed content
- normalize content
- reshape schemas
- become an alternate content source

## Single Mandatory Pipeline

All CMS-managed content must flow through one pipeline:

`DB -> shared normalize -> shared viewModel -> PageRenderBundle -> render`

This pipeline is mandatory for:

- preview
- publish
- public API responses
- frontend rendering

No layer is allowed to skip or reimplement the pipeline.

## Canonical Contract

The canonical render payload for the public site is `PageRenderBundle`.

Phase 1 rule:

- all public rendering must converge on a single bundle contract
- that contract will live in `shared/page/PageRenderBundle.ts`
- that contract will be runtime-validated by `shared/page/validatePageRenderBundle.ts`

Until that is implemented, any existing page-bundle shaping should be treated as transitional.

## Official Entry Points

Only the following entry points are allowed to assemble or consume CMS page content:

### Admin bundle assembly

Target official entry point:

- `buildPageBundle()`

Current code path:

- `admin/src/lib/services/page-render-service.js`
- exported function: `loadPageRenderBundle()`

Phase 1 decision:

- `loadPageRenderBundle()` is the current bundle assembly path
- it will be hardened toward a single official `buildPageBundle()` boundary

### API boundary

Official API entry point:

- `admin/src/app/api/page/[slug]/route.js`
- `GET /api/page/[slug]`

This route must return only canonical, validated page bundle responses once Phase 2 is complete.

### Frontend fetch boundary

Current frontend fetch path:

- `curvemetricswebsite/src/lib/admin-pages.ts`
- `fetchAdminPageBundle()`
- `fetchAdminPageBundleForPath()`

Phase 1 decision:

- frontend data access must stay thin
- frontend fetch helpers are consumers, not shapers
- this boundary will converge on a `fetchPageBundle()` contract

### Block support boundary

Target official block boundary:

- `shared/blocks/registry.ts`

Until that registry exists, local registries are transitional and must be treated as migration targets, not permanent architecture.

## Critical Violations

The following are architecture violations and must be treated as defects, not shortcuts.

### Frontend fallback fixes

Example anti-pattern:

```ts
title = title || "Default"
```

If CMS data is wrong:

- fix `admin`
- or fix `shared/`

Do not fix it in `curvemetricswebsite`.

### Pipeline bypass

Example anti-pattern:

```ts
const data = await db.page.find(...)
return Response.json(data)
```

All renderable page responses must come through the bundle builder.

### Registry bypass

New blocks must not be added by free-form string handling or ad hoc renderer wiring outside the shared block registry.

If a block is not in the registry, it does not exist.

### Partial migration

A block is not considered migrated until:

- its contracts live in `shared/`
- its interpretation lives in `shared/`
- the old duplicated logic has been deleted

Seventy percent migrated is not migrated.

### Silent migrations

Data must not be silently reshaped without explicit migration policy and logging.

### Silent block disappearance

Unknown blocks must never disappear silently.

Behavior policy:

- development: fail fast
- production: render explicit fallback UI and log the error

## Error Policy

### Development

Development should fail fast.

That includes:

- invalid page bundle
- invalid schema
- unknown block type
- unsupported render path

### Production

Production should fail safely and visibly.

That includes:

- explicit fallback UI where policy allows it
- structured logging
- no silent swallowing of invalid content

## Migration Policy

Non-conforming data must be either explicitly migrated or rejected.

Allowed examples:

- missing optional prop: add default
- renamed prop: map and log
- deprecated but still understandable shape: migrate and log

Rejected examples:

- invalid block type
- corrupt structure
- ambiguous schema

Rule:

- no silent migrations

## Deletion Policy

When logic is moved into `shared/`, the old implementation must be removed immediately.

Do not keep parallel implementations as a convenience.

Allowed temporary overlap requires:

- a clearly tracked migration step
- a known removal point

Otherwise, duplicate logic becomes long-term drift.

## Validation Policy

Validation starts early.

Validation is not a late cleanup step.

It must be added at the schema and content boundaries:

- shared contract validation
- save validation
- publish validation
- API bundle validation

## Observability Policy

Every major pipeline step should become traceable.

At minimum, the system should log:

- normalize start/end
- view-model build
- page bundle build
- validation failure
- publish success/failure
- unknown block render
- API response failure

This project should not require blind debugging through loosely connected layers.

## Current Reality Notes

The repository already has the beginnings of the target architecture:

- admin bundle assembly currently happens in `admin/src/lib/services/page-render-service.js`
- public API response shaping currently happens in `admin/src/app/api/page/[slug]/route.js`
- frontend fetch currently happens in `curvemetricswebsite/src/lib/admin-pages.ts`
- frontend block rendering currently uses `curvemetricswebsite/src/components/registry.ts`
- some shared interpretation already exists in `shared/blocks/advancedcard`, `shared/blocks/advancedheading`, and `shared/blocks/advancedparagraph`

These are useful starting points, but they are not yet the final enforced architecture.

## Phase 1 Outputs

Phase 1 is complete when this repo has:

- a written SSOT architecture document
- explicit ownership rules
- explicit critical violations
- explicit entry points
- explicit migration, deletion, validation, and error policies

Phase 1 does not require full implementation of:

- `PageRenderBundle`
- bundle validation
- shared block registry

Those are Phase 2 and Phase 3 deliverables, but this document defines them now so implementation has a fixed target.

## Summary

The system we are building is simple to describe:

- `admin` writes
- `shared/` interprets
- `curvemetricswebsite` renders

The system we are refusing to build is equally important:

- no frontend data fixing
- no duplicated interpretation
- no optional pipeline
- no invisible fallback logic
- no undocumented shortcuts
