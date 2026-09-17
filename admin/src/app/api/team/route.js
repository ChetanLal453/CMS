import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'team',
  listKey: 'team',
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
  createFields: [
    'name',
    'role',
    'bio',
    'image',
    'email',
    'linkedin_url',
    'order_index',
    'is_active',
  ],
  requiredCreateFields: ['name'],
  booleanFields: ['is_active'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
