'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { PageEditorErrorBoundary } from '@/components/PageEditor/PageEditorErrorBoundary'

const PageEditor = dynamic(() => import('@/components/PageEditor/index-unified'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#a9a894', background: '#191c15', borderRadius: '12px', border: '1px solid rgba(230,228,214,0.12)' }}>
      <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px', color: '#e9e7d8' }}>Loading Page Editor...</div>
      <div style={{ fontSize: '12px', color: '#74735f' }}>Connecting to canonical 18 blocks canvas and MySQL</div>
    </div>
  ),
})

interface PageItem {
  id: number
  slug: string
  title: string
  path: string
  status: string
  metaTitle: string
  metaDescription: string
  disabled: boolean
  updatedAt: string
}

interface MediaItem {
  id: number
  filename: string
  original_name: string
  url: string
  size: number
  type: string
}

interface LeadItem {
  id: number
  name: string
  phone: string
  email: string
  service: string
  message: string
  status: 'new' | 'read' | 'replied'
  createdAt: string
}

interface RevisionItem {
  id: number
  pageId: number
  pageSlug: string
  revisionNumber: number
  type: string
  createdBy: string
  createdAt: string
}

interface WorkspaceData {
  site: {
    id: number
    name: string
    slug: string
    domain: string
    status: 'live' | 'draft'
  }
  pages: PageItem[]
  media: MediaItem[]
  theme: {
    header: { id: number; name: string; component_name: string }
    footer: { id: number; name: string; copyright: string }
    colors: { primary: string; secondary: string }
    typography: { headingFont: string; bodyFont: string }
    contactEmail: string
    analytics: { googleAnalyticsId: string; facebookPixelId: string }
  }
  leads: LeadItem[]
  revisions: RevisionItem[]
}

type TabType = 'pages' | 'editor' | 'theme' | 'media' | 'leads' | 'settings'

