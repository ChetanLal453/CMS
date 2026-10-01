const DEFAULT_TTL_MS = Number.parseInt(process.env.PUBLIC_PAGE_CACHE_TTL_MS ?? '30000', 10)

function getCacheStore() {
  if (!globalThis.__curvePublicPageCache) {
    globalThis.__curvePublicPageCache = new Map()
  }

  if (!globalThis.__curvePublicPageInflight) {
    globalThis.__curvePublicPageInflight = new Map()
  }

  return {
    cache: globalThis.__curvePublicPageCache,
    inflight: globalThis.__curvePublicPageInflight,
  }
}

function normalizeKey(key) {
  return String(key || '').trim().toLowerCase()
}

/**
 * Generates a tenant-scoped cache key.
 * Format: site:{siteId}:page:{slug}
 * @param {string} slug
 * @param {string|number|null} [siteId]
 * @returns {string}
 */
export function makePublicPageCacheKey(slug, siteId = null) {
  const normSlug = normalizeKey(slug)
  const normSite = siteId != null && siteId !== '' ? String(siteId).trim().toLowerCase() : 'global'
  return `site:${normSite}:page:${normSlug}`
}

export async function getOrSetPublicPageCache(key, loader, ttlMs = DEFAULT_TTL_MS) {
  const normalizedKey = normalizeKey(key)
  if (!normalizedKey) {
    return loader()
  }

  const { cache, inflight } = getCacheStore()
  const cached = cache.get(normalizedKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  if (inflight.has(normalizedKey)) {
    return inflight.get(normalizedKey)
  }

  const request = Promise.resolve()
    .then(() => loader())
    .then((value) => {
      if (value != null) {
        cache.set(normalizedKey, {
          value,
          expiresAt: Date.now() + Math.max(ttlMs, 1000),
        })
      }

      inflight.delete(normalizedKey)
      return value
    })
    .catch((error) => {
      inflight.delete(normalizedKey)
      throw error
    })

  inflight.set(normalizedKey, request)
  return request
}

/**
 * Clears cached public page bundles.
 * Supports:
 * - clearPublicPageBundleCache(slug, siteId): clears only that tenant's page
 * - clearPublicPageBundleCache(null, siteId): clears all pages for that tenant
 * - clearPublicPageBundleCache(slug): clears all tenant pages matching that slug
 * - clearPublicPageBundleCache(): clears entire cache
 * @param {string|null} [slug]
 * @param {string|number|null} [siteId]
 * @returns {void}
 */
export function clearPublicPageBundleCache(slug = null, siteId = null) {
  const { cache, inflight } = getCacheStore()

  if (slug && siteId) {
    const specificKey = makePublicPageCacheKey(slug, siteId)
    cache.delete(specificKey)
    inflight.delete(specificKey)
    return
  }

  if (siteId && !slug) {
    const prefix = `site:${String(siteId).trim().toLowerCase()}:`
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key)
      }
    }
    for (const key of inflight.keys()) {
      if (key.startsWith(prefix)) {
        inflight.delete(key)
      }
    }
    return
  }

  if (slug && !siteId) {
    const normSlug = normalizeKey(slug)
    const suffix = `:page:${normSlug}`
    for (const key of cache.keys()) {
      if (key.endsWith(suffix) || key === normSlug) {
        cache.delete(key)
      }
    }
    for (const key of inflight.keys()) {
      if (key.endsWith(suffix) || key === normSlug) {
        inflight.delete(key)
      }
    }
    return
  }

  cache.clear()
  inflight.clear()
}
