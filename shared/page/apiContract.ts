export type PageRenderApiErrorCode =
  | 'PAGE_NOT_FOUND'
  | 'INVALID_REVISION_ID'
  | 'PREVIEW_REVISION_ONLY'
  | 'REVISION_NOT_FOUND'
  | 'PAGE_NOT_PUBLISHED'
  | 'INVALID_PAGE_RENDER_BUNDLE'
  | 'DATABASE_ERROR'

export type PageEditorApiErrorCode =
  | 'METHOD_NOT_ALLOWED'
  | 'INVALID_PAGE_ID'
  | 'INVALID_JSON_BODY'
  | 'NAME_REQUIRED'
  | 'PAGE_ID_REQUIRED'
  | 'VERSION_ID_REQUIRED'
  | 'TEMPLATE_ID_REQUIRED'
  | 'TEMPLATE_NAME_REQUIRED'
  | 'SECTION_ID_REQUIRED'
  | 'SECTION_UPDATES_REQUIRED'
  | 'TARGET_PAGE_REQUIRED'
  | 'INVALID_DISABLED_VALUE'
  | 'BANNER_SLUG_REQUIRED'
  | 'PAGE_NOT_FOUND'
  | 'SECTION_NOT_FOUND'
  | 'TARGET_PAGE_NOT_FOUND'
  | 'HOME_PAGE_DELETE_FORBIDDEN'
  | 'HOME_PAGE_DISABLE_FORBIDDEN'
  | 'NOTHING_TO_UPDATE'
  | 'LAYOUT_REQUIRED'
  | 'VERSION_NOT_FOUND'
  | 'TEMPLATE_NOT_FOUND'
  | 'TEMPLATE_STORAGE_UNAVAILABLE'
  | 'PAGE_LAYOUT_VALIDATION_FAILED'
  | 'REVISION_CONFLICT'
  | 'EMPTY_LAYOUT'
  | 'MISSING_CURRENT_REVISION'
  | 'TABLE_UNAVAILABLE'
  | 'DATABASE_ERROR'

type ApiErrorPayload<TCode extends string> = {
  success: false
  error: {
    code: TCode
    message: string
    traceId: string
    details?: Record<string, unknown>
  }
}

export type PageRenderApiErrorPayload = ApiErrorPayload<PageRenderApiErrorCode>
export type PageEditorApiErrorPayload = ApiErrorPayload<PageEditorApiErrorCode>

function createTraceId(prefix = 'page-api') {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createApiErrorPayload<TCode extends string>(input: {
  code: TCode
  message: string
  traceId?: string | null
  details?: Record<string, unknown>
}): ApiErrorPayload<TCode> {
  return {
    success: false,
    error: {
      code: input.code,
      message: input.message,
      traceId: String(input.traceId || '').trim() || createTraceId(),
      ...(input.details && Object.keys(input.details).length ? { details: input.details } : {}),
    },
  }
}

export function createPageRenderApiError(input: {
  code: PageRenderApiErrorCode
  message: string
  traceId?: string | null
  details?: Record<string, unknown>
}): PageRenderApiErrorPayload {
  return createApiErrorPayload(input)
}

export function createPageEditorApiError(input: {
  code: PageEditorApiErrorCode
  message: string
  traceId?: string | null
  details?: Record<string, unknown>
}): PageEditorApiErrorPayload {
  return createApiErrorPayload(input)
}
