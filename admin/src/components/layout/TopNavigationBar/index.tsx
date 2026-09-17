'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

type AdminTab = {
  href: string
  label: string
  icon: string
  match?: string
  legacyMatches?: string[]
}

const adminTabs: AdminTab[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/page-editor', label: 'Page Editor', icon: 'editor', match: '/page-editor' },
  { href: '/content', label: 'Content', icon: 'content', match: '/content' },
  { href: '/media', label: 'Media', icon: 'media', match: '/media' },
  { href: '/leads', label: 'Leads', icon: 'leads', match: '/leads' },
  { href: '/users', label: 'Users', icon: 'users', match: '/users' },
  { href: '/layout', label: 'Layout', icon: 'layout', match: '/layout' },
  { href: '/settings', label: 'Settings', icon: 'settings', match: '/settings', legacyMatches: ['/information'] },
]

const TabIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'dashboard':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" />
          <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" />
          <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" />
          <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" />
        </svg>
      )
    case 'editor':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M11 2l3 3-8 8H3v-3l8-8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'layout':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 5h12M2 9h8M2 13h5" strokeLinecap="round" />
        </svg>
      )
    case 'content':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 4h10M3 7h8M3 10h6M3 13h9" strokeLinecap="round" />
        </svg>
      )
    case 'leads':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M14 11a3 3 0 00-3-3H5a3 3 0 00-3 3M8 8a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="6" cy="5" r="2.5" />
          <path d="M1 14c0-3 2-4.5 5-4.5s5 1.5 5 4.5" />
          <circle cx="12.5" cy="5.5" r="2" />
          <path d="M15 14c0-2.5-1.5-4-3-4" />
        </svg>
      )
    case 'media':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="3" width="12" height="10" rx="1.5" />
          <circle cx="5.5" cy="6.5" r="1.2" />
          <path d="M2 11l4-3 3 3 2-2 3 3" strokeLinecap="round" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="2.2" />
          <path d="M8 1.8v2M8 12.2v2M1.8 8h2M12.2 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M12.7 3.3l-1.4 1.4M4.7 11.3l-1.4 1.4" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 7v5M8 5h.01" strokeLinecap="round" />
        </svg>
      )
  }
}

const TopNavigationBar = () => {
  const pathname = usePathname()
  const isPageEditor = pathname?.startsWith('/page-editor')
  const primaryLabel = useMemo(() => {
    if (pathname?.startsWith('/page-editor')) return 'Publish ↗'
    if (pathname?.startsWith('/media')) return 'Upload Files'
    if (pathname?.startsWith('/settings') || pathname?.startsWith('/information')) return 'Save Changes'
    if (pathname?.startsWith('/users')) return '+ Invite User'
    if (pathname?.startsWith('/leads')) return 'Export CSV'
    if (pathname?.startsWith('/content')) return '+ Add Item'
    if (pathname?.startsWith('/layout')) return 'Save Layout'
    return '+ New Page'
  }, [pathname])

  const dispatchEditorAction = useCallback((action: 'history' | 'templates' | 'save-draft' | 'publish') => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('cm-admin-action', { detail: { action } }))
  }, [])

  const handleHistory = useCallback(() => {
    if (isPageEditor) {
      dispatchEditorAction('history')
    }
  }, [dispatchEditorAction, isPageEditor])

  const handleSaveDraft = useCallback(() => {
    if (isPageEditor) {
      dispatchEditorAction('save-draft')
    }
  }, [dispatchEditorAction, isPageEditor])

  const handleTemplates = useCallback(() => {
    if (isPageEditor) {
      dispatchEditorAction('templates')
    }
  }, [dispatchEditorAction, isPageEditor])

  const handlePrimaryAction = useCallback(() => {
    if (pathname?.startsWith('/page-editor')) {
      dispatchEditorAction('publish')
    }
  }, [dispatchEditorAction, pathname])

  return (
    <div className="gnav">
      <div className="g-logo">
        <div className="g-logo-box">cm</div>
        <div className="g-logo-name">CurveMetrics</div>
      </div>
      <div className="g-vsep" />
      <div className="g-tabs">
        {adminTabs.map((tab) => {
          const matchTarget = tab.match || tab.href
          const isLegacyMatch = tab.legacyMatches?.some((legacyMatch) => pathname?.startsWith(`${legacyMatch}/`) || pathname === legacyMatch)
          const isActive = pathname === tab.href || pathname?.startsWith(`${matchTarget}/`) || Boolean(isLegacyMatch)

          return (
            <Link key={tab.href} href={tab.href} className={`gtab ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined}>
              <TabIcon type={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="g-right">
        <div className="g-status">
          <div className="live-dot" />
          Live
        </div>
        <button className="gbtn notif-btn" type="button" aria-label="Notifications">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 2a4 4 0 014 4v3l1 2H3l1-2V6a4 4 0 014-4zM6.5 13a1.5 1.5 0 003 0" strokeLinecap="round" />
          </svg>
          <span className="notif-dot" />
        </button>
        <button className="gbtn" type="button" onClick={handleHistory} disabled={!isPageEditor}>History</button>
        <button className="gbtn" type="button" onClick={handleTemplates} disabled={!isPageEditor}>Templates</button>
        <button className="gbtn" type="button" onClick={handleSaveDraft} disabled={!isPageEditor}>Save Draft</button>
        <button className="gbtn pu" type="button" onClick={handlePrimaryAction}>{primaryLabel}</button>
        <div className="g-avatar">Ad</div>
      </div>
    </div>
  )
}
export default TopNavigationBar
