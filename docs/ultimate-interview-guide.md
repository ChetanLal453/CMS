# Curve Metrics Ultimate Interview Guide

## How To Use This Guide

This guide is designed to help you explain the project at multiple levels:

- short answers for fast interview responses
- medium-depth answers for follow-up rounds
- deep architectural answers for senior and system design interviews
- project-specific questions tied to what is actually in the codebase
- interviewer-style questions based only on what you say out loud

Best practice in interviews:

1. Start high-level.
2. Explain responsibilities before implementation details.
3. Say why a design exists, not just what it does.
4. Mention one tradeoff and one future improvement.
5. Be honest about weaknesses.

---

## 30-Second Project Summary

This project is a CMS-driven full stack platform with three main parts: an admin app for content authoring and publishing, a shared contract layer for layout/block normalization and validation, and a public Next.js website that server-renders published content. The most important architectural decision is a revision-based page workflow, so drafts, preview, restore, and publishing are all first-class instead of directly editing live content.

## 1-Minute Project Summary

The platform is split into `admin`, `shared`, and `curvemetricswebsite`. The admin app is where internal users manage pages, media, templates, and publishing workflows. The shared layer defines canonical schemas, block contracts, normalization logic, and runtime validation so preview and production interpret content the same way. The public website is intentionally thin: it fetches a validated page bundle from the admin content API, derives a render view, and server-renders the final page. The strongest part of the design is the revision-first page lifecycle. The biggest weakness is that public delivery still depends on the admin/content runtime at request time, which creates scalability and availability concerns.

## 2-Minute Architecture Answer

I would explain the system as a CMS-style platform built around content lifecycle safety. The admin app owns writes and workflows like edit, autosave, preview, restore, and publish. Instead of storing only the current page state, the system stores revisions, so draft content and published content are separate. The shared layer owns the canonical meaning of blocks and layouts. It handles normalization, validation, and bundle assembly. The public site does not interpret raw CMS data directly. It fetches a validated page render bundle and renders it through SSR. That separation is intentional because it reduces preview-versus-production drift. The main tradeoff is increased application-level complexity, but the benefit is much stronger control over content correctness and publishing safety.

---

## Project Scope and Business Purpose

### What The System Solves

- lets internal users build and manage a website without touching raw code
- supports draft editing without affecting the live site
- allows preview before publish
- preserves content history through revisions
- keeps public rendering consistent through a canonical content contract

### Main User Types

- admin/editor users
- public visitors

### Main User Journeys

#### Admin journey

1. log in
2. choose a page
3. edit layout/content
4. autosave or manually save draft
5. preview draft
6. publish approved revision

#### Public journey

1. request route on website
2. server fetches published content
3. page is rendered server-side
4. final HTML is sent to browser

---

## Full System Architecture

### Main Applications

#### `admin`

Owns:

- page authoring
- autosave
- version history
- publish workflow
- templates
- media upload
- auth-protected management APIs

#### `shared`

Owns:

- block registry
- layout normalization
- canonical render contracts
- SEO normalization
- runtime validation
- page view shaping

#### `curvemetricswebsite`

Owns:

- public route handling
- SSR page rendering
- thin content fetch boundary
- public render shell

### Core Design Rule

The system tries to enforce:

`admin writes -> shared interprets -> website renders`

That is the core architectural story of the whole project.

### Why This Architecture Exists

Without a shared interpretation layer:

- preview and public render would drift
- blocks would accumulate duplicate behavior
- frontend components would start repairing CMS data
- debugging would become much harder

### Main Architectural Tradeoffs

Benefits:

- strong content consistency
- safer publishing workflow
- reusable content contract
- easier reasoning about draft vs live state

Costs:

- more backend and shared-layer complexity
- tighter contract coordination across apps
- higher implementation effort than simple CRUD CMS

---

## Frontend Architecture

### Frontend Split

There are really two frontend systems:

- admin editor frontend
- public website frontend

### Admin Frontend Goals

- manage complex local editing state
- support drag and drop
- support undo/redo
- support autosave
- support preview/publish flows

### Public Frontend Goals

- stay thin
- render validated content
- preserve SEO via SSR
- avoid becoming a second content interpretation layer

### Admin Component Hierarchy

High level:

- route
- error boundary
- page editor shell
- toolbar
- left sidebar
- canvas
- property panel
- version/template/json modals

### Public Component Hierarchy

