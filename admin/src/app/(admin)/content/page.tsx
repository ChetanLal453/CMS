'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ModuleShell from '@/components/admin/ModuleShell'
import MetricCard from '@/components/admin/MetricCard'

type ContentBucket = {
  key: string
  title: string
  description: string
  href: string
  endpoint: string
  listKey: string
  primaryAction: string
}

const contentBuckets: ContentBucket[] = [
  {
    key: 'blog',
    title: 'Blogs',
    description: 'Articles, news, and long-form content.',
    href: '/content/blog',
    endpoint: '/api/blog',
    listKey: 'posts',
    primaryAction: 'Write post',
  },
  {
    key: 'faqs',
    title: 'FAQs',
    description: 'Frequently asked questions and answers.',
    href: '/content/faqs',
    endpoint: '/api/faqs',
    listKey: 'faqs',
    primaryAction: 'Add FAQ',
  },
  {
    key: 'gallery',
    title: 'Gallery',
    description: 'Portfolio images and visual sections.',
    href: '/content/gallery',
    endpoint: '/api/gallery',
    listKey: 'gallery',
    primaryAction: 'Add image',
  },
  {
    key: 'stats',
    title: 'Stats',
    description: 'Numeric counters used in hero and proof sections.',
    href: '/content/stats',
    endpoint: '/api/stats',
    listKey: 'stats',
    primaryAction: 'Add stat',
  },
  {
    key: 'projects',
    title: 'Projects',
    description: 'Portfolio projects and case-study style cards.',
    href: '/content/projects',
    endpoint: '/api/projects',
    listKey: 'projects',
    primaryAction: 'Add project',
  },
  {
    key: 'services',
    title: 'Services',
    description: 'Service blocks used across landing pages.',
    href: '/content/services',
    endpoint: '/api/services',
    listKey: 'services',
    primaryAction: 'Add service',
  },
  {
    key: 'team',
    title: 'Team',
    description: 'Team members, bios, and profile links.',
    href: '/content/team',
    endpoint: '/api/team',
    listKey: 'team',
    primaryAction: 'Add member',
  },
  {
    key: 'testimonials',
    title: 'Testimonials',
    description: 'Customer quotes and social proof.',
    href: '/content/testimonials',
    endpoint: '/api/testimonials',
    listKey: 'testimonials',
    primaryAction: 'Add quote',
  },
]

