import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'pricing',
  listKey: 'pricing',
  itemKey: 'plan',
  selectColumns: [
    'id',
    'name',
    'price',
    'period',
    'description',
    'features',
    'is_popular',
    'cta_label',
    'cta_link',
    'order_index',
    'created_at',
  ],
  createFields: [
    'name',
    'price',
    'period',
    'description',
    'features',
    'is_popular',
    'cta_label',
    'cta_link',
    'order_index',
  ],
  requiredCreateFields: ['name', 'price'],
  jsonFields: ['features'],
  booleanFields: ['is_popular'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