High level:

- route
- SSR fetch layer
- public page shell
- header
- banner
- page sections
- footer

### Admin Rendering Flow

1. load selected page and revision-backed layout
2. normalize layout into editor-compatible shape
3. store it in local state
4. render sections/rows/columns/components
5. resolve block renderer through registry
6. update local state on edits
7. persist through autosave/manual save

### Public Rendering Flow

1. fetch page bundle from admin content API
2. validate bundle
3. derive public page view
4. render shell and block tree
5. send SSR HTML response

### State Management Strategy

The real editor state strategy is:

- local `useState`
- workflow-oriented custom hooks
- refs for async coordination
- Context for app-wide concerns, not core layout state

Main custom hooks:

- page data loading and persistence
- layout mutation logic
- undo/redo
- autosave
- UI shell state

### Why This State Strategy Was Chosen

- fast to iterate
- editor is a self-contained domain
- reduced global store overhead
- behavior grouped by workflow

### Weaknesses of Current Frontend State Model

- large top-level editor component
- heavy prop orchestration
- broad re-render potential
- difficult long-term scalability if feature count grows

### Drag-and-Drop Handling

- based on `@dnd-kit`
- drag metadata encodes layout location
- mutations happen in layout action hooks
- nested structures make the logic significantly harder than flat sorting

### Frontend Performance Bottlenecks

- full-layout object updates
- snapshot-based undo/redo
- JSON serialization for autosave/history comparisons
- large editor shell owning too much state
- nested block rendering complexity

### Frontend Scalability Concerns

- harder onboarding for new engineers
- more block types increase mutation complexity
- limited lazy loading in heavy editor paths
- preview/public shell duplication risk

### Frontend Improvement Ideas

- split editor into smaller state-owning containers
- lazy-load history/templates/media panels
- isolate section-level rendering
- reduce whole-layout invalidation
- converge preview and public shells further

---

## Backend Architecture

### What The Backend Actually Is

This is not a classic standalone Express server. It is a Node.js backend built mostly using:

- Next.js route handlers / API routes
- service layer
- repository layer
- MySQL
- NextAuth
- shared validation contracts

### Backend Layering

#### Route handlers

Own:

- request parsing
- auth boundary entry
- status codes
- JSON responses

#### Middleware

Owns:

- route protection for admin paths

#### Services

Own:

- save workflow
- publish workflow
- render-source assembly
- template application

#### Repositories

Own:

- page lookup
- revision lookup
- direct DB operations

#### Shared contracts

Own:

- canonical layout meaning
- bundle validation
- block schemas/defaults

### Why Service/Repository Separation Exists

Because save, publish, preview, and public render are workflows, not plain CRUD operations.

### Main Backend Strength

The page pipeline is workflow-aware and contract-aware rather than just exposing database rows.

### Main Backend Weakness

Architecture is strongest for pages, but some other domains still rely on simpler generic CRUD patterns.

---

## Authentication and Authorization

### Current Authentication Model

- NextAuth credentials provider
- session-based auth
- middleware for route groups
- server-side `requireAdmin()` checks on sensitive APIs

### Why It Was Likely Chosen

- simple internal admin tool
- low setup cost
- easy integration with Next.js

### Strengths

- simple mental model
- server-side session checks
- protected authoring APIs

### Weaknesses

- effectively admin-only model
- no mature user management
- no strong RBAC
- no robust audit trail

### Current Authorization Reality

This is closer to:

- authenticated admin required

than to:

- full multi-role RBAC

### Better Future RBAC Model

Suggested roles:

- editor
- publisher
- admin
- media manager

Suggested permissions:

- edit drafts
- publish pages
- restore revisions
- manage globals
- manage media

---

## API Design

### API Style

The backend uses resource routes plus workflow-specific action routes.

Examples:

- `/api/pages`
- `/api/pages/[page_id]`
- `/api/pages/[page_id]/autosave`
- `/api/pages/[page_id]/publish`
- `/api/page/[slug]`
- `/api/versions/list`
- `/api/versions/restore`

### Why This API Style Makes Sense

Publishing, autosave, and restore are not simple CRUD updates. They are domain commands.

### Tradeoffs

Pros:

- clearer workflow semantics
- easier to express domain actions

Cons:

- less “pure REST”
- more endpoint variety

### API Versioning Reality

There is not strong explicit external versioning like `/v1`.

