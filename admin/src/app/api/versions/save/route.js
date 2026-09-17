import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { saveDraftRevision } from '../../../../lib/services/page-editor-service.js'
import { revisionsTableReady } from '../../../../lib/repositories/page-revision-repository.js'
import { PageLayoutValidationError } from '../../../../../../shared/page/validateCanonicalLayout'
import { createPageEditorApiError } from '../../../../../../shared/page/apiContract'

function normalizeRevisionVersionRow(result) {
  const revision = result?.revision
  const revisionNumber = Number(revision?.revision_number || 1)
  const revisionType = revision?.revision_type || 'draft'
  const label = revisionType.charAt(0).toUpperCase() + revisionType.slice(1)

  return {
    id: String(revision?.id || ''),
    page_id: String(result?.page?.id || ''),
    version_name: `${label} ${revisionNumber}`,
    name: `${label} ${revisionNumber}`,
    version_number: revisionNumber,
    revision_type: revisionType,
    layout: result?.layout ?? { sections: [] },
    description: '',
    created_by: revision?.created_by || null,
    created_at: revision?.created_at || null,
  }
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

export async function POST(request) {
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

  const pageId = body?.page_id
  if (!pageId) {
    return jsonPageEditorError(400, {
      code: 'PAGE_ID_REQUIRED',
      message: 'page_id is required',
    })
  }

  const layout = body?.layout ?? body?.content
  if (layout === undefined) {
    return jsonPageEditorError(400, {
      code: 'LAYOUT_REQUIRED',
      message: 'layout is required',
    })
  }

  try {
    const parsedPageId = Number.parseInt(pageId, 10)
    if (Number.isNaN(parsedPageId)) {
      return jsonPageEditorError(400, {
        code: 'INVALID_PAGE_ID',
        message: 'Invalid page_id',
      })
    }

    if (!(await revisionsTableReady())) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'page_revisions' is unavailable.",
        details: { table: 'page_revisions' },
      })
    }

    const result = await saveDraftRevision({
      pageId: parsedPageId,
      layout,
      pageName: null,
      extraPageFields: {},
      baseRevisionId: body?.base_revision_id ?? null,
      actor: body?.created_by ?? 'system',
    })

    const version = normalizeRevisionVersionRow(result)
    return NextResponse.json(
      { success: true, data: version, version, message: 'Revision saved successfully' },
      { status: 201 },
    )
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
