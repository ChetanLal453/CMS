import pool from '../../../../lib/db.js'
import { requireAdmin } from '../../../../lib/require-admin.js'
import {
  getExistingColumns,
  missingTableResponse,
  parseJsonRow,
  pickDefined,
  tableExists,
} from '../../_utils/crud.js'
import { clearPublicPageBundleCache } from '../../../../lib/public-page-cache.js'

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
const WRITE_FIELDS = [
  'slug',
  'name',
  'logo',
  'logo_dark',
  'cta_label',
  'cta_link',
  'is_sticky',
  'bg_color',
  'settings',
]

function buildNavigationTree(items = []) {
  const byParent = new Map()

  for (const item of items) {
    const parentKey = item.parent_id ?? null
    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, [])
    }
    byParent.get(parentKey).push({ ...item })
  }

  const sortItems = (list = []) =>
    list
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0) || (a.id ?? 0) - (b.id ?? 0))
      .map((item) => ({
        ...item,
        children: sortItems(byParent.get(item.id) || []),
      }))

  return sortItems(byParent.get(null) || [])
}

async function insertNavigationItems(headerId, items = [], parentId = null, navColumns = []) {
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const payload = {
      label: item.label || '',
      href: item.href || '#',
      order_index: item.order_index ?? index,
      parent_id: parentId,
      is_active: item.is_active ?? true,
      open_new_tab: item.open_new_tab ?? false,
      header_id: headerId,
    }
    const insertFields = navColumns.filter((column) => column in payload)
    const values = insertFields.map((field) =>
      field === 'is_active' || field === 'open_new_tab' ? Boolean(payload[field]) : payload[field],
    )

    if (!insertFields.length) {
      continue
    }

    const [result] = await pool.execute(
      `INSERT INTO navigation_items (${insertFields.join(', ')}) VALUES (${insertFields
        .map(() => '?')
        .join(', ')})`,
      values,
    )

    if (Array.isArray(item.children) && item.children.length) {
      await insertNavigationItems(headerId, item.children, result.insertId, navColumns)
    }
  }
}

async function replaceNavigationItems(headerId, items = []) {
  if (!(await tableExists('navigation_items'))) {
    return
  }

  await pool.execute('DELETE FROM navigation_items WHERE header_id = ?', [headerId])
  if (!Array.isArray(items) || !items.length) {
    return
  }

  const navColumns = await getExistingColumns('navigation_items', [
    'label',
    'href',
    'order_index',
    'parent_id',
    'is_active',
    'open_new_tab',
    'header_id',
  ])
  await insertNavigationItems(headerId, items, null, navColumns)
}

async function fetchHeader(id) {
  const columns = await getExistingColumns(TABLE_NAME, SELECT_COLUMNS)
  const [rows] = await pool.execute(
    `SELECT ${columns.join(', ')} FROM ${TABLE_NAME} WHERE id = ? LIMIT 1`,
    [id],
  )

  if (!rows.length) {
    return null
  }

  const header = parseJsonRow(rows[0], ['settings'])
  if (!(await tableExists('navigation_items'))) {
    return { ...header, navigation_items: [] }
  }

  const navColumns = await getExistingColumns('navigation_items', [
    'id',
    'label',
    'href',
    'order_index',
    'parent_id',
    'is_active',
    'open_new_tab',
    'header_id',
    'created_at',
    'updated_at',
  ])
  const [navRows] = await pool.execute(
    `SELECT ${navColumns.join(', ')} FROM navigation_items WHERE header_id = ? ORDER BY order_index ASC, id ASC`,
    [id],
  )

  return { ...header, navigation_items: buildNavigationTree(navRows) }
}

export async function GET(_request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const header = await fetchHeader(id)
    if (!header) {
      return Response.json({ success: false, error: 'Header not found' }, { status: 404 })
    }

    return Response.json({ success: true, header, item: header })
  } catch (error) {
    console.error('Error fetching header:', error)
    return Response.json({ success: false, error: 'Failed to fetch header' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const body = await request.json()
    const payload = pickDefined(body, WRITE_FIELDS)
    const columns = await getExistingColumns(TABLE_NAME, Object.keys(payload))
    const updates = columns.map((column) => `${column} = ?`)

    if (updates.length) {
      const values = columns.map((column) =>
        column === 'settings' ? JSON.stringify(payload[column] || {}) : payload[column],
      )
      values.push(id)
      const [result] = await pool.execute(
        `UPDATE ${TABLE_NAME} SET ${updates.join(', ')} WHERE id = ?`,
        values,
      )

      if (!result.affectedRows) {
        return Response.json({ success: false, error: 'Header not found' }, { status: 404 })
      }
    }

    if (body.navigation_items !== undefined) {
      await replaceNavigationItems(id, body.navigation_items)
    }

    const header = await fetchHeader(id)
    clearPublicPageBundleCache()
    return Response.json({ success: true, header, item: header })
  } catch (error) {
    console.error('Error updating header:', error)
    return Response.json({ success: false, error: 'Failed to update header' }, { status: 500 })
  }
}

export async function DELETE(_request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists(TABLE_NAME))) {
      return missingTableResponse(TABLE_NAME)
    }

    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    if (await tableExists('navigation_items')) {
      await pool.execute('DELETE FROM navigation_items WHERE header_id = ?', [id])
    }

    const [result] = await pool.execute(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id])
    if (!result.affectedRows) {
      return Response.json({ success: false, error: 'Header not found' }, { status: 404 })
    }

    clearPublicPageBundleCache()
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting header:', error)
    return Response.json({ success: false, error: 'Failed to delete header' }, { status: 500 })
  }
}
