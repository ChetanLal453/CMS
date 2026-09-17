import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'services',
  listKey: 'services',
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
  createFields: ['title', 'description', 'icon', 'image', 'url', 'order_index', 'is_active'],
  requiredCreateFields: ['title'],
  booleanFields: ['is_active'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
