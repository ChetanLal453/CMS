import pool from '../db.js'
import { getExistingColumns, parseJsonRow, parseJsonRows, tableExists } from '../../app/api/_utils/crud.js'
import { normalizeLayoutToCanonical } from '../page-layout-normalizer.js'

function normalizeTemplateRow(row) {
  if (!row) {
    return null
  }

  const layout = row.layout_json || row.layout || row.content || {}
  const tags = Array.isArray(row.tags) ? row.tags : []

  return {
    ...row,
    layout,
    layout_json: layout,
    content: row.content || row.layout || row.layout_json || layout,
    tags,
  }
}

export async function getActiveTemplateTable() {
  if (await tableExists('page_templates')) {
    return 'page_templates'
  }

  // Legacy fallback only. Keep this until custom_templates is formally retired.
  if (await tableExists('custom_templates')) {
    return 'custom_templates'
  }

  return null
}

function buildTemplateSelectFields(tableName, columns) {
  if (tableName === 'page_templates') {
    return [
      'id',
      columns.includes('slug') ? 'slug' : 'NULL AS slug',
      'name',
      columns.includes('description') ? 'description' : 'NULL AS description',
      columns.includes('category') ? 'category' : 'NULL AS category',
      columns.includes('thumbnail_media_id') ? 'thumbnail_media_id' : 'NULL AS thumbnail_media_id',
      columns.includes('thumbnail') ? 'thumbnail' : 'NULL AS thumbnail',
      columns.includes('layout_json') ? 'layout_json' : 'NULL AS layout_json',
      columns.includes('header_id') ? 'header_id' : 'NULL AS header_id',
      columns.includes('footer_id') ? 'footer_id' : 'NULL AS footer_id',
      columns.includes('banner_id') ? 'banner_id' : 'NULL AS banner_id',
      columns.includes('tags') ? 'tags' : 'NULL AS tags',
      columns.includes('created_at') ? 'created_at' : 'NULL AS created_at',
      columns.includes('updated_at') ? 'updated_at' : 'NULL AS updated_at',
    ]
  }

  return [
    'id',
    columns.includes('slug') ? 'slug' : 'NULL AS slug',
    'name',
    columns.includes('description') ? 'description' : 'NULL AS description',
    columns.includes('category') ? 'category' : 'NULL AS category',
    columns.includes('thumbnail') ? 'thumbnail' : 'NULL AS thumbnail',
    columns.includes('layout') ? 'layout' : 'NULL AS layout',
    columns.includes('content') ? 'content' : 'NULL AS content',
    columns.includes('tags') ? 'tags' : 'NULL AS tags',
    columns.includes('created_at') ? 'created_at' : 'NULL AS created_at',
    columns.includes('updated_at') ? 'updated_at' : 'NULL AS updated_at',
  ]
}

export async function listTemplates(connection = pool) {
  const tableName = await getActiveTemplateTable()
  if (!tableName) {
    return { tableName: null, items: [] }
  }

  const columns = await getExistingColumns(tableName)
  const selectFields = buildTemplateSelectFields(tableName, columns)
  const jsonFields = tableName === 'page_templates' ? ['layout_json', 'tags'] : ['layout', 'content', 'tags']
  const [rows] = await connection.query(
    `SELECT ${selectFields.join(', ')} FROM ${tableName} ORDER BY ${columns.includes('updated_at') ? 'updated_at DESC,' : ''} id DESC`,
  )

  return {
    tableName,
    items: parseJsonRows(rows, jsonFields).map(normalizeTemplateRow),
  }
}

export async function getTemplateById(id, connection = pool) {
  const tableName = await getActiveTemplateTable()
  if (!tableName) {
    return { tableName: null, item: null }
  }

  const columns = await getExistingColumns(tableName)
  const selectFields = buildTemplateSelectFields(tableName, columns)
  const jsonFields = tableName === 'page_templates' ? ['layout_json', 'tags'] : ['layout', 'content', 'tags']
  const [rows] = await connection.query(
    `SELECT ${selectFields.join(', ')} FROM ${tableName} WHERE id = ? LIMIT 1`,
    [id],
  )

  return {
    tableName,
    item: normalizeTemplateRow(parseJsonRow(rows[0], jsonFields)),
  }
}

