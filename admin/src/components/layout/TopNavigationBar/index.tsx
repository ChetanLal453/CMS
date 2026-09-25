'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

type AdminTab = {
  href: string
  label: string
  icon: string
  match?: string
}

const masterTabs: AdminTab[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard', label: 'Sites and clients', icon: 'sites' },
  { href: '/settings', label: 'CMS settings', icon: 'settings', match: '/settings' },
]

const TabIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1" />
          <rect x="9" y="2" width="5" height="5" rx="1" />
          <rect x="2" y="9" width="5" height="5" rx="1" />
          <rect x="9" y="9" width="5" height="5" rx="1" />
        </svg>
      )
    case 'sites':
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M2 8h12M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M12.7 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

const TopNavigationBar = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isWorkspace = pathname?.startsWith('/workspace')
  const isPageEditor = pathname?.startsWith('/page-editor')
  const siteSlug = searchParams?.get('site') || 'Apex dental clinic'

  const primaryLabel = useMemo(() => {
    if (isPageEditor) return 'Publish ↗'
    if (pathname?.startsWith('/media')) return 'Upload Files'
    if (pathname?.startsWith('/settings')) return 'Save Settings'
    if (pathname?.startsWith('/content')) return 'Save Content'
    return 'Save Draft'
  }, [isPageEditor, pathname])

  const dispatchEditorAction = useCallback((action: 'history' | 'templates' | 'save-draft' | 'publish') => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('cm-admin-action', { detail: { action } }))
  }, [])

  if (isWorkspace) {
    return null
  }

  return (
    <div className="gnav">
      {/* Left: Brand Identity / Back button if in Page Editor */}
      <div className="g-left-cluster">
        {isPageEditor ? (
          <Link href="/dashboard" className="g-back-link">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 13L5 8l5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>All sites</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="g-logo">
            <div className="g-logo-box">cm</div>
            <div className="g-logo-name">CurveMetrics</div>
          </Link>
        )}
      </div>

      <div className="g-vsep" />

      {/* Center Tabs: Master Level 1 Tabs OR Page Editor Context */}
      {isPageEditor ? (
        <div className="g-editor-context">
          <span className="g-site-pill">{siteSlug}</span>
          <span className="g-page-context">Page Editor</span>
        </div>
      ) : (
        <div className="g-tabs">
          {masterTabs.map((tab, idx) => {
            const isActive = idx === 0 ? pathname === '/dashboard' || pathname === '/' : pathname?.startsWith(tab.match || tab.href)

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`gtab ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <TabIcon type={tab.icon} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Right Controls */}
      <div className="g-right">
        {isPageEditor ? (
          <>
            <button className="gbtn" type="button" onClick={() => dispatchEditorAction('history')}>
              History
            </button>
            <button className="gbtn" type="button" onClick={() => dispatchEditorAction('templates')}>
              Templates
            </button>
            <button className="gbtn" type="button" onClick={() => dispatchEditorAction('save-draft')}>
              Save Draft
            </button>
            <button className="gbtn pu" type="button" onClick={() => dispatchEditorAction('publish')}>
              {primaryLabel}
            </button>
          </>
        ) : (
          <div className="g-role-pill">
            <span>Viewing as</span>
            <strong>Developer</strong>
            <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
        )}

        <div className="g-avatar" title="Developer Admin">
          Ad
        </div>
      </div>

      <style jsx>{`
        .g-left-cluster {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .g-back-link {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #a9a894;
          font-size: 13px;
          text-decoration: none;
          padding: 5px 8px;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .g-back-link:hover {
          background: rgba(230, 228, 214, 0.08);
          color: #f4f2ea;
        }

        .g-editor-context {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
        }

        .g-site-pill {
          background: rgba(201, 138, 75, 0.15);
          color: #d9a86b;
          border: 1px solid rgba(201, 138, 75, 0.25);
          padding: 2px 9px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 12px;
        }

        .g-page-context {
          color: #8b8a78;
          font-size: 12.5px;
        }

        .g-role-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(230, 228, 214, 0.05);
          border: 1px solid rgba(230, 228, 214, 0.1);
          color: #a9a894;
          padding: 4px 10px;
          border-radius: 7px;
          font-size: 12px;
          cursor: pointer;
        }

        .g-role-pill strong {
          color: #f4f2ea;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

export default TopNavigationBar
