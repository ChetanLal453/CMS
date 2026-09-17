'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ModuleShell from '@/components/admin/ModuleShell'

type NavItem = {
  id: string
  label: string
  href: string
  open_new_tab: boolean
  is_active: boolean
  children: NavItem[]
}

type HeaderRecord = {
  id?: number
  slug: string
  name: string
  logo: string
  logo_dark: string
  cta_label: string
  cta_link: string
  is_sticky: boolean
  bg_color: string
  settings: Record<string, any>
  navigation_items: NavItem[]
}

const emptyHeader = (): HeaderRecord => ({
  slug: '',
  name: '',
  logo: '',
  logo_dark: '',
  cta_label: '',
  cta_link: '',
  is_sticky: true,
  bg_color: 'transparent',
  settings: {},
  navigation_items: [],
})

const normalizeNavItem = (item: any): NavItem => ({
  id: String(item?.id || `nav-${Math.random().toString(36).slice(2, 8)}`),
  label: item?.label || '',
  href: item?.href || item?.url || '/',
  open_new_tab: Boolean(item?.open_new_tab ?? item?.new_tab),
  is_active: item?.is_active !== false && item?.status !== 'draft',
  children: Array.isArray(item?.children) ? item.children.map(normalizeNavItem) : [],
})

const normalizeHeader = (header: any): HeaderRecord => ({
  id: header?.id,
  slug: header?.slug || '',
  name: header?.name || '',
  logo: header?.logo || '',
  logo_dark: header?.logo_dark || '',
  cta_label: header?.cta_label || '',
  cta_link: header?.cta_link || '',
  is_sticky: header?.is_sticky !== false,
  bg_color: header?.bg_color || 'transparent',
  settings: header?.settings || {},
  navigation_items: Array.isArray(header?.navigation_items) ? header.navigation_items.map(normalizeNavItem) : [],
})

const isDarkSurface = (value?: string) => {
  if (!value || value === 'transparent') {
    return false
  }

  const hex = value.trim().toLowerCase()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)) {
    return false
  }

  const expanded =
    hex.length === 4
      ? `#${hex
          .slice(1)
          .split('')
          .map((char) => char + char)
          .join('')}`
      : hex

  const r = Number.parseInt(expanded.slice(1, 3), 16)
  const g = Number.parseInt(expanded.slice(3, 5), 16)
  const b = Number.parseInt(expanded.slice(5, 7), 16)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000
  return luminance < 160
}

const resolvePreviewLogo = (draft: HeaderRecord) => {
  const darkSurface = isDarkSurface(draft.bg_color)
  return darkSurface ? draft.logo || draft.logo_dark : draft.logo_dark || draft.logo || ''
}

const countTreeNodes = (items: NavItem[]): number =>
  items.reduce((count, item) => count + 1 + countTreeNodes(item.children || []), 0)

const getButtonStyle = (draft: HeaderRecord) => String(draft.settings?.cta_style || 'solid')
const getButtonTarget = (draft: HeaderRecord) => Boolean(draft.settings?.cta_new_tab)
const getCtaLabel = (draft: HeaderRecord) => draft.cta_label.trim() || 'Contact Us'
const getCtaLink = (draft: HeaderRecord) => draft.cta_link.trim() || '/contact'

