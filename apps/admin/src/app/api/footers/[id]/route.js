import { createItemHandlers } from '../../_utils/crud.js'
import { clearPublicPageBundleCache } from '../../../../lib/public-page-cache.js'

const handlers = createItemHandlers({
  tableName: 'footers',
  itemKey: 'footer',
  selectColumns: [
    'id',
    'slug',
    'name',
    'columns',
    'copyright',
    'social_links',
    'bg_color',
    'settings',
    'created_at',
    'updated_at',
  ],
  updateFields: ['slug', 'name', 'columns', 'copyright', 'social_links', 'bg_color', 'settings'],
  jsonFields: ['columns', 'social_links', 'settings'],
  requireAdminForRead: true,
  requireAdminForWrite: true,
})

export const GET = handlers.GET

export async function PUT(request, context) {
  const response = await handlers.PUT(request, context)
  if (response.ok) {
    clearPublicPageBundleCache()
  }
  return response
}

export async function DELETE(request, context) {
  const response = await handlers.DELETE(request, context)
  if (response.ok) {
    clearPublicPageBundleCache()
  }
  return response
}
