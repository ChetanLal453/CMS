import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'stats',
  listKey: 'stats',
  itemKey: 'stat',
  selectColumns: ['id', 'label', 'value', 'icon', 'order_index', 'created_at'],
  createFields: ['label', 'value', 'icon', 'order_index'],
  requiredCreateFields: ['label', 'value'],
  orderBy: 'order_index ASC, id ASC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
