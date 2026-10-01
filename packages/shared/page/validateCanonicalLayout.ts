import type { PageLayout, PageSection } from './PageRenderBundle'
import { SeoDefaults } from './seo'
import { PAGE_RENDER_BUNDLE_SCHEMA_VERSION } from './schemaVersion'
import { PageRenderBundleValidationError, validatePageRenderBundle } from './validatePageRenderBundle'

type ValidationIssue = {
  path: string
  message: string
  code: 'INVALID_LAYOUT' | 'INVALID_PAGE_RENDER_BUNDLE' | 'UNKNOWN_BLOCK' | 'INVALID_BLOCK_PROPS'
}

type CanonicalLayoutValidationOptions = {
  pageId?: string | number | null
  slug?: string | null
  title?: string | null
  name?: string | null
  mode?: 'public' | 'preview'
}

function createTraceId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `layout-trace-${Math.random().toString(36).slice(2, 10)}`
}

function buildStructure(sections: PageSection[]) {
  return {
    sections: sections.map((section) => ({
      id: section.id,
      blockIds: section.blocks.map((block) => block.id),
      blockTypes: section.blocks.map((block) => block.type),
    })),
  }
}

export class PageLayoutValidationError extends Error {
  code: 'INVALID_LAYOUT'
  traceId: string
  issues: ValidationIssue[]

  constructor(message: string, traceId: string, issues: ValidationIssue[]) {
    super(message)
    this.name = 'PageLayoutValidationError'
    this.code = 'INVALID_LAYOUT'
    this.traceId = traceId
    this.issues = issues
  }
}

export function validateCanonicalLayout(
  layout: unknown,
  options: CanonicalLayoutValidationOptions = {},
): PageLayout {
  const traceId = createTraceId()
  const candidate = layout && typeof layout === 'object' ? (layout as PageLayout) : null
  const sections = Array.isArray(candidate?.sections) ? candidate.sections : []

  const syntheticBundle = {
    success: true as const,
    schemaVersion: PAGE_RENDER_BUNDLE_SCHEMA_VERSION,
    mode: options.mode === 'public' ? 'public' : 'preview',
    page: {
      id: options.pageId ?? null,
      slug: String(options.slug || `validation-${options.pageId ?? 'page'}`),
      title: String(options.title || options.name || 'Validation Page'),
      name: String(options.name || options.title || 'Validation Page'),
      seo: SeoDefaults,
    },
    layout,
    sections,
    view: {
      traceId,
      theme: {
        accent: '#0f766e',
        accentRgb: '15, 118, 110',
        shellBackground: '',
        surface: '#ffffff',
        surfaceAlt: '#f8fafc',
        border: 'rgba(15, 23, 42, 0.10)',
        text: '#0f172a',
        muted: '#475569',
        shadow: 'none',
      },
      header: null,
      footer: null,
      banner: null,
      content: sections,
      structure: buildStructure(sections),
    },
    diagnostics: {
      traceId,
      unknownBlocks: [],
    },
    revision: null,
    draft_revision: null,
    published_revision: null,
    has_published_revision: false,
  }

  try {
    return validatePageRenderBundle(syntheticBundle).layout
  } catch (error) {
    if (error instanceof PageRenderBundleValidationError) {
      throw new PageLayoutValidationError(
        `Invalid canonical layout: ${error.message.replace(/^Invalid PageRenderBundle:\s*/, '')}`,
        error.traceId,
        error.issues,
      )
    }

    throw error
  }
}