Versioning is more implicit through:

- shared bundle schema versioning
- coordinated app evolution

### Future Improvement

If external consumers or more independent clients are added:

- add API versioning
- formalize public contract guarantees

---

## Validation and Error Handling

### Validation Philosophy

CMS content should be treated as untrusted input even if it comes from internal tools.

### Main Validation Points

- request body parsing
- save-time canonical layout validation
- publish-time validation
- public render bundle validation
- frontend fetch-time validation

### Why Multi-Stage Validation Is Good

It prevents bad content from:

- entering storage unchecked
- reaching public rendering silently
- drifting across different consumers

### Error Handling Style

Errors are structured with:

- code
- message
- optional details
- optional trace id

### Main Status Codes Used

- `400` invalid request/layout
- `401` unauthenticated
- `403` forbidden
- `404` missing page/version
- `409` revision conflict
- `500` server/database failure
- `503` missing schema/table dependency

### Error Handling Weakness

Page lifecycle flows are better structured than some simpler CRUD domains.

---

## Database Design

### Core Tables

- `pages`
- `page_revisions`
- `page_templates`
- `headers`
- `footers`
- `banners`
- `navigation_items`
- `media_library`

### Why `pages` and `page_revisions` Are Separate

The page row stores identity and lifecycle pointers. Revisions store versioned content snapshots.

### Why Layout Is Stored As JSON

- nested page-builder structure
- fast schema evolution
- easy restore/history snapshots

### Tradeoffs of JSON Storage

Pros:

- flexible
- revision-friendly
- simpler page-builder persistence

Cons:

- hard to query deeply
- app-layer validation required
- less DB-native structure enforcement

### Why Globals Are Separate Tables

Headers, footers, banners, and navigation are reusable shared content and should not be duplicated into every page snapshot.

---

## Query Patterns and Optimization

### Main Read Patterns

- page by id
- page by slug
- revision history by page
- current/published revision lookup
- global content lookup for render bundle assembly

### Main Write Patterns

- create revision snapshot
- update page revision pointer
- publish by creating new published revision
- media insert/update

### Important Indexing Priorities

- page slug lookup
- revisions by page id + revision number
- revisions by page id + created time
- navigation by header id
- any frequently joined assignment IDs

### Optimization Opportunities

- strict slug-only public lookup
- prebuilt published bundles
- Redis/shared cache
- read-optimized published content model

---

## Security Analysis

### Main Security Weaknesses

- simplistic env-based admin auth
- no strong RBAC
- upload validation not fully hardened
- sanitization could be stronger server-side
- public/admin runtime coupling increases blast radius
- generic CRUD routes can drift into weaker validation

### Hardening Ideas

- DB-backed users and hashed passwords
- SSO/OAuth for admin
- role-based permissions
- audit logs
- file signature validation and malware scanning
- stronger CSP/security headers
- rate limiting
- centralized secret management

---

## Scalability Analysis

### Biggest Architectural Risk

Public content delivery depends on the admin/content runtime at request time.

### Why That Is Dangerous

Because the same runtime effectively serves:

- internal authoring workflows
- external public content reads

Those workloads have different scaling and reliability profiles.

### Read Load Concerns

- repeated runtime bundle assembly
- live dependency on admin service availability
- process-local cache only

### Write Load Concerns

- frequent autosave revisions
- large JSON payloads
- revision storage growth

### Statelessness Concerns

The backend is mostly stateless, but process-local in-memory cache reduces horizontal scaling quality.

### Better Long-Term Scaling Direction

- separate published content delivery from admin runtime
- precompute published bundles
- use shared cache like Redis
- possibly introduce CQRS-style read model

---

## Deployment, CI/CD, and Ops

### Deployment Shape

Likely deployments:

- admin app
- public website app
- database

### Main Deployment Risk

Shared contract changes require release coordination between apps.

### Production Considerations

- env validation
- startup safety checks
- migration sequencing
- health checks
- rollback strategy

### Strong CI/CD Pipeline Should Include

- install dependencies
- lint/type/build
- shared contract tests
- migration verification
- staging deploy
- smoke tests for save/preview/publish/public render
- production promotion

### Monitoring Should Include

- page API latency
- publish failure rate
- validation failures
- error rates
- cache hit rates

---

## Technology Choices and Tradeoffs

### React

Used because:

- component-driven UI
- strong editor ecosystem
- easy integration with Next.js

