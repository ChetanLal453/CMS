'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ModuleShell from '@/components/admin/ModuleShell'

type FooterLink = { id: string; label: string; href: string }
type FooterColumn = { id: string; heading: string; links: FooterLink[] }
type SocialLink = { id: string; platform: string; url: string }
type FooterSocialStyle = 'text' | 'icon' | 'circle'
type PagePoolItem = { id?: number; label: string; name: string; url: string; status: 'live' | 'draft' }
type FooterRecord = {
  id?: number
  slug: string
  name: string
  columns: FooterColumn[]
  copyright: string
  social_links: SocialLink[]
  bg_color: string
  settings: {
    logo_url?: string
    newsletter_enabled?: boolean
    copyright_text?: string
    company_address?: string
    company_email?: string
    company_phone?: string
    social_style?: FooterSocialStyle
    [key: string]: any
  }
}

const randomId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const createFooterLink = (): FooterLink => ({ id: randomId('fl'), label: 'New Link', href: '/' })
const createFooterColumn = (heading = 'Column'): FooterColumn => ({ id: randomId('fc'), heading, links: [createFooterLink()] })
const createSocialLink = (platform = 'LinkedIn'): SocialLink => ({ id: randomId('sl'), platform, url: '' })
const addSocialPreset = (current: SocialLink[], platform: string) => [...current, createSocialLink(platform)]

const emptyFooter = (): FooterRecord => ({
  slug: 'global-footer',
  name: 'Global Footer',
  columns: [createFooterColumn('Quick Links'), createFooterColumn('Company'), createFooterColumn('Resources')],
  copyright: '© 2026 Curve Metrics',
  social_links: [createSocialLink('LinkedIn'), createSocialLink('Instagram')],
  bg_color: '#111116',
  settings: {
    logo_url: '',
    newsletter_enabled: true,
    copyright_text: '© 2026 Curve Metrics',
    company_address: '',
    company_email: '',
    company_phone: '',
    social_style: 'text',
  },
})

const normalizeFooter = (footer: any): FooterRecord => {
  const settings = footer?.settings || {}
  const columns = Array.isArray(footer?.columns) ? footer.columns : []
  const socialLinks = Array.isArray(footer?.social_links) ? footer.social_links : []
  return {
    id: footer?.id,
    slug: footer?.slug || 'global-footer',
    name: footer?.name || 'Global Footer',
    columns:
      columns.length > 0
        ? columns.map((col: any, ci: number) => ({
            id: String(col?.id || `fc-${ci}`),
            heading: col?.heading || `Column ${ci + 1}`,
            links: Array.isArray(col?.links)
              ? col.links.map((lnk: any, li: number) => ({
                  id: String(lnk?.id || `fl-${ci}-${li}`),
                  label: lnk?.label || 'Link',
                  href: lnk?.href || '/',
                }))
              : [],
          }))
        : [],
    copyright: footer?.copyright || settings?.copyright_text || '',
    social_links:
      socialLinks.length > 0
        ? socialLinks.map((lnk: any, i: number) => ({ id: String(lnk?.id || `sl-${i}`), platform: lnk?.platform || 'Social', url: lnk?.url || '' }))
        : [],
    bg_color: footer?.bg_color || '#111116',
    settings: {
      ...settings,
      logo_url: footer?.logo_url || settings?.logo_url || '',
      newsletter_enabled:
        typeof footer?.newsletter_enabled === 'boolean'
          ? footer.newsletter_enabled
          : typeof settings?.newsletter_enabled === 'boolean'
            ? settings.newsletter_enabled
            : true,
      copyright_text: footer?.copyright_text || settings?.copyright_text || footer?.copyright || '',
      company_address: footer?.company_address || settings?.company_address || '',
      company_email: footer?.company_email || settings?.company_email || '',
      company_phone: footer?.company_phone || settings?.company_phone || '',
      social_style: (footer?.social_style || settings?.social_style || 'text') as FooterSocialStyle,
    },
  }
}

const reorderItems = <T,>(items: T[], from: number, to: number) => {
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

const isDarkSurface = (value?: string) => {
  if (!value || value === 'transparent') return false
  const hex = value.trim().toLowerCase()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)) return false
  const expanded =
    hex.length === 4
      ? `#${hex
          .slice(1)
          .split('')
          .map((c) => c + c)
          .join('')}`
      : hex
  const r = parseInt(expanded.slice(1, 3), 16)
  const g = parseInt(expanded.slice(3, 5), 16)
  const b = parseInt(expanded.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 160
}

const getSocialIconClass = (value?: string) => {
  const cleaned = String(value || '').trim().toLowerCase()
  if (cleaned.includes('linkedin')) return 'fab fa-linkedin-in'
  if (cleaned.includes('instagram')) return 'fab fa-instagram'
  if (cleaned.includes('facebook')) return 'fab fa-facebook-f'
  if (cleaned.includes('twitter') || cleaned === 'x') return 'fab fa-x-twitter'
  if (cleaned.includes('youtube')) return 'fab fa-youtube'
  if (cleaned.includes('whatsapp')) return 'fab fa-whatsapp'
  if (cleaned.includes('gmail') || cleaned.includes('mail') || cleaned.includes('email')) return 'fas fa-envelope'
  if (cleaned.includes('phone') || cleaned.includes('call')) return 'fas fa-phone'
  return 'fas fa-share-alt'
}

