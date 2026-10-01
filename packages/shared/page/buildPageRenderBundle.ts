import type { JsonObject, PageBanner, PageBlock, PageFooter, PageHeader, PageRenderBundle, PageSection } from './PageRenderBundle'
import { PAGE_RENDER_BUNDLE_SCHEMA_VERSION } from './schemaVersion'
import { normalizeLayout } from './layout'
import { normalizeSeo } from './seo'
import { validatePageRenderBundle } from './validatePageRenderBundle'

function createTraceId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `trace-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeBaseUrl(value?: string | null) {
  const trimmed = String(value || '').trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : ''
}

function isHexColor(color?: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(color || '').trim())
}

function normalizeHexColor(color?: string) {
  const hex = String(color || '').trim().toLowerCase()

  if (!isHexColor(hex)) {
    return ''
  }

  if (hex.length === 4) {
    return `#${hex
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('')}`
  }

  return hex
}

function toHexChannel(value: string) {
  return Number.parseInt(value, 16)
}

function hexToRgb(color: string) {
  const hex = normalizeHexColor(color)
  if (!hex) {
    return '15, 118, 110'
  }

  const r = toHexChannel(hex.slice(1, 3))
  const g = toHexChannel(hex.slice(3, 5))
  const b = toHexChannel(hex.slice(5, 7))
  return `${r}, ${g}, ${b}`
}

function buildTheme(page: Record<string, any>, header: Record<string, any> | null | undefined, footer: Record<string, any> | null | undefined, sections: PageSection[]) {
  const pageSlug = String(page?.slug || '').trim().toLowerCase()
  const sectionBackground = sections
    .map((section) => normalizeHexColor(section?.settings?.backgroundColor))
    .find(Boolean)

  const accent = normalizeHexColor(header?.bg_color) || normalizeHexColor(footer?.bg_color) || sectionBackground || '#0f766e'
  const serviceGradient =
    'linear-gradient(180deg, #17495a 0%, #5f6673 45%, #c98a8b 78%, #f2a0a2 100%)'

  return {
    accent,
    accentRgb: hexToRgb(accent),
    shellBackground:
      pageSlug.includes('service') || pageSlug.includes('home')
        ? serviceGradient
        : 'radial-gradient(circle at top left, rgba(15, 118, 110, 0.12), transparent 28%), radial-gradient(circle at top right, rgba(15, 23, 42, 0.08), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #ffffff 38%, #f8fafc 100%)',
    surface: '#ffffff',
    surfaceAlt: '#f8fafc',
    border: 'rgba(15, 23, 42, 0.10)',
    text: '#0f172a',
    muted: '#475569',
    shadow: '0 22px 60px rgba(15, 23, 42, 0.10)',
  }
}

function resolveCanonicalPage(page: Record<string, any>) {
  return {
    id: page?.id ?? null,
    slug: String(page?.slug || '').trim(),
    title: String(page?.title || '').trim() || String(page?.name || '').trim() || String(page?.slug || '').trim(),
    name: String(page?.name || '').trim() || String(page?.title || '').trim() || String(page?.slug || '').trim(),
    status: page?.status ?? null,
    seo: normalizeSeo(page?.seo ?? {
      title: page?.meta_title,
      description: page?.meta_description,
      keywords: page?.meta_keywords,
      image: page?.meta_image,
      imageId: page?.meta_image_id,
      canonicalUrl: page?.canonical_url,
      robots: page?.robots,
    }),
    header_slug: page?.header_slug ?? null,
    footer_slug: page?.footer_slug ?? null,
    banner_slug: page?.banner_slug ?? null,
    header_id: page?.header_id ?? null,
    footer_id: page?.footer_id ?? null,
    banner_id: page?.banner_id ?? null,
    published_at: page?.published_at ?? null,
    updated_at: page?.updated_at ?? null,
    current_revision_id: page?.current_revision_id ?? null,
    published_revision_id: page?.published_revision_id ?? null,
  }
}

function buildViewStructure(sections: PageSection[]) {
  return {
    sections: sections.map((section) => ({
      id: section.id,
      blockIds: section.blocks.map((block: PageBlock) => block.id),
      blockTypes: section.blocks.map((block: PageBlock) => block.type),
    })),
  }
}

function createPageViewModel(page: Record<string, unknown>, header: Record<string, unknown> | null, footer: Record<string, unknown> | null, banner: Record<string, unknown> | null, sections: PageSection[], traceId: string) {
  return {
    traceId,
    theme: buildTheme(page, header, footer, sections),
    header: header ?? null,
    footer: footer ?? null,
    banner: banner ?? null,
    content: sections,
    structure: buildViewStructure(sections),
  }
}

export type RawPageRenderSource = {
  mode?: 'public' | 'preview'
  page: Record<string, any>
  header?: PageHeader | null
  footer?: PageFooter | null
  banner?: PageBanner | null
  revision?: JsonObject | null
  draft_revision?: JsonObject | null
  published_revision?: JsonObject | null
  draft_layout?: unknown
  published_layout?: unknown
}

export function buildPageRenderBundle(source: RawPageRenderSource): PageRenderBundle {
  const mode = source.mode === 'preview' ? 'preview' : 'public'
  const page = resolveCanonicalPage(source.page || {})
  const traceId = createTraceId()
  const publishedRevision = source.published_revision ?? null
  const selectedLayoutSource = mode === 'preview'
    ? source.draft_layout ?? source.published_layout ?? null
    : source.published_layout ?? null

  const layout = normalizeLayout(selectedLayoutSource, page, {
    flattenAdvancedCard: mode === 'preview',
  })

  const sections = Array.isArray(layout.sections) ? layout.sections : []
  const header = source.header ?? null
  const footer = source.footer ?? null
  const banner = source.banner ?? null
  const bundle = {
    success: true as const,
    schemaVersion: PAGE_RENDER_BUNDLE_SCHEMA_VERSION,
    mode,
    page,
    layout,
    sections,
    header,
    footer,
    banner,
    view: createPageViewModel(page, header, footer, banner, sections, traceId),
    diagnostics: {
      traceId,
      unknownBlocks: [],
    },
    published_revision: publishedRevision,
    has_published_revision: Boolean(publishedRevision),
    ...(mode === 'preview'
      ? {
          revision: source.draft_revision ?? source.revision ?? null,
          draft_revision: source.draft_revision ?? null,
        }
      : {}),
  }

  return validatePageRenderBundle(bundle)
}
