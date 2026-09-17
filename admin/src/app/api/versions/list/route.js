import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { parsePaginationParams } from '../../_utils/crud.js'
import { normalizeLayoutToEditor } from '../../../../lib/page-layout-normalizer.js'
import {
  countRevisionsForPage,
  listRevisionsForPage,
  revisionsTableReady,
} from '../../../../lib/repositories/page-revision-repository.js'
import { createPageEditorApiError } from '../../../../../../shared/page/apiContract'

function normalizeRevisionVersionRow(row) {
  const revisionNumber = Number(row.revision_number || 1)
  const revisionType = row.revision_type || 'draft'
  const revisionLabel = revisionType.charAt(0).toUpperCase() + revisionType.slice(1)

  return {
    id: String(row.id),
    page_id: String(row.page_id),
    version_name: `${revisionLabel} ${revisionNumber}`,
    name: `${revisionLabel} ${revisionNumber}`,
    version_number: revisionNumber,
    revision_type: revisionType,
    layout: normalizeLayoutToEditor(row.layout_json, { id: row.page_id }),
    description: '',
    created_by: row.created_by || null,
    created_at: row.created_at || null,
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

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('page_id')

  if (!pageId) {
    return jsonPageEditorError(400, {
      code: 'PAGE_ID_REQUIRED',
      message: 'page_id is required',
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

    const { limit, offset } = parsePaginationParams(request, { defaultLimit: 50, maxLimit: 200 })
    const revisions = await listRevisionsForPage(parsedPageId, undefined, {
      limit: limit ?? 50,
      offset,
    })
    const total = await countRevisionsForPage(parsedPageId)
    const versions = revisions.map(normalizeRevisionVersionRow)

    return NextResponse.json({
      success: true,
      data: versions,
      versions,
      total,
      limit: limit ?? versions.length,
      offset,
    })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