// ─── Inline style objects for the column card (100% immune to external CSS) ──
const cardStyle: React.CSSProperties = {
  width: '100%',
  background: '#1a1a1f',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  overflow: 'hidden',
  fontFamily: 'inherit',
}
const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '13px 16px',
  background: '#141418',
  borderBottom: '0.5px solid rgba(255,255,255,0.08)',
  minWidth: 0,
}
const cardBadgeStyle: React.CSSProperties = {
  flexShrink: 0,
  background: 'rgba(255,255,255,0.08)',
  color: 'rgba(255,255,255,0.45)',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  padding: '2px 7px',
  borderRadius: '4px',
}
const cardTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.85)',
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}
const cardSubtitleStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: '11px',
  color: 'rgba(255,255,255,0.3)',
  whiteSpace: 'nowrap',
  flexShrink: 0,
}
const cardBodyStyle: React.CSSProperties = {
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
}
const controlsRowStyle: React.CSSProperties = { display: 'flex', gap: '6px', alignItems: 'center' }

const ctrlBtnStyle = (danger = false, disabled = false): React.CSSProperties => ({
  width: '30px',
  height: '30px',
  borderRadius: '6px',
  border: danger ? '0.5px solid rgba(220,80,60,0.28)' : '0.5px solid rgba(255,255,255,0.1)',
  background: danger ? 'rgba(220,80,60,0.1)' : 'rgba(255,255,255,0.05)',
  color: danger ? '#e05a45' : 'rgba(255,255,255,0.55)',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
  opacity: disabled ? 0.3 : 1,
  flexShrink: 0,
  lineHeight: 1,
  padding: 0,
})

const fieldGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' }
const fieldLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
}
const fieldInputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '38px',
  background: 'rgba(255,255,255,0.04)',
  border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.85)',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  boxShadow: 'none',
}
const fieldSelectStyle: React.CSSProperties = {
  ...fieldInputStyle,
  color: 'rgba(255,255,255,0.7)',
  appearance: 'none' as any,
  cursor: 'pointer',
}
const sectionStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  border: '0.5px solid rgba(255,255,255,0.07)',
  borderRadius: '10px',
  overflow: 'hidden',
}
const sectionHeadStyle = (row = false): React.CSSProperties => ({
  padding: '11px 14px',
  borderBottom: '0.5px solid rgba(255,255,255,0.06)',
  display: row ? 'flex' : 'block',
  alignItems: row ? 'center' : undefined,
  justifyContent: row ? 'space-between' : undefined,
  gap: row ? '10px' : undefined,
})
const sectionTitleStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }
const sectionDescStyle: React.CSSProperties = { fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }
const sectionBodyStyle: React.CSSProperties = { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }

const addBtnStyle = (disabled = false): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  padding: '6px 12px',
  borderRadius: '7px',
  border: '0.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  opacity: disabled ? 0.5 : 1,
  flexShrink: 0,
})

const linkItemStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '0.5px solid rgba(255,255,255,0.07)',
  borderRadius: '9px',
  overflow: 'hidden',
}
const linkHeadStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  padding: '9px 12px',
  borderBottom: '0.5px solid rgba(255,255,255,0.06)',
}
const linkNumStyle: React.CSSProperties = { fontSize: '10px', fontWeight: 500, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }
const linkNameStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.55)' }
const removeBtnStyle = (disabled = false): React.CSSProperties => ({
  fontSize: '11px',
  color: disabled ? 'rgba(220,80,60,0.3)' : 'rgba(220,80,60,0.65)',
  background: 'none',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
  padding: '2px 7px',
  borderRadius: '4px',
})
const linkFieldsStyle: React.CSSProperties = { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }

