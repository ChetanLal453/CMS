/**
 * shared/admin API helpers
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility functions used across the PageEditor and its sub-components.
 * Previously duplicated in: index-unified.tsx, usePageData.ts,
 * TemplateManager/index.tsx, VersionHistory/index.tsx
 */

/**
 * Extracts a human-readable error message from various API response shapes.
 *
 * Supports:
 *   { error: string }
 *   { error: { message: string } }
 *   { message: string }
 *
 * Falls back to `fallback` if no message is found.
 */
export const getApiErrorMessage = (payload: unknown, fallback: string): string => {
  if (!payload || typeof payload !== 'object') return fallback

  const p = payload as Record<string, any>

  const message =
    typeof p.error === 'string'
      ? p.error
      : typeof p.error?.message === 'string'
        ? p.error.message
        : typeof p.message === 'string'
          ? p.message
          : ''

  return message || fallback
}
