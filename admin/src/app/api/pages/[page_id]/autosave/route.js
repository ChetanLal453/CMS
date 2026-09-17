import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/require-admin.js'
import { tableExists } from '../../../_utils/crud.js'
import { autosaveRevision } from '../../../../../lib/services/page-editor-service.js'
import { PageLayoutValidationError } from '../../../../../../../shared/page/validateCanonicalLayout'
import { createPageEditorApiError } from '../../../../../../../shared/page/apiContract'

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

export async function POST(request, { params }) {
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

  if (body?.layout === undefined) {
    return jsonPageEditorError(400, {
      code: 'LAYOUT_REQUIRED',
      message: 'layout is required',
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

    const result = await autosaveRevision({
      pageId,
      layout: body.layout,
      pageName: body?.name ?? body?.title ?? null,
      extraPageFields: {},
      baseRevisionId: body?.base_revision_id ?? null,
      actor: body?.created_by ?? 'admin',
    })

    return NextResponse.json({
      success: true,
      page: result.page,
      revision: serializeRevisionMeta(result.revision),
      layout: result.layout,
      message: 'Autosave completed successfully',
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

