import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'services',
  itemKey: 'service',
  selectColumns: [
    'id',
    'title',
    'description',
    'icon',
    'image',
    'url',
    'order_index',
    'is_active',
    'created_at',
  ],
  updateFields: ['title', 'description', 'icon', 'image', 'url', 'order_index', 'is_active'],
  booleanFields: ['is_active'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
