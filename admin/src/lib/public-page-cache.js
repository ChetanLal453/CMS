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

export function clearPublicPageBundleCache(key) {
  const { cache, inflight } = getCacheStore()

  if (key) {
    const normalizedKey = normalizeKey(key)
    cache.delete(normalizedKey)
    inflight.delete(normalizedKey)
    return
  }

  cache.clear()
  inflight.clear()
}
