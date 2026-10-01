'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type SiteItem = {
  id: number
  name: string
  slug: string
  domain: string
  status: 'live' | 'draft'
  pagesCount: number
  livePagesCount: number
  draftPagesCount: number
  leadsCount: number
  lastEdited: string
}

type DashboardStats = {
  totalWebsites: number
  liveWebsites: number
  draftWebsites: number
  totalLeads: number
  totalMediaFiles: number
  storageUsedBytes: number
  storageUsedFormatted: string
  storageLimitFormatted: string
  systemHealth: string
}

function timeAgo(dateString?: string) {
  if (!dateString) return 'recently'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'recently'
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

const SITE_ACCENT_COLORS = [
  '#378ADD', // Blue
  '#D85A30', // Orange
  '#639922', // Green
  '#7F77DD', // Purple
  '#BA7517', // Gold
  '#D4537E', // Pink
]

export default function DashboardPage() {
  const router = useRouter()
  const [sites, setSites] = useState<SiteItem[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State for New Site
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSiteName, setNewSiteName] = useState('')
  const [newSiteSlug, setNewSiteSlug] = useState('')
  const [newSiteDomain, setNewSiteDomain] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')

  async function loadDashboardData() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/sites', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load sites')
      }
      setSites(data.sites || [])
      setStats(data.stats || null)
    } catch (err: any) {
      setError(err.message || 'Could not load sites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboardData()
  }, [])

  const filteredSites = useMemo(() => {
    if (!searchQuery.trim()) return sites
    const q = searchQuery.toLowerCase()
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q)
    )
  }, [sites, searchQuery])

  async function handleCreateSite(e: React.FormEvent) {
    e.preventDefault()
    if (!newSiteName.trim()) {
      setModalError('Site name is required.')
      return
    }

    setIsSubmitting(true)
    setModalError('')
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newSiteName.trim(),
          slug: newSiteSlug.trim() || undefined,
          domain: newSiteDomain.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create site')
      }

      // Reset and reload
      setIsModalOpen(false)
      setNewSiteName('')
      setNewSiteSlug('')
      setNewSiteDomain('')
      await loadDashboardData()
    } catch (err: any) {
      setModalError(err.message || 'Failed to create site')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dash-container">
      {/* Page Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">All sites</h1>
          <p className="dash-subtitle">
            {loading ? 'Loading client websites...' : `${sites.length} client website${sites.length === 1 ? '' : 's'} under management`}
          </p>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total websites</div>
          <div className="kpi-value">{loading ? '...' : (stats?.totalWebsites ?? sites.length)}</div>
          <div className="kpi-subtext">
            {loading ? '...' : `${stats?.liveWebsites ?? 0} live, ${stats?.draftWebsites ?? 0} draft`}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total leads</div>
          <div className="kpi-value">{loading ? '...' : (stats?.totalLeads ?? 0)}</div>
          <div className="kpi-subtext text-ok">
            {stats?.totalLeads ? `+${stats.totalLeads} this month` : 'All forms connected'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Cloud storage</div>
          <div className="kpi-value">
            {loading ? '...' : stats?.storageUsedFormatted || '0 B'}
          </div>
          <div className="kpi-subtext">of {stats?.storageLimitFormatted || '10 GB'} used</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">System health</div>
          <div className="kpi-value text-ok">
            {loading ? '...' : stats?.systemHealth || '100%'}
          </div>
          <div className="kpi-subtext text-ok">SSL active on all</div>
        </div>
      </div>

      {/* Search & Action Row */}
      <div className="action-row">
        <div className="search-wrap">
          <svg className="search-ic" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn-new-site" onClick={() => setIsModalOpen(true)}>
          <span style={{ fontSize: '15px' }}>+</span> New site
        </button>
      </div>

      {error ? <div className="error-banner">{error}</div> : null}

      {/* Sites Grid */}
      <div className="sites-grid">
        {filteredSites.map((site, index) => {
          const accentColor = SITE_ACCENT_COLORS[index % SITE_ACCENT_COLORS.length]
          const isLive = site.status === 'live'

          return (
            <div key={site.id} className="site-card">
              <div className="card-top">
                <div className="card-identity">
                  <div className="site-icon-box" style={{ background: accentColor }}>
                    {site.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="site-name">{site.name}</h3>
                </div>
                <span className={`status-pill ${isLive ? 'live' : 'draft'}`}>
                  {isLive ? 'Live' : 'Draft'}
                </span>
              </div>

              <div className="card-meta">
                <div className="meta-line domain">{site.domain}</div>
                <div className="meta-line details">
                  {site.pagesCount} page{site.pagesCount === 1 ? '' : 's'}, {site.leadsCount} lead{site.leadsCount === 1 ? '' : 's'}
                </div>
                <div className="meta-line time">Edited {timeAgo(site.lastEdited)}</div>
              </div>

              <div className="card-actions">
                <Link href={`/content?site=${site.slug}`} className="btn-card secondary">
                  Edit content
                </Link>
                <Link href={`/workspace/${site.slug}`} className="btn-card primary">
                  Open workspace
                </Link>
              </div>
            </div>
          )
        })}

        {/* Add New Site Card */}
        <div className="site-card add-card" onClick={() => setIsModalOpen(true)}>
          <div className="add-inner">
            <div className="add-plus">+</div>
            <div className="add-text">Add new site</div>
          </div>
        </div>
      </div>

      {/* New Site Modal */}
      {isModalOpen ? (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create New Client Website</h2>
            <p className="modal-desc">Add a new client website to manage content and visual pages.</p>

            {modalError ? <div className="modal-err">{modalError}</div> : null}

            <form onSubmit={handleCreateSite}>
              <div className="form-group">
                <label>Website / Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Dental Clinic"
                  value={newSiteName}
                  onChange={(e) => {
                    setNewSiteName(e.target.value)
                    if (!newSiteSlug) {
                      setNewSiteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Site Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. apex-dental"
                  value={newSiteSlug}
                  onChange={(e) => setNewSiteSlug(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. apexdental.com"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .dash-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
          color: #e9e7d8;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dash-header {
          margin-bottom: 1.5rem;
        }

        .dash-title {
          font-size: 24px;
          font-weight: 600;
          color: #f4f2ea;
          margin: 0 0 4px;
          letter-spacing: -0.02em;
        }

        .dash-subtitle {
          font-size: 13.5px;
          color: #8b8a78;
          margin: 0;
        }

        /* 4 KPI Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 1.5rem;
        }

        .kpi-card {
          background: #171914;
          border: 1px solid rgba(230, 228, 214, 0.08);
          border-radius: 12px;
          padding: 1.1rem 1.2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .kpi-label {
          font-size: 12px;
          color: #8b8a78;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .kpi-value {
          font-size: 26px;
          font-weight: 700;
          color: #f4f2ea;
          margin-bottom: 4px;
          letter-spacing: -0.02em;
        }

        .kpi-subtext {
          font-size: 12px;
          color: #8b8a78;
        }

        .text-ok {
          color: #5db975 !important;
        }

        /* Search & Action Row */
        .action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 1.5rem;
        }

        .search-wrap {
          position: relative;
          flex: 1;
          max-width: 320px;
        }

        .search-ic {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 14px;
          height: 14px;
          color: #74735f;
        }

        .search-input {
          width: 100%;
          background: #171914;
          border: 1px solid rgba(230, 228, 214, 0.1);
          border-radius: 9px;
          padding: 8px 12px 8px 34px;
          color: #f4f2ea;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .search-input:focus {
          border-color: #c98a4b;
        }

        .search-input::placeholder {
          color: #5f5e4f;
        }

        .btn-new-site {
          background: #c98a4b;
          color: #0d0f0c;
          border: none;
          border-radius: 9px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.15s ease;
        }

        .btn-new-site:hover {
          background: #db9c5d;
        }

        /* Sites Grid */
        .sites-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .site-card {
          background: #171914;
          border: 1px solid rgba(230, 228, 214, 0.08);
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 200px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .site-card:hover {
          border-color: rgba(230, 228, 214, 0.18);
          transform: translateY(-2px);
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .card-identity {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .site-icon-box {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .site-name {
          font-size: 15px;
          font-weight: 600;
          color: #f4f2ea;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-pill {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: capitalize;
        }

        .status-pill.live {
          background: rgba(93, 185, 117, 0.14);
          color: #79d090;
        }

        .status-pill.draft {
          background: rgba(201, 138, 75, 0.15);
          color: #d9a86b;
        }

        .card-meta {
          margin-bottom: 1.2rem;
        }

        .meta-line.domain {
          font-size: 12.5px;
          color: #a9a894;
          margin-bottom: 4px;
          font-family: ui-monospace, Menlo, monospace;
        }

        .meta-line.details {
          font-size: 12px;
          color: #74735f;
          margin-bottom: 4px;
        }

        .meta-line.time {
          font-size: 11.5px;
          color: #5f5e4f;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: auto;
        }

        .btn-card {
          flex: 1;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          padding: 7px 10px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .btn-card.secondary {
          background: rgba(230, 228, 214, 0.05);
          color: #e9e7d8;
          border: 1px solid rgba(230, 228, 214, 0.1);
        }

        .btn-card.secondary:hover {
          background: rgba(230, 228, 214, 0.1);
          color: #ffffff;
        }

        .btn-card.primary {
          background: rgba(201, 138, 75, 0.12);
          color: #e5b37e;
          border: 1px solid rgba(201, 138, 75, 0.3);
        }

        .btn-card.primary:hover {
          background: rgba(201, 138, 75, 0.22);
          color: #f7cb9b;
        }

        /* Add Card (Dashed) */
        .add-card {
          border: 1px dashed rgba(230, 228, 214, 0.15);
          background: rgba(23, 25, 20, 0.4);
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .add-card:hover {
          border-color: #c98a4b;
          background: rgba(201, 138, 75, 0.04);
        }

        .add-inner {
          text-align: center;
          color: #74735f;
        }

        .add-plus {
          font-size: 26px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .add-text {
          font-size: 13px;
          font-weight: 500;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-box {
          background: #171914;
          border: 1px solid rgba(230, 228, 214, 0.15);
          border-radius: 14px;
          padding: 1.5rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #f4f2ea;
          margin: 0 0 6px;
        }

        .modal-desc {
          font-size: 13px;
          color: #8b8a78;
          margin: 0 0 1.2rem;
        }

        .modal-err {
          background: rgba(217, 112, 112, 0.15);
          color: #f87171;
          border: 1px solid rgba(217, 112, 112, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12.5px;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          color: #a9a894;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          background: #0f110c;
          border: 1px solid rgba(230, 228, 214, 0.12);
          border-radius: 8px;
          padding: 8px 12px;
          color: #f4f2ea;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }

        .form-group input:focus {
          border-color: #c98a4b;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 1.5rem;
        }

        .btn-cancel {
          background: transparent;
          border: 1px solid rgba(230, 228, 214, 0.15);
          color: #a9a894;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }

        .btn-submit {
          background: #c98a4b;
          border: none;
          color: #0d0f0c;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-banner {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.2);
          color: #f87171;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 13px;
        }

        @media (max-width: 960px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .sites-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .kpi-grid,
          .sites-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
