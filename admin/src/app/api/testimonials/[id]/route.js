import { createItemHandlers, tableExists } from '../../_utils/crud.js'

const handlers = createItemHandlers({
  tableName: 'testimonials',
  itemKey: 'testimonial',
  selectColumns: ['id', 'text', 'author', 'created_at'],
  updateFields: ['text', 'author'],
  requireAdminForWrite: true,
})

export const PUT = handlers.PUT
export const DELETE = handlers.DELETE

export async function GET(request, context) {
  if (!(await tableExists('testimonials'))) {
    return Response.json({
      success: true,
      testimonial: null,
      available: false,
      notice: 'Testimonials collection is not set up yet.',
    })
  }

  return handlers.GET(request, context)
}
