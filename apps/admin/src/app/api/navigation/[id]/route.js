import pool from '../../../../lib/db.js'
import { createItemHandlers, missingTableResponse, tableExists } from '../../_utils/crud.js'
import { requireAdmin } from '../../../../lib/require-admin.js'

const handlers = createItemHandlers({
  tableName: 'navigation_items',
  itemKey: 'item',
  selectColumns: [
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
  ],
  updateFields: ['label', 'href', 'order_index', 'parent_id', 'is_active', 'open_new_tab', 'header_id'],
  booleanFields: ['is_active', 'open_new_tab'],
  requireAdminForRead: true,
  requireAdminForWrite: true,
})

async function collectDescendantIds(rootId) {
  const ids = [rootId]
  let cursor = 0

  while (cursor < ids.length) {
    const currentId = ids[cursor]
    const [rows] = await pool.execute('SELECT id FROM navigation_items WHERE parent_id = ?', [currentId])
    for (const row of rows) {
      ids.push(row.id)
    }
    cursor += 1
  }

  return ids.reverse()
}

export const GET = handlers.GET
export const PUT = handlers.PUT

export async function DELETE(_request, { params }) {
  const unauthorizedResponse = await requireAdmin()
  if (unauthorizedResponse) {
    return unauthorizedResponse
  }

  try {
    if (!(await tableExists('navigation_items'))) {
      return missingTableResponse('navigation_items')
    }

    const id = Number.parseInt(params.id, 10)
    if (Number.isNaN(id)) {
      return Response.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    }

    const idsToDelete = await collectDescendantIds(id)
    if (!idsToDelete.length) {
      return Response.json({ success: false, error: 'Item not found' }, { status: 404 })
    }

    const placeholders = idsToDelete.map(() => '?').join(', ')
    const [result] = await pool.execute(`DELETE FROM navigation_items WHERE id IN (${placeholders})`, idsToDelete)

    if (!result.affectedRows) {
      return Response.json({ success: false, error: 'Item not found' }, { status: 404 })
    }

    return Response.json({ success: true, deleted_ids: idsToDelete })
  } catch (error) {
    console.error('Error deleting navigation item:', error)
    return Response.json({ success: false, error: 'Failed to delete item' }, { status: 500 })
  }
}
