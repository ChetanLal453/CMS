import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/require-admin.js'
import { applyTemplateToPage } from '../../../../../lib/services/page-template-service.js'
import { createPageEditorApiError } from '../../../../../../../shared/page/apiContract'

function parsePageId(value) {
  const parsed = Number.parseInt(value ?? '', 10)
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

export async function POST(request, { params }) {
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

  const pageId = parsePageId(body?.page_id)
  if (pageId == null) {
    return jsonPageEditorError(400, {
      code: 'PAGE_ID_REQUIRED',
      message: 'page_id is required',
    })
  }

  try {
    const applied = await applyTemplateToPage({
      templateId: params?.id,
      pageId,
      actor: body?.created_by ?? 'admin',
      applyAssignments: Boolean(body?.apply_assignments),
      baseRevisionId: body?.base_revision_id ?? null,
    })

    if (!applied) {
      return jsonPageEditorError(404, {
        code: 'TEMPLATE_NOT_FOUND',
        message: 'Template not found',
      })
    }

    return NextResponse.json({
      success: true,
      template: applied.template,
      page: applied.result.page,
      revision: applied.result.revision
        ? {
            id: applied.result.revision.id,
            page_id: applied.result.revision.page_id,
            revision_number: applied.result.revision.revision_number ?? null,
            revision_type: applied.result.revision.revision_type ?? null,
            created_by: applied.result.revision.created_by ?? null,
            created_at: applied.result.revision.created_at ?? null,
          }
        : null,
      layout: applied.result.layout,
      message: 'Template applied successfully',
    })
  } catch (error) {
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
