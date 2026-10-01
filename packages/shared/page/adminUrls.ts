function normalizeBaseUrl(value?: string | null) {
  const trimmed = String(value || '').trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : ''
}

function readEnv(name: string) {
  const maybeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return maybeProcess?.env?.[name]
}

export function resolveAdminBaseUrl() {
  const explicit =
    normalizeBaseUrl(readEnv('NEXT_PUBLIC_ADMIN_BASE_URL')) ||
    normalizeBaseUrl(readEnv('NEXT_PUBLIC_ADMIN_URL')) ||
    normalizeBaseUrl(readEnv('ADMIN_BASE_URL'))

  if (explicit) {
    return explicit
  }

  if (readEnv('NODE_ENV') !== 'production') {
    return 'http://localhost:3000'
  }

  return ''
}

export function isAbsoluteUrl(value?: string) {
  return /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(String(value || '').trim()) || /^[a-z][a-z\d+\-.]*:/i.test(String(value || '').trim())
}

export function resolveAdminMediaUrl(value?: string) {
  const trimmed = String(value || '').trim()

  if (!trimmed) {
    return ''
  }

  if (/^(?:data:|blob:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed
  }

  if (isAbsoluteUrl(trimmed)) {
    return trimmed
  }

  const baseUrl = resolveAdminBaseUrl()
  if (!baseUrl) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed.replace(/^\/+/, '')}`
  }

  return trimmed.startsWith('/') ? `${baseUrl}${trimmed}` : `${baseUrl}/${trimmed.replace(/^\/+/, '')}`
}
