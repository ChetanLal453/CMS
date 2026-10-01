import { createCollectionHandlers } from '../_utils/crud.js'

function inferLeadType(body = {}) {
  const haystack = [body.lead_type, body.subject, body.message, body.source]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (haystack.includes('newsletter') || haystack.includes('subscribe')) {
    return 'newsletter_subscriber'
  }

  if (
    haystack.includes('appointment') ||
    haystack.includes('book') ||
    haystack.includes('meeting') ||
    haystack.includes('consult')
  ) {
    return 'appointment_request'
  }

  return 'contact_form'
}

function inferLeadSource(body = {}) {
  const source = typeof body.source === 'string' ? body.source.trim() : ''
  if (source) {
    return source
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  if (subject.startsWith('/')) {
    return subject
  }

  return '/contact'
}

const handlers = createCollectionHandlers({
  tableName: 'contact',
  listKey: 'submissions',
  itemKey: 'submission',
  selectColumns: [
    'id',
    'name',
    'email',
    'phone',
    'subject',
    'message',
    'status',
    'lead_type',
    'source',
    'notes',
    'follow_up_history',
    'created_at',
  ],
  createFields: ['name', 'email', 'phone', 'subject', 'message', 'status', 'lead_type', 'source', 'notes', 'follow_up_history'],
  requiredCreateFields: ['name', 'email', 'message'],
  defaultCreateValues: {
    status: 'new',
    lead_type: 'contact_form',
    source: '/contact',
    follow_up_history: [],
  },
  buildCreatePayload(basePayload, body) {
    return {
      ...basePayload,
      lead_type: body.lead_type || inferLeadType(body),
      source: inferLeadSource(body),
      notes: body.notes ?? basePayload.notes ?? null,
      follow_up_history: Array.isArray(body.follow_up_history) ? body.follow_up_history : basePayload.follow_up_history ?? [],
    }
  },
  orderBy: 'created_at DESC, id DESC',
  requireAdminForRead: true,
})

export const GET = handlers.GET
export const POST = handlers.POST