export default function HeaderEditorPage() {
  const [headers, setHeaders] = useState<HeaderRecord[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<HeaderRecord>(emptyHeader())
  const [globalNav, setGlobalNav] = useState<NavItem[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [navLoading, setNavLoading] = useState(true)
  const [uploadingField, setUploadingField] = useState<'logo' | 'logo_dark' | null>(null)
  const [notice, setNotice] = useState('')
  const [openPreviewItemId, setOpenPreviewItemId] = useState<string | null>(null)

  const selectedHeader = useMemo(
    () => headers.find((header) => header.id === selectedId) || null,
    [headers, selectedId],
  )

  const previewLogo = resolvePreviewLogo(draft)
  const previewDarkSurface = isDarkSurface(draft.bg_color)
  const previewStyle =
    draft.bg_color && draft.bg_color !== 'transparent' ? { backgroundColor: draft.bg_color } : undefined
  const navRootCount = globalNav.length
  const navNodeCount = countTreeNodes(globalNav)
  const brandingReady = Boolean(draft.logo || draft.logo_dark)
  const ctaReady = Boolean(draft.cta_label.trim() && draft.cta_link.trim())
  const ctaStyle = getButtonStyle(draft)
  const ctaNewTab = getButtonTarget(draft)
  const ctaLabelValue = getCtaLabel(draft)
  const ctaLinkValue = getCtaLink(draft)

  const renderPreviewNav = (items: NavItem[], nested = false): React.ReactNode =>
    items.map((item) => {
      const href = item.href || '/'
      const hasChildren = item.children.length > 0
      const isOpen = openPreviewItemId === item.id
      return (
        <div
          key={item.id}
          className={`header-preview-item ${nested ? 'nested' : ''} ${isOpen ? 'open' : ''}`}
          onMouseEnter={() => {
            if (hasChildren) {
              setOpenPreviewItemId(item.id)
            }
          }}
          onMouseLeave={() => {
            if (hasChildren) {
              setOpenPreviewItemId((current) => (current === item.id ? null : current))
            }
          }}>
          <a
            className="header-preview-link"
            href={href}
            target={item.open_new_tab ? '_blank' : undefined}
            rel={item.open_new_tab ? 'noreferrer noopener' : undefined}
            onClick={(event) => {
              if (hasChildren) {
                event.preventDefault()
                setOpenPreviewItemId((current) => (current === item.id ? null : item.id))
              }
            }}>
            <span>{item.label || 'Link'}</span>
            {hasChildren ? <span className="header-preview-caret">▾</span> : null}
          </a>
          {hasChildren ? <div className="header-preview-dropdown">{renderPreviewNav(item.children, true)}</div> : null}
        </div>
      )
    })

  const renderSourceNav = (items: NavItem[], depth = 0): React.ReactNode =>
    items.map((item) => (
      <div key={`source-${item.id}`} className="header-nav-node" style={{ paddingLeft: `${depth * 18}px` }}>
        <div className="header-nav-item">
          <span className="header-nav-dot" />
          <div className="header-nav-text">
            <strong>{item.label || 'Link'}</strong>
            <span>{item.href || '/'}</span>
          </div>
        </div>
        {item.children.length ? <div className="header-nav-children">{renderSourceNav(item.children, depth + 1)}</div> : null}
      </div>
    ))

  const fetchHeaders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/headers', { credentials: 'include' })
      const data = await response.json()
      const nextHeaders = Array.isArray(data?.headers) ? data.headers.map(normalizeHeader) : []
      setHeaders(nextHeaders)
      if (nextHeaders.length) {
        setSelectedId((current) => current ?? nextHeaders[0].id ?? null)
      } else {
        setSelectedId(null)
        setDraft(emptyHeader())
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchGlobalNavigation = useCallback(async () => {
    setNavLoading(true)
    try {
      const response = await fetch('/api/navigation', { credentials: 'include' })
      const data = await response.json().catch(() => null)
      if (response.ok) {
        const nextNav = Array.isArray(data?.navigation)
          ? data.navigation.map(normalizeNavItem)
          : Array.isArray(data?.items)
            ? data.items.map(normalizeNavItem)
            : []
        setGlobalNav(nextNav)
      }
    } finally {
      setNavLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchHeaders()
    void fetchGlobalNavigation()
  }, [fetchGlobalNavigation, fetchHeaders])

  useEffect(() => {
    if (selectedHeader) {
      setDraft(selectedHeader)
    }
  }, [selectedHeader])

  useEffect(() => {
    const handleNavUpdated = () => {
      void fetchGlobalNavigation()
      setNotice('Navigation refreshed from Navigation Manager.')
    }

    window.addEventListener('cm-navigation-updated', handleNavUpdated)
    return () => window.removeEventListener('cm-navigation-updated', handleNavUpdated)
  }, [fetchGlobalNavigation])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target?.closest('.header-preview-links')) {
        setOpenPreviewItemId(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const uploadMedia = useCallback(async (file: File, field: 'logo' | 'logo_dark') => {
    setUploadingField(field)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok || !data.success || !data.uploaded?.[0]?.url) {
        throw new Error(data.error || 'Upload failed')
      }

      const url = data.uploaded[0].url
      setDraft((current) => ({ ...current, [field]: url }))
    } finally {
      setUploadingField(null)
    }
  }, [])

  const handleCreateNew = () => {
    setSelectedId(null)
    setDraft({
      ...emptyHeader(),
      slug: `header-${headers.length + 1}`,
      name: `Header ${headers.length + 1}`,
      cta_label: 'Contact Us',
      cta_link: '/contact',
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        slug: draft.slug,
        name: draft.name,
        logo: draft.logo,
        logo_dark: draft.logo_dark,
        cta_label: draft.cta_label,
        cta_link: draft.cta_link,
        is_sticky: draft.is_sticky,
        bg_color: draft.bg_color,
        settings: draft.settings,
      }

      const response = await fetch(selectedId ? `/api/headers/${selectedId}` : '/api/headers', {
        method: selectedId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save header')
      }

      await fetchHeaders()
      const saved = normalizeHeader(data.header || data.item)
      setSelectedId(saved.id || null)
      setDraft(saved)
      setNotice('Header saved. Navigation stays synced from Navigation Manager.')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Failed to save header')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModuleShell
      className="info-wrap header-wrap"
      title="Header Manager"
      description="Control branding, CTA, sticky behavior, and the way your global header adopts the shared navigation."
      actions={(
        <>
          <Link className="gbtn" href="/layout/navigation">
            Open Navigation Manager
          </Link>
          <button className="gbtn" type="button" onClick={handleCreateNew}>
            + New Header
          </button>
          <button className="gbtn pu" type="button" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving...' : 'Save Header'}
          </button>
        </>
      )}>
      <div className="header-manager-shell">
        <div className="header-overview-grid">
          <div className="header-overview-card">
            <div className="header-kicker">Menu source</div>
            <div className="header-title">Navigation Manager</div>
            <div className="header-value">{navLoading ? 'Loading...' : `${navRootCount} root links`}</div>
            <div className="header-meta">Header now adopts the shared site navigation automatically.</div>
          </div>
          <div className="header-overview-card">
            <div className="header-kicker">Branding</div>
            <div className="header-title">Logo state</div>
            <div className="header-value">{brandingReady ? 'Ready' : 'Needs logo'}</div>
            <div className="header-meta">Light and dark logos are switched based on header background.</div>
          </div>
          <div className="header-overview-card">
            <div className="header-kicker">CTA</div>
            <div className="header-title">Action button</div>
            <div className="header-value">{ctaReady ? ctaLabelValue : 'Needs setup'}</div>
            <div className="header-meta">{ctaReady ? `Targets ${ctaLinkValue}` : 'Use it for contact, quote, or booking actions.'}</div>
          </div>
          <div className="header-overview-card">
            <div className="header-kicker">Behavior</div>
            <div className="header-title">Scroll mode</div>
            <div className="header-value">{draft.is_sticky ? 'Sticky' : 'Static'}</div>
            <div className="header-meta">Background: {draft.bg_color || 'transparent'}</div>
          </div>
        </div>

        <div className="header-main-grid">
          <div className="header-main-column">
            <div className="ic header-preview-card">
              <div className="ic-h">
                <div>
                  <div className="header-section-title">Live Header Preview</div>
                  <div className="header-section-subtitle">This uses the same shared navigation source that the public header will render.</div>
                </div>
                <Link className="gbtn" href="/layout/navigation">
                  Edit Menu
                </Link>
              </div>
              <div className="ic-b d-block">
                <div
                  className="header-preview-surface"
                  style={{
                    ...previewStyle,
                    background: previewStyle ? previewStyle.backgroundColor : 'linear-gradient(135deg, rgba(18,19,31,0.95), rgba(27,30,48,0.88))',
                    color: previewDarkSurface ? '#fff' : 'var(--t1)',
                    borderColor: previewDarkSurface ? 'rgba(255,255,255,0.12)' : 'var(--b1)',
                  }}>
                  <div className="header-preview-brand">
                    {previewLogo ? <img src={previewLogo} alt={draft.name || 'Header logo'} className="header-preview-logo" /> : null}
                    <div>
                      <div className="header-preview-name">{draft.name || 'Header name'}</div>
                      <div className="header-preview-slug">{draft.slug || 'header-slug'}</div>
                    </div>
                  </div>

                  <div className="header-preview-links">
                    {!navLoading ? renderPreviewNav(globalNav) : null}
                    {navLoading ? <span className="header-preview-pill muted">Loading menu...</span> : null}
                    {!navLoading && !globalNav.length ? <span className="header-preview-pill muted">No nav items yet</span> : null}
                  </div>

                  <a
                    className={`header-preview-cta ${ctaReady ? '' : 'placeholder'} ${ctaStyle}`}
                    href={ctaReady ? ctaLinkValue : '#header-branding'}
                    target={ctaReady && (ctaNewTab || /^https?:\/\//i.test(ctaLinkValue)) ? '_blank' : undefined}
                    rel={ctaReady && (ctaNewTab || /^https?:\/\//i.test(ctaLinkValue)) ? 'noreferrer noopener' : undefined}
                    onClick={(event) => {
                      if (!ctaReady) {
                        event.preventDefault()
                        const section = document.getElementById('header-branding')
                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        setNotice('CTA is empty right now. Set the label and link in Branding & CTA to activate the button.')
                      }
                    }}>
                    {ctaLabelValue}
                  </a>
                </div>

                <div className="header-chip-row">
                  <span className="header-chip">{draft.is_sticky ? 'Sticky on' : 'Sticky off'}</span>
                  <span className="header-chip">{navRootCount} root links</span>
                  <span className="header-chip">{navNodeCount} total menu items</span>
                  <span className="header-chip">CTA: {ctaStyle}</span>
                </div>
                {notice ? <div className="header-inline-note">{notice}</div> : null}
              </div>
            </div>

            <div className="ic header-nav-card">
              <div className="ic-h">
                <div>
                  <div className="header-section-title">Navigation Source</div>
                  <div className="header-section-subtitle">Navigation links are no longer edited here. The header reads them directly from Navigation Manager.</div>
                </div>
              </div>
              <div className="ic-b header-nav-source">
                <div className="header-nav-summary">
                  <div className="header-nav-badge">Shared menu</div>
                  <div className="header-nav-copy">
                    Add, reorder, nest, or remove links in Navigation Manager and this header will adopt them automatically.
                  </div>
                </div>
                <div className="header-nav-list">
                  {navLoading ? <div className="header-nav-empty">Loading navigation...</div> : null}
                  {!navLoading ? renderSourceNav(globalNav) : null}
                  {!navLoading && !globalNav.length ? (
                    <div className="header-nav-empty">No shared navigation items yet. Create them from Navigation Manager.</div>
                  ) : null}
                </div>
                <div className="header-nav-actions">
                  <Link className="gbtn pu" href="/layout/navigation">
                    Open Navigation Manager
                  </Link>
                  <button className="gbtn" type="button" onClick={() => void fetchGlobalNavigation()}>
                    Refresh Menu
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="header-main-column">
            <div className="ic">
              <div className="ic-h">Header Template</div>
              <div className="ic-b">
                <div className="ig">
                  <label>Select Header</label>
                  <select
                    className="form-select"
                    value={selectedId ?? ''}
                    onChange={(event) => {
                      const nextId = event.target.value ? Number(event.target.value) : null
                      setSelectedId(nextId)
                      if (nextId === null) {
                        setDraft({
                          ...emptyHeader(),
                          slug: `header-${headers.length + 1}`,
                          name: `Header ${headers.length + 1}`,
                          cta_label: 'Contact Us',
                          cta_link: '/contact',
                        })
                      }
                    }}
                    disabled={loading}>
                    <option value="">Create new header</option>
                    {headers.map((header) => (
                      <option key={header.id} value={header.id}>
                        {header.name || header.slug} {header.slug ? `(${header.slug})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ig">
                  <label>Slug</label>
                  <input value={draft.slug} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} />
                </div>
                <div className="ig">
                  <label>Name</label>
                  <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="ig">
                  <label>Background</label>
                  <input value={draft.bg_color} onChange={(event) => setDraft((current) => ({ ...current, bg_color: event.target.value }))} placeholder="#0f172a or transparent" />
                </div>
              </div>
            </div>

            <div className="ic" id="header-branding">
              <div className="ic-h">Branding & CTA</div>
              <div className="ic-b">
                <div className="ig">
                  <label>Logo URL</label>
                  <input value={draft.logo} onChange={(event) => setDraft((current) => ({ ...current, logo: event.target.value }))} placeholder="/uploads/logo-light.png" />
                  <input
                    type="file"
                    className="form-control mt-2"
                    accept="image/*"
                    onChange={(event) => event.target.files?.[0] && void uploadMedia(event.target.files[0], 'logo')}
                  />
                  <small className="text-muted">{uploadingField === 'logo' ? 'Uploading...' : 'Upload primary logo'}</small>
                </div>
                <div className="ig">
                  <label>Dark Logo URL</label>
                  <input value={draft.logo_dark} onChange={(event) => setDraft((current) => ({ ...current, logo_dark: event.target.value }))} placeholder="/uploads/logo-dark.png" />
                  <input
                    type="file"
                    className="form-control mt-2"
                    accept="image/*"
                    onChange={(event) => event.target.files?.[0] && void uploadMedia(event.target.files[0], 'logo_dark')}
                  />
                  <small className="text-muted">{uploadingField === 'logo_dark' ? 'Uploading...' : 'Upload alternate logo'}</small>
                </div>
                <div className="ig">
                  <label>CTA Label</label>
                  <input value={draft.cta_label} onChange={(event) => setDraft((current) => ({ ...current, cta_label: event.target.value }))} placeholder="Contact Us" />
                </div>
                <div className="ig">
                  <label>CTA Link</label>
                  <input value={draft.cta_link} onChange={(event) => setDraft((current) => ({ ...current, cta_link: event.target.value }))} placeholder="/contact" />
                </div>
                <div className="ig">
                  <label>CTA Style</label>
                  <select
                    value={ctaStyle}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          cta_style: event.target.value,
                        },
                      }))
                    }>
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
                <div className="ig">
                  <label>CTA Target</label>
                  <select
                    value={ctaNewTab ? 'new-tab' : 'same-tab'}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        settings: {
                          ...current.settings,
                          cta_new_tab: event.target.value === 'new-tab',
                        },
                      }))
                    }>
                    <option value="same-tab">Open in same tab</option>
                    <option value="new-tab">Open in new tab</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="ic">
              <div className="ic-h">Header Behavior</div>
              <div className="ic-b header-behavior-grid">
                <div className="header-toggle-card">
                  <div>
                    <div className="header-toggle-title">Sticky header</div>
                    <div className="header-toggle-copy">Keep the header visible while scrolling.</div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={draft.is_sticky}
                      onChange={(event) => setDraft((current) => ({ ...current, is_sticky: event.target.checked }))}
                    />
                  </div>
                </div>
                <div className="header-note-card">
                  <div className="header-note-title">How this works</div>
                  <div className="header-note-copy">
                    This screen controls the shell of the header. The actual menu tree comes from Navigation Manager, so there is only one place to maintain links.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .header-manager-shell {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .header-overview-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .header-overview-card {
          min-height: 132px;
          border-radius: 14px;
          border: 1px solid var(--b1);
          background:
            radial-gradient(circle at top right, rgba(124, 92, 252, 0.14), transparent 38%),
            linear-gradient(180deg, rgba(19, 21, 34, 0.96), rgba(15, 17, 28, 0.96));
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--t4);
          font-weight: 700;
        }

        .header-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--t1);
        }

        .header-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--pul);
        }

        .header-meta {
          font-size: 12px;
          line-height: 1.5;
          color: var(--t3);
        }

        .header-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 14px;
        }

        .header-main-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }

        .header-preview-card {
          overflow: visible !important;
        }

        .header-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--t1);
        }

        .header-section-subtitle {
          margin-top: 4px;
          font-size: 11px;
          color: var(--t3);
          line-height: 1.5;
        }

        .header-preview-surface {
          border: 1px solid var(--b1);
          border-radius: 18px;
          padding: 18px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          overflow: visible;
          position: relative;
          z-index: 1;
        }

        .header-preview-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .header-preview-logo {
          height: 40px;
          width: auto;
          flex-shrink: 0;
        }

        .header-preview-name {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.1;
        }

        .header-preview-slug {
          margin-top: 4px;
          font-size: 11px;
          opacity: 0.72;
        }

        .header-preview-links {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          align-items: center;
          min-width: 0;
        }

        .header-preview-pill,
        .header-preview-cta {
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
        }

        .header-preview-item {
          position: relative;
        }

        .header-preview-item::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 100%;
          height: 10px;
        }

        .header-preview-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 36px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.08);
          color: inherit;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          text-decoration: none;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
          white-space: nowrap;
        }

        .header-preview-link:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .header-preview-caret {
          font-size: 10px;
          opacity: 0.72;
          transition: transform 0.18s ease;
        }

        .header-preview-item.open .header-preview-caret {
          transform: rotate(180deg);
        }

        .header-preview-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 210px;
          padding: 10px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(12, 14, 22, 0.96);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.32);
          display: none;
          flex-direction: column;
          gap: 8px;
          z-index: 30;
        }

        .header-preview-item:hover > .header-preview-dropdown,
        .header-preview-item.open > .header-preview-dropdown {
          display: flex;
        }

        .header-preview-item.nested {
          width: 100%;
        }

        .header-preview-item.nested .header-preview-link {
          width: 100%;
          justify-content: space-between;
          border-radius: 10px;
          min-height: 34px;
        }

        .header-preview-pill {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.08);
          color: inherit;
        }

        .header-preview-pill.muted {
          opacity: 0.7;
        }

        .header-preview-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          color: #171923;
          white-space: nowrap;
          text-decoration: none;
          min-height: 38px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .header-preview-cta.outline {
          background: transparent;
          color: inherit;
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: none;
        }

        .header-preview-cta.ghost {
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
          box-shadow: none;
        }

        .header-preview-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(0, 0, 0, 0.22);
        }

        .header-preview-cta.placeholder {
          background: rgba(255, 255, 255, 0.16);
          color: inherit;
          border: 1px dashed rgba(255, 255, 255, 0.22);
          box-shadow: none;
        }

        .header-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .header-chip {
          border-radius: 999px;
          border: 1px solid var(--b1);
          background: var(--s2);
          color: var(--t2);
          padding: 6px 10px;
          font-size: 11px;
        }

        .header-inline-note {
          margin-top: 12px;
          border: 1px solid rgba(124, 92, 252, 0.2);
          border-radius: 10px;
          background: rgba(124, 92, 252, 0.08);
          color: var(--pul);
          padding: 10px 12px;
          font-size: 12px;
        }

        .header-nav-source {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .header-nav-summary {
          border-radius: 14px;
          border: 1px solid var(--b1);
          background: linear-gradient(180deg, rgba(18, 19, 31, 0.95), rgba(15, 17, 28, 0.95));
          padding: 14px;
        }

        .header-nav-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          background: rgba(18, 217, 130, 0.12);
          color: var(--grl);
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .header-nav-copy {
          margin-top: 10px;
          font-size: 13px;
          line-height: 1.55;
          color: var(--t2);
        }

        .header-nav-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header-nav-node {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 12px;
          border: 1px solid var(--b1);
          background: var(--s2);
          padding: 12px;
        }

        .header-nav-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--pu);
          flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(124, 92, 252, 0.12);
        }

        .header-nav-children {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .header-nav-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .header-nav-text strong {
          color: var(--t1);
          font-size: 13px;
        }

        .header-nav-text span {
          color: var(--t3);
          font-size: 11px;
          word-break: break-all;
        }

        .header-nav-empty {
          border: 1px dashed var(--b2);
          border-radius: 12px;
          background: var(--s2);
          color: var(--t3);
          padding: 14px;
          font-size: 12px;
        }

        .header-nav-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .header-behavior-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .header-toggle-card,
        .header-note-card {
          border: 1px solid var(--b1);
          border-radius: 14px;
          background: var(--s2);
          padding: 14px;
        }

        .header-toggle-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .header-toggle-title,
        .header-note-title {
          color: var(--t1);
          font-size: 14px;
          font-weight: 700;
        }

        .header-toggle-copy,
        .header-note-copy {
          margin-top: 4px;
          color: var(--t3);
          font-size: 12px;
          line-height: 1.55;
        }

        @media (max-width: 1200px) {
          .header-overview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .header-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .header-overview-grid {
            grid-template-columns: 1fr;
          }

          .header-preview-surface {
            grid-template-columns: 1fr;
            justify-items: start;
          }

          .header-preview-links {
            justify-content: flex-start;
            width: 100%;
          }

          .header-preview-dropdown {
            position: static;
            min-width: 100%;
            margin-top: 8px;
          }

          .header-preview-cta {
            width: 100%;
          }
        }
      `}</style>
    </ModuleShell>
  )
}
