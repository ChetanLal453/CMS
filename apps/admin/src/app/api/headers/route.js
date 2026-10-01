import pool from '../../../lib/db.js'
import { requireAdmin } from '../../../lib/require-admin.js'
import {
  getExistingColumns,
  missingTableResponse,
  parsePaginationParams,
  parseJsonRow,
  parseJsonRows,
  tableExists,
} from '../_utils/crud.js'
import { clearPublicPageBundleCache } from '../../../lib/public-page-cache.js'

const TABLE_NAME = 'headers'
const SELECT_COLUMNS = [
  'id',
  'slug',
  'name',
  'logo',
  'logo_dark',
  'cta_label',
  'cta_link',
  'is_sticky',
  'bg_color',
  'settings',
  'created_at',
  'updated_at',
]

function mapHeaderStyle(header) {
  const styleFromSettings = header?.settings?.style
  if (styleFromSettings) {
    return styleFromSettings
  }

  return header?.is_sticky === false ? 'static' : 'sticky'
}

function normalizeHeaderRow(header) {
  if (!header) {
    return null
  }

  return {
    ...header,
    logo_url: header.logo || '',
    style: mapHeaderStyle(header),
  }
}

async function fetchHeaders(pagination = null) {
  const columns = await getExistingColumns(TABLE_NAME, SELECT_COLUMNS)
  const values = []
  let query = `SELECT ${columns.join(', ')} FROM ${TABLE_NAME} ORDER BY id ASC`

  if (pagination?.applyPagination && pagination.limit !== null) {
    query += ' LIMIT ? OFFSET ?'
    values.push(pagination.limit, pagination.offset)
  }

  const [rows] = await pool.execute(query, values)

  return parseJsonRows(rows, ['settings']).map(normalizeHeaderRow)
}

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const pagination = parsePaginationParams(request, { maxLimit: 100 })
    const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM ${TABLE_NAME}`)
    const headers = await fetchHeaders(pagination)
    return Response.json({
      success: true,
      header: headers[0] || null,
      headers,
      items: headers,
      total: Number(countRows[0]?.total || 0),
      limit: pagination.limit ?? headers.length,
      offset: pagination.offset,
    })
  } catch (error) {
    console.error('Error fetching headers:', error)
    return Response.json({ success: false, error: 'Failed to fetch headers' }, { status: 500 })
  }
}

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const body = await request.json()
    const requestedColumns = await getExistingColumns(TABLE_NAME, SELECT_COLUMNS)
    const [rows] = await pool.execute(
      `SELECT ${requestedColumns.join(', ')} FROM ${TABLE_NAME} ORDER BY id ASC LIMIT 1`,
    )

    const existing = parseJsonRow(rows[0], ['settings'])
    const currentSettings = existing?.settings || {}
    const nextStyle = body.style || currentSettings.style || 'sticky'
    const nextSettings = {
      ...currentSettings,
      style: nextStyle,
    }

    const payload = {
      slug: body.slug || existing?.slug || 'global-header',
      name: body.name || existing?.name || 'Global Header',
      logo: body.logo || body.logo_url || existing?.logo || '',
      logo_dark: body.logo_dark || existing?.logo_dark || '',
      cta_label: body.cta_label ?? existing?.cta_label ?? 'Contact Us',
      cta_link: body.cta_link ?? existing?.cta_link ?? '/contact',
      is_sticky: nextStyle !== 'static',
      bg_color: body.bg_color ?? existing?.bg_color ?? 'transparent',
      settings: JSON.stringify(nextSettings),
    }

    const writeColumns = await getExistingColumns(TABLE_NAME, Object.keys(payload))

    if (existing?.id) {
      const updates = writeColumns.map((column) => `${column} = ?`)
      const values = writeColumns.map((column) => payload[column])
      values.push(existing.id)
      await pool.execute(`UPDATE ${TABLE_NAME} SET ${updates.join(', ')} WHERE id = ?`, values)
    } else {
      const values = writeColumns.map((column) => payload[column])
      await pool.execute(
        `INSERT INTO ${TABLE_NAME} (${writeColumns.join(', ')}) VALUES (${writeColumns.map(() => '?').join(', ')})`,
        values,
      )
    }

    const headers = await fetchHeaders()
    clearPublicPageBundleCache()
    return Response.json({
      success: true,
      header: headers[0] || null,
      headers,
      item: headers[0] || null,
    })
  } catch (error) {
    console.error('Error saving header:', error)
    return Response.json({ success: false, error: 'Failed to save header' }, { status: 500 })
  }
}
