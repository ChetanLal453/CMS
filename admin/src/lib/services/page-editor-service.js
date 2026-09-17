import pool from '../db.js'
import { getExistingColumns } from '../../app/api/_utils/crud.js'
import { normalizeLayoutToCanonical, normalizeLayoutToEditor } from '../page-layout-normalizer.js'
import { clearPublicPageBundleCache } from '../public-page-cache.js'
import { getPageById, updatePageById } from '../repositories/page-repository.js'
import { createRevision, getNextRevisionNumber, revisionsTableReady } from '../repositories/page-revision-repository.js'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'
import { validateCanonicalLayout } from '../../../../shared/page/validateCanonicalLayout'

function buildPageUpdatePayload(extraPageFields = {}) {
  return { ...extraPageFields }
}

async function createPageDraftRevision({
  pageId,
  layout,
  pageName,
  extraPageFields = {},
  baseRevisionId = null,
  actor = null,
  revisionType = 'draft',
}) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const existingPage = await getPageById(pageId, connection)
    if (!existingPage) {
      throw new Error('Page not found')
    }

    const migratedLayout = migrateLayoutInput(layout, {
      pageId,
      slug: existingPage.slug,
    }).value
    const canonicalLayout = normalizeLayoutToCanonical(migratedLayout, {
      id: pageId,
      name: pageName || existingPage.name || existingPage.title,
      title: existingPage.title,
    })
    const validatedCanonicalLayout = validateCanonicalLayout(canonicalLayout, {
      pageId,
      slug: existingPage.slug,
      title: existingPage.title,
      name: pageName || existingPage.name || existingPage.title,
      mode: 'preview',
    })
    const editorLayout = normalizeLayoutToEditor(validatedCanonicalLayout, {
      id: pageId,
      name: pageName || existingPage.name || existingPage.title,
      title: existingPage.title,
    })

    let revision = null
    const canWriteRevisions = await revisionsTableReady()
    const pageColumns = await getExistingColumns('pages')

    if (canWriteRevisions) {
      const currentRevisionId = existingPage.current_revision_id == null ? null : Number(existingPage.current_revision_id)
      const providedBaseRevisionId = baseRevisionId == null ? null : Number(baseRevisionId)

      if (
        providedBaseRevisionId !== null &&
        currentRevisionId !== null &&
        providedBaseRevisionId !== currentRevisionId
      ) {
        const conflictError = new Error('Revision conflict')
        conflictError.code = 'REVISION_CONFLICT'
        throw conflictError
      }

      const nextRevisionNumber = await getNextRevisionNumber(pageId, connection)
      revision = await createRevision(
        {
          pageId,
          revisionNumber: nextRevisionNumber,
          revisionType,
          layoutJson: validatedCanonicalLayout,
          createdBy: actor,
        },
        connection,
      )
    }

    const payload = buildPageUpdatePayload({
      ...extraPageFields,
      ...(pageName != null && pageColumns.includes('name') ? { name: pageName } : {}),
      ...(pageName != null && pageColumns.includes('title') ? { title: pageName } : {}),
      ...(revision && pageColumns.includes('current_revision_id') ? { current_revision_id: revision.id } : {}),
    })

    const updatedPage = await updatePageById(pageId, payload, connection)

    await connection.commit()
    clearPublicPageBundleCache(existingPage.slug)

    return {
      page: updatedPage,
      revision,
      layout: editorLayout,
      canonicalLayout: validatedCanonicalLayout,
      syncResult: {
        synced: false,
        count: Array.isArray(editorLayout.sections) ? editorLayout.sections.length : 0,
        inserted: 0,
        updated: 0,
        deleted: 0,
      },
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function saveDraftRevision(options) {
  return createPageDraftRevision({
    ...options,
    revisionType: 'draft',
  })
}

export async function autosaveRevision(options) {
  return createPageDraftRevision({
    ...options,
    revisionType: 'autosave',
  })
}

export async function restoreRevisionToDraft({
  pageId,
  revision,
  actor = null,
}) {
  if (!revision?.layout_json) {
    throw new Error('Revision layout is required')
  }

  return createPageDraftRevision({
    pageId,
    layout: revision.layout_json,
    pageName: null,
    extraPageFields: {},
    baseRevisionId: null,
    actor,
    revisionType: 'restore',
  })
}
