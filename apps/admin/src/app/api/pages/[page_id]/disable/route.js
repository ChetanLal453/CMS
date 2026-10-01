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

function normalizeDisabled(value) {
  if (value === true || value === false) {
    return value ? 1 : 0
  }

  return null
}

async function fetchPageState(pageId) {
  const [rows] = await pool.query('SELECT id, slug, disabled, updated_at FROM pages WHERE id = ? LIMIT 1', [
    pageId,
  ])
  return rows[0] || null
}

async function updateDisabled(request, params) {
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

  const disabled = normalizeDisabled(body?.disabled)
  if (disabled === null) {
    return jsonPageEditorError(400, {
      code: 'INVALID_DISABLED_VALUE',
      message: 'disabled must be boolean',
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

    if (page.slug === 'home' && disabled === 1) {
      return jsonPageEditorError(403, {
        code: 'HOME_PAGE_DISABLE_FORBIDDEN',
        message: 'Cannot disable home page',
      })
    }

    await pool.query('UPDATE pages SET disabled = ?, updated_at = NOW() WHERE id = ?', [disabled, pageId])

    const updatedPage = await fetchPageState(pageId)
    return NextResponse.json({
      success: true,
      data: {
        id: updatedPage?.id ?? pageId,
        disabled: Boolean(updatedPage?.disabled ?? disabled),
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
        disabled: Boolean(page.disabled),
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

  return updateDisabled(request, params)
}

export async function PUT(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  return updateDisabled(request, params)
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
