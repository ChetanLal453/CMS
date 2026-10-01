import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'gallery',
  itemKey: 'item',
  selectColumns: ['id', 'title', 'image', 'alt_text', 'category', 'order_index', 'created_at'],
  updateFields: ['title', 'image', 'alt_text', 'category', 'order_index'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
