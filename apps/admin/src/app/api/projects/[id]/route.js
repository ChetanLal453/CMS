import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'projects',
  itemKey: 'project',
  selectColumns: [
    'id',
    'title',
    'description',
    'image',
    'category',
    'client',
    'url',
    'order_index',
    'is_active',
    'created_at',
  ],
  updateFields: [
    'title',
    'description',
    'image',
    'category',
    'client',
    'url',
    'order_index',
    'is_active',
  ],
  booleanFields: ['is_active'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
