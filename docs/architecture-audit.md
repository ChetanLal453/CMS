# Architecture Audit

## Purpose

This document records the current repo state against the single-source-of-truth architecture defined in `docs/ssot.md`.

It is a snapshot of what is true in code today.

## Summary

The repository already contains most of the target architecture primitives:

- shared bundle contract
- shared runtime bundle validation
- shared block registry
- shared layout migration and canonical validation
- admin save and publish flows wired through shared normalization
- frontend bundle validation at fetch time

The main remaining weakness is enforcement at the boundaries:

- some API response shaping still happens outside the canonical shared contract
- several admin and frontend render paths still perform CMS-data interpretation and fallback behavior
- the repo still contains transitional and overlapping implementations

## Current Strengths

### Shared contract layer exists

- `shared/page/PageRenderBundle.ts`
- `shared/page/validatePageRenderBundle.ts`
- `shared/page/schemaVersion.ts`

### Shared block registry exists

- `shared/blocks/registry.ts`

### Save and publish validate canonical layouts

- `admin/src/lib/services/page-editor-service.js`
- `admin/src/lib/services/page-publish-service.js`
- `shared/page/migrateLayoutInput.ts`
- `shared/page/validateCanonicalLayout.ts`

### Frontend fetch boundary is thin

- `curvemetricswebsite/src/lib/admin-pages.ts`

## Architecture Violations

### API still reshapes the public contract

File:

- `admin/src/app/api/page/[slug]/route.js`

Issue:

- `createPublicApiBundle()` prunes and reshapes the bundle before returning it publicly.

### Frontend block renderers still interpret CMS data

Files:

- `curvemetricswebsite/src/components/ui/AdvancedList/index.tsx`
- `curvemetricswebsite/src/components/ui/filter/index.tsx`
- `curvemetricswebsite/src/components/ui/tabs/index.tsx`
- `curvemetricswebsite/src/components/ui/SwiperContainer/index.tsx`

Issue:

- These renderers still contain local defaults, fallback behavior, or content-shaping logic.

### Transitional shared bundle assembly still normalizes globals locally

File:

- `shared/page/buildPageRenderBundle.ts`

Issue:

- header, footer, and banner are still normalized with local fallback-heavy mappers inside the bundle builder.

## Duplication Map

### Content interpretation already in `shared`

- page bundle typing and validation
- layout migration and canonical validation
- block registry and block contracts
- block normalize and view-model helpers

### Interpretation still duplicated outside `shared`

- public block fallback/default logic in website UI components
- SEO/title precedence in frontend page shell
- public API bundle pruning in admin route

### Detailed duplication map by file/module

#### Page bundle assembly and public contract shaping

- `shared/page/buildPageRenderBundle.ts`
  Owns canonical bundle assembly and should remain the single shared bundle builder.
- `admin/src/lib/services/page-render-service.js`
  Still duplicates some bundle-adjacent concerns by selecting revisions, loading globals, and shaping page data before calling the shared builder.
- `admin/src/app/api/page/[slug]/route.js`
  Still duplicates public-contract shaping with `createPublicApiBundle()` and pruning logic after the shared bundle has already been built.
- `curvemetricswebsite/src/pages/[[...slug]].tsx`
  Now thinner than before, but still duplicates page-shell concerns like SEO extraction and server-side serialization shaping around `pageView`.

#### Global content loading and management

- `shared/page/globalContent.ts`
  Owns canonical header/footer/banner normalization.
- `admin/src/lib/services/page-render-service.js`
  Duplicates global-content assembly concerns by loading header/footer/banner records, navigation trees, footer fallback selection, and banner activation filtering before passing data to `shared`.
- `admin/src/app/api/headers/route.js`
  Contains manager-facing fallback shaping like `logo_url` and derived `style`, which overlaps with the concept of canonical header state even though it serves a different UI consumer.
- `admin/src/app/api/footers/route.js`
  Contains manager-facing fallback shaping like `copyright_text`, `logo_url`, `newsletter_enabled`, and `social_style`, overlapping with shared footer semantics.
- `admin/src/app/api/banners/route.js`
  Still shapes banner listing rows into a custom admin-facing response that is not the canonical shared banner contract.
- `admin/src/app/(admin)/layout/header/page.tsx`
  Performs local header form normalization and fallback filling for admin editing.
- `admin/src/app/(admin)/layout/footer/page.tsx`
  Performs local footer form normalization, preview shaping, and fallback filling for admin editing.
- `admin/src/app/(admin)/layout/page.tsx`
  Still contains overview-level normalization/fallback logic for header/footer/banner summaries used by the admin layout dashboard.

#### Registry and block-definition ownership

