import { createCollectionHandlers, tableExists } from '../_utils/crud.js'

const handlers = createCollectionHandlers({
  tableName: 'testimonials',
  listKey: 'testimonials',
  itemKey: 'testimonial',
  selectColumns: ['id', 'text', 'author', 'created_at'],
  createFields: ['text', 'author'],
  requiredCreateFields: ['text', 'author'],
  orderBy: 'id DESC',
  requireAdminForWrite: true,
})

export const POST = handlers.POST

export async function GET(request) {
  if (!(await tableExists('testimonials'))) {
    return Response.json({
      success: true,
      testimonials: [],
      available: false,
      notice: 'Testimonials collection is not set up yet.',
    })
  }

  return handlers.GET(request)
}
