import pool from '../db.js'
import { getExistingColumns } from '../../app/api/_utils/crud.js'

function mapAvailableFields(fields, existingColumns) {
  return fields
    .map((field) =>
      existingColumns.includes(field.column)
        ? field.select
        : field.fallback ?? `NULL AS ${field.alias || field.column}`,
    )
}

export async function getPageSelectClause() {
  const columns = await getExistingColumns('pages')
  const fields = [
    { column: 'id', select: 'id' },
    { column: 'slug', select: 'slug' },
    { column: 'title', select: 'title' },
    { column: 'name', select: 'name' },
    { column: 'status', select: 'status', fallback: 'NULL AS status' },
    { column: 'disabled', select: 'disabled', fallback: '0 AS disabled' },
    { column: 'header_slug', select: 'header_slug', fallback: 'NULL AS header_slug' },
    { column: 'footer_slug', select: 'footer_slug', fallback: 'NULL AS footer_slug' },
    { column: 'banner_slug', select: 'banner_slug', fallback: 'NULL AS banner_slug' },
    { column: 'header_id', select: 'header_id', fallback: 'NULL AS header_id' },
    { column: 'footer_id', select: 'footer_id', fallback: 'NULL AS footer_id' },
    { column: 'banner_id', select: 'banner_id', fallback: 'NULL AS banner_id' },
    { column: 'meta_title', select: 'meta_title', fallback: 'NULL AS meta_title' },
    { column: 'meta_description', select: 'meta_description', fallback: 'NULL AS meta_description' },
    { column: 'meta_image', select: 'meta_image', fallback: 'NULL AS meta_image' },
    { column: 'meta_image_id', select: 'meta_image_id', fallback: 'NULL AS meta_image_id' },
    { column: 'published_at', select: 'published_at', fallback: 'NULL AS published_at' },
    { column: 'updated_at', select: 'updated_at', fallback: 'NULL AS updated_at' },
    { column: 'current_revision_id', select: 'current_revision_id', fallback: 'NULL AS current_revision_id' },
    { column: 'published_revision_id', select: 'published_revision_id', fallback: 'NULL AS published_revision_id' },
  ]

  return mapAvailableFields(fields, columns).join(',\n        ')
}

export async function getPageById(pageId, connection = pool) {
  const selectClause = await getPageSelectClause()
  const [rows] = await connection.query(
    `SELECT
        ${selectClause}
      FROM pages
      WHERE id = ?
      LIMIT 1`,
    [pageId],
  )

  return rows[0] || null
}

export async function getPageBySlug(slug, connection = pool) {
  const selectClause = await getPageSelectClause()
  const normalizedSlug = String(slug || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const [rows] = await connection.query(
    `SELECT
        ${selectClause}
      FROM pages
      WHERE LOWER(TRIM(BOTH '/' FROM slug)) = ?
         OR LOWER(TRIM(COALESCE(title, ''))) = ?
         OR LOWER(TRIM(COALESCE(name, ''))) = ?
      ORDER BY
        CASE
          WHEN LOWER(TRIM(BOTH '/' FROM slug)) = ? THEN 0
          WHEN LOWER(TRIM(COALESCE(title, ''))) = ? THEN 1
          WHEN LOWER(TRIM(COALESCE(name, ''))) = ? THEN 2
          ELSE 3
        END,
        id ASC
      LIMIT 1`,
    [normalizedSlug, normalizedSlug, normalizedSlug, normalizedSlug, normalizedSlug, normalizedSlug],
  )

  return rows[0] || null
}

export async function updatePageById(pageId, payload, connection = pool) {
  const fields = Object.keys(payload)
  if (!fields.length) {
    return null
  }

  const existingColumns = await getExistingColumns('pages', fields)
  const writableFields = existingColumns.filter((field) => payload[field] !== undefined)
  if (!writableFields.length) {
    return null
  }

  const values = writableFields.map((field) => payload[field])
  values.push(pageId)

  await connection.query(
    `UPDATE pages
     SET ${writableFields.map((field) => `${field} = ?`).join(', ')}, updated_at = NOW()
     WHERE id = ?`,
    values,
  )

  return getPageById(pageId, connection)
}