- `shared/blocks/registry.ts`
  Owns the canonical block list, aliases, defaults, schemas, normalize hooks, and renderer registration boundary.
- `admin/src/lib/componentRegistry.tsx`
  Correctly consumes the shared registry, but still duplicates presentation-layer metadata mapping into admin `ComponentDefinition` records.
- `curvemetricswebsite/src/components/registry.ts`
  Correctly consumes the shared registry, but still duplicates website renderer registration wiring.
- `admin/src/components/PageEditor/ComponentLibrary/index.tsx`
  Consumes the admin component registry for the editor library; safe, but worth noting as a downstream dependency whenever registry metadata changes.

#### Admin preview and editor render paths

- `admin/src/components/PageEditor/DynamicComponent.tsx`
  Registry-backed and now the main editor render boundary for admin blocks.
- `admin/src/components/PageEditor/components/PageEditorCanvas.tsx`
  Previously bypassed the registry for `NewGrid`; that bypass is now removed, but this file remains a key place to watch for future ad hoc special-casing.
- `admin/src/components/PageEditor/components/SwiperContainer.tsx`
  Previously used a local registry require for child previews; now registry-backed, but still contains nested preview orchestration that can drift if other complex blocks copy the pattern.
- `admin/src/components/PageRenderer.tsx`
  Duplicates a public-style render path inside admin by resolving website renderers directly for preview mode.
- `admin/src/components/public/PublicPage.tsx`
  Duplicates the public page shell renderer that also exists in `curvemetricswebsite/src/components/public/PublicPage.tsx`.

#### Public page-shell and shared view shaping

- `shared/page/viewHelpers.ts`
  Owns public page view shaping from a canonical bundle into render-ready header/banner/footer/section data.
- `curvemetricswebsite/src/components/public/PublicPage.tsx`
  Mostly render-only now, but still contains navigation fallback behavior and page-shell rendering logic that is duplicated in the admin public preview shell.
- `admin/src/components/public/PublicPage.tsx`
  Duplicates the website public page shell and should eventually be reduced or deleted in favor of a single shared consumer path if possible.

#### Frontend CMS-data interpretation still not fully removed

- `curvemetricswebsite/src/components/ui/filter/index.tsx`
  Still a known enforcement-risk file for CMS fallback and type-specific UI interpretation.
- `curvemetricswebsite/src/components/ui/tabs/index.tsx`
  Improved, but still part of the block group that needs live verification for render-only behavior.
- `curvemetricswebsite/src/components/ui/SwiperContainer/index.tsx`
  Improved, but still a high-risk file because interactive blocks tend to accumulate local interpretation.
- `curvemetricswebsite/src/components/ui/AdvancedList/index.tsx`
  Structurally improved, but still worth keeping in the duplication map until end-to-end verification is complete.

#### SEO and page-shell precedence

- `shared/page/seo.ts`
  Owns the canonical SEO contract.
- `shared/page/buildPageRenderBundle.ts`
  Owns canonical page SEO normalization into the bundle.
- `curvemetricswebsite/src/pages/[[...slug]].tsx`
  Now consumes canonical `page.seo` directly for `<Head>` metadata, but remains a key frontend boundary file to watch while removing other page-shell repair logic.

## Detailed Refactor Queue By Order Of Execution

### Step 1: Finish live verification for the blocks already structurally migrated

Files to exercise:

- `curvemetricswebsite/src/components/ui/AdvancedList/index.tsx`
- `curvemetricswebsite/src/components/ui/filter/index.tsx`
- `curvemetricswebsite/src/components/ui/tabs/index.tsx`
- `curvemetricswebsite/src/components/ui/SwiperContainer/index.tsx`
- `admin/src/components/public/PublicPage.tsx`
- `curvemetricswebsite/src/components/public/PublicPage.tsx`

Why first:

- These blocks have already had major structural cleanup.
- The checklist still shows missing live confirmation.
- Verifying them now reduces the chance of breaking known-good behavior while removing the next layer of duplicated logic.

Exit condition:

- preview and public render match for these blocks
- no new CMS fallback behavior is discovered in those renderers

### Step 2: Remove remaining frontend interpretation helpers from website UI components

Primary targets:

- `curvemetricswebsite/src/components/ui/filter/index.tsx`
- `curvemetricswebsite/src/components/ui/tabs/index.tsx`
- `curvemetricswebsite/src/components/ui/SwiperContainer/index.tsx`
- `curvemetricswebsite/src/components/ui/AdvancedList/index.tsx`
- `curvemetricswebsite/src/components/public/PublicPage.tsx`

Why second:

- The biggest remaining enforcement gap is still frontend interpretation.
- API and admin cleanup should not happen before frontend consumers stop depending on reshaped or repaired data.

