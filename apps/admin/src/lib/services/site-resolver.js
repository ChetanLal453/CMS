import pool from '../db.js'
import { tableExists } from '../../app/api/_utils/crud.js'

/**
 * Normalizes an incoming Host or x-forwarded-host header value by trimming,
 * stripping port numbers, and converting to lowercase.
 *
 * Examples:
 *   "example.com:3000" -> "example.com"
 *   "  DEMO.localhost:8080 " -> "demo.localhost"
 */
export function normalizeHost(host) {
  if (!host || typeof host !== 'string') {
    return ''
  }
  const trimmed = host.trim().toLowerCase()
  return trimmed.split(':')[0]
}

/**
 * Fetches a site record by primary ID.
 */
export async function getSiteById(siteId, connection = pool) {
  if (!siteId) return null
  if (!(await tableExists('sites'))) return null

  const [rows] = await connection.query(
    'SELECT id, name, slug, domain, status, created_at, updated_at FROM sites WHERE id = ? LIMIT 1',
    [siteId],
  )
  return rows[0] || null
}

/**
 * Fetches a site record by slug.
 */
export async function getSiteBySlug(slug, connection = pool) {
  if (!slug) return null
  if (!(await tableExists('sites'))) return null

  const normalized = String(slug).trim().toLowerCase()
  const [rows] = await connection.query(
    'SELECT id, name, slug, domain, status, created_at, updated_at FROM sites WHERE LOWER(slug) = ? LIMIT 1',
    [normalized],
  )
  return rows[0] || null
}

/**
 * Fetches a site record by domain.
 */
export async function getSiteByDomain(domain, connection = pool, { requireLive = false } = {}) {
  if (!domain) return null
  if (!(await tableExists('sites'))) return null

  const normalized = normalizeHost(domain)
  if (!normalized) return null

  const whereParts = ['LOWER(domain) = ?']
  const params = [normalized]

  if (requireLive) {
    whereParts.push("status = 'live'")
  }

  const [rows] = await connection.query(
    `SELECT id, name, slug, domain, status, created_at, updated_at FROM sites WHERE ${whereParts.join(' AND ')} LIMIT 1`,
    params,
  )
  return rows[0] || null
}

/**
 * Fetches the default/primary site (ordered by lowest id).
 */
export async function getDefaultSite(connection = pool, { requireLive = false } = {}) {
  if (!(await tableExists('sites'))) return null

  const whereClause = requireLive ? "WHERE status = 'live'" : ''
  const [rows] = await connection.query(
    `SELECT id, name, slug, domain, status, created_at, updated_at FROM sites ${whereClause} ORDER BY id ASC LIMIT 1`,
  )
  return rows[0] || null
}

/**
 * Resolves a site by hostname string.
 * Rules:
 * 1. Exact domain match (`LOWER(domain) = normalizedHost`)
 * 2. If host ends with `.localhost` or configured root domain, resolves by subdomain slug (e.g. `tenant-b.localhost` -> slug `tenant-b`)
 * 3. If host is plain `localhost` or `127.0.0.1`, resolves default site for local development
 * 4. Unknown host -> returns null (never falls back to primary site in production)
 */
export async function resolveSiteFromHost(host, connection = pool, options = {}) {
  const { requireLive = false } = options
  const normalizedHost = normalizeHost(host)
  if (!normalizedHost) return null

  // 1. Exact domain match
  const siteByDomain = await getSiteByDomain(normalizedHost, connection, { requireLive })
  if (siteByDomain) {
    return siteByDomain
  }

  // 2. Subdomain check for configured root domain or .localhost
  const configuredRootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'curvemetrics.com'
  const isLocalhostSubdomain = normalizedHost.endsWith('.localhost')
  const isConfiguredRootSubdomain = normalizedHost.endsWith(`.${configuredRootDomain}`)

  if (isLocalhostSubdomain || isConfiguredRootSubdomain) {
    const suffix = isLocalhostSubdomain ? '.localhost' : `.${configuredRootDomain}`
    const sub = normalizedHost.slice(0, -suffix.length)
    if (sub && !sub.includes('.')) {
      const siteBySlug = await getSiteBySlug(sub, connection)
      if (siteBySlug) {
        if (!requireLive || siteBySlug.status === 'live') {
          return siteBySlug
        }
      }
    }
  }

  // 3. Fallback only for generic local dev hostnames
  if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1') {
    return getDefaultSite(connection, { requireLive })
  }

  // Unknown host: fail closed
  return null
}

