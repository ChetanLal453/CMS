import pool from '../db.js'
import { getExistingColumns, parseJsonValue, tableExists } from '../../app/api/_utils/crud.js'
import { getPageBySlug } from '../repositories/page-repository.js'
import { getRevisionById, revisionsTableReady } from '../repositories/page-revision-repository.js'
import { buildPageRenderBundle } from '@uadmin/shared/page/buildPageRenderBundle'
import { assertPageRenderBundle } from '@uadmin/shared/page/assertPageRenderBundle'
import {
  normalizeBannerToCanonical,
  normalizeFooterToCanonical,
  normalizeHeaderToCanonical,
} from '@uadmin/shared/page/globalContent'

function buildNavigationTree(items = []) {
  const byParent = new Map()

  for (const item of items) {
    const parentKey = item.parent_id ?? null
    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, [])
    }

    byParent.get(parentKey).push({
      id: item.id,
      label: item.label || '',
      href: item.href || '',
      order_index: Number(item.order_index || 0),
      open_new_tab: Boolean(item.open_new_tab),
      children: [],
    })
  }

  const walk = (parentId = null) =>
    [...(byParent.get(parentId) || [])]
      .sort((left, right) => left.order_index - right.order_index || Number(left.id || 0) - Number(right.id || 0))
      .map((item) => ({
        ...item,
        children: walk(item.id),
      }))

  return walk(null)
}

async function loadRecordByIdentifier(tableName, identifier, requestedColumns) {
  if (!identifier?.id && !identifier?.slug) {
    return null
  }

  if (!(await tableExists(tableName))) {
    return null
  }

  const columns = await getExistingColumns(tableName, requestedColumns)
  if (!columns.length) {
    return null
  }

  const whereField = identifier.id != null ? 'id' : 'slug'
  const whereValue = identifier.id ?? identifier.slug
  const [rows] = await pool.execute(
    `SELECT ${columns.join(', ')} FROM ${tableName} WHERE ${whereField} = ? LIMIT 1`,
    [whereValue],
  )

  return rows[0] || null
}

async function loadFirstFooter() {
  if (!(await tableExists('footers'))) {
    return null
  }

  const columns = await getExistingColumns('footers', [
    'id',
    'slug',
    'name',
    'columns',
    'copyright',
    'social_links',
    'bg_color',
    'settings',
  ])

  if (!columns.length) {
    return null
  }

  const [rows] = await pool.execute(
    `SELECT ${columns.join(', ')} FROM footers ORDER BY id ASC LIMIT 1`,
  )

  return rows[0] || null
}

async function loadHeader(page) {
  const header = await loadRecordByIdentifier(
    'headers',
    { id: page.header_id ?? null, slug: page.header_slug ?? null },
    ['id', 'slug', 'name', 'logo', 'logo_dark', 'cta_label', 'cta_link', 'is_sticky', 'bg_color', 'settings'],
  )

  if (!header) {
    return null
  }

  let navRows = []
  if (await tableExists('navigation_items')) {
    const navColumns = await getExistingColumns('navigation_items', [
      'id',
      'label',
      'href',
      'url',
      'order_index',
      'parent_id',
      'open_new_tab',
      'header_id',
      'is_active',
    ])

    if (navColumns.includes('header_id')) {
      const [headerRows] = await pool.execute(
        `SELECT ${navColumns.join(', ')}
         FROM navigation_items
         WHERE header_id = ? ${navColumns.includes('is_active') ? 'AND is_active = TRUE' : ''}
         ORDER BY ${navColumns.includes('order_index') ? 'order_index ASC,' : ''} id ASC`,
        [header.id],
      )
      navRows = headerRows

      if (!navRows.length) {
        const [globalRows] = await pool.execute(
          `SELECT ${navColumns.join(', ')}
           FROM navigation_items
           WHERE header_id IS NULL ${navColumns.includes('is_active') ? 'AND is_active = TRUE' : ''}
           ORDER BY ${navColumns.includes('order_index') ? 'order_index ASC,' : ''} id ASC`,
        )
        navRows = globalRows
      }
    }
  }

  return {
    ...normalizeHeaderToCanonical({
      ...header,
      settings: parseJsonValue(header.settings, {}),
      navigation_items: buildNavigationTree(navRows),
    }),
  }
}

