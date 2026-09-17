import { getPageLayoutRecord } from '../../../../lib/layout-sync.js'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { saveDraftRevision } from '../../../../lib/services/page-editor-service.js'
import { PageLayoutValidationError } from '../../../../../../shared/page/validateCanonicalLayout'

export async function PUT(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const { pageId, slug, sections } = await request.json()

    if (!Array.isArray(sections) || sections.length === 0) {
      return Response.json({ success: false, error: 'Sections array is required' }, { status: 400 })
    }

    const record = await getPageLayoutRecord(pageId ? { pageId } : { slug })
    if (!record) {
      return Response.json({ success: false, error: 'Page not found' }, { status: 404 })
    }

    const layout = {
      ...record.layout,
      sections,
    }

    await saveDraftRevision({
      pageId: record.page.id,
      layout,
      pageName: layout.name ?? null,
      extraPageFields: {},
      actor: 'admin',
    })

    return Response.json({
      success: true,
      message: 'Sections updated successfully',
      count: sections.length,
    })
  } catch (error) {
    if (error instanceof PageLayoutValidationError) {
      return Response.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          traceId: error.traceId,
          issues: error.issues,
        },
        { status: 400 },
      )
    }

    console.error('Error bulk updating sections:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