Exit condition:

- no block UI component invents defaults for CMS-managed data
- no block UI component reshapes CMS structure locally
- public page shell is render-only apart from explicit production fallback UI

### Step 3: Standardize global-content structures with the same strictness as page layout

Primary targets:

- `shared/page/globalContent.ts`
- `shared/page/validatePageRenderBundle.ts`
- `admin/src/lib/services/page-render-service.js`
- `admin/src/app/api/headers/route.js`
- `admin/src/app/api/footers/route.js`
- `admin/src/app/api/banners/route.js`
- `admin/src/app/(admin)/layout/header/page.tsx`
- `admin/src/app/(admin)/layout/footer/page.tsx`
- `admin/src/app/(admin)/layout/page.tsx`

Why third:

- The canonical boundary for header/footer/banner is stronger now, but admin-facing management flows still contain manager-specific fallback shaping.
- Tightening these structures before API contract removal makes later cleanup safer and more observable.

Exit condition:

- admin loaders and managers use one shared canonical shape for globals
- manager UI adapters are explicit and isolated
- no silent alias translation remains in shared canonical global-content normalization

### Step 4: Remove API-local public bundle reshaping

Primary targets:

- `admin/src/app/api/page/[slug]/route.js`
- `admin/src/lib/services/page-render-service.js`
- `curvemetricswebsite/src/lib/admin-pages.ts`
- `curvemetricswebsite/src/pages/[[...slug]].tsx`

Why fourth:

- The frontend must stop depending on transitional API shaping before `createPublicApiBundle()` can disappear safely.
- Once Steps 2 and 3 are done, this route should be able to return the canonical public contract directly.

Exit condition:

- `createPublicApiBundle()` is removed
- public API responses come directly from the shared pipeline
- frontend fetch and page-shell code consume the canonical contract without repair logic

### Step 5: Eliminate preview/public drift caused by duplicate public shells and preview renderers

Primary targets:

- `admin/src/components/public/PublicPage.tsx`
- `curvemetricswebsite/src/components/public/PublicPage.tsx`
- `admin/src/components/PageRenderer.tsx`
- `admin/src/components/PageEditor/components/PageEditorCanvas.tsx`

Why fifth:

- Drift is now less about block registration and more about parallel render shells and preview paths.
- Unifying or deleting overlapping render consumers is safer after the data contract is stable.

Exit condition:

- preview and public paths share the same render assumptions
- duplicate public-page-shell logic is minimized or removed
- admin preview does not rely on a looser interpretation path than the public site

### Step 6: Add contract-focused and smoke-level verification

Primary targets:

- `admin/__tests__/shared/page/*`
- `shared/page/validatePageRenderBundle.ts`
- preview/public smoke coverage around page API and renderer entry points

Why sixth:

- Stronger tests should lock the architecture only after the contract and render boundaries stop moving.
- Adding smoke coverage too early would freeze transitional behavior instead of the cleaned architecture.

Exit condition:

- direct tests exist for `validatePageRenderBundle()`
- unknown-block behavior is covered
- smoke coverage exists for create, edit, preview, publish, and public render

### Step 7: Delete stale overlap immediately after each migration

Primary targets:

- old helper paths identified in the duplication map
- legacy aliases that no longer serve active data
- temporary adapters left behind in admin and website boundaries

Why seventh:

- Deletion is the enforcement mechanism that prevents drift from re-forming.
- This step should happen continuously, but it becomes safer only after the earlier contract and render cleanup lands.

Exit condition:

- the duplication map materially shrinks
- obsolete overlap is deleted rather than merely documented
- the checklist’s cleanup/stabilization items are mostly administrative, not architectural

## Phase Mapping

### Phase 1

Complete.

### Phase 2

Largely complete.

### Phase 3

Largely complete.

### Phase 4

This document is the first explicit audit artifact for the phase.

### Phase 5

Partially complete.

### Phase 6

Partially complete and currently the main active refactor area.

### Phase 7

Mostly complete.

### Phase 8

Mostly complete with API reshaping still to remove.

### Phase 9

Partially complete and currently the highest-risk enforcement gap.

### Phase 10

Partially complete.

### Phase 11

Partially complete.

### Phase 12

In progress informally, not yet governed tightly by real-page need.

### Phase 13

Not complete.

## Immediate Next Steps

1. Finish `AdvancedList` as a pure renderer that consumes shared view data.
2. Audit and remove remaining duplicated interpretation helpers in admin/frontend render paths, starting with the admin sections API and any remaining public-shell repair logic.
3. Remove `createPublicApiBundle()` reshaping from the page API route.
4. Add smoke coverage for preview, publish, and public render parity.
