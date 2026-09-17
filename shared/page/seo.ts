export type SeoContract = {
  title: string
  description: string
  keywords: string[]
  image: string
  imageId: string | number | null
  canonicalUrl: string
  robots: string
}

export const SeoDefaults: SeoContract = {
  title: '',
  description: '',
  keywords: [],
  image: '',
  imageId: null,
  canonicalUrl: '',
  robots: 'index,follow',
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asString(entry))
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

export function normalizeSeo(input: unknown): SeoContract {
  const source = isObject(input) ? input : {}

  return {
    title: asString(source.title),
    description: asString(source.description),
    keywords: asKeywords(source.keywords),
    image: asString(source.image),
    imageId:
      typeof source.imageId === 'string' || typeof source.imageId === 'number'
        ? source.imageId
        : null,
    canonicalUrl: asString(source.canonicalUrl),
    robots: asString(source.robots, SeoDefaults.robots) || SeoDefaults.robots,
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invalid SEO contract: ${message}`)
  }
}

export function validateSeo(input: unknown): SeoContract {
  assert(isObject(input), '`seo` must be an object')
  assert(typeof input.title === 'string', '`seo.title` must be a string')
  assert(typeof input.description === 'string', '`seo.description` must be a string')
  assert(Array.isArray(input.keywords), '`seo.keywords` must be an array')
  input.keywords.forEach((keyword, index) => {
    assert(typeof keyword === 'string', `seo.keywords[${index}] must be a string`)
  })
  assert(typeof input.image === 'string', '`seo.image` must be a string')
  assert(
    input.imageId === null || typeof input.imageId === 'string' || typeof input.imageId === 'number',
    '`seo.imageId` must be null, string, or number',
  )
  assert(typeof input.canonicalUrl === 'string', '`seo.canonicalUrl` must be a string')
  assert(typeof input.robots === 'string', '`seo.robots` must be a string')

  return input as SeoContract
}
