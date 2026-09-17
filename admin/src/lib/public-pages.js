import { getOrSetPublicPageCache } from './public-page-cache.js'
import { loadPageRenderBundle } from './services/page-render-service.js'

export async function getPublicPageBundle(slug) {
  return getOrSetPublicPageCache(slug, () => loadPageRenderBundle(slug, { mode: 'public' }))
}

export async function getPreviewPageBundle(slug, options = {}) {
  return loadPageRenderBundle(slug, {
    mode: 'preview',
    revisionId: options.revisionId ?? null,
  })
}