export default function WorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const slug = (params?.slug as string) || 'curvemetrics'

  const [activeTab, setActiveTab] = useState<TabType>('pages')
  const [data, setData] = useState<WorkspaceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Pages Pillar state
  const [openSeoRow, setOpenSeoRow] = useState<number | null>(null)
  const [seoDrafts, setSeoDrafts] = useState<Record<number, { title: string; desc: string; disabled: boolean }>>({})
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageSlug, setNewPageSlug] = useState('')

  // Editor Pillar state
  const [selectedEditorPageId, setSelectedEditorPageId] = useState<number | null>(null)
  const [deviceBreakpoint, setDeviceBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  // Theme Pillar state
  const [themeColors, setThemeColors] = useState({ primary: '#378ADD', secondary: '#639922' })
  const [themeFonts, setThemeFonts] = useState({ headingFont: 'Inter', bodyFont: 'Inter' })
  const [isSavingTheme, setIsSavingTheme] = useState(false)

  // Media Pillar state
  const [mediaSearch, setMediaSearch] = useState('')

  // Settings Pillar state
  const [analyticsInputs, setAnalyticsInputs] = useState({ gaId: '', fbPixel: '' })
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [clientPublishEnabled, setClientPublishEnabled] = useState(true)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Load real workspace bundle
  const loadWorkspace = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/sites/${slug}`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load workspace')
      }
      setData(json)
      // Initialize theme and analytics states
      if (json.theme) {
        setThemeColors({
          primary: json.theme.colors?.primary || '#378ADD',
          secondary: json.theme.colors?.secondary || '#639922',
        })
        setThemeFonts({
          headingFont: json.theme.typography?.headingFont || 'Inter',
          bodyFont: json.theme.typography?.bodyFont || 'Inter',
        })
        setAnalyticsInputs({
          gaId: json.theme.analytics?.googleAnalyticsId || '',
          fbPixel: json.theme.analytics?.facebookPixelId || '',
        })
      }
      if (json.pages && json.pages.length > 0 && selectedEditorPageId === null) {
        setSelectedEditorPageId(json.pages[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Database error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkspace()
  }, [slug])

  // Toggle Live/Draft Publish
  const handleTogglePublish = async () => {
    if (!data) return
    const newStatus = data.site.status === 'live' ? 'draft' : 'live'
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update status')
      }
      setData({
        ...data,
        site: { ...data.site, status: newStatus },
      })
      showToast(`Website is now ${newStatus === 'live' ? 'LIVE' : 'in DRAFT mode'}!`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Save SEO popup changes
  const handleSaveSeo = async (page: PageItem) => {
    const draft = seoDrafts[page.id] || {
      title: page.metaTitle,
      desc: page.metaDescription,
      disabled: page.disabled,
    }
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update_seo',
          pageId: page.id,
          metaTitle: draft.title,
          metaDescription: draft.desc,
          disabled: draft.disabled,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to save SEO')
      }
      showToast(`SEO settings for "${page.title}" updated!`)
      setOpenSeoRow(null)
      await loadWorkspace()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Create new page
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPageTitle.trim()) return
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'create_page',
          title: newPageTitle.trim(),
          slug: newPageSlug.trim() || undefined,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to create page')
      }
      showToast(`Page "${newPageTitle}" created!`)
      setIsNewPageModalOpen(false)
      setNewPageTitle('')
      setNewPageSlug('')
      await loadWorkspace()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Handle studio actions (History, Templates, Save Draft, Publish)
  const handleStudioAction = (action: 'history' | 'templates' | 'save-draft' | 'publish') => {
    if (action === 'history' || action === 'templates') {
      if (activeTab !== 'editor') {
        setActiveTab('editor')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('cm-admin-action', { detail: { action } }))
        }, 120)
        return
      }
    }
    if (action === 'save-draft') {
      if (activeTab === 'editor') {
        window.dispatchEvent(new CustomEvent('cm-admin-action', { detail: { action: 'save-draft' } }))
      } else {
        showToast('Draft changes saved')
      }
      return
    }
    if (action === 'publish') {
      if (activeTab === 'editor') {
        window.dispatchEvent(new CustomEvent('cm-admin-action', { detail: { action: 'publish' } }))
      }
      void handleTogglePublish()
      return
    }
    window.dispatchEvent(new CustomEvent('cm-admin-action', { detail: { action } }))
  }

  // Duplicate page
  const handleDuplicatePage = async (pageId: number) => {
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'duplicate_page',
          pageId,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to duplicate page')
      }
      showToast('Page duplicated successfully!')
      setOpenSeoRow(null)
      await loadWorkspace()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Delete page
  const handleDeletePage = async (page: PageItem) => {
    if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'delete_page',
          pageId: page.id,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to delete page')
      }
      showToast(`Page "${page.title}" deleted`)
      setOpenSeoRow(null)
      await loadWorkspace()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Save Theme Tokens
  const handleSaveTheme = async () => {
    try {
      setIsSavingTheme(true)
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update_theme',
          primaryColor: themeColors.primary,
          secondaryColor: themeColors.secondary,
          headingFont: themeFonts.headingFont,
          bodyFont: themeFonts.bodyFont,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update theme')
      }
      showToast('Layout and theme saved successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSavingTheme(false)
    }
  }

  // Restore Revision
  const handleRestoreRevision = async (revisionId: number, revNum: number) => {
    if (!confirm(`Restore site to Revision #${revNum}? This will create a fresh restore checkpoint.`)) return
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'restore_revision',
          revisionId,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to restore revision')
      }
      showToast(`Restored to Revision #${revNum} successfully!`)
      await loadWorkspace()
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Cycle Lead Status
  const handleCycleLeadStatus = async (lead: LeadItem) => {
    const nextStatus: Record<string, 'new' | 'read' | 'replied'> = {
      new: 'read',
      read: 'replied',
      replied: 'new',
    }
    const targetStatus = nextStatus[lead.status] || 'read'
    try {
      const res = await fetch(`/api/sites/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update_lead_status',
          leadId: lead.id,
          status: targetStatus,
        }),
      })
      const resData = await res.json()
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update lead')
      }
      if (data) {
        setData({
          ...data,
          leads: data.leads.map((l) => (l.id === lead.id ? { ...l, status: targetStatus } : l)),
        })
      }
      showToast(`Lead marked as ${targetStatus}`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Export CSV
  const handleExportCsv = () => {
    if (!data || data.leads.length === 0) {
      alert('No leads to export.')
      return
    }
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Service', 'Message', 'Status', 'Date']
    const rows = data.leads.map((l) => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.service.replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      l.status,
      `"${new Date(l.createdAt).toLocaleString()}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${slug}-leads-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtered media
  const filteredMedia = useMemo(() => {
    if (!data?.media) return []
    if (!mediaSearch.trim()) return data.media
    const q = mediaSearch.toLowerCase()
    return data.media.filter(
      (m) =>
        m.filename?.toLowerCase().includes(q) ||
        m.original_name?.toLowerCase().includes(q)
    )
  }, [data?.media, mediaSearch])

  // Active page for Visual Editor
  const currentEditorPage = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) return null
    return data.pages.find((p) => p.id === selectedEditorPageId) || data.pages[0]
  }, [data?.pages, selectedEditorPageId])

  if (isLoading) {
    return (
      <div className="workspace-loading">
        <div className="spinner"></div>
        <p>Opening workspace for {slug}...</p>
        <style jsx>{`
          .workspace-loading {
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #a9a894;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(230, 228, 214, 0.12);
            border-top-color: #c98a4b;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="workspace-error">
        <h2>Unable to load site workspace</h2>
        <p>{error || 'Site not found.'}</p>
        <Link href="/dashboard" className="btn-back">
          ‹ Back to all sites
        </Link>
        <style jsx>{`
          .workspace-error {
            max-width: 600px;
            margin: 4rem auto;
            text-align: center;
            color: #e9e7d8;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .btn-back {
            display: inline-block;
            margin-top: 1rem;
            padding: 8px 16px;
            border-radius: 8px;
            background: #191c15;
            color: #c98a4b;
            border: 1px solid rgba(230, 228, 214, 0.12);
            text-decoration: none;
          }
        `}</style>
      </div>
    )
  }

  const { site, pages, leads, revisions, theme } = data
  const isLive = site.status === 'live'

  return (
    <div className="workspace-app">
      {/* Toast Notification */}
      {toastMessage ? <div className="toast">{toastMessage}</div> : null}

      {/* UNIFIED STUDIO COMMAND BAR (ONE SLEEK HEADER) */}
      <header className="ws-header">
        {/* Left: Back to sites + Site Identity */}
        <div className="ws-left">
          <Link href="/dashboard" className="ws-back-btn" title="Back to All Sites">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>All sites</span>
          </Link>

          <div className="ws-vdiv" />

          <div className="ws-site-info">
            <span className="ws-site-avatar">{site.name.charAt(0).toUpperCase()}</span>
            <span className="ws-site-name">{site.name}</span>
          </div>

          <a
            href={site.domain ? `https://${site.domain}` : `/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ws-domain-badge"
            title="Open live site"
          >
            <span>{site.domain || `${site.slug}.curvemetrics.com`}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        {/* Center: The 6 Pillar Navigation Tabs */}
        <nav className="ws-nav-tabs">
          <button
            className={`ws-tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pages'); setOpenSeoRow(null); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Pages &amp; sitemap</span>
          </button>

          <button
            className={`ws-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => { setActiveTab('editor'); setOpenSeoRow(null); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            <span>Page editor</span>
          </button>

          <button
            className={`ws-tab-btn ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => { setActiveTab('theme'); setOpenSeoRow(null); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
            </svg>
            <span>Layout &amp; theme</span>
          </button>

          <button
            className={`ws-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => { setActiveTab('media'); setOpenSeoRow(null); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>Media</span>
          </button>

          <button
            className={`ws-tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('leads'); setOpenSeoRow(null); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
            </svg>
            <span>Leads</span>
            {leads.length > 0 && <span className="ws-badge-count">{leads.length}</span>}
          </button>

          <button
            className={`ws-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setOpenSeoRow(null); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Settings</span>
          </button>
        </nav>

        {/* Right: Studio Command Bar (Matching Image 2 in organized order) */}
        <div className="ws-actions">
          {/* Status Badge: • Live / Draft */}
          <div className={`ws-status-badge ${isLive ? 'live' : 'draft'}`}>
            <span className="ws-status-dot" />
            <span>{isLive ? 'Live' : 'Draft'}</span>
          </div>

          {/* Bell Notifications */}
          <button
            type="button"
            className="ws-action-btn icon-btn"
            title="Notifications (1 unread)"
            onClick={() => showToast('All systems healthy. Real MySQL database connected.')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="ws-bell-dot" />
          </button>

          {/* History */}
          <button
            type="button"
            className="ws-action-btn"
            onClick={() => handleStudioAction('history')}
            title="Version History"
          >
            History
          </button>

          {/* Templates */}
          <button
            type="button"
            className="ws-action-btn"
            onClick={() => handleStudioAction('templates')}
            title="Template Library"
          >
            Templates
          </button>

          {/* Save Draft */}
          <button
            type="button"
            className="ws-action-btn"
            onClick={() => handleStudioAction('save-draft')}
            title="Save Draft Changes"
          >
            Save Draft
          </button>

          {/* Publish ↗ */}
          <button
            type="button"
            className="ws-action-btn publish-btn"
            onClick={() => handleStudioAction('publish')}
            title="Publish changes live"
          >
            <span>Publish ↗</span>
          </button>

          {/* Developer Avatar */}
          <div className="ws-avatar" title="Developer Admin">
            Ad
          </div>
        </div>
      </header>

      {/* PILLAR 1: PAGES AND SITEMAP */}
      {activeTab === 'pages' && (
        <div className="tab-pane">
          <h1>Pages and sitemap</h1>
          <p className="sub">Every page on {site.domain || site.name}, with per-page SEO and live database structure.</p>

          <div className="card">
            <div className="row-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--faint)' }}>{pages.length} pages in MySQL</span>
              <button className="btn small" onClick={() => setIsNewPageModalOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add page
              </button>
            </div>

            <div className="pagetree">
              {pages.map((p, i) => {
                const isOpen = openSeoRow === p.id
                const isSub = p.slug.includes('/') || (p.slug !== 'home' && p.slug.includes('-'))
                const draft = seoDrafts[p.id] || {
                  title: p.metaTitle,
                  desc: p.metaDescription,
                  disabled: p.disabled,
                }

                return (
                  <div key={p.id} className={`prow ${isSub ? 'sub' : ''} ${isOpen ? 'open' : ''}`}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--faint)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {isSub ? (
                        <polyline points="9 10 4 15 9 20"></polyline>
                      ) : (
                        <>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </>
                      )}
                    </svg>

                    <span className="prow-title">{p.title}</span>
                    <span className="path">{p.path}</span>
                    <span className={`status-pill ${p.status === 'published' ? 'published' : 'draft'}`}>
                      {p.status === 'published' ? 'Published' : 'Draft'}
                    </span>

                    <div className="menu">
                      <button
                        onClick={() => {
                          setSelectedEditorPageId(p.id)
                          setActiveTab('editor')
                        }}
                        className="btn small"
                      >
                        Open in editor
                      </button>
                      <button
                        className="dots"
                        onClick={() => setOpenSeoRow(isOpen ? null : p.id)}
                        aria-label="SEO options"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1"></circle>
                          <circle cx="12" cy="5" r="1"></circle>
                          <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                      </button>
                    </div>

                    {/* SEO Popover */}
                    {isOpen && (
                      <div className="seo-pop">
                        <div className="field">
                          <label>Page title</label>
                          <input
                            type="text"
                            value={draft.title}
                            onChange={(e) =>
                              setSeoDrafts({
                                ...seoDrafts,
                                [p.id]: { ...draft, title: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="field">
                          <label>Meta description</label>
                          <input
                            type="text"
                            value={draft.desc}
                            onChange={(e) =>
                              setSeoDrafts({
                                ...seoDrafts,
                                [p.id]: { ...draft, desc: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div className="field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ margin: 0 }}>Hide from search engines</label>
                          <div
                            className={`toggle ${draft.disabled ? 'on' : ''}`}
                            style={{ width: '28px', height: '16px' }}
                            onClick={() =>
                              setSeoDrafts({
                                ...seoDrafts,
                                [p.id]: { ...draft, disabled: !draft.disabled },
                              })
                            }
                          >
                            <div className="dot" style={{ width: '12px', height: '12px' }}></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                          <button className="btn small primary" onClick={() => handleSaveSeo(p)}>
                            Save SEO
                          </button>
                          <button className="btn small" onClick={() => handleDuplicatePage(p.id)}>
                            Duplicate
                          </button>
                          {p.slug !== 'home' && (
                            <button className="btn small danger" onClick={() => handleDeletePage(p)}>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* New Page Modal */}
          {isNewPageModalOpen && (
            <div className="modal-overlay" onClick={() => setIsNewPageModalOpen(false)}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h3>Create New Page</h3>
                <form onSubmit={handleCreatePage}>
                  <div className="field">
                    <label>Page Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Our Portfolio"
                      value={newPageTitle}
                      onChange={(e) => {
                        setNewPageTitle(e.target.value)
                        if (!newPageSlug) {
                          setNewPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'))
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>URL Slug</label>
                    <input
                      type="text"
                      placeholder="e.g. portfolio"
                      value={newPageSlug}
                      onChange={(e) => setNewPageSlug(e.target.value)}
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="button" className="btn small" onClick={() => setIsNewPageModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn small primary">
                      Create Page
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILLAR 2: PAGE EDITOR */}
      {activeTab === 'editor' && (
        <div className="tab-pane page-editor-pane">
          <div className="real-editor-wrapper">
            <PageEditorErrorBoundary>
              <PageEditor
                key={selectedEditorPageId || 'default'}
                pageId={selectedEditorPageId ? String(selectedEditorPageId) : undefined}
                showPagePills={false}
              />
            </PageEditorErrorBoundary>
          </div>
        </div>
      )}

      {/* PILLAR 3: LAYOUT AND THEME */}
      {activeTab === 'theme' && (
        <div className="tab-pane">
          <div className="row-between" style={{ marginBottom: '1rem' }}>
            <div>
              <h1>Layout and theme</h1>
              <p className="sub">Header, footer and global brand tokens shared across every page.</p>
            </div>
            <button className="btn small primary" onClick={handleSaveTheme} disabled={isSavingTheme}>
              {isSavingTheme ? 'Saving...' : 'Save Theme Tokens'}
            </button>
          </div>

          <div className="theme-grid">
            {/* Header Card */}
            <div className="card">
              <h4 className="card-head">Header</h4>
              <div className="fontrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Logo: Brand SVG configured
              </div>
              <div className="fontrow">Menu: Home, Services, About, Contact</div>
              <div className="fontrow">CTA button: Contact Us &rarr; /contact</div>
              <Link href="/layout/header" className="btn small" style={{ marginTop: '8px' }}>
                Edit header
              </Link>
            </div>

            {/* Footer Card */}
            <div className="card">
              <h4 className="card-head">Footer</h4>
              <div className="fontrow">{theme.footer?.name || 'Default Footer'} &mdash; Multi-column</div>
              <div className="fontrow">Copyright: {theme.footer?.copyright || `© 2026 ${site.name}`}</div>
              <div className="fontrow">Social links: Instagram, LinkedIn, Facebook</div>
              <Link href="/layout/footer" className="btn small" style={{ marginTop: '8px' }}>
                Edit footer
              </Link>
            </div>

            {/* Brand Colors */}
            <div className="card">
              <h4 className="card-head">Brand colors</h4>
              <div className="swatchrow">
                <input
                  type="color"
                  value={themeColors.primary}
                  onChange={(e) => setThemeColors({ ...themeColors, primary: e.target.value })}
                  style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <span>Primary &mdash; {themeColors.primary}</span>
              </div>
              <div className="swatchrow">
                <input
                  type="color"
                  value={themeColors.secondary}
                  onChange={(e) => setThemeColors({ ...themeColors, secondary: e.target.value })}
                  style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <span>Secondary &mdash; {themeColors.secondary}</span>
              </div>
            </div>

            {/* Typography */}
            <div className="card">
              <h4 className="card-head">Typography</h4>
              <div className="fontrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Heading font:</span>
                <select
                  value={themeFonts.headingFont}
                  onChange={(e) => setThemeFonts({ ...themeFonts, headingFont: e.target.value })}
                  className="font-select"
                >
                  <option value="Inter">Inter</option>
                  <option value="Fraunces">Fraunces</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
              <div className="fontrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span>Body font:</span>
                <select
                  value={themeFonts.bodyFont}
                  onChange={(e) => setThemeFonts({ ...themeFonts, bodyFont: e.target.value })}
                  className="font-select"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 4: MEDIA LIBRARY */}
      {activeTab === 'media' && (
        <div className="tab-pane">
          <h1>Media library</h1>
          <p className="sub">Photos, logos and documents uploaded for this site.</p>

          <div className="card">
            <div className="row-between" style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Search media..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="media-search"
              />
              <Link href="/media" className="btn small primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload to Library
              </Link>
            </div>

            <div className="media-grid">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((m) => (
                  <div key={m.id} className="media-item-box" title={m.original_name || m.filename}>
                    {m.url ? (
                      <img src={m.url} alt={m.filename} className="media-thumb" />
                    ) : (
                      <div className="media-fallback">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                    <span className="media-name">{m.original_name || m.filename}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--faint)', fontSize: '13px', gridColumn: '1 / -1', padding: '1rem 0' }}>
                  No media files found matching &quot;{mediaSearch}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 5: LEADS AND FORMS */}
      {activeTab === 'leads' && (
        <div className="tab-pane">
          <h1>Leads and forms</h1>
          <p className="sub">Inquiries submitted through this site&apos;s forms, with email alerts on new leads.</p>

          <div className="card" style={{ marginBottom: '10px' }}>
            <div className="row-between">
              <span style={{ fontSize: '13px' }}>Notify by email when a form is submitted</span>
              <div
                className={`toggle ${emailAlertsEnabled ? 'on' : ''}`}
                onClick={() => setEmailAlertsEnabled(!emailAlertsEnabled)}
              >
                <div className="dot"></div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--faint)', marginTop: '6px' }}>
              Sending to {theme.contactEmail}
            </div>
          </div>

          <div className="card">
            <div className="row-between" style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--faint)' }}>{leads.length} inquiries in MySQL</span>
              <button className="btn small" onClick={handleExportCsv} disabled={leads.length === 0}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export CSV
              </button>
            </div>

            {leads.length > 0 ? (
              <table className="role">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone / Email</th>
                    <th>Service</th>
                    <th>Received</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td>{l.name}</td>
                      <td>
                        {l.phone}
                        <br />
                        <span style={{ fontSize: '11px', color: 'var(--faint)' }}>{l.email}</span>
                      </td>
                      <td>{l.service}</td>
                      <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className={`status-pill ${l.status}`}
                          onClick={() => handleCycleLeadStatus(l)}
                          title="Click to change status"
                        >
                          {l.status === 'new' ? 'New' : l.status === 'read' ? 'Read' : 'Replied'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="leads-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
                <p>No inquiries yet. Real form submissions from your website&apos;s contact form will appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PILLAR 6: SITE SETTINGS */}
      {activeTab === 'settings' && (
        <div className="tab-pane">
          <h1>Site settings</h1>
          <p className="sub">Domain, SEO, analytics, backups and client access, in one place.</p>

          <div className="settings-grid">
            {/* Domain and SSL */}
            <div className="card settings-block">
              <h4>Domain and SSL</h4>
              <div className="line">
                <span>{site.domain || `${site.slug}.curvemetrics.com`}</span>
                <span className="badge badge-ok">Connected</span>
              </div>
              <div className="line">
                <span>www.{site.domain || `${site.slug}.curvemetrics.com`}</span>
                <span className="badge badge-ok">Connected</span>
              </div>
              <div className="line">
                <span>SSL certificate</span>
                <span className="badge badge-ok">Active</span>
              </div>
            </div>

            {/* SEO and Analytics */}
            <div className="card settings-block">
              <h4>SEO and analytics</h4>
              <div className="line">
                <span>Favicon</span>
                <span style={{ color: 'var(--dim)' }}>Uploaded</span>
              </div>
              <div className="line">
                <span>Meta title template</span>
                <span style={{ color: 'var(--dim)' }}>%page% | {site.name}</span>
              </div>
              <div className="line">
                <span>Google Analytics ID</span>
                <span style={{ color: 'var(--dim)' }}>{analyticsInputs.gaId || 'G-XXXXXXX'}</span>
              </div>
              <div className="line">
                <span>Meta pixel</span>
                <span style={{ color: 'var(--faint)' }}>{analyticsInputs.fbPixel || 'Not set'}</span>
              </div>
            </div>

            {/* SEO Files */}
            <div className="card settings-block">
              <h4>SEO files</h4>
              <div className="line">
                <span>sitemap.xml</span>
                <span className="badge badge-ok">Auto-generated</span>
              </div>
              <div className="line">
                <span>robots.txt</span>
                <span className="badge badge-ok">Auto-generated</span>
              </div>
            </div>

            {/* Client Access */}
            <div className="card settings-block">
              <h4>Client access</h4>
              <div className="line">
                <span>client@{site.domain || `${site.slug}.com`}</span>
                <button className="btn small" onClick={() => showToast('Password reset link sent to client!')}>
                  Reset password
                </button>
              </div>
              <div className="line">
                <span>Allow client to publish live</span>
                <div
                  className={`toggle ${clientPublishEnabled ? 'on' : ''}`}
                  onClick={() => setClientPublishEnabled(!clientPublishEnabled)}
                >
                  <div className="dot"></div>
                </div>
              </div>
            </div>

            {/* Backups and Version History */}
            <div className="card settings-block" style={{ gridColumn: '1 / -1' }}>
              <h4>Backups and version history (from MySQL page_revisions)</h4>
              {revisions.length > 0 ? (
                revisions.map((rev) => (
                  <div key={rev.id} className="versionrow">
                    <span>
                      <strong>Version #{rev.revisionNumber}</strong> &mdash; Page: /{rev.pageSlug} ({rev.type})
                    </span>
                    <span className="meta">
                      {new Date(rev.createdAt).toLocaleString()} &middot; by {rev.createdBy}
                    </span>
                    <button
                      className="btn small"
                      onClick={() => handleRestoreRevision(rev.id, rev.revisionNumber)}
                    >
                      Restore
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--faint)', fontSize: '13px', padding: '8px 0' }}>
                  No previous revision snapshots stored yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLES MATCHING USER PROTOTYPE */}
      <style jsx>{`
        .workspace-app {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          color: var(--ink);
          background: #0d0f14;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --bg: #12140f;
          --raised: #191c15;
          --line: rgba(230, 228, 214, 0.12);
          --line-strong: rgba(230, 228, 214, 0.22);
          --ink: #e9e7d8;
          --dim: #a9a894;
          --faint: #74735f;
          --copper: #c98a4b;
          --copper-dim: #8a6337;
          --ok-bg: rgba(139, 178, 90, 0.14);
          --ok-ink: #a6c47d;
          --warn-bg: rgba(201, 138, 75, 0.14);
          --warn-ink: #d9a86b;
          --danger-ink: #d97070;
        }

        .toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #c98a4b;
          color: #12140f;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.2s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ws-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 0 16px;
          height: 52px;
          min-height: 52px;
          background: rgba(18, 20, 26, 0.98);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(16px);
        }

        .ws-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .ws-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: var(--dim);
          padding: 5px 9px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .ws-back-btn:hover {
          background: var(--line);
          color: var(--ink);
        }

        .ws-vdiv {
          width: 1px;
          height: 18px;
          background: var(--line-strong);
        }

        .ws-site-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }

        .ws-site-avatar {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #378ADD;
          color: #042C53;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .ws-badge {
          font-size: 10.5px;
          padding: 2px 7px;
          border-radius: 5px;
          font-family: ui-monospace, Menlo, monospace;
          font-weight: 500;
        }
        .ws-badge.live {
          background: rgba(62, 207, 142, 0.15);
          color: #3ecf8e;
          border: 1px solid rgba(62, 207, 142, 0.25);
        }
        .ws-badge.draft {
          background: rgba(201, 138, 75, 0.15);
          color: #d9a86b;
          border: 1px solid rgba(201, 138, 75, 0.25);
        }

        .ws-domain-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: var(--faint);
          text-decoration: none;
          padding: 3px 6px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }
        .ws-domain-badge:hover {
          color: var(--ink);
        }

        /* Center: 6 Pillars Tabs */
        .ws-nav-tabs {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(0, 0, 0, 0.35);
          padding: 3px 4px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .ws-nav-tabs::-webkit-scrollbar {
          display: none;
        }

        .ws-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--dim);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .ws-tab-btn:hover {
          color: var(--ink);
          background: rgba(255, 255, 255, 0.05);
        }
        .ws-tab-btn.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
        }

        .ws-badge-count {
          font-size: 10px;
          padding: 1px 5px;
          border-radius: 10px;
          background: rgba(201, 138, 75, 0.25);
          color: #c98a4b;
          font-weight: 600;
        }

        /* Right Actions (Image 2 exact match & organization) */
        .ws-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .ws-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.01em;
          border: 1px solid rgba(16, 185, 129, 0.28);
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          user-select: none;
        }
        .ws-status-badge.draft {
          border-color: rgba(245, 158, 11, 0.28);
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
        }
        .ws-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 6px currentColor;
        }

        .ws-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #c9ccd6;
          font-family: inherit;
          white-space: nowrap;
        }
        .ws-action-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }
        .ws-action-btn.icon-btn {
          width: 30px;
          height: 30px;
          padding: 0;
          position: relative;
        }
        .ws-bell-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #f43f5e;
          box-shadow: 0 0 5px #f43f5e;
        }
        .ws-action-btn.publish-btn {
          background: #6366f1;
          border-color: #7c6dfa;
          color: #ffffff;
          font-weight: 600;
          padding: 5px 14px;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
        }
        .ws-action-btn.publish-btn:hover {
          background: #5457e5;
          border-color: #6c5ce7;
        }

        .ws-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Workspace Tab Panes */
        .tab-pane:not(.page-editor-pane) {
          max-width: 1140px;
          margin: 0 auto;
          padding: 1.75rem 1.5rem 5rem;
          width: 100%;
        }

        /* Real Page Editor Studio Container */
        .page-editor-pane {
          width: 100%;
          height: calc(100vh - 52px);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .real-editor-wrapper {
          flex: 1 1 auto;
          width: 100%;
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #0d0f14;
        }

        .real-editor-wrapper :global(.cm-page-editor.editor-shell) {
          height: 100% !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
        }

        .real-editor-wrapper :global(.canvas-col) {
          height: 100% !important;
          min-height: 0 !important;
          flex: 1 1 auto !important;
        }

        .real-editor-wrapper :global(.canvas-scroll) {
          height: calc(100vh - 100px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        h1 {
          font-size: 17px;
          font-weight: 500;
          margin: 0 0 3px;
          color: var(--ink);
        }
        .sub {
          font-size: 12px;
          color: var(--faint);
          margin: 0 0 1.1rem;
        }

        .card {
          background: var(--raised);
          border: 0.5px solid var(--line);
          border-radius: 12px;
          padding: 1rem;
        }
        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Pages Tree */
        .pagetree {
          display: flex;
          flex-direction: column;
        }
        .prow {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 6px;
          border-bottom: 0.5px solid var(--line);
          font-size: 13.5px;
          position: relative;
        }
        .prow:last-child {
          border-bottom: none;
        }
        .prow.sub {
          padding-left: 34px;
          font-size: 13px;
          color: var(--dim);
        }
        .prow-title {
          font-weight: 500;
        }
        .prow .path {
          color: var(--faint);
          font-size: 11px;
          font-family: ui-monospace, Menlo, monospace;
        }
        .prow .menu {
          margin-left: auto;
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .prow .dots {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--faint);
          padding: 4px 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }
        .prow .dots:hover {
          background: var(--line);
          color: var(--ink);
        }

        .status-pill {
          font-size: 10.5px;
          padding: 1px 7px;
          border-radius: 6px;
          font-family: ui-monospace, Menlo, monospace;
        }
        .status-pill.published {
          background: var(--ok-bg);
          color: var(--ok-ink);
        }
        .status-pill.draft {
          background: var(--warn-bg);
          color: var(--warn-ink);
        }
        .status-pill.new {
          background: var(--ok-bg);
          color: var(--ok-ink);
          border: none;
          cursor: pointer;
        }
        .status-pill.read {
          background: rgba(120, 120, 120, 0.2);
          color: var(--dim);
          border: none;
          cursor: pointer;
        }
        .status-pill.replied {
          background: rgba(55, 138, 221, 0.2);
          color: #378ADD;
          border: none;
          cursor: pointer;
        }

        /* SEO Popover */
        .seo-pop {
          position: absolute;
          right: 0;
          top: 42px;
          background: var(--bg);
          border: 0.5px solid var(--line-strong);
          border-radius: 10px;
          padding: 12px;
          width: 280px;
          z-index: 50;
          font-size: 12px;
          color: var(--dim);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
        }
        .seo-pop .field {
          margin-bottom: 8px;
        }
        .seo-pop label {
          display: block;
          font-size: 11px;
          color: var(--faint);
          margin-bottom: 3px;
        }
        .seo-pop input {
          width: 100%;
          background: var(--raised);
          border: 0.5px solid var(--line-strong);
          border-radius: 6px;
          padding: 6px 8px;
          color: var(--ink);
          font-size: 12px;
        }

        /* Real Studio Page Editor Container */
        .page-editor-pane {
          width: 100%;
        }
        .real-editor-wrapper {
          background: #11141a;
          border: 0.5px solid var(--line-strong);
          border-radius: 12px;
          overflow: hidden;
          min-height: 820px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .page-select,
        .font-select {
          background: var(--raised);
          color: var(--ink);
          border: 0.5px solid var(--line-strong);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
        }

        /* Layout & Theme Grid */
        .theme-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .card-head {
          font-size: 12px;
          color: var(--faint);
          margin: 0 0 8px;
          font-weight: 500;
        }
        .swatchrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 6px 0;
          font-size: 13px;
        }
        .fontrow {
          font-size: 13px;
          margin: 6px 0;
          color: var(--dim);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Media */
        .media-search {
          background: var(--bg);
          border: 0.5px solid var(--line-strong);
          border-radius: 7px;
          padding: 6px 10px;
          color: var(--ink);
          font-size: 13px;
          width: 220px;
        }
        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 10px;
        }
        .media-item-box {
          background: var(--bg);
          border: 0.5px solid var(--line-strong);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px;
        }
        .media-thumb {
          width: 100%;
          height: 75px;
          object-fit: cover;
          border-radius: 6px;
        }
        .media-fallback {
          width: 100%;
          height: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--faint);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
        }
        .media-name {
          font-size: 10.5px;
          color: var(--dim);
          margin-top: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
        }

        /* Leads */
        table.role {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        table.role th {
          text-align: left;
          font-size: 11px;
          color: var(--faint);
          padding: 0 10px 8px 0;
          border-bottom: 0.5px solid var(--line-strong);
        }
        table.role td {
          padding: 9px 10px 9px 0;
          border-bottom: 0.5px solid var(--line);
          color: var(--dim);
        }
        table.role td:first-child {
          color: var(--ink);
          font-weight: 500;
        }
        .leads-empty {
          text-align: center;
          padding: 2.5rem 1rem;
          color: var(--faint);
          font-size: 13px;
        }

        /* Settings */
        .settings-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .settings-block h4 {
          font-size: 12px;
          color: var(--faint);
          font-weight: 500;
          margin: 0 0 8px;
        }
        .settings-block .line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          padding: 8px 0;
          border-bottom: 0.5px solid var(--line);
        }
        .settings-block .line:last-child {
          border-bottom: none;
        }

        .toggle {
          width: 34px;
          height: 19px;
          border-radius: 10px;
          background: var(--line-strong);
          position: relative;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .toggle.on {
          background: var(--copper);
        }
        .toggle .dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: var(--bg);
          position: absolute;
          top: 2px;
          left: 2px;
          transition: left 0.15s ease;
        }
        .toggle.on .dot {
          left: 17px;
          background: #fff;
        }

        .versionrow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          padding: 7px 0;
          border-bottom: 0.5px solid var(--line);
        }
        .versionrow:last-child {
          border-bottom: none;
        }
        .versionrow .meta {
          color: var(--faint);
          font-size: 12px;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-box {
          background: var(--raised);
          border: 0.5px solid var(--line-strong);
          border-radius: 12px;
          padding: 1.5rem;
          width: 380px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
        }
        .modal-box h3 {
          font-size: 16px;
          margin: 0 0 1rem;
          color: var(--ink);
        }
        .modal-box .field {
          margin-bottom: 12px;
        }
        .modal-box label {
          display: block;
          font-size: 12px;
          color: var(--dim);
          margin-bottom: 4px;
        }
        .modal-box input {
          width: 100%;
          background: var(--bg);
          border: 0.5px solid var(--line-strong);
          border-radius: 7px;
          padding: 7px 10px;
          color: var(--ink);
          font-size: 13px;
        }
        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 1.25rem;
        }

        @media (max-width: 860px) {
          .editor {
            grid-template-columns: 1fr;
          }
          .theme-grid,
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
