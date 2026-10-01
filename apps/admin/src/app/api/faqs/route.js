import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'faqs',
  listKey: 'faqs',
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
  createFields: ['question', 'answer', 'category', 'order_index', 'is_active'],
  requiredCreateFields: ['question', 'answer'],
  booleanFields: ['is_active'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