Alternatives:

- Vue
- Angular
- Svelte

Tradeoff:

- very flexible, but requires stronger architectural discipline

### Next.js

Used because:

- SSR support
- route-based app structure
- integrated API/backend capabilities

Alternatives:

- Remix
- Vite + React Router
- standalone React + Express

Tradeoff:

- productive and integrated, but framework coupling is higher

### MySQL

Used because:

- structured relational data
- transactional workflow support
- practical and familiar

Alternatives:

- PostgreSQL
- MongoDB

Tradeoff:

- strong for relational workflows, but JSON-heavy querying is less elegant than PostgreSQL in some cases

### NextAuth

Used because:

- quick session-based auth integration
- protected route support

Alternatives:

- custom auth
- Auth0
- Clerk

Tradeoff:

- reduced auth plumbing, but current usage is too simple for large-scale production needs

### Direct SQL

Used because:

- explicit transaction and query control
- clear revision workflow logic

Alternatives:

- Prisma
- Sequelize
- TypeORM

Tradeoff:

- more boilerplate, but fewer ORM abstraction surprises

---

## Small Answer Bank

### What problem does the project solve?

It gives internal users a safe way to manage and publish website content with drafts, preview, revisions, and a clear separation between editing and live delivery.

### What is the strongest technical decision?

The revision-based content lifecycle combined with shared validation.

### What is the biggest weakness?

Public page delivery still depends on the admin/content service at runtime.

### Why is the shared layer important?

Because it prevents preview and production from interpreting content differently.

### Why use SSR on the public site?

For SEO, first-response correctness, and content-driven rendering.

### Why store layouts as JSON?

Because page-builder content is nested and changes shape over time.

### Why use revisions?

To support draft isolation, restore, preview, publish, and safer history tracking.

### Why not just update the page row directly?

Because live content should not be overwritten by in-progress edits.

### Why not let the frontend shape CMS data itself?

Because that would create multiple sources of truth for content interpretation.

### How do you handle concurrent edits?

Optimistic concurrency using revision baselines.

---

## Long Answer Bank

### Explain the project end-to-end

The system is a CMS-style web platform. Admin users authenticate into an authoring application and edit pages through a visual page builder. The editor stores content as structured layout data composed of sections, rows, columns, and blocks. Draft changes are autosaved and manually saveable as revisions rather than being applied directly to the live site. When a page is previewed, the system loads draft revision data and renders it through the shared layout and bundle pipeline. When a page is published, the current draft is validated for public use, stored as a published revision, and referenced as the live version of that page. On the read side, the public website requests the page bundle by slug, the backend assembles page metadata, the published revision, and any global content like header/footer/banner, validates the canonical render bundle, and the website server-renders the result. The design intentionally separates writing, interpretation, and rendering responsibilities to reduce drift and improve lifecycle safety.

### Explain the frontend architecture end-to-end

The admin frontend is a rich React editor built around local state and custom hooks. It loads revision-backed layout data, renders it dynamically through a registry, and supports interactions like drag-and-drop, property editing, autosave, undo/redo, preview, version history, and template application. Its biggest strength is workflow grouping through hooks, and its biggest weakness is orchestration density in the top-level editor container. The public frontend is much thinner. It uses SSR to fetch a validated page bundle, derive a public page view, and render a stable page shell. The public app intentionally avoids becoming a content interpretation layer.

### Explain the backend architecture end-to-end

The backend is built around Next.js route handlers, services, repositories, shared validation, and MySQL persistence. Sensitive routes are protected through middleware and server-side auth checks. Save and publish workflows are handled in services, not in raw route handlers, because they involve validation, transactions, revision creation, and page-pointer updates. The public content API builds a canonical render bundle rather than returning raw DB records. This gives the frontend a stable rendering contract while keeping content meaning centralized. The strongest part of the backend is the revision-first page pipeline. The biggest architectural weakness is that public delivery still depends on the authoring runtime at request time.

---

## Tough Interview Questions With Strong Direction

### Why is runtime dependency between public site and admin dangerous?

Because public traffic becomes dependent on the same backend that serves authoring workflows. That creates availability coupling, scaling tension, and operational risk. If public traffic spikes, it can affect content editors. If admin/content assembly slows down, it directly impacts public latency. A stronger design would separate published-content delivery into a read-optimized path or precomputed artifact.

