import { getPageById, getPageBySlug } from '@/lib/repositories/page-repository.js'
import { resolveSiteFromHost, resolveSiteFromRequest } from '@/lib/services/site-resolver.js'
import { loadPageRenderSource } from '@/lib/services/page-render-service.js'
import {
  getOrSetPublicPageCache,
  clearPublicPageBundleCache,
  makePublicPageCacheKey,
} from '@/lib/public-page-cache.js'
import pool from '@/lib/db.js'

// Mock database connection for pool
jest.mock('@/lib/db.js', () => ({
  query: jest.fn(),
  execute: jest.fn(),
  getConnection: jest.fn(),
}))

// Mock crud helper
jest.mock('../../src/app/api/_utils/crud.js', () => ({
  getExistingColumns: jest.fn().mockImplementation(async (table, requested) => {
    const allCols: Record<string, string[]> = {
      pages: [
        'id', 'slug', 'title', 'name', 'status', 'disabled',
        'header_slug', 'footer_slug', 'banner_slug',
        'header_id', 'footer_id', 'banner_id',
        'meta_title', 'meta_description', 'meta_image', 'meta_image_id',
        'site_id', 'published_at', 'updated_at',
        'current_revision_id', 'published_revision_id',
      ],
      page_revisions: ['id', 'page_id', 'revision_number', 'revision_type', 'layout_json', 'created_by', 'created_at'],
      headers: ['id', 'slug', 'name', 'logo', 'logo_dark', 'cta_label', 'cta_link', 'is_sticky', 'bg_color', 'settings', 'site_id'],
      footers: ['id', 'slug', 'name', 'columns', 'copyright', 'social_links', 'bg_color', 'settings', 'site_id'],
      banners: ['id', 'slug', 'name', 'content', 'is_active', 'site_id'],
      sites: ['id', 'name', 'slug', 'domain', 'status', 'created_at', 'updated_at'],
    }
    const cols = allCols[table] || ['id', 'name', 'slug', 'site_id']
    if (requested) {
      return requested.filter((c: string) => cols.includes(c))
    }
    return cols
  }),
  tableExists: jest.fn().mockResolvedValue(true),
  parseJsonValue: jest.fn((val, fallback) => {
    try {
      return typeof val === 'string' ? JSON.parse(val) : (val ?? fallback)
    } catch {
      return fallback
    }
  }),
}))

