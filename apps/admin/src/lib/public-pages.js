import { getOrSetPublicPageCache, makePublicPageCacheKey } from './public-page-cache.js'
import { loadPageRenderBundle } from './services/page-render-service.js'

export async function getPublicPageBundle(slug, options = {}) {
  const siteId = options.siteId ?? null
  const cacheKey = makePublicPageCacheKey(slug, siteId)
  return getOrSetPublicPageCache(cacheKey, () => loadPageRenderBundle(slug, { mode: 'public', siteId }))
}

export async function getPreviewPageBundle(slug, options = {}) {
  return loadPageRenderBundle(slug, {
    mode: 'preview',
    revisionId: options.revisionId ?? null,
    siteId: options.siteId ?? null,
  })
}
