import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'pricing',
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
  updateFields: [
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
  jsonFields: ['features'],
  booleanFields: ['is_popular'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