describe('Two-Site Adversarial Multi-Tenant Security Audit (Phase 3.1)', () => {
  const siteA = {
    id: 1,
    name: 'Tenant Alpha Corp',
    slug: 'site-a',
    domain: 'site-a.test',
    status: 'live',
  }

  const siteB = {
    id: 2,
    name: 'Tenant Beta Solutions',
    slug: 'site-b',
    domain: 'site-b.test',
    status: 'live',
  }

  const siteAPageAbout = {
    id: 101,
    site_id: 1,
    slug: 'about',
    title: 'About Tenant Alpha',
    name: 'About Alpha',
    status: 'published',
    current_revision_id: 201,
    published_revision_id: 201,
  }

  const siteBPageAbout = {
    id: 202,
    site_id: 2,
    slug: 'about',
    title: 'About Tenant Beta',
    name: 'About Beta',
    status: 'published',
    current_revision_id: 302,
    published_revision_id: 302,
  }

  const siteARevision = {
    id: 201,
    page_id: 101,
    revision_number: 1,
    revision_type: 'published',
    layout_json: { sections: [{ id: 'sec-alpha', name: 'Alpha Hero' }] },
  }

  const siteBRevision = {
    id: 302,
    page_id: 202,
    revision_number: 1,
    revision_type: 'published',
    layout_json: { sections: [{ id: 'sec-beta', name: 'Beta Hero' }] },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    clearPublicPageBundleCache()
    ;(pool.query as jest.Mock).mockResolvedValue([[]])
    ;(pool.execute as jest.Mock).mockResolvedValue([[]])
  })

  // ATTACK 1: Unknown Hostname -> 404 / site not found
  it('Attack 1: Unknown Hostname returns null / site not found (never falls back to primary tenant)', async () => {
    const site = await resolveSiteFromHost('malicious-or-unknown.com', pool, { requireLive: true })
    expect(site).toBeNull()

    const req = new Request('http://localhost:3000/api/page/about', {
      headers: { 'x-forwarded-host': 'malicious-or-unknown.com' },
    })
    const resolution = await resolveSiteFromRequest(req, pool, { mode: 'public' })
    expect(resolution.site).toBeNull()
    expect(resolution.siteId).toBe(-1)
  })

  // ATTACK 2: Site A context + Site B page ID -> inaccessible
  it('Attack 2: Site A context querying Site B page ID is blocked and returns null', async () => {
    const page = await getPageById(202, { siteId: siteA.id, connection: pool })
    expect(page).toBeNull()

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('id = ? AND site_id = ?'),
      [202, siteA.id],
    )
  })

  // ATTACK 3: Site A context + Site B revision ID -> inaccessible
  it('Attack 3: Site A context attempting to preview Site B revision ID fails closed', async () => {
    // Mock getPageBySlug returning Site A's page, but revision query returning Site B's revision
    ;(pool.query as jest.Mock)
      .mockResolvedValueOnce([[siteAPageAbout]]) // getPageBySlug
      .mockResolvedValueOnce([[siteBRevision]]) // getRevisionById(302)

    const source = await loadPageRenderSource('about', {
      mode: 'preview',
      revisionId: siteBRevision.id,
      siteId: siteA.id,
    })

    // Revision should be rejected because page_id (202) !== page.id (101)
    expect(source?.revision).toBeNull()
  })

  // ATTACK 4: Site A context + same slug -> only Site A record returned
  it('Attack 4: Same slug ("about") under Site A returns only Site A record, never Site B', async () => {
    ;(pool.query as jest.Mock).mockResolvedValueOnce([[siteAPageAbout]])

    const pageA = await getPageBySlug('about', { siteId: siteA.id, connection: pool })
    expect(pageA).toEqual(siteAPageAbout)
    expect(pageA?.title).toBe('About Tenant Alpha')
    expect(pageA?.site_id).toBe(1)

    ;(pool.query as jest.Mock).mockResolvedValueOnce([[siteBPageAbout]])

    const pageB = await getPageBySlug('about', { siteId: siteB.id, connection: pool })
    expect(pageB).toEqual(siteBPageAbout)
    expect(pageB?.title).toBe('About Tenant Beta')
    expect(pageB?.site_id).toBe(2)
  })

  // ATTACK 5: Missing site context -> fails closed (never executes unscoped query)
  it('Attack 5: Missing site context fails closed and does not query database', async () => {
    const page = await getPageBySlug('about', pool)
    expect(page).toBeNull()
    expect(pool.query).not.toHaveBeenCalled()
  })

  // ATTACK 6: Manipulated query ?siteId= cannot bypass public hostname trust boundary
  it('Attack 6: Attacker sending ?siteId=2 on site-a.test cannot hijack tenant context in public mode', async () => {
    // In public mode, Host header site-a.test resolves to Site A (id: 1)
    ;(pool.query as jest.Mock).mockResolvedValueOnce([[siteA]])

    const req = new Request('http://site-a.test/api/page/about?siteId=2', {
      headers: { host: 'site-a.test' },
    })

    const resolution = await resolveSiteFromRequest(req, pool, { mode: 'public' })
    // Host takes precedence in public mode; client cannot spoof tenant via query param
    expect(resolution.siteId).toBe(siteA.id)
    expect(resolution.site?.slug).toBe('site-a')
  })

  // ATTACK 7: Manipulated x-site-id header cannot bypass public trust boundary
  it('Attack 7: Attacker sending x-site-id: 2 on site-a.test cannot hijack tenant context in public mode', async () => {
    ;(pool.query as jest.Mock).mockResolvedValueOnce([[siteA]])

    const req = new Request('http://site-a.test/api/page/about', {
      headers: {
        host: 'site-a.test',
        'x-site-id': '2',
      },
    })

    const resolution = await resolveSiteFromRequest(req, pool, { mode: 'public' })
    expect(resolution.siteId).toBe(siteA.id)
    expect(resolution.site?.slug).toBe('site-a')
  })

  // ATTACK 8: Missing Site A footer must not return Site B footer
  it('Attack 8: Missing Site A footer returns null and NEVER falls back to Site B footer', async () => {
    ;(pool.query as jest.Mock).mockResolvedValueOnce([[siteAPageAbout]]) // page found

    const source = await loadPageRenderSource('about', {
      mode: 'public',
      siteId: siteA.id,
    })

    expect(source?.footer).toBeNull()
    // Verify unscoped fallback query was NOT executed
    const executeCalls = (pool.execute as jest.Mock).mock.calls.map((c) => c[0])
    for (const sql of executeCalls) {
      if (typeof sql === 'string' && sql.includes('FROM footers')) {
        expect(sql).toContain('site_id = ?')
      }
    }
  })

  // ATTACK 9: Cache same slug for A and B -> separate entries, zero cache leakage
  it('Attack 9: Caching /about for Site A does NOT poison or satisfy cache for Site B', async () => {
    const keyA = makePublicPageCacheKey('about', siteA.id)
    const keyB = makePublicPageCacheKey('about', siteB.id)

    expect(keyA).toBe('site:1:page:about')
    expect(keyB).toBe('site:2:page:about')
    expect(keyA).not.toBe(keyB)

    const bundleA = { success: true, site: 'Alpha', content: 'Alpha Exclusive' }
    const bundleB = { success: true, site: 'Beta', content: 'Beta Exclusive' }

    await getOrSetPublicPageCache(keyA, async () => bundleA)
    await getOrSetPublicPageCache(keyB, async () => bundleB)

    const cachedA = await getOrSetPublicPageCache(keyA, async () => ({ shouldNotRun: true }))
    const cachedB = await getOrSetPublicPageCache(keyB, async () => ({ shouldNotRun: true }))

    expect(cachedA).toEqual(bundleA)
    expect(cachedB).toEqual(bundleB)
    expect(cachedA).not.toEqual(cachedB)
  })

  // ATTACK 10: Publishing Site A page leaves Site B public cached result intact
  it('Attack 10: Publishing/clearing Site A /about preserves Site B cached /about', async () => {
    const keyA = makePublicPageCacheKey('about', siteA.id)
    const keyB = makePublicPageCacheKey('about', siteB.id)

    await getOrSetPublicPageCache(keyA, async () => ({ site: 'Alpha' }))
    await getOrSetPublicPageCache(keyB, async () => ({ site: 'Beta' }))

    // Site A publishes /about -> invalidates only Site A
    clearPublicPageBundleCache('about', siteA.id)

    // Site A cache is now empty and calls loader
    const refreshedA = await getOrSetPublicPageCache(keyA, async () => ({ site: 'Alpha Fresh' }))
    expect(refreshedA).toEqual({ site: 'Alpha Fresh' })

    // Site B cache was NOT cleared and returns cached Beta without calling loader
    const cachedB = await getOrSetPublicPageCache(keyB, async () => ({ shouldNotBeCalled: true }))
    expect(cachedB).toEqual({ site: 'Beta' })
  })
})
