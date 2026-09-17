# Work Checklist

This is the simple tracking file for the architecture cleanup.

Use it like this:

- `[x]` means done
- `[ ]` means not done yet
- items under `Now` are the current focus

## Now

- [x] Write the SSOT architecture doc
- [x] Write the first architecture audit doc
- [x] Start cleaning `AdvancedList`
- [x] Finish `AdvancedList` cleanup (no frontend interpretation)
- [x] Fix shared/view-model gaps exposed by `AdvancedList`
- [x] Re-run and confirm `AdvancedList` is stable without fallbacks
- [x] Clean `filter`
- [x] Improve `filter` property-panel visibility and type-specific behavior
- [x] Fix `advancedaccordion` behavior drift between editor and website
- [x] Fix `advancedcard` shared view-model handoff in website renderer
- [x] Clean `tabs`
- [x] Clean `SwiperContainer`
- [x] Re-run and confirm `filter`, `tabs`, `advancedaccordion`, `advancedcard`, and `SwiperContainer` in live editor/public render

## Phase 1: Lock The Architecture

- [x] Write `docs/ssot.md`
- [x] Define ownership of `admin`, `shared/`, and `curvemetricswebsite`
- [x] Define the single mandatory pipeline
- [x] Define official entry points
- [x] Define critical violations
- [x] Define error policy
- [x] Define migration policy
- [x] Define deletion policy
- [x] Add schema-version direction to the architecture rules

## Phase 2: Define Canonical Contracts

- [x] Create `shared/page/PageRenderBundle.ts`
- [x] Create `shared/page/validatePageRenderBundle.ts`
- [x] Define shared contracts for page, layout, section, block, header, footer, banner, and SEO
- [x] Add `schemaVersion`
- [x] Define preview and public bundle shapes
- [x] Tighten header/footer/banner so they are fully canonical and not still normalized with fallback-heavy bundle-builder logic

## Phase 3: Build The Block Registry

- [x] Create `shared/blocks/registry.ts`
- [x] Register supported block types
- [x] Connect block defaults, normalize logic, and view-model hooks through the registry
- [x] Define unknown-block behavior
- [x] Confirm every block currently rendered by admin and website is represented only through the shared registry

## Phase 4: Audit The Existing Repo

- [x] Create the first audit doc in `docs/architecture-audit.md`
- [x] Audit save flow at a high level
- [x] Audit preview flow at a high level
- [x] Audit publish flow at a high level
- [x] Audit API response shaping at a high level
- [x] Audit frontend fallbacks and reshaping at a high level
- [x] Identify priority architecture violations
- [x] Add a more detailed duplication map by file/module
- [x] Add a more detailed refactor queue by order of execution

## Phase 5: Standardize Schema And Add Early Validation

- [x] Add shared layout migration entry point
- [x] Add canonical layout validation
- [x] Validate on save
- [x] Validate on publish
- [x] Reject invalid or ambiguous layout data
- [x] Add tests for migration and canonical layout validation
- [ ] Standardize all global content structures with the same strictness as page layout
- [ ] Log all migrations in a consistent observable way

## Phase 6: Move All Interpretation Into `shared/`

Rule:

- No frontend component may define defaults for CMS data
- No frontend component may branch on missing required CMS data
- No frontend component may reshape or derive CMS structure

- [x] Move major page/layout interpretation into `shared/`
- [x] Move `AdvancedList` style and item-display rules further into the shared view model
- [x] `AdvancedList` accepts only fully-formed view model data for required fields
- [x] `AdvancedList` contains zero CMS fallback logic
- [x] All `AdvancedList` data shaping is moved to `shared/`
- [x] Move `filter` interpretation further into `shared/`
- [x] Move `tabs` interpretation fully into `shared/`
- [x] Move `SwiperContainer` interpretation further into `shared/`
- [x] Remove unused legacy frontend duplicate `AdvancedParagraph`
- [ ] Audit and remove other duplicated interpretation helpers in admin/frontend
- [ ] Delete old duplicated logic immediately after each migration

## Phase 7: Enforce The Single Pipeline In Admin

- [x] Ensure save writes through shared migration/normalization/validation
- [x] Ensure publish writes through shared migration/normalization/validation
- [x] Use shared bundle assembly for page render loading
- [ ] Harden `buildPageBundle()` naming and ownership so there is one clearly final admin bundle builder
- [ ] Ensure header/footer/banner/SEO follow the same strict shared pipeline with no side normalization shortcuts
- [ ] Remove remaining bypass paths

