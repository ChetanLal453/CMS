import { randomUUID } from 'crypto'
import { getPageLayoutRecord } from '../../../../../lib/layout-sync.js'
import { requireAdmin } from '../../../../../lib/require-admin.js'
import { saveDraftRevision } from '../../../../../lib/services/page-editor-service.js'
import { PageLayoutValidationError } from '../../../../../../../shared/page/validateCanonicalLayout'
import { createPageEditorApiError } from '../../../../../../../shared/page/apiContract'

function cloneSection(section) {
  return JSON.parse(JSON.stringify(section))
}

function findSectionIndex(sections, sectionId) {
  return sections.findIndex((section) => String(section.id) === String(sectionId))
}

function buildSection(section, index = null) {
  return {
    id: section.id || randomUUID(),
    name: section.name || section.title || (index != null ? `Section ${index + 1}` : 'Section'),
    type: section.type || 'custom',
    props: section.props ?? section.content ?? {},
    content: section.content ?? section.props ?? {},
    container: section.container || {
      id: `container-${randomUUID()}`,
      rows: [],
    },
    styleProps: section.styleProps ?? {},
    responsiveProps: section.responsiveProps ?? {},
    accessibilityProps: section.accessibilityProps ?? {},
    interactiveProps: section.interactiveProps ?? {},
    stickyEnabled: Boolean(section.stickyEnabled ?? section.sticky_enabled ?? false),
    stickyColumnIndex: section.stickyColumnIndex ?? section.sticky_column_index ?? null,
    stickyPosition: section.stickyPosition ?? section.sticky_position ?? null,
    stickyOffset: section.stickyOffset ?? section.sticky_offset ?? 0,
  }
}

async function persistPageLayout(pageId, layout, pageName = null) {
  const result = await saveDraftRevision({
    pageId,
    layout,
    pageName: pageName ?? layout?.name ?? null,
    extraPageFields: {},
    actor: 'admin',
  })

  return result.layout
}

function jsonPageEditorError(status, {
  code,
  message,
  traceId,
  details,
}) {
  return Response.json(
    createPageEditorApiError({
      code,
      message,
      traceId,
      details,
    }),
    { status },
  )
}

export async function GET(_request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const record = await getPageLayoutRecord({ slug: params.slug })
    if (!record) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const sections = Array.isArray(record.layout.sections) ? record.layout.sections : []
    return Response.json({
      success: true,
      pageId: record.page.id,
      slug: params.slug,
      sections,
      count: sections.length,
      timestamp: new Date().toISOString(),
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

    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Server error',
      details: error instanceof Error ? { reason: error.message } : undefined,
    })
  }
}

export async function PATCH(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const record = await getPageLayoutRecord({ slug: params.slug })
    if (!record) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const { sectionId, stickyEnabled, stickyColumnIndex, stickyPosition, stickyOffset } = await request.json()
    if (!sectionId) {
      return jsonPageEditorError(400, {
        code: 'SECTION_ID_REQUIRED',
        message: 'sectionId is required',
      })
    }

    const sections = [...record.layout.sections]
    const sectionIndex = findSectionIndex(sections, sectionId)
    if (sectionIndex === -1) {
      return jsonPageEditorError(404, {
        code: 'SECTION_NOT_FOUND',
        message: 'Section not found',
      })
    }

    const current = cloneSection(sections[sectionIndex])
    sections[sectionIndex] = {
      ...current,
      stickyEnabled: stickyEnabled ?? current.stickyEnabled ?? false,
      stickyColumnIndex: stickyColumnIndex ?? current.stickyColumnIndex ?? null,
      stickyPosition: stickyPosition ?? current.stickyPosition ?? null,
      stickyOffset: stickyOffset ?? current.stickyOffset ?? 0,
    }

    const layout = { ...record.layout, sections }
    const savedLayout = await persistPageLayout(record.page.id, layout, layout.name)

    return Response.json({
      success: true,
      message: 'Sticky settings updated successfully',
      section: savedLayout.sections?.[sectionIndex] ?? sections[sectionIndex],
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

    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Server error',
      details: error instanceof Error ? { reason: error.message } : undefined,
    })
  }
}

