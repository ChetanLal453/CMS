import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'stats',
  itemKey: 'stat',
  selectColumns: ['id', 'label', 'value', 'icon', 'order_index', 'created_at'],
  updateFields: ['label', 'value', 'icon', 'order_index'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