/**
 * Resolves a site by flexible identifier (ID, slug, or domain).
 */
export async function resolveSite(identifier, connection = pool, options = {}) {
  if (!identifier) return null

  if (typeof identifier === 'number' || /^\d+$/.test(String(identifier).trim())) {
    const site = await getSiteById(Number(identifier), connection)
    if (site) return site
  }

  const strIdentifier = String(identifier).trim().toLowerCase()
  const siteBySlug = await getSiteBySlug(strIdentifier, connection)
  if (siteBySlug) return siteBySlug

  return resolveSiteFromHost(strIdentifier, connection, options)
}

/**
 * Resolves the site context from an incoming Next.js Request object.
 * Enforces the trust boundary:
 * - In public mode: Host is authoritative. Arbitrary client ?siteId= or x-site-id cannot hijack tenant.
 * - In preview mode / local dev: Explicit site context is permitted for admin workspaces.
 */
export async function resolveSiteFromRequest(request, connection = pool, options = {}) {
  let site = null

  if (!request) {
    return { site: null, siteId: -1, siteSlug: null }
  }

  const url = request.url ? new URL(request.url) : null
  const isPreview = options.mode === 'preview' || url?.searchParams.get('preview') === '1'

  // Extract explicit parameters
  const querySiteId = url?.searchParams.get('siteId')
  const querySiteSlug = url?.searchParams.get('siteSlug') || url?.searchParams.get('site')
  const queryHost = url?.searchParams.get('host')

  // Extract headers
  const headerSiteId = request.headers?.get('x-site-id')
  const headerSiteSlug = request.headers?.get('x-site-slug')
  const hostHeader = request.headers?.get('x-forwarded-host') || request.headers?.get('host')

  const effectiveHost = queryHost || hostHeader || url?.host
  const normalizedHost = normalizeHost(effectiveHost)
  const isLocalDevHost = !normalizedHost || normalizedHost === 'localhost' || normalizedHost === '127.0.0.1'

  // 1. In Public Mode on a non-localhost host: Host header strictly defines tenant
  if (!isPreview && !isLocalDevHost) {
    site = await resolveSiteFromHost(normalizedHost, connection, { requireLive: true })
    if (site) {
      return {
        site,
        siteId: site.id,
        siteSlug: site.slug,
      }
    }
    // Unknown public host -> fail closed
    return {
      site: null,
      siteId: -1,
      siteSlug: null,
    }
  }

  // 2. In Preview mode, or in local development (localhost):
  // Check explicit siteId / siteSlug (from admin workspace or query)
  if (querySiteId) {
    site = await getSiteById(querySiteId, connection)
    return {
      site,
      siteId: site?.id ?? (Number.parseInt(querySiteId, 10) || -1),
      siteSlug: site?.slug ?? null,
    }
  }

  if (querySiteSlug) {
    site = await getSiteBySlug(querySiteSlug, connection)
    return {
      site,
      siteId: site?.id ?? -1,
      siteSlug: site?.slug ?? querySiteSlug,
    }
  }

  if (headerSiteId) {
    site = await getSiteById(headerSiteId, connection)
    return {
      site,
      siteId: site?.id ?? (Number.parseInt(headerSiteId, 10) || -1),
      siteSlug: site?.slug ?? null,
    }
  }

  if (headerSiteSlug) {
    site = await getSiteBySlug(headerSiteSlug, connection)
    return {
      site,
      siteId: site?.id ?? -1,
      siteSlug: site?.slug ?? headerSiteSlug,
    }
  }

  // Next, if a specific hostname was supplied in preview/local dev:
  if (normalizedHost && !isLocalDevHost) {
    site = await resolveSiteFromHost(normalizedHost, connection, { requireLive: false })
    if (site) {
      return {
        site,
        siteId: site.id,
        siteSlug: site.slug,
      }
    }
    return {
      site: null,
      siteId: -1,
      siteSlug: null,
    }
  }

  // Fallback for unscoped local development on localhost
  if (isLocalDevHost) {
    site = await getDefaultSite(connection, { requireLive: false })
  }

  return {
    site,
    siteId: site?.id ?? null,
    siteSlug: site?.slug ?? null,
  }
}
