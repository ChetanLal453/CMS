import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'gallery',
  listKey: 'gallery',
  itemKey: 'item',
  selectColumns: ['id', 'title', 'image', 'alt_text', 'category', 'order_index', 'created_at'],
  createFields: ['title', 'image', 'alt_text', 'category', 'order_index'],
  requiredCreateFields: ['image'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
