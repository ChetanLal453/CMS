import { NextResponse } from 'next/server'
import pool from '../../../../lib/db.js'
import {
  pickDefined,
  tableExists,
} from '../../_utils/crud.js'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { normalizeLayout } from '../../../../lib/layout-sync.js'
import { clearPublicPageBundleCache } from '../../../../lib/public-page-cache.js'
import { getPageSelectClause } from '../../../../lib/repositories/page-repository.js'
import { getRevisionById, revisionsTableReady } from '../../../../lib/repositories/page-revision-repository.js'
import { saveDraftRevision } from '../../../../lib/services/page-editor-service.js'
import { PageLayoutValidationError } from '@uadmin/shared/page/validateCanonicalLayout'
import { createPageEditorApiError } from '@uadmin/shared/page/apiContract'

function parsePageId(pageId) {
  const parsed = Number.parseInt(pageId, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function jsonPageEditorError(status, {
  code,
  message,
  traceId,
  details,
}) {
  return NextResponse.json(
    createPageEditorApiError({
      code,
      message,
      traceId,
      details,
    }),
    { status },
  )
}

function normalizePageRow(page) {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title || page.name || '',
    name: page.name || page.title || '',
    status: page.status || null,
    disabled: Boolean(page.disabled),
    header_slug: page.header_slug ?? null,
    footer_slug: page.footer_slug ?? null,
    banner_slug: page.banner_slug ?? null,
    header_id: page.header_id ?? null,
    footer_id: page.footer_id ?? null,
    banner_id: page.banner_id ?? null,
    meta_title: page.meta_title ?? null,
    meta_description: page.meta_description ?? null,
    meta_image: page.meta_image ?? null,
    meta_image_id: page.meta_image_id ?? null,
    published_at: page.published_at ?? null,
    updated_at: page.updated_at ?? null,
    current_revision_id: page.current_revision_id ?? null,
    published_revision_id: page.published_revision_id ?? null,
  }
}

function serializeRevisionMeta(revision) {
  if (!revision) {
    return null
  }

  return {
    id: revision.id,
    page_id: revision.page_id,
    revision_number: revision.revision_number ?? null,
    revision_type: revision.revision_type ?? null,
    created_by: revision.created_by ?? null,
    created_at: revision.created_at ?? null,
  }
}

async function buildRevisionBackedPageResponse(pageRow) {
  const normalizedPage = normalizePageRow(pageRow)
  let currentRevision = null
  let publishedRevision = null

  if (await revisionsTableReady()) {
    if (normalizedPage.current_revision_id != null) {
      currentRevision = await getRevisionById(normalizedPage.current_revision_id)
    }

    if (normalizedPage.published_revision_id != null) {
      publishedRevision = await getRevisionById(normalizedPage.published_revision_id)
    }
  }

  return {
    page: {
      ...normalizedPage,
      layout: normalizeLayout(currentRevision?.layout_json ?? null, normalizedPage),
    },
    revision: serializeRevisionMeta(currentRevision),
    published_revision: serializeRevisionMeta(publishedRevision),
  }
}

export async function GET(_request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const pageId = parsePageId(params?.page_id)
  if (pageId === null) {
    return jsonPageEditorError(400, {
      code: 'INVALID_PAGE_ID',
      message: 'Invalid page ID',
    })
  }

  try {
    if (!(await tableExists('pages'))) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'pages' is unavailable.",
        details: { table: 'pages' },
      })
    }

    const selectClause = await getPageSelectClause()
    const [rows] = await pool.query(
      `SELECT
        ${selectClause}
      FROM pages
      WHERE id = ?
      LIMIT 1`,
      [pageId],
    )

    if (!rows.length) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const responseData = await buildRevisionBackedPageResponse(rows[0])

    return NextResponse.json({
      success: true,
      ...responseData,
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}

export async function DELETE(_request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const pageId = parsePageId(params?.page_id)
  if (pageId === null) {
    return jsonPageEditorError(400, {
      code: 'INVALID_PAGE_ID',
      message: 'Invalid page ID',
    })
  }

  try {
    if (!(await tableExists('pages'))) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'pages' is unavailable.",
        details: { table: 'pages' },
      })
    }

    const [pages] = await pool.query('SELECT slug FROM pages WHERE id = ? LIMIT 1', [pageId])
    if (!pages.length) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    if (pages[0].slug === 'home') {
      return jsonPageEditorError(403, {
        code: 'HOME_PAGE_DELETE_FORBIDDEN',
        message: 'Cannot delete home page',
      })
    }

    await pool.query('DELETE FROM pages WHERE id = ?', [pageId])
    clearPublicPageBundleCache(pages[0].slug)

    return NextResponse.json({ success: true, data: { id: pageId } })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}

export async function PUT(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const pageId = parsePageId(params?.page_id)
  if (pageId === null) {
    return jsonPageEditorError(400, {
      code: 'INVALID_PAGE_ID',
      message: 'Invalid page ID',
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return jsonPageEditorError(400, {
      code: 'INVALID_JSON_BODY',
      message: 'Invalid JSON body',
    })
  }

  const payload = pickDefined(body, [
    'title',
    'name',
    'layout',
    'disabled',
    'status',
    'header_slug',
    'footer_slug',
    'banner_slug',
    'meta_title',
    'meta_description',
    'meta_image',
    'published_at',
    'scheduled_for',
  ])
  const baseRevisionId = body?.base_revision_id ?? null

  if (!Object.keys(payload).length) {
    return jsonPageEditorError(400, {
      code: 'NOTHING_TO_UPDATE',
      message: 'Nothing to update',
    })
  }

  try {
    if (!(await tableExists('pages'))) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'pages' is unavailable.",
        details: { table: 'pages' },
      })
    }

    const [pages] = await pool.query('SELECT id, slug FROM pages WHERE id = ? LIMIT 1', [pageId])
    if (!pages.length) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'layout')) {
      const { layout, ...extraPageFields } = payload

      const result = await saveDraftRevision({
        pageId,
        layout,
        pageName: payload.name || payload.title || '',
        extraPageFields,
        baseRevisionId,
        actor: 'admin',
      })

      const normalizedPage = normalizePageRow(result.page || pages[0] || { id: pageId })

      return NextResponse.json({
        success: true,
        page: {
          ...normalizedPage,
          layout: result.layout,
        },
        revision: serializeRevisionMeta(result.revision),
      })
    }

    const fields = Object.keys(payload)
    const values = fields.map((field) => payload[field])
    values.push(pageId)

    await pool.query(
      `UPDATE pages SET ${fields.map((field) => `${field} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
      values,
    )
    clearPublicPageBundleCache(pages[0].slug)

    const selectClause = await getPageSelectClause()
    const [rows] = await pool.query(
      `SELECT
        ${selectClause}
      FROM pages
      WHERE id = ?
      LIMIT 1`,
      [pageId],
    )

    const responseData = rows[0] ? await buildRevisionBackedPageResponse(rows[0]) : { page: null, revision: null, published_revision: null }

    return NextResponse.json({
      success: true,
      ...responseData,
    })
  } catch (error) {
    if (error instanceof PageLayoutValidationError) {
      return jsonPageEditorError(400, {
        code: 'PAGE_LAYOUT_VALIDATION_FAILED',
        message: error.message,
        traceId: error.traceId,
        details: {
          validationCode: error.code,
          issues: error.issues,
        },
      })
    }

    if (error?.code === 'REVISION_CONFLICT') {
      return jsonPageEditorError(409, {
        code: 'REVISION_CONFLICT',
        message: 'This page changed in another session. Reload the editor and try again.',
      })
    }

    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
