import pool from '../../../lib/db.js'
import { getExistingColumns, missingTableResponse, tableExists } from '../_utils/crud.js'
import { requireAdmin } from '../../../lib/require-admin.js'
import { clearPublicPageBundleCache } from '../../../lib/public-page-cache.js'

function normalizeDbItem(item) {
  const statusValue =
    item.status ??
    (item.is_active === false || item.is_active === 0 ? 'draft' : 'live')

  return {
    id: item.id,
    label: item.label || '',
    url: item.url || item.href || '/',
    parent_id: item.parent_id ?? null,
    order_index: Number(item.order_index || 0),
    is_dropdown:
      item.is_dropdown != null ? Boolean(item.is_dropdown) : Boolean(item.children?.length),
    new_tab:
      item.new_tab != null ? Boolean(item.new_tab) : Boolean(item.open_new_tab),
    status: statusValue,
  }
}

function buildNavigationTree(items = []) {
  const byParent = new Map()

  for (const rawItem of items) {
    const item = normalizeDbItem(rawItem)
    const parentKey = item.parent_id ?? null
    if (!byParent.has(parentKey)) {
      byParent.set(parentKey, [])
    }
    byParent.get(parentKey)?.push(item)
  }

  const sortItems = (list = []) =>
    [...list]
      .sort((left, right) => left.order_index - right.order_index || left.id - right.id)
      .map((item, index) => ({
        ...item,
        order_index: index,
        children: sortItems(byParent.get(item.id) || []),
      }))

  return sortItems(byParent.get(null) || [])
}

async function getNavigationColumns() {
  return getExistingColumns('navigation_items', [
    'id',
    'label',
    'url',
    'href',
    'parent_id',
    'order_index',
    'is_dropdown',
    'new_tab',
    'status',
    'is_active',
    'open_new_tab',
    'header_id',
    'created_at',
    'updated_at',
  ])
}

async function fetchNavigationTree() {
  const columns = await getNavigationColumns()
  const query = [
    `SELECT ${columns.join(', ')} FROM navigation_items`,
    'WHERE header_id IS NULL',
    'ORDER BY order_index ASC, id ASC',
  ].join(' ')

  const [rows] = await pool.execute(query)
  return {
    flat: rows,
    tree: buildNavigationTree(rows),
  }
}

function parseHeaderId(value) {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? null : parsed
}

async function fetchNavigationTreeForScope(headerId = null) {
  const columns = await getNavigationColumns()
  const whereParts = []
  const values = []

  if (columns.includes('header_id')) {
    if (headerId === null) {
      whereParts.push('header_id IS NULL')
    } else {
      whereParts.push('header_id = ?')
      values.push(headerId)
    }
  }

  const query = [
    `SELECT ${columns.join(', ')} FROM navigation_items`,
    whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '',
    'ORDER BY order_index ASC, id ASC',
  ]
    .filter(Boolean)
    .join(' ')

  const [rows] = await pool.execute(query, values)
  return {
    flat: rows,
    tree: buildNavigationTree(rows),
  }
}

function getRequestItems(body) {
  if (Array.isArray(body)) {
    return body
  }

  if (Array.isArray(body?.navigation)) {
    return body.navigation
  }

  if (Array.isArray(body?.items)) {
    return body.items
  }

  return null
}

async function replaceNavigationItems(connection, items = [], parentId = null, headerId = null) {
  const columns = await getNavigationColumns()
  const insertableColumns = columns.filter((column) => !['id', 'created_at', 'updated_at'].includes(column))

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const payload = {
      label: item.label || 'New Link',
      url: item.url || item.href || '/new-link',
      href: item.url || item.href || '/new-link',
      parent_id: parentId,
      order_index: index,
      is_dropdown:
        item.is_dropdown != null ? Boolean(item.is_dropdown) : Array.isArray(item.children) && item.children.length > 0,
      new_tab: Boolean(item.new_tab || item.open_new_tab),
      status: item.status || 'live',
      is_active: (item.status || 'live') !== 'draft',
      open_new_tab: Boolean(item.new_tab || item.open_new_tab),
      header_id: headerId,
    }

    const fields = insertableColumns.filter((column) => payload[column] !== undefined)
    const values = fields.map((field) => payload[field])

    const [result] = await connection.execute(
      `INSERT INTO navigation_items (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
      values,
    )

    const children = Array.isArray(item.children) ? item.children : []
    if (children.length) {
      await replaceNavigationItems(connection, children, result.insertId, headerId)
    }
  }
}

export async function GET(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('navigation_items'))) {
      return missingTableResponse('navigation_items')
    }

    const { searchParams } = new URL(request.url)
    const headerId = parseHeaderId(searchParams.get('header_id'))
    const { flat, tree } = await fetchNavigationTreeForScope(headerId)
    return Response.json({ success: true, navigation: tree, items: tree, flat_items: flat, header_id: headerId })
  } catch (error) {
    console.error('Error fetching navigation items:', error)
    return Response.json({ success: false, error: 'Failed to fetch navigation items' }, { status: 500 })
  }
}

export async function POST(request) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('navigation_items'))) {
      return missingTableResponse('navigation_items')
    }

    const body = await request.json()
    const items = getRequestItems(body)
    const headerId = parseHeaderId(body?.header_id)

    if (!items) {
      return Response.json(
        { success: false, error: 'navigation array is required' },
        { status: 400 },
      )
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const columns = await getNavigationColumns()
      if (columns.includes('header_id')) {
        if (headerId === null) {
          await connection.execute('DELETE FROM navigation_items WHERE header_id IS NULL')
        } else {
          await connection.execute('DELETE FROM navigation_items WHERE header_id = ?', [headerId])
        }
      } else {
        await connection.execute('DELETE FROM navigation_items')
      }

      if (items.length) {
        await replaceNavigationItems(connection, items, null, headerId)
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    const { tree } = await fetchNavigationTreeForScope(headerId)
    clearPublicPageBundleCache()
    return Response.json({ success: true, navigation: tree, items: tree, header_id: headerId })
  } catch (error) {
    console.error('Error saving navigation items:', error)
    return Response.json({ success: false, error: 'Failed to save navigation items' }, { status: 500 })
  }
}
