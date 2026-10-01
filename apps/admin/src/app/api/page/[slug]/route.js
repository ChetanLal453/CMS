import { buildPageRenderBundle } from '@uadmin/shared/page/buildPageRenderBundle'
import { createPageRenderApiError } from '@uadmin/shared/page/apiContract'
import { assertPageRenderBundle } from '@uadmin/shared/page/assertPageRenderBundle'
import { PageRenderBundleValidationError } from '@uadmin/shared/page/validatePageRenderBundle'
import { loadPageRenderSource } from '../../../../lib/services/page-render-service.js'

function formatSlugLabel(slug) {
  const normalized = String(slug || '')
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) {
    return 'Untitled Page'
  }

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase())
}

function resolvePageName(page) {
  const name = String(page?.name || '').trim()
  if (name) {
    return name
  }

  const title = String(page?.title || '').trim()
  if (title) {
    return title
  }

  return formatSlugLabel(page?.slug)
}

function normalizeIncomingSlug(slug) {
  if (Array.isArray(slug)) {
    return slug.filter(Boolean).join('/').trim()
  }

  return String(slug || '').trim()
}

function isNonPageSlug(slug) {
  const normalizedSlug = normalizeIncomingSlug(slug).replace(/^\/+/, '').toLowerCase()

  if (!normalizedSlug) {
    return false
  }

  if (normalizedSlug.startsWith('_next') || normalizedSlug.startsWith('uploads')) {
    return true
  }

  if (normalizedSlug === 'favicon.ico') {
    return true
  }

  const lastSegment = normalizedSlug.split('/').pop() || ''
  return lastSegment.includes('.')
}

function pruneEditorOnlyProps(value) {
  if (Array.isArray(value)) {
    return value.map(pruneEditorOnlyProps)
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.startsWith('editor'))
      .map(([key, entryValue]) => [key, pruneEditorOnlyProps(entryValue)]),
  )
}

function prunePublicBlock(block) {
  if (!block || typeof block !== 'object') {
    return block
  }

  return {
    id: block.id,
    type: block.type,
    props: pruneEditorOnlyProps(block.props && typeof block.props === 'object' ? block.props : {}),
  }
}

function prunePublicRow(row) {
  if (!row || typeof row !== 'object') {
    return row
  }

  return {
    id: row.id,
    columns: Array.isArray(row.columns)
      ? row.columns.map((column) => ({
          id: column?.id,
          width: column?.width,
          components: Array.isArray(column?.components) ? column.components.map(prunePublicBlock) : [],
        }))
      : [],
  }
}

function prunePublicSection(section) {
  if (!section || typeof section !== 'object') {
    return section
  }

  const rows = Array.isArray(section.rows) ? section.rows.map(prunePublicRow) : []
  const blocks = Array.isArray(section.blocks) ? section.blocks.map(prunePublicBlock) : []

  return {
    id: section.id,
    name: section.name,
    type: section.type,
    content: section.content,
    props: pruneEditorOnlyProps(section.props && typeof section.props === 'object' ? section.props : {}),
    settings: section.settings && typeof section.settings === 'object' ? section.settings : {},
    blocks,
    rows,
  }
}

function createPublicApiBundle(bundle) {
  const publicSections = Array.isArray(bundle.sections) ? bundle.sections.map(prunePublicSection) : []
  const publicLayoutSections = Array.isArray(bundle.layout?.sections) ? bundle.layout.sections.map(prunePublicSection) : []
  const publicViewContent = Array.isArray(bundle.view?.content) ? bundle.view.content.map(prunePublicSection) : []

  return {
    success: bundle.success,
    schemaVersion: bundle.schemaVersion,
    mode: bundle.mode,
    page: bundle.page,
    layout: {
      schemaVersion: bundle.layout?.schemaVersion,
      id: bundle.layout?.id,
      name: bundle.layout?.name,
      sections: publicLayoutSections,
    },
    sections: publicSections,
    header: bundle.header ?? null,
    footer: bundle.footer ?? null,
    banner: bundle.banner ?? null,
    view: {
      ...bundle.view,
      content: publicViewContent,
    },
  }
}

function jsonPageRenderError(status, {
  code,
  message,
  traceId,
  details,
}) {
  return Response.json(
    createPageRenderApiError({
      code,
      message,
      traceId,
      details,
    }),
    { status },
  )
}

export async function GET(request, { params }) {
  try {
    const { slug } = params

    if (isNonPageSlug(slug)) {
      return jsonPageRenderError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const url = new URL(request.url)
    const revisionIdParam = url.searchParams.get('revisionId')
    const preview = url.searchParams.get('preview') === '1'
    const parsedRevisionId =
      revisionIdParam == null ? null : Number.parseInt(revisionIdParam, 10)

    if (revisionIdParam != null && Number.isNaN(parsedRevisionId)) {
      return jsonPageRenderError(400, {
        code: 'INVALID_REVISION_ID',
        message: 'Invalid revisionId',
      })
    }

    if (!preview && revisionIdParam != null) {
      return jsonPageRenderError(400, {
        code: 'PREVIEW_REVISION_ONLY',
        message: 'revisionId is only supported in preview mode',
      })
    }

    const revisionId = parsedRevisionId == null || Number.isNaN(parsedRevisionId) ? null : parsedRevisionId
    const mode = preview ? 'preview' : 'public'
    const source = await loadPageRenderSource(slug, { mode, revisionId })

    if (!source) {
      return jsonPageRenderError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const bundle = assertPageRenderBundle(buildPageRenderBundle(source))

    if (preview) {
      if (revisionId != null && !bundle.revision) {
        return jsonPageRenderError(404, {
          code: 'REVISION_NOT_FOUND',
          message: 'Revision not found',
          traceId: bundle.view?.traceId,
          details: {
            revisionId,
            slug: bundle.page?.slug ?? normalizeIncomingSlug(slug),
          },
        })
      }

      return Response.json(bundle)
    }

    const pageIsPublished = String(bundle.page?.status || '').toLowerCase() === 'published'

    if (!pageIsPublished || !bundle.published_revision) {
      return jsonPageRenderError(404, {
        code: 'PAGE_NOT_PUBLISHED',
        message: 'Page is not published',
        traceId: bundle.view?.traceId,
        details: {
          page: {
            id: bundle.page?.id ?? null,
            slug: bundle.page?.slug ?? slug,
            title: resolvePageName(bundle.page),
          },
        },
      })
    }

    return Response.json(createPublicApiBundle(bundle))
  } catch (error) {
    if (error instanceof PageRenderBundleValidationError) {
      console.error('page_render_bundle_validation_failed', {
        traceId: error.traceId,
        code: error.code,
        issues: error.issues,
      })

      return jsonPageRenderError(500, {
        code: 'INVALID_PAGE_RENDER_BUNDLE',
        message: error.message,
        traceId: error.traceId,
        details: {
          validationCode: error.code,
          issues: error.issues,
        },
      })
    }

    console.error('DB ERROR:', error)
    return jsonPageRenderError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
