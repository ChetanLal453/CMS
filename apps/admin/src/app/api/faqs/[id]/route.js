import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'faqs',
  itemKey: 'faq',
  selectColumns: [
    'id',
    'question',
    'answer',
    'category',
    'order_index',
    'is_active',
    'created_at',
  ],
  updateFields: ['question', 'answer', 'category', 'order_index', 'is_active'],
  booleanFields: ['is_active'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
