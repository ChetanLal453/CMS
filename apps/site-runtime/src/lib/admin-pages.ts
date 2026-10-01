import type {
  PageBanner as AdminBanner,
  PageFooter as AdminFooter,
  PageHeader as AdminHeader,
  PageNavigationItem as AdminNavigationItem,
  PageRecord as AdminPage,
  PageRenderBundle as AdminPageBundle,
  PageSection as AdminSection,
} from '@uadmin/shared/page/PageRenderBundle'
import { isAbsoluteUrl, resolveAdminBaseUrl, resolveAdminMediaUrl } from '@uadmin/shared/page/adminUrls'
import { validatePageRenderBundle } from '@uadmin/shared/page/validatePageRenderBundle'

export type {
  AdminBanner,
  AdminFooter,
  AdminHeader,
  AdminNavigationItem,
  AdminPage,
  AdminPageBundle,
  AdminSection,
}

export interface SiteFetchOptions {
  host?: string
  siteId?: string | number
  siteSlug?: string
}

export function extractHostname(host?: string | null): string {
  if (!host || typeof host !== 'string') return ''
  return host.trim().toLowerCase().split(':')[0]
}

export function buildAdminPageCandidates(slugSegments: string[] = []) {
  const cleanedSegments = slugSegments.map((segment) => String(segment || '').trim()).filter(Boolean)

  if (!cleanedSegments.length) {
    return ['home', 'index']
  }

  const exactPath = cleanedSegments.join('/')
  const dashedPath = cleanedSegments.join('-')
  const lastSegment = cleanedSegments[cleanedSegments.length - 1]
  const firstSegment = cleanedSegments[0]

  return Array.from(
    new Set([
      exactPath,
      dashedPath,
      lastSegment,
      firstSegment,
    ].filter(Boolean)),
  )
}

async function fetchJson(url: string, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...headers,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  try {
    return await response.json()
  } catch {
    return null
  }
}

export async function fetchAdminPageBundle(
  slug: string,
  options: SiteFetchOptions = {},
) {
  const baseUrl = resolveAdminBaseUrl()
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_ADMIN_BASE_URL is not configured')
  }

  const queryParams = new URLSearchParams()
  const headers: Record<string, string> = {}

  if (options.siteId != null) {
    queryParams.set('siteId', String(options.siteId))
    headers['x-site-id'] = String(options.siteId)
  }

  if (options.siteSlug) {
    queryParams.set('siteSlug', options.siteSlug)
    headers['x-site-slug'] = options.siteSlug
  }

  if (options.host) {
    const normalizedHost = extractHostname(options.host)
    if (normalizedHost) {
      queryParams.set('host', normalizedHost)
      headers['x-forwarded-host'] = normalizedHost
    }
  }

  const queryString = queryParams.toString()
  const requestUrl = `${baseUrl}/api/page/${encodeURIComponent(slug)}${queryString ? `?${queryString}` : ''}`

  const response = await fetchJson(requestUrl, headers)

  if (!response || response.success === false) {
    return null
  }

  return validatePageRenderBundle(response)
}

export async function fetchPageBundle(slug: string, options: SiteFetchOptions = {}) {
  return fetchAdminPageBundle(slug, options)
}

export async function fetchPageBundleForPath(
  slugSegments: string[] = [],
  options: SiteFetchOptions = {},
) {
  const candidates = buildAdminPageCandidates(slugSegments)

  for (const candidate of candidates) {
    const bundle = await fetchPageBundle(candidate, options)
    if (bundle) {
      return bundle
    }
  }

  return null
}

export async function fetchAdminPageBundleForPath(
  slugSegments: string[] = [],
  options: SiteFetchOptions = {},
) {
  return fetchPageBundleForPath(slugSegments, options)
}