### Why didn’t you just use WordPress or a normal CMS?

Because the main challenge wasn’t just content fields, it was lifecycle control and render contract consistency. I wanted revision-based draft/preview/publish flow and a shared interpretation layer that keeps preview and production aligned.

### If traffic became 100x larger, what would you change first?

I would first decouple public content delivery from the admin runtime. That gives the biggest immediate improvement to scalability and public reliability. After that, I’d add shared caching, read-optimized published bundles, and stronger observability.

### What would you improve first for production security?

I would replace the current admin-only auth model with real users, hashed credentials or SSO, stronger role-based authorization, and audit logging. I would also harden uploads and content sanitization.

### What would you improve first for frontend maintainability?

I would split the editor shell into smaller state-owning modules and improve lazy loading for heavy editor features.

---

## Technology Choice Q&A

### Why React?

React was the right fit because the admin experience is deeply interactive and component-driven, and the public site also benefits from reusable rendering components. Vue or Angular could also have worked, but React plus Next.js gave a strong ecosystem fit for this project.

### Why Next.js?

Next.js gave SSR for the public site, route-based structure, and integrated backend capabilities through route handlers. That helped unify the frontend/backend development model.

### Why Node.js?

Using Node.js let the team use the same language across backend and frontend concerns, which simplifies shared contracts and reduces context switching.

### Why MySQL?

MySQL is a practical choice for structured content relationships and transactions. It handles page metadata, revision pointers, and related entities well. The tradeoff is that deeply querying layout JSON is less elegant than in some other databases.

### Why NextAuth?

NextAuth reduced the amount of custom session/auth infrastructure needed. For an internal admin setup, it was a reasonable speed-vs-complexity tradeoff.

---

## 100 High-Probability Interviewer Questions and Answers

These are framed from the perspective of an interviewer who understands your summary at a high level but does not know every internal file, function, or implementation detail.

Use them as broad-response practice questions, not as a script to memorize word for word.

### How To Practice These By Interview Round

If you want to sound structured in a real interview, do not practice all 100 in random order.

Use them in three passes:

#### Round 1: High-Level / HR / General Technical Interviewer

These are the questions most likely to come from someone who understands software well but does not know the project deeply:

- 1. What problem does this project solve?
- 2. What are the major parts of the system?
- 3. Why split admin and public?
- 4. Why is the shared layer necessary?
- 5. How does a page move from draft to live?
- 6. Why use revisions?
- 9. Why SSR?
- 11. What is the biggest backend weakness?
- 12. What is the biggest frontend weakness?
- 13. What is the biggest security weakness?
- 21. Why separate globals like header and footer?
- 23. How does the editor state work?
- 25. Why use a registry for blocks?
- 28. How do you render pages publicly?
- 30. What would you improve first at scale?
- 31. What would you improve first for enterprise readiness?
- 42. What is the role of templates?
- 43. What is the role of autosave?
- 51. What would you say is the system’s best design choice?
- 52. What would you say is the system’s weakest design choice?
- 53. How would you explain the project to a non-technical stakeholder?
- 71. What is the value of a shared repo here?
- 73. Why is page content not just plain HTML storage?
- 75. Why keep public frontend thin?
- 76. Why keep admin backend workflow-rich?
- 77. What would you say if asked “Did you overengineer this?”
- 78. What parts are maybe underengineered?
- 79. What makes this a strong interview project?
- 80. What makes it vulnerable in interviews?
- 81. What should you be honest about?
- 82. What are the top future improvements?
- 99. What should you say if asked “What are you most proud of?”
- 100. What should you say if asked “What would you do next?”

#### Round 2: Mid-Level Technical Interviewer

These are the questions most likely to come once the interviewer wants implementation depth but is still not doing a full system design round:

