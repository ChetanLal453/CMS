import { randomUUID } from 'crypto'
import { getPageLayoutRecord } from '../../../../lib/layout-sync.js'
import { requireAdmin } from '../../../../lib/require-admin.js'
import { saveDraftRevision } from '../../../../lib/services/page-editor-service.js'
import { PageLayoutValidationError } from '@uadmin/shared/page/validateCanonicalLayout'

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const { sectionId, pageId, slug, targetPageId, targetPageSlug, newName } = await request.json()

    if (!sectionId) {
      return Response.json({ success: false, error: 'sectionId is required' }, { status: 400 })
    }

    const sourceRecord = await getPageLayoutRecord(pageId ? { pageId } : { slug })
    if (!sourceRecord) {
      return Response.json({ success: false, error: 'Source page not found' }, { status: 404 })
    }

    const sourceSections = [...sourceRecord.layout.sections]
    const sourceIndex = sourceSections.findIndex((section) => String(section.id) === String(sectionId))
    if (sourceIndex === -1) {
      return Response.json({ success: false, error: 'Section not found' }, { status: 404 })
    }

    const targetRecord =
      targetPageId || targetPageSlug
        ? await getPageLayoutRecord(targetPageId ? { pageId: targetPageId } : { slug: targetPageSlug })
        : sourceRecord

    if (!targetRecord) {
      return Response.json({ success: false, error: 'Target page not found' }, { status: 404 })
    }

    const original = JSON.parse(JSON.stringify(sourceSections[sourceIndex]))
    const duplicate = {
      ...original,
      id: randomUUID(),
      name: newName || `${original.name || 'Section'} (Copy)`,
    }

    const targetSections = [...targetRecord.layout.sections, duplicate]
    const nextLayout = { ...targetRecord.layout, sections: targetSections }

    await saveDraftRevision({
      pageId: targetRecord.page.id,
      layout: nextLayout,
      pageName: nextLayout.name ?? null,
      extraPageFields: {},
      actor: 'admin',
    })

    return Response.json({
      success: true,
      message: 'Section duplicated successfully',
      section: duplicate,
      sectionId: duplicate.id,
      pageId: targetRecord.page.id,
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

    console.error('Error duplicating section:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