## Phase 8: Harden The API Contract

Note:

Do not remove API reshaping until frontend components no longer depend on it.

- [x] Validate bundle output before returning it
- [x] Separate preview and public behavior
- [x] Return clear API errors for missing, invalid, and unpublished cases
- [ ] Remove `createPublicApiBundle()` reshaping from `admin/src/app/api/page/[slug]/route.js`
- [ ] Return only the canonical public contract directly from the shared pipeline

## Phase 9: Clean The Frontend Boundary

- [x] Keep frontend fetch logic thin
- [x] Validate bundle shape at the fetch boundary
- [x] Throw on unknown blocks in development
- [x] Show explicit unknown-block fallback UI in production
- [ ] Remove SEO/title fallback precedence from `curvemetricswebsite/src/pages/[[...slug]].tsx`
- [x] Remove major frontend defaults/state fallbacks for CMS-managed data from `filter`
- [x] Remove frontend defaults for CMS-managed data from `tabs`
- [x] Remove major frontend defaults/selector drift for CMS-managed data from `SwiperContainer`
- [ ] No usage of `||`, `??`, or fallback chains on CMS data in UI components
- [ ] No data transformation logic inside UI components, only rendering
- [ ] Remove any remaining frontend schema reshaping
- [ ] Confirm the website is render-only

## Phase 10: Add Testing Early

- [x] Add tests for shared layout migration
- [x] Add tests for shared canonical layout validation
- [ ] Add tests focused directly on `validatePageRenderBundle()`
- [ ] Add unknown-block behavior tests
- [ ] Add smoke coverage for create
- [ ] Add smoke coverage for edit
- [ ] Add smoke coverage for preview
- [ ] Add smoke coverage for publish
- [ ] Add smoke coverage for public render
- [ ] Add a manual QA checklist

## Phase 11: Ensure Preview And Published Parity

- [x] Share most preview/public bundle assembly through the same shared builder
- [ ] Remove remaining preview/public drift caused by API reshaping
- [ ] Remove remaining preview/public drift caused by frontend fallback logic
- [x] Fix admin preview/public render drift for `AdvancedList`
- [x] Fix admin preview/public render drift for `advancedaccordion`
- [x] Fix admin preview/public render drift for `advancedcard`
- [x] Fix major admin preview/public render drift for `filter`
- [x] Fix major admin preview/public render drift for `SwiperContainer`
- [ ] Verify media, SEO, globals, and block behavior match in preview and published mode

## Phase 12: Increase Page-Building Power For This Site

- [ ] Audit which page patterns still require code changes
- [ ] Improve weak blocks based on real page needs
- [ ] Add missing high-value reusable blocks only when a real page requires them
- [ ] Improve reusable templates and sections for the current site
- [ ] Improve editor UX where it blocks content work

## Phase 13: Cleanup And Stabilization

- [ ] Remove dead aliases
- [ ] Remove stale fallback paths
- [ ] Remove old transforms and overlapping helpers
- [ ] Confirm architecture rules are followed in code, not only docs
- [ ] Finalize docs for the cleaned architecture
- [ ] Move future nice-to-haves to backlog

## Known Blocking Files

- [ ] `admin/src/app/api/page/[slug]/route.js`
- [ ] `shared/page/buildPageRenderBundle.ts`
- [ ] `curvemetricswebsite/src/pages/[[...slug]].tsx`
- [ ] `curvemetricswebsite/src/components/ui/filter/index.tsx`
- [ ] `curvemetricswebsite/src/components/ui/tabs/index.tsx`
- [ ] `admin/src/components/PageEditor/PropertyPanel/index.tsx`

## Notes

- The lint run did not fail because of this checklist work.
- The current lint blocker in the website is an existing hook-order error in `src/components/public/PublicPage.tsx`.
- `next lint` from `curvemetricswebsite` is not a reliable verifier right now because this package layout does not expose the expected Next `pages` or `app` directory to that command.
- `AdvancedList`, `filter`, `advancedaccordion`, `advancedcard`, and `SwiperContainer` have all received structural fixes, but some still need end-to-end live verification in the editor and public render.
- This checklist should be updated every time a task is actually completed.
