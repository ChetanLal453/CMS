import { createCollectionHandlers } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'blog',
  listKey: 'posts',
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
  createFields: [
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
  requiredCreateFields: ['title', 'slug'],
  jsonFields: ['tags'],
  orderBy: 'COALESCE(published_at, created_at) DESC, id DESC',
  requireAdminForWrite: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
