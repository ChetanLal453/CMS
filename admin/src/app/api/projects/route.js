import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'projects',
  listKey: 'projects',
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
  createFields: [
    'title',
    'description',
    'image',
    'category',
    'client',
    'url',
    'order_index',
    'is_active',
  ],
  requiredCreateFields: ['title'],
  booleanFields: ['is_active'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
