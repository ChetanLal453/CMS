import {
  getPageById,
  getPageBySlug,
  getPageByIdSystem,
  getPageBySlugSystem,
} from '@/lib/repositories/page-repository.js'

// Mock getExistingColumns so it doesn't query MySQL information_schema
jest.mock('../../src/app/api/_utils/crud.js', () => ({
  getExistingColumns: jest.fn().mockImplementation(async (table, requested) => {
    const allCols = [
      'id', 'slug', 'title', 'name', 'status', 'disabled',
      'header_slug', 'footer_slug', 'banner_slug',
      'header_id', 'footer_id', 'banner_id',
      'meta_title', 'meta_description', 'meta_image', 'meta_image_id',
      'site_id', 'published_at', 'updated_at',
      'current_revision_id', 'published_revision_id',
    ]
    if (requested) {
      return requested.filter((c: string) => allCols.includes(c))
    }
    return allCols
  }),
  tableExists: jest.fn().mockResolvedValue(true),
  parseJsonValue: jest.fn((val, fallback) => {
    try {
      return JSON.parse(val)
    } catch {
      return fallback
    }
  }),
}))

describe('Multi-Site Tenant Isolation (Phase 3.1)', () => {
  const mockConnection = {
    query: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPageById fail-closed site scoping', () => {
    it('appends site_id constraint when siteId is provided', async () => {
      const mockPage = { id: 10, title: 'Home', site_id: 1 }
      mockConnection.query.mockResolvedValueOnce([[mockPage]])

      const page = await getPageById(10, { siteId: 1, connection: mockConnection })

      expect(page).toEqual(mockPage)
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('id = ? AND site_id = ?'),
        [10, 1],
      )
    })

    it('fails closed (returns null without querying) when siteId is missing', async () => {
      const page = await getPageById(10, mockConnection as any)

      expect(page).toBeNull()
      expect(mockConnection.query).not.toHaveBeenCalled()
    })

    it('allows unscoped lookup only when allowUnscoped: true is explicitly declared', async () => {
      const mockPage = { id: 10, title: 'System Page', site_id: 1 }
      mockConnection.query.mockResolvedValueOnce([[mockPage]])

      const page = await getPageByIdSystem(10, mockConnection as any)

      expect(page).toEqual(mockPage)
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('id = ?'),
        [10],
      )
    })
  })

  describe('getPageBySlug fail-closed site scoping and cross-tenant isolation', () => {
    it('scopes page lookup by slug and site_id', async () => {
      const site1Home = { id: 1, slug: 'home', title: 'Site 1 Home', site_id: 1 }
      mockConnection.query.mockResolvedValueOnce([[site1Home]])

      const page = await getPageBySlug('home', { siteId: 1, connection: mockConnection })

      expect(page).toEqual(site1Home)
      const [sql, params] = mockConnection.query.mock.calls[0]
      expect(sql).toContain('site_id = ?')
      expect(params).toContain(1)
    })

    it('enforces isolation: returns null when page belongs to Site 1 but queried under Site 2', async () => {
      // Database returns empty array because site_id = 2 does not have 'exclusive-promo'
      mockConnection.query.mockResolvedValueOnce([[]])

      const page = await getPageBySlug('exclusive-promo', { siteId: 2, connection: mockConnection })

      expect(page).toBeNull()
      const [sql, params] = mockConnection.query.mock.calls[0]
      expect(sql).toContain('site_id = ?')
      expect(params).toContain(2)
    })

    it('fails closed (returns null without querying) when siteId is missing or invalid', async () => {
      const page = await getPageBySlug('about', mockConnection as any)

      expect(page).toBeNull()
      expect(mockConnection.query).not.toHaveBeenCalled()
    })

    it('allows explicit system lookup only via getPageBySlugSystem', async () => {
      const defaultPage = { id: 5, slug: 'about', title: 'About Us' }
      mockConnection.query.mockResolvedValueOnce([[defaultPage]])

      const page = await getPageBySlugSystem('about', mockConnection as any)

      expect(page).toEqual(defaultPage)
      const [sql] = mockConnection.query.mock.calls[0]
      expect(sql).not.toContain('site_id = ?')
    })
  })
})
