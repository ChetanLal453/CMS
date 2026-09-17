import pool from './db.js'
import { normalizeLayout } from './page-layout-normalizer.js'
import { getPageById, getPageBySlug } from './repositories/page-repository.js'
import { getRevisionById, revisionsTableReady } from './repositories/page-revision-repository.js'
import { saveDraftRevision } from './services/page-editor-service.js'

export { normalizeLayout }

export async function getPageRecord({ pageId, slug }, connection = pool) {
  if (!pageId && !slug) {
    return null
  }

  return pageId ? getPageById(pageId, connection) : getPageBySlug(slug, connection)
}

export async function getPageLayoutRecord(identifier, connection = pool) {
  const page = await getPageRecord(identifier, connection)
  if (!page) {
    return null
  }

  let draftRevision = null
  let publishedRevision = null

  if (await revisionsTableReady()) {
    if (page.current_revision_id != null) {
      draftRevision = await getRevisionById(page.current_revision_id, connection)
    }

    if (page.published_revision_id != null) {
      publishedRevision = await getRevisionById(page.published_revision_id, connection)
    }
  }

  return {
    page,
    layout: normalizeLayout(draftRevision?.layout_json ?? null, page),
    publishedLayout: publishedRevision?.layout_json ? normalizeLayout(publishedRevision.layout_json, page) : null,
    draftRevision,
    publishedRevision,
  }
}

export async function syncSectionsSnapshot() {
  return { synced: false, count: 0, inserted: 0, updated: 0, deleted: 0 }
}

export async function saveLayoutForPage({
  pageId,
  layout,
  pageName,
  extraPageFields = {},
}) {
  const result = await saveDraftRevision({
    pageId,
    layout,
    pageName,
    extraPageFields,
    actor: 'system',
  })

  return {
    synced: false,
    count: Array.isArray(result.layout?.sections) ? result.layout.sections.length : 0,
    inserted: 0,
    updated: 0,
    deleted: 0,
    layout: result.layout,
    revision: result.revision,
    page: result.page,
  }
}
