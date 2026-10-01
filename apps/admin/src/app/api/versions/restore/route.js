import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { getRevisionById, revisionsTableReady } from '../../../../lib/repositories/page-revision-repository.js'
import { restoreRevisionToDraft } from '../../../../lib/services/page-editor-service.js'
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

  const versionId = body?.version_id
  if (!versionId) {
    return jsonPageEditorError(400, {
      code: 'VERSION_ID_REQUIRED',
      message: 'version_id is required',
    })
  }

  try {
    if (!(await revisionsTableReady())) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'page_revisions' is unavailable.",
        details: { table: 'page_revisions' },
      })
    }

    const revision = await getRevisionById(versionId)
    if (!revision) {
      return jsonPageEditorError(404, {
        code: 'VERSION_NOT_FOUND',
        message: 'Version not found',
      })
    }

    const restored = await restoreRevisionToDraft({
      pageId: revision.page_id,
      revision,
      actor: body?.created_by ?? 'system',
    })

    return NextResponse.json({
      success: true,
      data: {
        page_id: revision.page_id,
        version_id: revision.id,
        restored_revision_id: restored.revision?.id ?? null,
        version_name: `Restore ${restored.revision?.revision_number ?? ''}`.trim(),
        version_number: restored.revision?.revision_number ?? null,
        layout: restored.layout,
      },
      version: {
        id: String(restored.revision?.id ?? ''),
        page_id: String(revision.page_id),
        version_number: Number(restored.revision?.revision_number || 1),
        name: `Restore ${restored.revision?.revision_number ?? ''}`.trim(),
        description: '',
        layout: restored.layout,
        created_by: restored.revision?.created_by || null,
        created_at: restored.revision?.created_at || null,
      },
      layout: restored.layout,
      message: 'Revision restored successfully',
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
