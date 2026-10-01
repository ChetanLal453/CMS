import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'team',
  itemKey: 'member',
  selectColumns: [
    'id',
    'name',
    'role',
    'bio',
    'image',
    'email',
    'linkedin_url',
    'order_index',
    'is_active',
    'created_at',
  ],
  updateFields: [
    'name',
    'role',
    'bio',
    'image',
    'email',
    'linkedin_url',
    'order_index',
    'is_active',
  ],
  booleanFields: ['is_active'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
