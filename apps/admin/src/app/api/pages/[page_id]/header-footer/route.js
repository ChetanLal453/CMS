import { NextResponse } from 'next/server'
import pool from '../../../../../lib/db.js'
import { requireAdmin } from '../../../../../lib/require-admin.js'
import { tableExists } from '../../../_utils/crud.js'
import { createPageEditorApiError } from '@uadmin/shared/page/apiContract'

function logRequest(request) {
  console.log('[API]', request.method, request.url)
}

function methodNotAllowed() {
  return jsonPageEditorError(405, {
    code: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  })
}

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

function normalizeSlug(value) {
  if (value === undefined) {
    return undefined
  }

  if (value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    return null
  }

  return value.trim() || null
}

async function fetchPageState(pageId) {
  const [rows] = await pool.query(
    'SELECT id, header_slug, footer_slug, updated_at FROM pages WHERE id = ? LIMIT 1',
    [pageId],
  )
  return rows[0] || null
}

async function updateHeaderFooter(request, params) {
  logRequest(request)

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

  const headerSlug = normalizeSlug(body?.header_slug)
  const footerSlug = normalizeSlug(body?.footer_slug)

  if (headerSlug === undefined && footerSlug === undefined) {
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

    const page = await fetchPageState(pageId)
    if (!page) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const updates = []
    const values = []

    if (headerSlug !== undefined) {
      updates.push('header_slug = ?')
      values.push(headerSlug)
    }

    if (footerSlug !== undefined) {
      updates.push('footer_slug = ?')
      values.push(footerSlug)
    }

    values.push(pageId)
    await pool.query(`UPDATE pages SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values)

    const updatedPage = await fetchPageState(pageId)
    return NextResponse.json({
      success: true,
      data: {
        id: updatedPage?.id ?? pageId,
        header_slug: updatedPage?.header_slug ?? null,
        footer_slug: updatedPage?.footer_slug ?? null,
        updated_at: updatedPage?.updated_at ?? null,
      },
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}

export async function GET(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  logRequest(request)

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

    const page = await fetchPageState(pageId)
    if (!page) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: page.id,
        header_slug: page.header_slug ?? null,
        footer_slug: page.footer_slug ?? null,
        updated_at: page.updated_at ?? null,
      },
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}

export async function POST(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  return updateHeaderFooter(request, params)
}

export async function PUT(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  return updateHeaderFooter(request, params)
}

export async function PATCH() {
  return methodNotAllowed()
}

export async function DELETE() {
  return methodNotAllowed()
}

export async function OPTIONS() {
  return NextResponse.json({ success: true, data: { methods: ['GET', 'POST', 'PUT'] } })
}
