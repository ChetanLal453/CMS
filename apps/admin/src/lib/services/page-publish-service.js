import pool from '../db.js'
import { getExistingColumns } from '../../app/api/_utils/crud.js'
import { normalizeLayoutToCanonical, normalizeLayoutToEditor } from '../page-layout-normalizer.js'
import { clearPublicPageBundleCache } from '../public-page-cache.js'
import { getPageById, updatePageById } from '../repositories/page-repository.js'
import {
  createRevision,
  getNextRevisionNumber,
  getRevisionById,
  revisionsTableReady,
} from '../repositories/page-revision-repository.js'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'
import { validateCanonicalLayout } from '@uadmin/shared/page/validateCanonicalLayout'

export async function publishCurrentDraft({ pageId, actor = null }) {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const existingPage = await getPageById(pageId, connection)
    if (!existingPage) {
      throw new Error('Page not found')
    }

    if (!(await revisionsTableReady())) {
      const missingRevisionError = new Error('page_revisions table not found')
      missingRevisionError.code = 'MISSING_REVISIONS_TABLE'
      throw missingRevisionError
    }

    if (existingPage.current_revision_id == null) {
      const missingDraftError = new Error('Current draft revision not found')
      missingDraftError.code = 'MISSING_CURRENT_REVISION'
      throw missingDraftError
    }

    const currentRevision = await getRevisionById(existingPage.current_revision_id, connection)
    if (!currentRevision?.layout_json) {
      const missingDraftError = new Error('Current draft revision not found')
      missingDraftError.code = 'MISSING_CURRENT_REVISION'
      throw missingDraftError
    }

    const migratedLayout = migrateLayoutInput(currentRevision.layout_json, {
      pageId,
      slug: existingPage.slug,
    }).value
    const canonicalLayout = normalizeLayoutToCanonical(migratedLayout, existingPage)
    const validatedCanonicalLayout = validateCanonicalLayout(canonicalLayout, {
      pageId,
      slug: existingPage.slug,
      title: existingPage.title,
      name: existingPage.name || existingPage.title,
      mode: 'public',
    })
    const editorLayout = normalizeLayoutToEditor(validatedCanonicalLayout, existingPage)

    if (!Array.isArray(validatedCanonicalLayout.sections) || validatedCanonicalLayout.sections.length === 0) {
      const emptyError = new Error('Cannot publish an empty layout')
      emptyError.code = 'EMPTY_LAYOUT'
      throw emptyError
    }

    const pageColumns = await getExistingColumns('pages')
    const nextRevisionNumber = await getNextRevisionNumber(pageId, connection)
    const revision = await createRevision(
      {
        pageId,
        revisionNumber: nextRevisionNumber,
        revisionType: 'published',
        layoutJson: validatedCanonicalLayout,
        createdBy: actor,
      },
      connection,
    )

    const payload = {
      status: 'published',
      published_at: new Date(),
      ...(pageColumns.includes('published_revision_id') ? { published_revision_id: revision.id } : {}),
    }

    const updatedPage = await updatePageById(pageId, payload, connection)

    await connection.commit()
    clearPublicPageBundleCache(existingPage.slug)

    return {
      page: updatedPage,
      revision,
      layout: editorLayout,
      canonicalLayout: validatedCanonicalLayout,
    }
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