export default function ContentPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState('')
  const [bucketStates, setBucketStates] = useState<Record<string, 'ready' | 'missing' | 'error'>>({})

  useEffect(() => {
    let active = true

    async function loadCounts() {
      setLoading(true)
      setWarning('')

      try {
        const nextCounts: Record<string, number> = {}
        const nextStates: Record<string, 'ready' | 'missing' | 'error'> = {}
        const notices: string[] = []

        await Promise.all(
          contentBuckets.map(async (bucket) => {
            try {
              const response = await fetch(bucket.endpoint, { credentials: 'include' })
              const data = await response.json().catch(() => null)

              if (response.status === 503 || data?.available === false) {
                nextCounts[bucket.key] = 0
                nextStates[bucket.key] = 'missing'
                notices.push(data?.notice || `${bucket.title} is not available yet`)
                return
              }

              if (!response.ok || !data) {
                throw new Error(`Failed to load ${bucket.title.toLowerCase()}`)
              }

              const items =
                Array.isArray(data?.[bucket.listKey]) ? data[bucket.listKey] : Array.isArray(data) ? data : []
              nextCounts[bucket.key] = items.length
              nextStates[bucket.key] = 'ready'
            } catch {
              nextCounts[bucket.key] = 0
              nextStates[bucket.key] = 'error'
              notices.push(`${bucket.title} failed to load`)
            }
          }),
        )

        if (!active) {
          return
        }

        setCounts(nextCounts)
        setBucketStates(nextStates)
        setWarning(notices.length ? notices.join(', ') : '')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCounts()

    return () => {
      active = false
    }
  }, [])

  const totalItems = useMemo(() => contentBuckets.reduce((sum, bucket) => sum + (counts[bucket.key] || 0), 0), [counts])
  const unavailableCount = useMemo(
    () => Object.values(bucketStates).filter((state) => state === 'missing' || state === 'error').length,
    [bucketStates],
  )
  const statusLabel = warning ? 'Partial' : 'Ready'
  const statusChip = warning ? `${unavailableCount} unavailable` : 'Connected'

  return (
    <ModuleShell
      className="content-wrap"
      title="Content"
      description="Manage reusable content collections without leaving the CMS."
      actions={(
        <Link className="gbtn pu" href="/page-editor">
          Open Page Editor
        </Link>
      )}>
      <div className="dash-grid">
        <MetricCard
          label="Collections"
          value={contentBuckets.length}
          valueColor="var(--pu)"
          chips={<span>Active content types</span>}
        />
        <MetricCard
          label="Total Items"
          value={loading ? '...' : totalItems}
          valueColor="var(--gr)"
          chips={<span>{warning ? 'Some collections unavailable' : 'Across all collections'}</span>}
        />
        <MetricCard
          label="Quick Access"
          value={contentBuckets.length}
          valueColor="var(--am)"
          chips={<span>Editor shortcuts</span>}
        />
        <MetricCard
          label="Status"
          value={loading ? '...' : statusLabel}
          valueColor={warning ? 'var(--am)' : 'var(--gr)'}
          chips={<span className={`kpi-chip ${warning ? 'bad' : 'good'}`}>{statusChip}</span>}
        />
      </div>

      <div className="ic">
        <div className="ic-h">
          <div>
            <div className="layout-nav-title">Collections</div>
            <div className="layout-nav-subtitle">Open the editor for each content type</div>
          </div>
          <div className="content-hint">{contentBuckets.length} collections arranged in a balanced grid</div>
        </div>

        <div className="ic-b">
          <div className="content-card-grid">
            {contentBuckets.map((bucket) => (
              <div key={bucket.key} className="content-card">
                <div className="content-card-top">
                  <div>
                    <div className="content-card-title">{bucket.title}</div>
                    <div className="content-card-subtitle">{bucket.description}</div>
                  </div>
                  <div className="content-card-meta">
                    <span className="content-card-count">{loading ? '...' : counts[bucket.key] || 0}</span>
                    {bucketStates[bucket.key] === 'missing' ? <span className="content-card-tag bad">Unavailable</span> : null}
                    {bucketStates[bucket.key] === 'error' ? <span className="content-card-tag bad">Error</span> : null}
                  </div>
                </div>

                <div className="content-card-actions">
                  <Link className="gbtn pu" href={bucket.href}>
                    Open
                  </Link>
                  <Link className="gbtn" href={bucket.href}>
                    {bucket.primaryAction}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(.cm-admin-shell .content-wrap) {
          display: flex;
          flex-direction: column;
          min-height: 0;
          padding: 32px 24px;
          padding-bottom: 28px;
          background: #0d0f14;
          font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        :global(.cm-admin-shell .content-wrap .content-card-grid) {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          align-items: stretch;
        }

        :global(.cm-admin-shell .content-wrap .content-card) {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
            #1a1d28;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 164px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
        }

        :global(.cm-admin-shell .content-wrap .content-card-top) {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        :global(.cm-admin-shell .content-wrap .content-card-title) {
          font-size: 15px;
          font-weight: 600;
          color: #e8eaf0;
        }

        :global(.cm-admin-shell .content-wrap .content-card-subtitle) {
          margin-top: 4px;
          color: #8b90a8;
          font-size: 12px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        :global(.cm-admin-shell .content-wrap .content-card-count) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 42px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(124, 109, 250, 0.12);
          color: #a594ff;
          font-size: 13px;
          font-weight: 700;
        }

        :global(.cm-admin-shell .content-wrap .content-card-meta) {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        :global(.cm-admin-shell .content-wrap .content-card-tag) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        :global(.cm-admin-shell .content-wrap .content-card-tag.bad) {
          background: rgba(255, 99, 132, 0.14);
          color: #ff8ea3;
        }

        :global(.cm-admin-shell .content-wrap .content-card-actions) {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        :global(.cm-admin-shell .content-wrap .content-card-actions .gbtn) {
          padding: 7px 10px;
          font-size: 12px;
        }

        :global(.cm-admin-shell .content-wrap .ic-b) {
          display: block;
          padding: 18px;
        }

        :global(.cm-admin-shell .content-wrap .content-hint) {
          color: #7c8198;
          font-size: 12px;
          font-weight: 500;
        }

        @media (max-width: 1280px) {
          :global(.cm-admin-shell .content-wrap .content-card-grid) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          :global(.cm-admin-shell .content-wrap .content-card-grid) {
            grid-template-columns: 1fr;
          }
        }

        :global(.cm-admin-shell .content-wrap .layout-side-empty) {
          margin: 0 0 16px;
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: #1a1d28;
          color: #8b90a8;
          font-size: 12px;
        }

        @media (max-width: 900px) {
          :global(.cm-admin-shell .content-wrap) {
            padding: 24px 16px;
          }
        }
      `}</style>
    </ModuleShell>
  )
}