- 7. Why not update content directly?
- 8. Why store layouts as JSON?
- 10. Why use route handlers instead of a separate backend at first?
- 14. How do you prevent invalid content from reaching production?
- 15. Why validate more than once?
- 16. What happens if two users edit the same page?
- 17. Why use optimistic concurrency?
- 18. What are the main DB tables?
- 19. What is the role of the page table?
- 20. What is the role of the revisions table?
- 22. How is navigation modeled?
- 24. Why not Redux?
- 26. What is the hardest frontend problem here?
- 27. What is the hardest backend problem here?
- 29. Why not let the frontend fix bad CMS data?
- 34. What is one good reason for direct SQL?
- 35. What is one downside of direct SQL?
- 36. Why use NextAuth?
- 37. What is wrong with env-based admin credentials?
- 38. What is your logging strategy today?
- 39. What observability would you add?
- 40. How would you cache public content?
- 41. Why is in-memory cache weak?
- 44. What is the downside of autosave?
- 45. What happens during publish failure?
- 46. How is preview protected?
- 47. What is the role of the shared page render bundle?
- 48. What is the role of schema versioning in shared content?
- 49. What is the role of normalization?
- 50. Why is canonical structure important?
- 55. Why use custom hooks in the editor?
- 56. What is still too big in the frontend?
- 57. What is still too coupled in the backend?
- 58. What is the role of middleware?
- 59. Why do APIs still check auth if middleware exists?
- 60. How are media uploads stored?
- 61. What is the downside of local upload storage?
- 62. What would be better later for uploads?
- 63. What is the role of templates in scaling content operations?
- 64. What is the role of page history in operational safety?
- 66. What is the frontend’s strongest boundary?
- 67. What is the backend’s strongest boundary?
- 68. What could go wrong during deploy?
- 69. How would you reduce deploy risk?
- 70. What would your smoke test cover?

#### Round 3: Senior / System Design / Architecture Follow-Up

These are the questions most likely to show up after the interviewer decides the project is strong and wants tradeoffs, alternatives, and future-state thinking:

- 32. Why use MySQL over MongoDB?
- 33. Why not PostgreSQL?
- 65. What would you change first in the database at larger scale?
- 72. What is the risk of a shared repo?
- 74. When would plain HTML storage be tempting?
- 83. What is the right way to explain the biggest tradeoff?
- 84. What’s the wrong way to explain the tradeoff?
- 85. Why do interviewer follow-ups happen so much on this project?
- 86. What is one sign you really understand the project?
- 87. What is another sign?
- 88. What is another sign?
- 89. What is another sign?
- 90. What is another sign?
- 91. What should you say if asked “Why not WordPress?”
- 92. What should you say if asked “Why not GraphQL?”
- 93. What should you say if asked “Why not Prisma?”
- 94. What should you say if asked “Why not MongoDB?”
- 95. What should you say if asked “Why not static site generation?”
- 96. What should you say if asked “What fails first at scale?”
- 97. What should you say if asked “What fails first security-wise?”
- 98. What should you say if asked “What fails first frontend-wise?”

### Best Practice Order

If you have limited prep time:

1. Practice Round 1 until your answers sound natural.
2. Add Round 2 so you can handle follow-up depth.
3. Use Round 3 only after your first two rounds feel stable.

### 1. What problem does this project solve?
It solves safe content management for a website by separating draft editing from live content and adding preview, publish, and revision history.

### 2. What are the major parts of the system?
The major parts are the admin authoring app, the shared content contract layer, and the public SSR website.

### 3. Why split admin and public?
Because editing workflows and public rendering have different concerns and should not share the same runtime responsibilities too tightly.

### 4. Why is the shared layer necessary?
It gives one canonical interpretation of blocks and layouts so preview and public rendering stay aligned.

### 5. How does a page move from draft to live?
An editor saves draft revisions, previews them, and publishes the selected draft as the current live revision. The public site only reads the published revision.

### 6. Why use revisions?
Revisions support autosave, restore, preview, rollback, and safe publishing.

### 7. Why not update content directly?
Because editing in-progress content directly into live state is risky and removes safe rollback boundaries.

### 8. Why store layouts as JSON?
Because page-builder structures are nested and change over time.

### 9. Why SSR?
Because SEO and first-response correctness matter for public content pages.

### 10. Why use route handlers instead of a separate backend at first?
Because it was faster to build and aligned well with the project’s full stack structure.

### 11. What is the biggest backend weakness?
Public delivery depending on the admin/content runtime.

### 12. What is the biggest frontend weakness?
The editor shell owns too much orchestration and state.

### 13. What is the biggest security weakness?
Auth and authorization are too simple for broader production use.

### 14. How do you prevent invalid content from reaching production?
Through save-time and render-time validation.

### 15. Why validate more than once?
Because data can drift, migrate, or become invalid after persistence too.

### 16. What happens if two users edit the same page?
Optimistic concurrency causes the stale save to fail rather than silently overwrite.

