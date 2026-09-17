import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { listTemplateRecords } from '../../../../lib/services/page-template-service.js'
import { createPageEditorApiError } from '../../../../../../shared/page/apiContract'

function safeParseInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isNaN(parsed) ? fallback : parsed
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

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const limit = safeParseInteger(searchParams.get('limit'), 50)
  const offset = safeParseInteger(searchParams.get('offset'), 0)

  try {
    const allTemplates = await listTemplateRecords()

    if (!Array.isArray(allTemplates)) {
      return jsonPageEditorError(503, {
        code: 'TEMPLATE_STORAGE_UNAVAILABLE',
        message: 'Template storage is unavailable',
      })
    }

    const templates = allTemplates
      .filter((template) => {
        const matchesSearch =
          !search ||
          String(template.name || '').toLowerCase().includes(search.toLowerCase()) ||
          String(template.description || '').toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !category || category === 'all' || template.category === category
        return matchesSearch && matchesCategory
      })
      .slice(Math.max(offset, 0), Math.max(offset, 0) + Math.max(limit, 1))

    return NextResponse.json({
      success: true,
      data: templates,
      templates,
      total: allTemplates.filter((template) => {
        const matchesSearch =
          !search ||
          String(template.name || '').toLowerCase().includes(search.toLowerCase()) ||
          String(template.description || '').toLowerCase().includes(search.toLowerCase())
        const matchesCategory = !category || category === 'all' || template.category === category
        return matchesSearch && matchesCategory
      }).length,
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