async function loadFooter(page) {
  const requestedFooter = await loadRecordByIdentifier(
    'footers',
    { id: page.footer_id ?? null, slug: page.footer_slug ?? null },
    ['id', 'slug', 'name', 'columns', 'copyright', 'social_links', 'bg_color', 'settings'],
  )

  if (requestedFooter) {
    return normalizeFooterToCanonical({
      ...requestedFooter,
      columns: parseJsonValue(requestedFooter.columns, []),
      social_links: parseJsonValue(requestedFooter.social_links, []),
      settings: parseJsonValue(requestedFooter.settings, {}),
    })
  }

  const globalFooter = await loadRecordByIdentifier(
    'footers',
    { slug: 'global-footer' },
    ['id', 'slug', 'name', 'columns', 'copyright', 'social_links', 'bg_color', 'settings'],
  )

  const fallbackFooter = globalFooter || (await loadFirstFooter())

  if (!fallbackFooter) {
    return null
  }

  return normalizeFooterToCanonical({
    ...fallbackFooter,
    columns: parseJsonValue(fallbackFooter.columns, []),
    social_links: parseJsonValue(fallbackFooter.social_links, []),
    settings: parseJsonValue(fallbackFooter.settings, {}),
  })
}

async function loadBanner(page) {
  const banner = await loadRecordByIdentifier(
    'banners',
    { id: page.banner_id ?? null, slug: page.banner_slug ?? null },
    ['id', 'slug', 'name', 'content', 'is_active'],
  )

  if (!banner) {
    return null
  }

  if (banner.is_active != null && !Boolean(banner.is_active)) {
    return null
  }

  return normalizeBannerToCanonical({
    ...banner,
    content: parseJsonValue(banner.content, {}),
  })
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

async function resolveDraftRevision(page, explicitRevisionId = null) {
  if (!(await revisionsTableReady())) {
    return null
  }

  if (explicitRevisionId != null) {
    return getRevisionById(explicitRevisionId, pool)
  }

  if (page.current_revision_id != null) {
    return getRevisionById(page.current_revision_id, pool)
  }

  return null
}

async function resolvePublishedRevision(page) {
  if (!(await revisionsTableReady())) {
    return null
  }

  if (page.published_revision_id != null) {
    return getRevisionById(page.published_revision_id, pool)
  }

  if (String(page.status || '').toLowerCase() === 'published' && page.current_revision_id != null) {
    return getRevisionById(page.current_revision_id, pool)
  }

  return null
}

export async function loadPageRenderSource(slug, options = {}) {
  const { mode = 'public', revisionId = null } = options
  const page = await getPageBySlug(slug, pool)

  if (!page) {
    return null
  }

  const [draftRevision, publishedRevision, header, footer, banner] = await Promise.all([
    resolveDraftRevision(page, revisionId),
    resolvePublishedRevision(page),
    loadHeader(page),
    loadFooter(page),
    loadBanner(page),
  ])

  return {
    mode,
    page: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      name: page.name,
      status: page.status,
      seo: {
        title: page.meta_title ?? '',
        description: page.meta_description ?? '',
        keywords: page.meta_keywords ?? null,
        image: page.meta_image ?? '',
        imageId: page.meta_image_id ?? null,
        canonicalUrl: page.canonical_url ?? '',
        robots: page.robots ?? 'index,follow',
      },
      header_slug: page.header_slug ?? null,
      footer_slug: page.footer_slug ?? null,
      banner_slug: page.banner_slug ?? null,
      header_id: page.header_id ?? null,
      footer_id: page.footer_id ?? null,
      banner_id: page.banner_id ?? null,
      published_at: page.published_at ?? null,
      current_revision_id: page.current_revision_id ?? null,
      published_revision_id:
        page.published_revision_id ?? (String(page.status || '').toLowerCase() === 'published' ? page.current_revision_id ?? null : null),
    },
    draft_layout: draftRevision?.layout_json ?? null,
    published_layout: publishedRevision?.layout_json ?? null,
    revision: serializeRevisionMeta(mode === 'preview' ? draftRevision : publishedRevision),
    draft_revision: serializeRevisionMeta(draftRevision),
    published_revision: serializeRevisionMeta(publishedRevision),
    header,
    footer,
    banner,
  }
}

export async function loadPageRenderBundle(slug, options = {}) {
  const source = await loadPageRenderSource(slug, options)
  if (!source) {
    return null
  }

  return assertPageRenderBundle(buildPageRenderBundle(source))
}