export async function POST(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const record = await getPageLayoutRecord({ slug: params.slug })
    if (!record) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const body = await request.json()
    const action = body.action || 'toggleSticky'

    if (action === 'create') {
      const sections = [...record.layout.sections]
      const insertIndex = Number.isInteger(body.index) ? body.index : sections.length
      const nextSection = buildSection(body.section || {}, insertIndex)
      sections.splice(Math.max(0, Math.min(insertIndex, sections.length)), 0, nextSection)

      const layout = { ...record.layout, sections }
      const savedLayout = await persistPageLayout(record.page.id, layout, layout.name)

      return Response.json({
        success: true,
        section: savedLayout.sections?.[insertIndex] ?? nextSection,
        sections: savedLayout.sections ?? sections,
        count: savedLayout.sections?.length ?? sections.length,
      })
    }

    if (action === 'move') {
      const { sectionId, targetPageId, targetPageSlug, newSortOrder } = body
      if (!sectionId || (!targetPageId && !targetPageSlug)) {
        return jsonPageEditorError(400, {
          code: !sectionId ? 'SECTION_ID_REQUIRED' : 'TARGET_PAGE_REQUIRED',
          message: 'sectionId and target page are required',
        })
      }

      const sourceSections = [...record.layout.sections]
      const sourceIndex = findSectionIndex(sourceSections, sectionId)
      if (sourceIndex === -1) {
        return jsonPageEditorError(404, {
          code: 'SECTION_NOT_FOUND',
          message: 'Section not found',
        })
      }

      const [section] = sourceSections.splice(sourceIndex, 1)
      const targetRecord =
        targetPageId && Number(targetPageId) === Number(record.page.id)
          ? record
          : await getPageLayoutRecord(targetPageId ? { pageId: targetPageId } : { slug: targetPageSlug })

      if (!targetRecord) {
        return jsonPageEditorError(404, {
          code: 'TARGET_PAGE_NOT_FOUND',
          message: 'Target page not found',
        })
      }

      const targetSections =
        Number(targetRecord.page.id) === Number(record.page.id) ? sourceSections : [...targetRecord.layout.sections]
      const insertIndex = Number.isInteger(newSortOrder) ? newSortOrder : targetSections.length
      targetSections.splice(Math.max(0, Math.min(insertIndex, targetSections.length)), 0, section)

      await persistPageLayout(record.page.id, { ...record.layout, sections: sourceSections }, record.layout.name)

      if (Number(targetRecord.page.id) !== Number(record.page.id)) {
        await persistPageLayout(
          targetRecord.page.id,
          { ...targetRecord.layout, sections: targetSections },
          targetRecord.layout.name,
        )
      }

      return Response.json({ success: true, message: 'Section moved successfully', sectionId, newPageId: targetRecord.page.id, newSortOrder: insertIndex })
    }

    const { sectionId, columnIndex = 0 } = body
    if (!sectionId) {
      return jsonPageEditorError(400, {
        code: 'SECTION_ID_REQUIRED',
        message: 'sectionId is required',
      })
    }

    const sections = [...record.layout.sections]
    const sectionIndex = findSectionIndex(sections, sectionId)
    if (sectionIndex === -1) {
      return jsonPageEditorError(404, {
        code: 'SECTION_NOT_FOUND',
        message: 'Section not found',
      })
    }

    const current = cloneSection(sections[sectionIndex])
    const stickyEnabled = !(current.stickyEnabled && current.stickyColumnIndex === columnIndex)

    sections[sectionIndex] = {
      ...current,
      stickyEnabled,
      stickyColumnIndex: stickyEnabled ? columnIndex : 0,
    }

    const layout = { ...record.layout, sections }
    const savedLayout = await persistPageLayout(record.page.id, layout, layout.name)
    const savedSections = Array.isArray(savedLayout.sections) ? savedLayout.sections : sections
    const savedSection = savedSections.find((section) => String(section.id) === String(sectionId)) || sections[sectionIndex]

    return Response.json({
      success: true,
      data: {
        sectionId,
        stickyEnabled: savedSection.stickyEnabled,
        stickyColumnIndex: savedSection.stickyColumnIndex,
      },
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

    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Server error',
      details: error instanceof Error ? { reason: error.message } : undefined,
    })
  }
}

export async function PUT(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const record = await getPageLayoutRecord({ slug: params.slug })
    if (!record) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const body = await request.json()
    const sections = [...record.layout.sections]

    if (Array.isArray(body.sections)) {
      const nextSections = body.sections.map((section, index) => buildSection(section, index))
      const layout = { ...record.layout, sections: nextSections }
      const savedLayout = await persistPageLayout(record.page.id, layout, layout.name)

      return Response.json({
        success: true,
        message: 'Sections updated successfully',
        count: savedLayout.sections?.length ?? nextSections.length,
        sections: savedLayout.sections ?? nextSections,
      })
    }

    const { sectionId, updates } = body
    if (!sectionId || !updates) {
      return jsonPageEditorError(400, {
        code: !sectionId ? 'SECTION_ID_REQUIRED' : 'SECTION_UPDATES_REQUIRED',
        message: 'sectionId and updates are required',
      })
    }

    const sectionIndex = findSectionIndex(sections, sectionId)
    if (sectionIndex === -1) {
      return jsonPageEditorError(404, {
        code: 'SECTION_NOT_FOUND',
        message: 'Section not found',
      })
    }

    sections[sectionIndex] = {
      ...cloneSection(sections[sectionIndex]),
      ...updates,
    }

    if (updates.section_order !== undefined || updates.sort_order !== undefined) {
      const targetIndex = updates.section_order ?? updates.sort_order
      const [moved] = sections.splice(sectionIndex, 1)
      sections.splice(Math.max(0, Math.min(targetIndex, sections.length)), 0, moved)
    }

    const layout = { ...record.layout, sections }
    const savedLayout = await persistPageLayout(record.page.id, layout, layout.name)

    return Response.json({
      success: true,
      message: 'Section updated successfully',
      section:
        savedLayout.sections?.find((section) => String(section.id) === String(sectionId)) ||
        sections.find((section) => String(section.id) === String(sectionId)) ||
        null,
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

    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Server error',
      details: error instanceof Error ? { reason: error.message } : undefined,
    })
  }
}

export async function DELETE(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    const record = await getPageLayoutRecord({ slug: params.slug })
    if (!record) {
      return jsonPageEditorError(404, {
        code: 'PAGE_NOT_FOUND',
        message: 'Page not found',
      })
    }

    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('sectionId')

    if (!sectionId) {
      return jsonPageEditorError(400, {
        code: 'SECTION_ID_REQUIRED',
        message: 'Section ID is required',
      })
    }

    const sections = record.layout.sections.filter((section) => String(section.id) !== String(sectionId))
    if (sections.length === record.layout.sections.length) {
      return jsonPageEditorError(404, {
        code: 'SECTION_NOT_FOUND',
        message: 'Section not found',
      })
    }

    const layout = { ...record.layout, sections }
    await persistPageLayout(record.page.id, layout, layout.name)

    return Response.json({ success: true, message: 'Section deleted successfully' })
  } catch (error) {
    console.error('DB ERROR:', error)
    return jsonPageEditorError(500, {
      code: 'DATABASE_ERROR',
      message: 'Server error',
      details: error instanceof Error ? { reason: error.message } : undefined,
    })
  }
}
