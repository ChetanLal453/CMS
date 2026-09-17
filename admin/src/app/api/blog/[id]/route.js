import { createItemHandlers } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'blog',
  itemKey: 'post',
  selectColumns: [
    'id',
    'title',
    'slug',
    'content',
    'excerpt',
    'featured_image',
    'author',
    'category',
    'tags',
    'status',
    'meta_title',
    'meta_description',
    'published_at',
    'created_at',
    'updated_at',
  ],
  updateFields: [
    'title',
    'slug',
    'content',
    'excerpt',
    'featured_image',
    'author',
    'category',
    'tags',
    'status',
    'meta_title',
    'meta_description',
    'published_at',
  ],
  jsonFields: ['tags'],
})

export const GET = handlers.GET
export const PUT = handlers.PUT
export const DELETE = handlers.DELETE
