import type {
  PageBanner as AdminBanner,
  PageFooter as AdminFooter,
  PageHeader as AdminHeader,
  PageNavigationItem as AdminNavigationItem,
  PageRecord as AdminPage,
  PageRenderBundle as AdminPageBundle,
  PageSection as AdminSection,
} from '../../../shared/page/PageRenderBundle'
import { isAbsoluteUrl, resolveAdminBaseUrl, resolveAdminMediaUrl } from '../../../shared/page/adminUrls'
import { validatePageRenderBundle } from '../../../shared/page/validatePageRenderBundle'

export type {
  AdminBanner,
  AdminFooter,
  AdminHeader,
  AdminNavigationItem,
  AdminPage,
  AdminPageBundle,
  AdminSection,
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

async function fetchJson(url: string) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
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

export async function fetchAdminPageBundle(slug: string) {
  const baseUrl = resolveAdminBaseUrl()
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_ADMIN_BASE_URL is not configured')
  }

  const response = await fetchJson(`${baseUrl}/api/page/${encodeURIComponent(slug)}`)

  if (!response || response.success === false) {
    return null
  }

  return validatePageRenderBundle(response)
}

export async function fetchPageBundle(slug: string) {
  return fetchAdminPageBundle(slug)
}

export async function fetchPageBundleForPath(slugSegments: string[] = []) {
  const candidates = buildAdminPageCandidates(slugSegments)

  for (const candidate of candidates) {
    const bundle = await fetchPageBundle(candidate)
    if (bundle) {
      return bundle
    }
  }

  return null
}

export async function fetchAdminPageBundleForPath(slugSegments: string[] = []) {
  return fetchPageBundleForPath(slugSegments)
}