export async function createTemplateRecord(templateData, connection = pool) {
  const tableName = await getActiveTemplateTable()
  if (!tableName) {
    return { tableName: null, item: null }
  }

  const columns = await getExistingColumns(tableName)
  const canonicalLayout = normalizeLayoutToCanonical(templateData.layout ?? templateData.layout_json ?? templateData.content ?? {}, {})

  const payload =
    tableName === 'page_templates'
      ? {
          slug: templateData.slug,
          name: templateData.name,
          description: templateData.description ?? '',
          category: templateData.category ?? 'general',
          thumbnail: templateData.thumbnail ?? '',
          layout_json: JSON.stringify(canonicalLayout),
          header_id: templateData.header_id ?? null,
          footer_id: templateData.footer_id ?? null,
          banner_id: templateData.banner_id ?? null,
          tags: JSON.stringify(templateData.tags ?? []),
        }
      : {
          id: templateData.id,
          slug: templateData.slug,
          name: templateData.name,
          description: templateData.description ?? '',
          category: templateData.category ?? 'general',
          thumbnail: templateData.thumbnail ?? '',
          layout: JSON.stringify(canonicalLayout),
          content: JSON.stringify(canonicalLayout),
          tags: JSON.stringify(templateData.tags ?? []),
        }

  const insertFields = Object.keys(payload).filter((field) => columns.includes(field) && payload[field] !== undefined)
  await connection.query(
    `INSERT INTO ${tableName} (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
    insertFields.map((field) => payload[field]),
  )

  if (tableName === 'page_templates') {
    const [rows] = await connection.query('SELECT LAST_INSERT_ID() AS id')
    return getTemplateById(rows[0]?.id, connection)
  }

  return getTemplateById(templateData.id, connection)
}

export async function updateTemplateRecord(id, templateData, connection = pool) {
  const tableName = await getActiveTemplateTable()
  if (!tableName) {
    return { tableName: null, item: null }
  }

  const columns = await getExistingColumns(tableName)
  const canonicalLayout = normalizeLayoutToCanonical(templateData.layout ?? templateData.layout_json ?? templateData.content ?? {}, {})

  const payload =
    tableName === 'page_templates'
      ? {
          slug: templateData.slug,
          name: templateData.name,
          description: templateData.description ?? '',
          category: templateData.category ?? 'general',
          thumbnail: templateData.thumbnail ?? '',
          layout_json: JSON.stringify(canonicalLayout),
          header_id: templateData.header_id ?? null,
          footer_id: templateData.footer_id ?? null,
          banner_id: templateData.banner_id ?? null,
          tags: JSON.stringify(templateData.tags ?? []),
        }
      : {
          slug: templateData.slug,
          name: templateData.name,
          description: templateData.description ?? '',
          category: templateData.category ?? 'general',
          thumbnail: templateData.thumbnail ?? '',
          layout: JSON.stringify(canonicalLayout),
          content: JSON.stringify(canonicalLayout),
          tags: JSON.stringify(templateData.tags ?? []),
        }

  const updateFields = Object.keys(payload).filter((field) => columns.includes(field) && payload[field] !== undefined)
  const assignments = [...updateFields.map((field) => `${field} = ?`)]
  if (columns.includes('updated_at')) {
    assignments.push('updated_at = NOW()')
  }
  await connection.query(
    `UPDATE ${tableName}
     SET ${assignments.join(', ')}
     WHERE id = ?`,
    [...updateFields.map((field) => payload[field]), id],
  )

  return getTemplateById(id, connection)
}

export async function deleteTemplateRecord(id, connection = pool) {
  const tableName = await getActiveTemplateTable()
  if (!tableName) {
    return { tableName: null, deleted: false }
  }

  const [result] = await connection.query(`DELETE FROM ${tableName} WHERE id = ?`, [id])
  return {
    tableName,
    deleted: Boolean(result?.affectedRows),
  }
}