### 17. Why use optimistic concurrency?
Because it’s simpler than locking and works well when conflicts are uncommon.

### 18. What are the main DB tables?
Pages, page revisions, templates, globals, navigation, and media.

### 19. What is the role of the page table?
Identity, metadata, and pointers to revision states.

### 20. What is the role of the revisions table?
Immutable snapshots of layout content over time.

### 21. Why separate globals like header and footer?
Because they are reusable and should not be duplicated per page.

### 22. How is navigation modeled?
Through navigation items, which are later assembled into a tree.

### 23. How does the editor state work?
Local state plus custom hooks for page loading, mutation, autosave, and history.

### 24. Why not Redux?
At this stage, local workflow hooks were simpler and faster to iterate with.

### 25. Why use a registry for blocks?
To make block rendering extensible and centralized.

### 26. What is the hardest frontend problem here?
Nested layout state management with drag-and-drop plus persistence and history.

### 27. What is the hardest backend problem here?
Maintaining a clean canonical content contract across save, preview, publish, and public render.

### 28. How do you render pages publicly?
Fetch the bundle, validate it, derive a public view, SSR the final page.

### 29. Why not let the frontend fix bad CMS data?
Because that creates another interpretation layer and increases drift risk.

### 30. What would you improve first at scale?
Separate published-content delivery from admin runtime.

### 31. What would you improve first for enterprise readiness?
User system, RBAC, audit logging, and stronger auth.

### 32. Why use MySQL over MongoDB?
Because the workflow is still strongly relational even though layouts are JSON-like.

### 33. Why not PostgreSQL?
PostgreSQL would also have been a strong choice; MySQL was still reasonable for the current constraints.

### 34. What is one good reason for direct SQL?
Explicit control over revision and transaction behavior.

### 35. What is one downside of direct SQL?
More manual query and schema maintenance.

### 36. Why use NextAuth?
To reduce custom auth plumbing and integrate sessions quickly.

### 37. What is wrong with env-based admin credentials?
They do not scale operationally to real multi-user, secure production use.

### 38. What is your logging strategy today?
Basic logs plus structured error boundaries, but observability should be improved.

### 39. What observability would you add?
Structured logs, metrics, alerts, and request correlation IDs.

### 40. How would you cache public content?
Use Redis or precomputed published bundles rather than process-local memory.

### 41. Why is in-memory cache weak?
Because it does not scale horizontally and is instance-local.

### 42. What is the role of templates?
Reusable layout starting points for faster content creation.

### 43. What is the role of autosave?
Protect user work without requiring constant manual saves.

### 44. What is the downside of autosave?
More write traffic and more concurrency complexity.

### 45. What happens during publish failure?
The API returns a clear error and the public site remains unchanged because published state did not advance.

### 46. How is preview protected?
Through admin access control and preview-mode content resolution.

### 47. What is the role of the shared page render bundle?
It is the canonical payload that bridges backend content assembly and public rendering.

### 48. What is the role of schema versioning in shared content?
It gives a path for evolving content contracts more safely.

### 49. What is the role of normalization?
To convert flexible incoming/editor content shapes into one canonical structure.

### 50. Why is canonical structure important?
Because rendering and validation become much simpler when the shape is consistent.

### 51. What would you say is the system’s best design choice?
Revision-first page lifecycle plus shared validation.

### 52. What would you say is the system’s weakest design choice?
Public request-time dependency on the admin/content runtime.

### 53. How would you explain the project to a non-technical stakeholder?
It’s a system that lets the team safely edit and publish website content without directly touching live pages.

### 54. How would you explain it to a senior engineer?
It’s a revision-based CMS platform with a shared canonical content layer and SSR public rendering.

### 55. Why use custom hooks in the editor?
To organize workflow logic like save, history, and layout mutation.

### 56. What is still too big in the frontend?
The unified page editor shell.

### 57. What is still too coupled in the backend?
Public content delivery and admin runtime.

### 58. What is the role of middleware?
To protect route groups and improve admin navigation security flow.

### 59. Why do APIs still check auth if middleware exists?
Because APIs are the actual server-side trust boundary.

### 60. How are media uploads stored?
Locally in uploads plus metadata in the media library.

### 61. What is the downside of local upload storage?
Weaker scalability and durability than object storage.

### 62. What would be better later for uploads?
Object storage like S3 or Cloudinary-style delivery.

