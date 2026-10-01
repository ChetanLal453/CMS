import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { removeTemplate } from '../../../../lib/services/page-template-service.js'
import { createPageEditorApiError } from '@uadmin/shared/page/apiContract'

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

export async function DELETE(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return jsonPageEditorError(400, {
      code: 'TEMPLATE_ID_REQUIRED',
      message: 'Template ID is required',
    })
  }

  try {
    const result = await removeTemplate(id)
    if (!result.tableName) {
      return jsonPageEditorError(503, {
        code: 'TEMPLATE_STORAGE_UNAVAILABLE',
        message: 'Template storage is unavailable',
      })
    }

    if (!result.deleted) {
      return jsonPageEditorError(404, {
        code: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found',
      })
    }

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Template deleted successfully',
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
