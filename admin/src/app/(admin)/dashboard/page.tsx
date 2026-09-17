'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ModuleShell from '@/components/admin/ModuleShell'
import MetricCard from '@/components/admin/MetricCard'

type PageItem = {
  id: number
  name: string
  label: string
  url: string
  status: 'live' | 'draft'
}

type MediaItem = {
  id: string
  filename: string
  url: string
  uploaded_at?: string | null
}

type NavItem = {
  id: number
  label: string
  url: string
  children?: NavItem[]
}

export default function DashboardPage() {
  const [pages, setPages] = useState<PageItem[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [navigation, setNavigation] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      setLoading(true)
      setError('')
      try {
        const [pagesRes, mediaRes, navRes] = await Promise.all([
          fetch('/api/pages', { credentials: 'include' }),
          fetch('/api/media/list', { credentials: 'include' }),
          fetch('/api/navigation', { credentials: 'include' }),
        ])

        const [pagesData, mediaData, navData] = await Promise.all([pagesRes.json(), mediaRes.json(), navRes.json()])
        console.log('API RESPONSE:', pagesData)

        if (!pagesRes.ok || !mediaRes.ok || !navRes.ok) {
          throw new Error(pagesData.error || mediaData.error || navData.error || 'Failed to load dashboard data')
        }

        if (!active) {
          return
        }

        const nextPages = Array.isArray(pagesData?.pages) ? pagesData.pages : []
        const nextTotal = typeof pagesData?.total === 'number' ? pagesData.total : nextPages.length

        setPages(nextPages)
        setTotalPages(nextTotal)
        setMedia(Array.isArray(mediaData.media) ? mediaData.media : [])
        setNavigation(Array.isArray(navData.items) ? navData.items : [])
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard data')
          setPages([])
          setTotalPages(0)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [])

  const livePages = useMemo(() => pages.filter((page) => page.status === 'live'), [pages])
  const draftPages = useMemo(() => pages.filter((page) => page.status === 'draft'), [pages])
  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => Number(b?.id ?? 0) - Number(a?.id ?? 0)),
    [pages],
  )
  const totalNavItems = useMemo(() => {
    const countItems = (items: NavItem[]): number => items.reduce((total, item) => total + 1 + countItems(item.children || []), 0)
    return countItems(navigation)
  }, [navigation])

  const metrics = [
    {
      label: 'Total Pages',
      value: loading ? '...' : totalPages,
      valueColor: 'var(--pu)',
      chips: (
        <>
          <span className="kpi-chip up">Live {livePages.length}</span>
          <span>Draft {draftPages.length}</span>
        </>
      ),
    },
    {
      label: 'Media Files',
      value: loading ? '...' : media.length,
      valueColor: 'var(--gr)',
      chips: (
        <>
          <span className="kpi-chip good">Library</span>
          <span>DB-backed</span>
        </>
      ),
    },
    {
      label: 'Navigation Items',
      value: loading ? '...' : totalNavItems,
      valueColor: 'var(--am)',
      chips: <span>{navigation.length} top-level</span>,
    },
    {
      label: 'Status',
      value: error ? 'Error' : loading ? '...' : 'Ready',
      valueColor: 'var(--rd)',
      chips: <span className={`kpi-chip ${error ? 'bad' : 'good'}`}>{error ? 'Needs attention' : 'Connected'}</span>,
    },
  ]

  return (
    <ModuleShell
      className="dash"
      title="Dashboard"
      description="A quick snapshot of pages, leads, media usage, and system health."
      actions={(
        <Link className="gbtn pu" href="/page-editor">
          Open Page Editor
        </Link>
      )}>
      <div className="dash-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} valueColor={metric.valueColor} chips={metric.chips} />
        ))}
      </div>

      {error ? <div className="dcard" style={{ color: 'var(--rd)' }}>{error}</div> : null}

      <div className="dash-3col">
        <div className="dcard">
          <div className="dcard-h">Pages <span>Live data</span></div>
          {(loading ? [] : sortedPages.slice(0, 6)).map((page) => (
            <div key={page.id} className="dash-page-row">
              <div className="dash-page-main">
                <span className={`dash-page-dot ${page.status === 'live' ? 'is-live' : 'is-draft'}`} />
                <div>
                  <div className="feed-t">{page.label || page.name}</div>
                  <div className="feed-m">{page.url}</div>
                </div>
              </div>
              <span className={`nm-badge ${page.status === 'live' ? 'badge-live' : 'badge-draft'}`}>
                {page.status === 'live' ? 'Live' : 'Draft'}
              </span>
            </div>
          ))}
          {!loading && !pages.length ? <div className="feed-m">No pages found.</div> : null}
        </div>

        <div className="dcard">
          <div className="dcard-h">Media <span>Newest files</span></div>
          {(loading ? [] : media.slice(0, 6)).map((item) => (
            <div key={item.id} className="leads-row"><span className="lead-status" style={{ background: 'var(--gr)' }} /><div><div className="feed-t">{item.filename}</div><div className="feed-m">{item.url}</div></div></div>
          ))}
          {!loading && !media.length ? <div className="feed-m">No media found.</div> : null}
        </div>

        <div className="dcard">
          <div className="dcard-h">Navigation <span>Nested tree</span></div>
          {(loading ? [] : navigation).map((item) => (
            <div key={item.id} className="feed">
              <div className="feed-ic" style={{ background: 'var(--pud)' }}>{item.children?.length ? '▾' : '•'}</div>
              <div>
                <div className="feed-t">{item.label}</div>
                <div className="feed-m">{item.url}</div>
                {item.children?.length ? <div className="feed-m">{item.children.length} child item(s)</div> : null}
              </div>
            </div>
          ))}
          {!loading && !navigation.length ? <div className="feed-m">No navigation configured.</div> : null}
        </div>
      </div>

      <style jsx>{`
        .nm-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 64px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
        }

        .badge-live {
          background: var(--grd);
          color: var(--grl);
        }

        .badge-draft {
          background: var(--amd);
          color: var(--aml);
        }

        .dash-page-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--b1);
          transition: background 0.18s ease;
        }

        .dash-page-row:last-child {
          border-bottom: none;
        }

        .dash-page-row:hover {
          background: rgba(124, 92, 252, 0.04);
        }

        .dash-page-main {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .dash-page-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          flex-shrink: 0;
        }

        .dash-page-dot.is-live {
          background: var(--gr);
          box-shadow: 0 0 0 4px var(--grd);
        }

        .dash-page-dot.is-draft {
          background: var(--am);
          box-shadow: 0 0 0 4px var(--amd);
        }
      `}</style>
    </ModuleShell>
  )
}