### 63. What is the role of templates in scaling content operations?
They reduce repeated editor effort and standardize starting structures.

### 64. What is the role of page history in operational safety?
It allows recovery and rollback when content changes go wrong.

### 65. What would you change first in the database at larger scale?
Introduce a read-optimized published content model or cache layer.

### 66. What is the frontend’s strongest boundary?
Public rendering staying thin and contract-driven.

### 67. What is the backend’s strongest boundary?
Canonical validation around page lifecycle workflows.

### 68. What could go wrong during deploy?
Contract mismatch, schema mismatch, or public rendering breakage if releases are not compatible.

### 69. How would you reduce deploy risk?
Backward-compatible changes, contract tests, staging smoke tests.

### 70. What would your smoke test cover?
Create/edit/save/preview/publish/public render.

### 71. What is the value of a shared repo here?
Easier refactors and coordinated evolution across apps and contracts.

### 72. What is the risk of a shared repo?
Boundaries can blur if discipline is weak.

### 73. Why is page content not just plain HTML storage?
Because structured blocks are more reusable, safer, and easier to validate.

### 74. When would plain HTML storage be tempting?
For very simple publishing systems without complex block semantics.

### 75. Why keep public frontend thin?
To avoid duplication of content meaning.

### 76. Why keep admin backend workflow-rich?
Because content lifecycle safety requires explicit workflow handling.

### 77. What would you say if asked “Did you overengineer this?”
I’d say the complexity is deliberate around the page lifecycle, because content publishing is where silent failure is most costly.

### 78. What parts are maybe underengineered?
Auth, RBAC, observability, and public delivery scaling.

### 79. What makes this a strong interview project?
It shows system design thinking across frontend, backend, data modeling, and content lifecycle.

### 80. What makes it vulnerable in interviews?
If I overclaim production readiness in auth, RBAC, or scaling.

### 81. What should you be honest about?
That the page architecture is stronger than some surrounding domains and that some parts are still evolving.

### 82. What are the top future improvements?
Published-content delivery separation, auth/RBAC hardening, editor modularization.

### 83. What is the right way to explain the biggest tradeoff?
We accepted more application complexity to get safer content lifecycle and shared rendering correctness.

### 84. What’s the wrong way to explain the tradeoff?
Pretending there were no downsides or that the current system is fully enterprise-grade.

### 85. Why do interviewer follow-ups happen so much on this project?
Because the architecture makes strong claims around workflow, consistency, and lifecycle safety.

### 86. What is one sign you really understand the project?
You can explain the exact difference between save, preview, and publish.

### 87. What is another sign?
You can explain why the shared layer exists and what would break without it.

### 88. What is another sign?
You can explain why public rendering should not repair CMS data.

### 89. What is another sign?
You can explain why revisions are better than updating live state directly.

### 90. What is another sign?
You can explain what happens when two editors collide.

### 91. What should you say if asked “Why not WordPress?”
Because the core need was controlled block-based lifecycle and rendering semantics, not just simple content entry.

### 92. What should you say if asked “Why not GraphQL?”
Because the current consumers are known and the workflow-heavy API was simpler with REST-like routes.

### 93. What should you say if asked “Why not Prisma?”
Direct SQL gave explicit control over revision and transactional workflows, though Prisma could be a valid future option.

### 94. What should you say if asked “Why not MongoDB?”
Even though layouts are JSON-like, the rest of the system is still strongly relational and transactional.

### 95. What should you say if asked “Why not static site generation?”
It would be attractive later, but dynamic preview and early workflow speed were stronger initial priorities.

### 96. What should you say if asked “What fails first at scale?”
Public runtime coupling to admin/content service.

### 97. What should you say if asked “What fails first security-wise?”
The simplistic auth/authorization model.

### 98. What should you say if asked “What fails first frontend-wise?”
Editor maintainability and render isolation on large pages.

### 99. What should you say if asked “What are you most proud of?”
The revision-first content lifecycle and shared contract direction.

### 100. What should you say if asked “What would you do next?”
Decouple published delivery, improve auth/RBAC, and modularize the editor further.

---

## Final Advice

The interview goal is not to sound perfect.  
The goal is to sound:

- structured
- honest
- technically deep
- aware of tradeoffs
- aware of what should happen next

The strongest pattern is:

1. what it does
2. why it exists
3. tradeoff
4. future improvement

If you keep answering in that structure, you will sound much more senior.
