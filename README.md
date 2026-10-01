# UAdmin — Multi-Site CMS Platform

Monorepo containing the UAdmin CMS visual builder and the generic public website runtime.

## Structure

```
uadmin/
├── apps/
│   ├── admin/          # Admin CMS + Visual Page Builder (Next.js 14)
│   └── site-runtime/   # Generic public website runtime (Next.js 15)
│
├── packages/
│   └── shared/         # Canonical CMS contracts shared by both apps (@uadmin/shared)
│       ├── blocks/     # Block schemas, normalization, view models, registries
│       ├── page/       # Page render bundle, layout, validation, migration
│       ├── presets/    # Section preset definitions & factories
│       ├── theme/      # Global theme contracts & CSS variable generation
│       └── utils/      # Shared utilities (sanitization, merge, etc.)
│
├── .gitignore          # Monorepo-aware gitignore rules
├── .npmrc              # legacy-peer-deps=true for React 18 compatibility
├── .nvmrc              # Node 20 LTS runtime declaration
├── package.json        # Root workspace configuration
├── package-lock.json   # Single root lockfile for all workspaces
└── tsconfig.base.json  # Shared TypeScript compiler options
```

## Dependency Rule

```
apps/admin ────────┐
                   ↓
             packages/shared (@uadmin/shared)
                   ↑
apps/site-runtime ─┘
```

**Apps must never import each other directly.**

## Requirements & Environment

- **Node.js**: Node 20 LTS (`20.x`, specifically tested on `v20.20.2`). Declared in `.nvmrc` and root `package.json` engines.
  - *Note: Node 23 is NOT supported due to upstream Webpack worker pool serialization defects on Windows.*
- **Package Manager**: npm with workspaces (`npm ci` and `npm install`).
  - `.npmrc` sets `legacy-peer-deps=true` because `react-albus@2.0.0` in `@uadmin/admin` specifies legacy peer dependencies while the monorepo runs on React 18.

## Getting Started

```bash
# Clean install all workspace dependencies from root lockfile
npm ci

# Development (Predictable ports: Admin on 3000, Site Runtime on 3001)
npm run dev:admin        # Start admin CMS on http://localhost:3000
npm run dev:site         # Start site-runtime on http://localhost:3001

# Type checking (0 errors across both applications)
npm run typecheck        # Check both apps

# Testing (Jest contracts & integration tests)
npm run test             # Run all 25 Jest test suites (152 tests)

# Production builds
npm run build:admin      # Build admin for production
npm run build:site       # Build site-runtime for production
```

## Importing Shared Code

Both apps import canonical CMS contracts via the `@uadmin/shared` workspace package:

```typescript
import { blockRegistry } from '@uadmin/shared/blocks/registry'
import { buildPublicPageView } from '@uadmin/shared/page/viewHelpers'
import { THEME_PRESETS } from '@uadmin/shared/theme'
import { instantiateSectionPreset } from '@uadmin/shared/presets/registry'
```
