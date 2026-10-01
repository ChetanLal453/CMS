import {
  normalizeHost,
  resolveSiteFromHost,
  resolveSite,
  resolveSiteFromRequest,
} from '@/lib/services/site-resolver.js'

describe('Multi-Site Hostname Resolution (Phase 3)', () => {
  describe('normalizeHost', () => {
    it('strips port from hostname', () => {
      expect(normalizeHost('curvemetrics.com:3000')).toBe('curvemetrics.com')
      expect(normalizeHost('demo.localhost:8080')).toBe('demo.localhost')
      expect(normalizeHost('127.0.0.1:3001')).toBe('127.0.0.1')
    })

    it('trims whitespace and converts to lowercase', () => {
      expect(normalizeHost('   MyDomain.COM:443  ')).toBe('mydomain.com')
      expect(normalizeHost('Tenant-A.CurveMetrics.COM ')).toBe('tenant-a.curvemetrics.com')
    })

    it('returns empty string for null, undefined, or empty values', () => {
      expect(normalizeHost('')).toBe('')
      expect(normalizeHost(null as any)).toBe('')
      expect(normalizeHost(undefined as any)).toBe('')
    })
  })

  describe('resolveSiteFromHost with connection mocking', () => {
    const mockConnection = {
      query: jest.fn(),
    }

    beforeEach(() => {
      jest.clearAllMocks()
      mockConnection.query.mockResolvedValue([[]])
    })

    it('resolves site by exact domain match', async () => {
      const mockSite = {
        id: 1,
        name: 'CurveMetrics',
        slug: 'curvemetrics',
        domain: 'curvemetrics.com',
        status: 'live',
      }

      mockConnection.query.mockResolvedValueOnce([[mockSite]])

      const site = await resolveSiteFromHost('curvemetrics.com:3000', mockConnection as any)
      expect(site).toEqual(mockSite)
      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE LOWER(domain) = ?'),
        ['curvemetrics.com'],
      )
    })

    it('resolves site by subdomain slug if domain does not match directly', async () => {
      const mockTenantB = {
        id: 2,
        name: 'Tenant B Services',
        slug: 'tenant-b',
        domain: 'tenant-b.com',
        status: 'live',
      }

      // First query for domain fails (empty rows)
      mockConnection.query.mockResolvedValueOnce([[]])
      // Second query for subdomain slug succeeds
      mockConnection.query.mockResolvedValueOnce([[mockTenantB]])

      const site = await resolveSiteFromHost('tenant-b.curvemetrics.com:3000', mockConnection as any)
      expect(site).toEqual(mockTenantB)
      expect(mockConnection.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('WHERE LOWER(slug) = ?'),
        ['tenant-b'],
      )
    })

    it('falls back to default site for generic localhost requests', async () => {
      const defaultSite = {
        id: 1,
        name: 'CurveMetrics',
        slug: 'curvemetrics',
        domain: 'curvemetrics.com',
        status: 'live',
      }

      // Exact domain check fails
      mockConnection.query.mockResolvedValueOnce([[]])
      // Fallback query for default site succeeds
      mockConnection.query.mockResolvedValueOnce([[defaultSite]])

      const site = await resolveSiteFromHost('localhost:3001', mockConnection as any)
      expect(site).toEqual(defaultSite)
      expect(mockConnection.query).toHaveBeenLastCalledWith(
        expect.stringContaining('ORDER BY id ASC LIMIT 1'),
      )
    })

    it('returns null when host is unknown and not localhost (enforcing tenant isolation)', async () => {
      // Domain lookup fails
      mockConnection.query.mockResolvedValueOnce([[]])
      // Subdomain lookup fails
      mockConnection.query.mockResolvedValueOnce([[]])

      const site = await resolveSiteFromHost('unknown-client-site.com', mockConnection as any)
      expect(site).toBeNull()
    })
  })

  describe('resolveSiteFromRequest (strict tenant isolation)', () => {
    const mockConnection = {
      query: jest.fn(),
    }

    beforeEach(() => {
      jest.clearAllMocks()
      mockConnection.query.mockResolvedValue([[]])
    })

    it('resolves site from explicit siteId query parameter', async () => {
      const mockSite = { id: 2, name: 'Client Two', slug: 'client-two' }
      mockConnection.query.mockResolvedValueOnce([[mockSite]])

      const req = new Request('http://localhost:3000/api/page/home?siteId=2')
      const result = await resolveSiteFromRequest(req, mockConnection as any)

      expect(result.siteId).toBe(2)
      expect(result.site).toEqual(mockSite)
    })

    it('flags unknown explicit siteId as -1 to prevent leaking default site data', async () => {
      mockConnection.query.mockResolvedValueOnce([[]])

      const req = new Request('http://localhost:3000/api/page/home?siteId=999')
      const result = await resolveSiteFromRequest(req, mockConnection as any)

      expect(result.siteId).toBe(999)
      expect(result.site).toBeNull()
    })

    it('resolves site from x-site-id header', async () => {
      const mockSite = { id: 3, name: 'Client Three', slug: 'client-three' }
      mockConnection.query.mockResolvedValueOnce([[mockSite]])

      const req = new Request('http://localhost:3000/api/page/home', {
        headers: { 'x-site-id': '3' },
      })
      const result = await resolveSiteFromRequest(req, mockConnection as any)

      expect(result.siteId).toBe(3)
      expect(result.site).toEqual(mockSite)
    })

    it('resolves site from x-forwarded-host header', async () => {
      const mockSite = { id: 1, name: 'CurveMetrics', domain: 'curvemetrics.com' }
      mockConnection.query.mockResolvedValueOnce([[mockSite]])

      const req = new Request('http://localhost:3000/api/page/home', {
        headers: { 'x-forwarded-host': 'curvemetrics.com:3001' },
      })
      const result = await resolveSiteFromRequest(req, mockConnection as any)

      expect(result.siteId).toBe(1)
      expect(result.site).toEqual(mockSite)
    })
  })
})