export default function FooterEditorPage() {
  const [draft, setDraft] = useState<FooterRecord>(emptyFooter())
  const [pages, setPages] = useState<PagePoolItem[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingPages, setLoadingPages] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [notice, setNotice] = useState('')
  const [pageSelections, setPageSelections] = useState<Record<string, string>>({})
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({})

  const columnCount = draft.columns.length
  const linkCount = useMemo(() => draft.columns.reduce((n, c) => n + c.links.length, 0), [draft.columns])
  const socialCount = draft.social_links.filter((l) => l.platform.trim() || l.url.trim()).length
  const newsletterEnabled = draft.settings.newsletter_enabled !== false
  const brandingReady = Boolean(draft.settings.logo_url || draft.name.trim())
  const previewTone = isDarkSurface(draft.bg_color) ? 'dark' : 'light'
  const previewStyle = draft.bg_color ? { backgroundColor: draft.bg_color } : undefined
  const previewTextColor = previewTone === 'dark' ? '#f5f7ff' : '#171a24'
  const previewMutedColor = previewTone === 'dark' ? 'rgba(235,240,255,0.72)' : 'rgba(23,26,36,0.62)'
  const previewBorder = previewTone === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)'

  const builderInputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '40px',
    borderRadius: '8px',
    padding: '9px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
    boxShadow: 'none',
    outline: 'none',
    fontSize: '13px',
  }
  const builderMutedLabelStyle: React.CSSProperties = {
    color: 'var(--t3)',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  }

  const fetchFooter = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/footers', { credentials: 'include' })
      const data = await res.json().catch(() => null)
      if (!res.ok || data?.success === false) throw new Error(data?.error || 'Failed to load footer')
      const footer = data?.footer || data?.footers?.[0] || null
      setDraft(footer ? normalizeFooter(footer) : emptyFooter())
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to load footer right now.')
      setDraft(emptyFooter())
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPages = useCallback(async () => {
    setLoadingPages(true)
    try {
      const res = await fetch('/api/pages', { credentials: 'include' })
      const data = await res.json().catch(() => null)
      if (res.ok && Array.isArray(data?.pages)) {
        setPages(
          data.pages.map((p: any) => ({
            id: p.id,
            label: p.label || p.name || 'Untitled Page',
            name: p.name || p.label || 'Untitled Page',
            url: p.url || '/',
            status: p.status === 'draft' ? 'draft' : 'live',
          })),
        )
      }
    } finally {
      setLoadingPages(false)
    }
  }, [])

  useEffect(() => {
    void fetchFooter()
    void fetchPages()
  }, [fetchFooter, fetchPages])
  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(t)
  }, [notice])
  useEffect(() => {
    const h = () => {
      void fetchPages()
      setNotice('Footer page list refreshed.')
    }
    window.addEventListener('cm-pages-updated', h)
    return () => window.removeEventListener('cm-pages-updated', h)
  }, [fetchPages])

  const updateDraft = (recipe: (c: FooterRecord) => FooterRecord) => setDraft((c) => recipe(c))

  const uploadLogo = useCallback(async (file: File) => {
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('files', file)
      const res = await fetch('/api/media/upload', { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success || !data.uploaded?.[0]?.url) throw new Error(data.error || 'Upload failed')
      setDraft((c) => ({ ...c, settings: { ...c.settings, logo_url: data.uploaded[0].url } }))
      setNotice('Footer logo uploaded.')
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to upload footer logo.')
    } finally {
      setUploadingLogo(false)
    }
  }, [])

  const addPageToColumn = (colIdx: number) => {
    const col = draft.columns[colIdx]
    const page = pages.find((p) => p.url === pageSelections[col.id])
    if (!page) {
      setNotice('Select a page first, then add it to the column.')
      return
    }
    updateDraft((c) => ({
      ...c,
      columns: c.columns.map((item, i) =>
        i === colIdx ? { ...item, links: [...item.links, { id: randomId('fl'), label: page.label, href: page.url }] } : item,
      ),
    }))
    setNotice(`${page.label} added to ${col.heading || `Column ${colIdx + 1}`}.`)
  }

  const toggleCollapse = (id: string) => setCollapsedColumns((c) => ({ ...c, [id]: !c[id] }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        id: draft.id ?? undefined,
        slug: draft.slug.trim() || 'global-footer',
        name: draft.name.trim() || 'Global Footer',
        columns: draft.columns,
        social_links: draft.social_links,
        bg_color: draft.bg_color.trim() || '#111116',
        logo_url: draft.settings.logo_url || '',
        newsletter_enabled: draft.settings.newsletter_enabled !== false,
        copyright_text: draft.settings.copyright_text?.trim() || draft.copyright.trim() || '© 2026 Curve Metrics',
        copyright: draft.settings.copyright_text?.trim() || draft.copyright.trim() || '© 2026 Curve Metrics',
        company_address: draft.settings.company_address?.trim() || '',
        company_email: draft.settings.company_email?.trim() || '',
        company_phone: draft.settings.company_phone?.trim() || '',
        social_style: draft.settings.social_style || 'text',
      }
      const res = await fetch('/api/footers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to save footer')
      setDraft(normalizeFooter(data?.footer || data?.item))
      setNotice('Footer saved successfully.')
      window.dispatchEvent(
        new CustomEvent('cm-footer-updated', {
          detail: {
            id: data?.footer?.id ?? data?.item?.id ?? draft.id ?? null,
            slug: data?.footer?.slug ?? data?.item?.slug ?? draft.slug,
          },
        }),
      )
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Failed to save footer.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Column card — 100% inline styles ─────────────────────────────────────
  const renderColumnCard = (column: FooterColumn, colIdx: number) => {
    const isCollapsed = collapsedColumns[column.id] === true
    const isFirst = colIdx === 0
    const isLast = colIdx === draft.columns.length - 1

    return (
      <article key={column.id} style={cardStyle}>
        {/* Header */}
        <div style={cardHeaderStyle}>
          <span style={cardBadgeStyle}>{String(colIdx + 1).padStart(2, '0')}</span>
          <span style={cardTitleStyle}>{column.heading || `Column ${colIdx + 1}`}</span>
          <span style={cardSubtitleStyle}>Footer column builder</span>
        </div>

        {/* Body */}
        <div style={cardBodyStyle}>
          {/* Controls row */}
          <div style={controlsRowStyle}>
            <button
              style={ctrlBtnStyle(false, false)}
              type="button"
              title={isCollapsed ? 'Expand' : 'Collapse'}
              onClick={() => toggleCollapse(column.id)}>
              {isCollapsed ? '+' : '−'}
            </button>
            <button
              style={ctrlBtnStyle(false, isFirst)}
              type="button"
              title="Move left"
              disabled={isFirst}
              onClick={() => !isFirst && updateDraft((c) => ({ ...c, columns: reorderItems(c.columns, colIdx, colIdx - 1) }))}>
              ←
            </button>
            <button
              style={ctrlBtnStyle(false, isLast)}
              type="button"
              title="Move right"
              disabled={isLast}
              onClick={() => !isLast && updateDraft((c) => ({ ...c, columns: reorderItems(c.columns, colIdx, colIdx + 1) }))}>
              →
            </button>
            <button
              style={ctrlBtnStyle(true, draft.columns.length === 1)}
              type="button"
              title="Delete column"
              disabled={draft.columns.length === 1}
              onClick={() => updateDraft((c) => ({ ...c, columns: c.columns.filter((_, i) => i !== colIdx) }))}>
              ✕
            </button>
          </div>

          {/* Column name field */}
          <div style={fieldGroupStyle}>
            <label style={fieldLabelStyle}>Column name</label>
            <input
              style={fieldInputStyle}
              value={column.heading}
              placeholder="Footer column title"
              onChange={(e) =>
                updateDraft((c) => ({ ...c, columns: c.columns.map((item, i) => (i === colIdx ? { ...item, heading: e.target.value } : item)) }))
              }
            />
          </div>

          {!isCollapsed && (
            <>
              {/* ── Add page link section ── */}
              <div style={sectionStyle}>
                <div style={sectionHeadStyle()}>
                  <div style={sectionTitleStyle}>Add page link</div>
                  <div style={sectionDescStyle}>Bring in any page created from Page Editor.</div>
                </div>
                <div style={sectionBodyStyle}>
                  <div style={fieldGroupStyle}>
                    <label style={fieldLabelStyle}>Page picker</label>
                    <select
                      style={fieldSelectStyle}
                      value={pageSelections[column.id] || ''}
                      onChange={(e) => setPageSelections((cur) => ({ ...cur, [column.id]: e.target.value }))}>
                      <option value="">{loadingPages ? 'Loading pages...' : 'Select a page...'}</option>
                      {pages.map((page) => (
                        <option key={`${column.id}-${page.url}`} value={page.url}>
                          {page.label} ({page.url})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    style={addBtnStyle(loadingPages || !pages.length)}
                    type="button"
                    disabled={loadingPages || !pages.length}
                    onClick={() => addPageToColumn(colIdx)}>
                    + Add Page
                  </button>
                </div>
              </div>

              {/* ── Links section ── */}
              <div style={sectionStyle}>
                <div style={sectionHeadStyle(true)}>
                  <div>
                    <div style={sectionTitleStyle}>Links</div>
                    <div style={sectionDescStyle}>Manage labels and destinations for this column.</div>
                  </div>
                  <button
                    style={addBtnStyle()}
                    type="button"
                    onClick={() =>
                      updateDraft((c) => ({
                        ...c,
                        columns: c.columns.map((item, i) => (i === colIdx ? { ...item, links: [...item.links, createFooterLink()] } : item)),
                      }))
                    }>
                    + Add Custom Link
                  </button>
                </div>
                <div style={sectionBodyStyle}>
                  {column.links.map((link, li) => (
                    <div key={link.id} style={linkItemStyle}>
                      <div style={linkHeadStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={linkNumStyle}>{String(li + 1).padStart(2, '0')}</span>
                          <span style={linkNameStyle}>Link {li + 1}</span>
                        </div>
                        <button
                          style={removeBtnStyle(column.links.length === 1)}
                          type="button"
                          disabled={column.links.length === 1}
                          onClick={() =>
                            updateDraft((c) => ({
                              ...c,
                              columns: c.columns.map((item, i) =>
                                i === colIdx ? { ...item, links: item.links.filter((_, lii) => lii !== li) } : item,
                              ),
                            }))
                          }>
                          Remove
                        </button>
                      </div>
                      <div style={linkFieldsStyle}>
                        <div style={fieldGroupStyle}>
                          <label style={fieldLabelStyle}>Label</label>
                          <input
                            style={fieldInputStyle}
                            value={link.label}
                            placeholder="Link label"
                            onChange={(e) =>
                              updateDraft((c) => ({
                                ...c,
                                columns: c.columns.map((item, i) =>
                                  i === colIdx
                                    ? { ...item, links: item.links.map((entry, lii) => (lii === li ? { ...entry, label: e.target.value } : entry)) }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </div>
                        <div style={fieldGroupStyle}>
                          <label style={fieldLabelStyle}>URL</label>
                          <input
                            style={fieldInputStyle}
                            value={link.href}
                            placeholder="/about"
                            onChange={(e) =>
                              updateDraft((c) => ({
                                ...c,
                                columns: c.columns.map((item, i) =>
                                  i === colIdx
                                    ? { ...item, links: item.links.map((entry, lii) => (lii === li ? { ...entry, href: e.target.value } : entry)) }
                                    : item,
                                ),
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </article>
    )
  }
  // ──────────────────────────────────────────────────────────────────────────

  const renderFooterColumnsSection = () => (
    <section className="ic" id="footer-columns">
      <div className="ic-h">
        <div>
          <div className="footer-section-title">Footer Columns</div>
          <div className="footer-section-subtitle">Create as many columns as you want and name them however you like.</div>
        </div>
        <div className="footer-toolbar">
          <button
            className="gbtn"
            type="button"
            onClick={() => updateDraft((c) => ({ ...c, columns: [...c.columns, createFooterColumn(`Column ${c.columns.length + 1}`)] }))}>
            + Add Column
          </button>
        </div>
      </div>
      <div className="ic-b d-block">
        <div className="footer-columns-grid">{draft.columns.map((col, i) => renderColumnCard(col, i))}</div>
      </div>
    </section>
  )

  const renderSocialLinksSection = () => (
    <section className="ic" id="footer-socials">
      <div className="ic-h">
        <div>
          <div className="footer-section-title">Social Links</div>
          <div className="footer-section-subtitle">Add and manage as many social links as you need.</div>
        </div>
        <div className="footer-toolbar">
          <button
            className="gbtn"
            type="button"
            onClick={() => updateDraft((c) => ({ ...c, social_links: [...c.social_links, createSocialLink('X / Twitter')] }))}>
            + Add Social Link
          </button>
        </div>
      </div>
      <div className="ic-b d-block">
        {draft.social_links.length ? (
          <div className="footer-social-grid">
            {draft.social_links.map((link, index) => (
              <div key={link.id} className="footer-social-card">
                <div className="footer-social-card-head">
                  <div className="footer-social-badge">{String(index + 1).padStart(2, '00')}</div>
                  <span className="footer-social-title">Social link</span>
                  <button
                    className="gbtn footer-remove-btn"
                    type="button"
                    onClick={() =>
                      updateDraft((c) => ({
                        ...c,
                        social_links: c.social_links.filter((item) => item.id !== link.id),
                      }))
                    }>
                    Remove
                  </button>
                </div>
                <div className="footer-social-fields">
                  <div className="footer-link-field">
                    <span style={builderMutedLabelStyle}>Platform</span>
                    <input
                      className="footer-input"
                      style={builderInputStyle}
                      value={link.platform}
                      placeholder="Instagram"
                      onChange={(e) =>
                        updateDraft((c) => ({
                          ...c,
                          social_links: c.social_links.map((item, i) => (i === index ? { ...item, platform: e.target.value } : item)),
                        }))
                      }
                    />
                  </div>
                  <div className="footer-link-field">
                    <span style={builderMutedLabelStyle}>URL</span>
                    <input
                      className="footer-input"
                      style={builderInputStyle}
                      value={link.url}
                      placeholder="https://instagram.com/brand"
                      onChange={(e) =>
                        updateDraft((c) => ({
                          ...c,
                          social_links: c.social_links.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="footer-empty-state">
            No social links added yet. Use the quick buttons above to add Instagram, LinkedIn, WhatsApp, or a custom social profile.
          </div>
        )}
      </div>
    </section>
  )

  return (
    <ModuleShell
      title="Footer Manager"
      description="Shape the global footer once, then let every public page inherit the same columns, links, and contact details."
      className="info-wrap footer-wrap"
      actions={
        <>
          <Link className="gbtn" href="/layout">
            Back To Layout
          </Link>
          <button className="gbtn" type="button" onClick={() => window.open('/', '_blank')}>
            Preview Site
          </button>
          <button className="gbtn pu" type="button" onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? 'Saving Footer...' : 'Save Footer'}
          </button>
        </>
      }>
      {notice ? <div className="footer-notice">{notice}</div> : null}

      <div className="footer-manager-shell">
        <div className="footer-overview-grid">
          <article className="footer-overview-card">
            <div className="footer-overview-kicker">Structure</div>
            <div className="footer-overview-title">Footer columns</div>
            <div className="footer-overview-value">{columnCount}</div>
            <div className="footer-overview-meta">{linkCount} total links across all columns</div>
          </article>
          <article className="footer-overview-card">
            <div className="footer-overview-kicker">Branding</div>
            <div className="footer-overview-title">Brand block</div>
            <div className="footer-overview-value">{brandingReady ? 'Ready' : 'Needs setup'}</div>
            <div className="footer-overview-meta">Logo, footer name, and copyright line</div>
          </article>
          <article className="footer-overview-card">
            <div className="footer-overview-kicker">Connect</div>
            <div className="footer-overview-title">Social links</div>
            <div className="footer-overview-value">{socialCount}</div>
            <div className="footer-overview-meta">Instagram, LinkedIn, WhatsApp, and more</div>
          </article>
          <article className="footer-overview-card">
            <div className="footer-overview-kicker">Capture</div>
            <div className="footer-overview-title">Newsletter slot</div>
            <div className="footer-overview-value">{newsletterEnabled ? 'Enabled' : 'Hidden'}</div>
            <div className="footer-overview-meta">Keep a signup prompt inside the footer</div>
          </article>
        </div>

        <div className="footer-main-grid">
          <div className="footer-builder-stack">
            <section className="ic footer-manage-intro">
              <div className="ic-h">
                <div>
                  <div className="footer-section-title">Manage Footer Content</div>
                  <div className="footer-section-subtitle">Build columns, add links, and manage social links from one place.</div>
                </div>
                <div className="footer-toolbar">
                  <button
                    className="gbtn"
                    type="button"
                    onClick={() => document.getElementById('footer-columns')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                    Open Columns
                  </button>
                  <button
                    className="gbtn"
                    type="button"
                    onClick={() => document.getElementById('footer-socials')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                    Open Social Links
                  </button>
                </div>
              </div>
            </section>

            {renderFooterColumnsSection()}
            {renderSocialLinksSection()}

            <section className="ic footer-preview-card">
              <div className="ic-h">
                <div>
                  <div className="footer-section-title">Live Footer Preview</div>
                  <div className="footer-section-subtitle">This preview mirrors the public footer layout and tone.</div>
                </div>
              </div>
              <div className="footer-preview-wrap">
                <div className={`footer-preview-surface ${previewTone}`} style={previewStyle}>
                  <div className="footer-preview-top">
                    <div className="footer-preview-brand">
                      {draft.settings.logo_url ? (
                        <img src={draft.settings.logo_url} alt={draft.name || 'Footer logo'} className="footer-preview-logo" />
                      ) : (
                        <div className="footer-preview-logo-placeholder">Logo</div>
                      )}
                      <div className="footer-preview-brand-copy">
                        <strong style={{ color: previewTextColor }}>{draft.name || 'Global Footer'}</strong>
                        <span style={{ color: previewMutedColor }}>{newsletterEnabled ? 'Newsletter slot active' : 'Newsletter slot hidden'}</span>
                      </div>
                    </div>
                    {(draft.settings.company_address || draft.settings.company_email || draft.settings.company_phone) && (
                      <div className="footer-preview-contact" style={{ borderColor: previewBorder }}>
                        {draft.settings.company_address ? (
                          <span style={{ color: previewMutedColor }}>{draft.settings.company_address}</span>
                        ) : null}
                        {draft.settings.company_email ? (
                          <span style={{ color: previewMutedColor }}>{draft.settings.company_email}</span>
                        ) : null}
                        {draft.settings.company_phone ? (
                          <span style={{ color: previewMutedColor }}>{draft.settings.company_phone}</span>
                        ) : null}
                      </div>
                    )}
                    {newsletterEnabled && (
                      <div className="footer-preview-newsletter" style={{ borderColor: previewBorder }}>
                        <span style={{ color: previewTextColor }}>Stay in the loop</span>
                        <button className="footer-preview-newsletter-btn" type="button" onClick={(e) => e.preventDefault()}>
                          Join newsletter
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="footer-preview-columns">
                    {draft.columns.map((col, i) => (
                      <div key={col.id} className="footer-preview-column">
                        <div className="footer-preview-column-heading" style={{ color: previewTextColor }}>
                          {col.heading || `Column ${i + 1}`}
                        </div>
                        <div className="footer-preview-link-list">
                          {col.links.map((link) => (
                            <a
                              key={link.id}
                              className="footer-preview-link"
                              href={link.href || '/'}
                              onClick={(e) => e.preventDefault()}
                              style={{ color: previewMutedColor }}>
                              {link.label || 'Link'}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="footer-preview-bottom" style={{ borderTopColor: previewBorder }}>
                    <div className={`footer-preview-socials footer-preview-socials-${draft.settings.social_style || 'text'}`}>
                      {draft.social_links.length ? (
                        draft.social_links.map((link) => (
                          <a
                            key={link.id}
                            className={`footer-preview-social footer-preview-social-${draft.settings.social_style || 'text'}`}
                            href={link.url || '#'}
                            onClick={(e) => e.preventDefault()}
                            style={{ color: previewMutedColor }}
                            aria-label={link.platform || 'Social'}
                            title={link.platform || 'Social'}>
                            {(draft.settings.social_style || 'text') === 'text' ? (
                              link.platform || 'Social'
                            ) : (
                              <span className="footer-preview-social-glyph" aria-hidden="true">
                                <i className={getSocialIconClass(link.platform)} />
                              </span>
                            )}
                          </a>
                        ))
                      ) : (
                        <span style={{ color: previewMutedColor }}>Add social links to show them here.</span>
                      )}
                    </div>
                    <div className="footer-preview-copyright" style={{ color: previewMutedColor }}>
                      {draft.settings.copyright_text || draft.copyright || '© 2026 Curve Metrics'}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="footer-side-stack">
            <div className="ic">
              <div className="ic-h">Footer Template</div>
              <div className="ic-b">
                <div className="ig">
                  <label>Slug</label>
                  <input value={draft.slug} onChange={(e) => updateDraft((c) => ({ ...c, slug: e.target.value }))} />
                </div>
                <div className="ig">
                  <label>Background</label>
                  <input value={draft.bg_color} onChange={(e) => updateDraft((c) => ({ ...c, bg_color: e.target.value }))} />
                </div>
                <div className="ig full">
                  <label>Name</label>
                  <input value={draft.name} onChange={(e) => updateDraft((c) => ({ ...c, name: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="ic" id="footer-branding">
              <div className="ic-h">Branding & Details</div>
              <div className="ic-b">
                <div className="ig full">
                  <label>Footer Logo URL</label>
                  <input
                    value={draft.settings.logo_url || ''}
                    placeholder="/uploads/footer-logo.png"
                    onChange={(e) => updateDraft((c) => ({ ...c, settings: { ...c.settings, logo_url: e.target.value } }))}
                  />
                </div>
                <div className="ig full">
                  <label>Upload Footer Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void uploadLogo(e.target.files[0])} />
                  <small className="text-muted">
                    {uploadingLogo ? 'Uploading footer logo...' : 'Upload logo directly to media and apply it here'}
                  </small>
                </div>
                <div className="ig full">
                  <label>Copyright Text</label>
                  <input
                    value={draft.settings.copyright_text || draft.copyright}
                    placeholder="© 2026 Curve Metrics"
                    onChange={(e) =>
                      updateDraft((c) => ({ ...c, copyright: e.target.value, settings: { ...c.settings, copyright_text: e.target.value } }))
                    }
                  />
                </div>
                <div className="ig full">
                  <label>Company Address</label>
                  <input
                    value={draft.settings.company_address || ''}
                    placeholder="123 Main Street, City, Country"
                    onChange={(e) => updateDraft((c) => ({ ...c, settings: { ...c.settings, company_address: e.target.value } }))}
                  />
                </div>
                <div className="ig">
                  <label>Company Email</label>
                  <input
                    value={draft.settings.company_email || ''}
                    placeholder="hello@example.com"
                    onChange={(e) => updateDraft((c) => ({ ...c, settings: { ...c.settings, company_email: e.target.value } }))}
                  />
                </div>
                <div className="ig">
                  <label>Company Phone</label>
                  <input
                    value={draft.settings.company_phone || ''}
                    placeholder="+91 98765 43210"
                    onChange={(e) => updateDraft((c) => ({ ...c, settings: { ...c.settings, company_phone: e.target.value } }))}
                  />
                </div>
                <div className="ig">
                  <label>Social Style</label>
                  <select
                    value={draft.settings.social_style || 'text'}
                    onChange={(e) =>
                      updateDraft((c) => ({
                        ...c,
                        settings: {
                          ...c.settings,
                          social_style: e.target.value as FooterSocialStyle,
                        },
                      }))
                    }>
                    <option value="text">Text links</option>
                    <option value="icon">Icon links</option>
                    <option value="circle">Circle badges</option>
                  </select>
                </div>
                <div className="ig">
                  <label>Newsletter</label>
                  <select
                    value={newsletterEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => updateDraft((c) => ({ ...c, settings: { ...c.settings, newsletter_enabled: e.target.value === 'enabled' } }))}>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <div className="ig">
                  <label>Footer tone</label>
                  <div className="footer-tone-chip">{previewTone === 'dark' ? 'Dark footer' : 'Light footer'}</div>
                </div>
                <div className="ig full">
                  <label>Current Logo Preview</label>
                  <div className="footer-logo-preview">
                    {draft.settings.logo_url ? (
                      <img src={draft.settings.logo_url} alt={draft.name || 'Footer logo'} className="footer-logo-preview-image" />
                    ) : (
                      <span>No footer logo selected yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .footer-manager-shell {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .footer-notice {
          border: 1px solid rgba(124, 92, 252, 0.24);
          background: rgba(124, 92, 252, 0.1);
          color: #d9d0ff;
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 13px;
        }

        .footer-overview-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .footer-overview-card {
          min-height: 132px;
          border-radius: 14px;
          border: 1px solid var(--b1);
          padding: 16px;
          background:
            radial-gradient(circle at top right, rgba(124, 92, 252, 0.14), transparent 38%),
            linear-gradient(180deg, rgba(19, 21, 34, 0.96), rgba(15, 17, 28, 0.96));
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .footer-overview-kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--t4);
        }
        .footer-overview-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--t1);
        }
        .footer-overview-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--pul);
        }
        .footer-overview-meta {
          font-size: 12px;
          color: var(--t3);
          line-height: 1.5;
        }

        .footer-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
          gap: 14px;
          align-items: start;
        }
        .footer-builder-stack {
          display: grid;
          gap: 16px;
          min-width: 0;
        }
        .footer-side-stack {
          display: grid;
          gap: 16px;
          position: sticky;
          top: 12px;
        }
        .footer-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }
        .footer-toolbar :global(.gbtn) {
          min-height: 34px;
        }
        .footer-manage-intro {
          border-color: rgba(124, 92, 252, 0.18);
        }
        .footer-manage-intro :global(.ic-h) {
          border-bottom: none;
        }
        .footer-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--t1);
        }
        .footer-section-subtitle {
          margin-top: 4px;
          font-size: 11px;
          color: var(--t3);
          line-height: 1.5;
        }
        .footer-columns-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .footer-social-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .footer-social-card {
          border: 1px solid rgba(133, 145, 182, 0.14);
          border-radius: 18px;
          padding: 14px;
          background: linear-gradient(180deg, rgba(28, 30, 42, 0.96), rgba(16, 18, 27, 0.94));
          display: grid;
          gap: 10px;
        }
        .footer-social-card-head {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .footer-social-badge {
          min-width: 34px;
          height: 24px;
          padding: 0 8px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.45);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .footer-social-title {
          color: var(--t1);
          font-size: 13px;
          font-weight: 700;
        }
        .footer-social-fields {
          display: grid;
          gap: 10px;
        }
        .footer-link-field {
          display: grid;
          gap: 6px;
        }
        .footer-input {
          width: 100%;
          min-height: 40px;
          border-radius: 8px;
          padding: 9px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          box-shadow: none;
          outline: none;
          font-size: 13px;
          appearance: none;
        }
        .footer-empty-state {
          border: 1px dashed rgba(124, 92, 252, 0.22);
          border-radius: 18px;
          padding: 18px;
          background: rgba(124, 92, 252, 0.06);
          color: var(--t2);
          font-size: 13px;
          line-height: 1.6;
        }

        .footer-preview-card :global(.ic-b) {
          display: block;
        }
        .footer-preview-wrap {
          padding: 18px;
        }
        .footer-preview-help {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          padding: 0 18px 18px;
          color: var(--t2);
          font-size: 12px;
        }
        .footer-preview-help a {
          color: var(--pul);
          text-decoration: none;
          font-weight: 700;
        }
        .footer-preview-surface {
          border-radius: 28px;
          padding: 28px;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }
        .footer-preview-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }
        .footer-preview-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .footer-preview-logo,
        .footer-preview-logo-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          object-fit: contain;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: grid;
          place-items: center;
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .footer-preview-brand-copy {
          display: grid;
          gap: 6px;
        }
        .footer-preview-brand-copy strong {
          font-size: 20px;
        }
        .footer-preview-brand-copy span {
          font-size: 13px;
        }
        .footer-preview-contact {
          min-width: 220px;
          border: 1px solid;
          border-radius: 20px;
          padding: 14px;
          display: grid;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          align-content: start;
        }
        .footer-preview-newsletter {
          min-width: 220px;
          border: 1px solid;
          border-radius: 20px;
          padding: 14px;
          display: grid;
          gap: 10px;
        }
        .footer-preview-newsletter span {
          font-size: 14px;
          font-weight: 600;
        }
        .footer-preview-newsletter-btn {
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #8f73ff, #6d54fa);
          color: white;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          justify-self: start;
        }
        .footer-preview-columns {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .footer-preview-column {
          display: grid;
          gap: 12px;
          min-width: 0;
        }
        .footer-preview-column-heading {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 700;
        }
        .footer-preview-link-list {
          display: grid;
          gap: 9px;
        }
        .footer-preview-link {
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }
        .footer-preview-link:hover,
        .footer-preview-social:hover {
          color: #ffffff !important;
        }
        .footer-preview-bottom {
          margin-top: auto;
          padding-top: 18px;
          border-top: 1px solid;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .footer-preview-socials {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .footer-preview-social {
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .footer-preview-social-glyph {
          width: 28px;
          height: 28px;
          display: inline-grid;
          place-items: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          font-size: 11px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .footer-preview-social-label {
          line-height: 1;
        }
        .footer-preview-copyright {
          font-size: 13px;
        }

        .footer-tone-chip {
          min-height: 42px;
          border-radius: 14px;
          border: 1px solid var(--b1);
          background: var(--s2);
          display: flex;
          align-items: center;
          padding: 0 14px;
          color: var(--t1);
          font-weight: 600;
        }
        .footer-quick-actions {
          display: grid;
          gap: 10px;
        }
        .footer-logo-preview {
          min-height: 88px;
          border-radius: 16px;
          border: 1px dashed var(--b1);
          background: var(--s2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          color: var(--t2);
        }
        .footer-logo-preview-image {
          max-height: 56px;
          width: auto;
          object-fit: contain;
        }
        .footer-builder-stack :global(input[type='file']),
        .footer-side-stack :global(input[type='file']) {
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: var(--t2) !important;
          padding: 8px 10px !important;
          border-radius: 10px !important;
        }

        @media (max-width: 1200px) {
          .footer-overview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .footer-main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 900px) {
          .footer-overview-grid,
          .footer-preview-columns {
            grid-template-columns: 1fr;
          }
          .footer-toolbar {
            justify-content: flex-start;
          }
          .footer-preview-top {
            flex-direction: column;
          }
          .footer-preview-newsletter {
            min-width: 0;
          }
        }
      `}</style>
    </ModuleShell>
  )
}
