import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/require-admin.js'
import { tableExists } from '../../../_utils/crud.js'
import { publishCurrentDraft } from '../../../../../lib/services/page-publish-service.js'
import { revisionsTableReady } from '../../../../../lib/repositories/page-revision-repository.js'
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

export async function POST(_request, { params }) {
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

  try {
    if (!(await tableExists('pages'))) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'pages' is unavailable.",
        details: { table: 'pages' },
      })
    }

    if (!(await revisionsTableReady())) {
      return jsonPageEditorError(503, {
        code: 'TABLE_UNAVAILABLE',
        message: "Database table 'page_revisions' is unavailable.",
        details: { table: 'page_revisions' },
      })
    }

    const result = await publishCurrentDraft({ pageId, actor: 'admin' })

    return NextResponse.json({
      success: true,
      data: {
        id: result.page?.id ?? pageId,
        slug: result.page?.slug ?? null,
        published_at: result.page?.published_at ?? null,
        updated_at: result.page?.updated_at ?? null,
        layout: result.layout,
      },
      page: {
        id: result.page?.id ?? pageId,
        slug: result.page?.slug ?? null,
        published_at: result.page?.published_at ?? null,
        published_revision_id: result.revision?.id ?? result.page?.published_revision_id ?? null,
      },
      revision: serializeRevisionMeta(result.revision),
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

    if (error?.code === 'EMPTY_LAYOUT') {
      return jsonPageEditorError(400, {
        code: 'EMPTY_LAYOUT',
        message: error.message,
      })
    }

    if (error?.code === 'MISSING_CURRENT_REVISION') {
      return jsonPageEditorError(409, {
        code: 'MISSING_CURRENT_REVISION',
        message: error.message,
      })
    }

    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Database error',
    })
  }
}
