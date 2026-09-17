import { NextResponse } from 'next/server'
import pool from '../../../../../lib/db.js'
import { requireAdmin } from '../../../../../lib/require-admin.js'
import { tableExists } from '../../../_utils/crud.js'
import { createPageEditorApiError } from '../../../../../../../shared/page/apiContract'

type PageBannerState = {
  id: number
  banner_slug: string | null
  updated_at: string | null
}

function logRequest(request: Request) {
  void request
}

function methodNotAllowed() {
  return jsonPageEditorError(405, {
    code: 'METHOD_NOT_ALLOWED',
    message: 'Method not allowed',
  })
}

function parsePageId(pageId: string | undefined) {
  const parsed = Number.parseInt(pageId || '', 10)
  return Number.isNaN(parsed) ? null : parsed
}

function jsonPageEditorError(status: number, {
  code,
  message,
  traceId,
  details,
}: {
  code: Parameters<typeof createPageEditorApiError>[0]['code']
  message: string
  traceId?: string | null
  details?: Record<string, unknown>
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

function normalizeSlug(value: unknown) {
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

async function fetchPageState(pageId: number) {
  const [rows] = await pool.query('SELECT id, banner_slug, updated_at FROM pages WHERE id = ? LIMIT 1', [
    pageId,
  ])
  return Array.isArray(rows) ? ((rows[0] as PageBannerState | undefined) ?? null) : null
}

async function updateBanner(request: Request, params: { page_id: string }) {
  logRequest(request)

  const pageId = parsePageId(params?.page_id)
  if (pageId === null) {
    return jsonPageEditorError(400, {
      code: 'INVALID_PAGE_ID',
      message: 'Invalid page ID',
    })
  }

  let body: { banner_slug?: unknown }
  try {
    body = await request.json()
  } catch {
    return jsonPageEditorError(400, {
      code: 'INVALID_JSON_BODY',
      message: 'Invalid JSON body',
    })
  }

  const bannerSlug = normalizeSlug(body?.banner_slug)
  if (bannerSlug === undefined) {
    return jsonPageEditorError(400, {
      code: 'BANNER_SLUG_REQUIRED',
      message: 'banner_slug is required',
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

    await pool.query('UPDATE pages SET banner_slug = ?, updated_at = NOW() WHERE id = ?', [
      bannerSlug,
      pageId,
    ])

    const updatedPage = await fetchPageState(pageId)
    return NextResponse.json({
      success: true,
      data: {
        id: updatedPage?.id ?? pageId,
        banner_slug: updatedPage?.banner_slug ?? null,
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

export async function GET(request: Request, { params }: { params: { page_id: string } }) {
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
        banner_slug: page.banner_slug ?? null,
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

export async function POST(request: Request, { params }: { params: { page_id: string } }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  return updateBanner(request, params)
}

export async function PUT(request: Request, { params }: { params: { page_id: string } }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  return updateBanner(request, params)
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
