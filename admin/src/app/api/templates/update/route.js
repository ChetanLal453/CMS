import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { updateTemplate } from '../../../../lib/services/page-template-service.js'
import { createPageEditorApiError } from '../../../../../../shared/page/apiContract'

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

export async function PUT(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
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

  const id = body?.id
  if (!id) {
    return jsonPageEditorError(400, {
      code: 'TEMPLATE_ID_REQUIRED',
      message: 'Template ID is required',
    })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return jsonPageEditorError(400, {
      code: 'TEMPLATE_NAME_REQUIRED',
      message: 'Template name is required',
    })
  }

  const layout = body?.layout ?? body?.content ?? {}
  const description = body?.description ?? ''
  const category = body?.category ?? 'general'
  const thumbnail = body?.thumbnail ?? ''
  const tags = Array.isArray(body?.tags) ? body.tags : []

  try {
    const { item: template } = await updateTemplate(id, {
      name,
      description,
      category,
      thumbnail,
      layout,
      tags,
    })

    if (!template) {
      return jsonPageEditorError(404, {
        code: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found or template storage is unavailable',
      })
    }

    return NextResponse.json({
      success: true,
      data: template,
      template,
      message: 'Template updated successfully',
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
