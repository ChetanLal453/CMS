'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import ModuleShell from '@/components/admin/ModuleShell'

type NavItem = {
  id: string
  label: string
  url: string
  status: 'live' | 'draft'
  newTab: boolean
  children: NavItem[]
}

type PagePoolItem = {
  id?: number
  name: string
  label: string
  url: string
  status: 'live' | 'draft'
}

type HeaderForm = {
  logo_url: string
  cta_label: string
  cta_link: string
  style: string
}

type FooterForm = {
  copyright_text: string
  logo_url: string
  newsletter_enabled: boolean
}

type SocialForm = {
  instagram: string
  linkedin: string
  twitter: string
  whatsapp: string
}

type BannerItem = {
  id: number | string
  slug: string
  name: string
  content?: {
    title?: string
    subtitle?: string
    description?: string
  } | null
  is_active?: boolean
}

type TemplateItem = {
  id: string | number
  name: string
  description?: string
  category?: string
  updated_at?: string | null
}

type ThemeSnapshot = {
  site_name: string
  primary_color: string
  secondary_color: string
  heading_font: string
  body_font: string
  meta_description: string
}

const defaultHeader: HeaderForm = {
  logo_url: '',
  cta_label: 'Contact Us',
  cta_link: '/contact',
  style: 'sticky',
}

const defaultFooter: FooterForm = {
  copyright_text: '© 2026 Curve Metrics Solutions Pvt. Ltd.',
  logo_url: '',
  newsletter_enabled: true,
}

const defaultSocial: SocialForm = {
  instagram: '',
  linkedin: '',
  twitter: '',
  whatsapp: '',
}

const defaultThemeSnapshot: ThemeSnapshot = {
  site_name: 'Curve Metrics',
  primary_color: '',
  secondary_color: '',
  heading_font: '',
  body_font: '',
  meta_description: '',
}

const createNavItem = (partial: Partial<NavItem> = {}): NavItem => ({
  id: partial.id || `nav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: partial.label || 'New Link',
  url: partial.url || '/new-link',
  status: partial.status === 'draft' ? 'draft' : 'live',
  newTab: Boolean(partial.newTab),
  children: Array.isArray(partial.children) ? partial.children : [],
})

function normalizeStatus(value: unknown): 'live' | 'draft' {
  return value === 'draft' ? 'draft' : 'live'
}

function normalizeNavItem(item: any): NavItem {
  return createNavItem({
    id: String(item?.id || ''),
    label: item?.label || 'New Link',
    url: item?.url || item?.href || '/new-link',
    status: normalizeStatus(item?.status),
    newTab: item?.new_tab != null ? Boolean(item.new_tab) : Boolean(item?.open_new_tab),
    children: Array.isArray(item?.children) ? item.children.map(normalizeNavItem) : [],
  })
}

function flattenTree(items: NavItem[], depth = 0): Array<NavItem & { depth: number }> {
  return items.flatMap((item) => [
    { ...item, depth },
    ...flattenTree(item.children, depth + 1),
  ])
}

function normalizeComparableUrl(url: string) {
  const value = url.trim()
  if (!value) {
    return ''
  }

  if (value === '/') {
    return '/'
  }

  return value.replace(/\/+$/, '')
}

function updateTree(items: NavItem[], targetId: string, updater: (item: NavItem) => NavItem): NavItem[] {
  return items.map((item) =>
    item.id === targetId
      ? updater(item)
      : {
          ...item,
          children: updateTree(item.children, targetId, updater),
        },
  )
}

function removeTreeItem(items: NavItem[], targetId: string): NavItem[] {
  return items
    .filter((item) => item.id !== targetId)
    .map((item) => ({
      ...item,
      children: removeTreeItem(item.children, targetId),
    }))
}

function reorderItems<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function moveTreeItem(items: NavItem[], parentId: string | null, fromIndex: number, toIndex: number): NavItem[] {
  if (parentId === null) {
    return reorderItems(items, fromIndex, toIndex)
  }

  return updateTree(items, parentId, (item) => ({
    ...item,
    children: reorderItems(item.children, fromIndex, toIndex),
  }))
}

export default function LayoutPage() {
  const [navData, setNavData] = useState<NavItem[]>([])
  const [pages, setPages] = useState<PagePoolItem[]>([])
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [headerForm, setHeaderForm] = useState<HeaderForm>(defaultHeader)
  const [footerForm, setFooterForm] = useState<FooterForm>(defaultFooter)
  const [socialForm, setSocialForm] = useState<SocialForm>(defaultSocial)
  const [themeSnapshot, setThemeSnapshot] = useState<ThemeSnapshot>(defaultThemeSnapshot)
  const [loading, setLoading] = useState(true)
  const [navSaving, setNavSaving] = useState(false)
  const [layoutSaving, setLayoutSaving] = useState(false)
  const [pageCreateSaving, setPageCreateSaving] = useState(false)
  const [showNavSaved, setShowNavSaved] = useState(false)
  const [toast, setToast] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkParentId, setNewLinkParentId] = useState('root')
  const [newPageName, setNewPageName] = useState('')
  const [dragState, setDragState] = useState<{ parentId: string | null; index: number } | null>(null)
  const [builderMessage, setBuilderMessage] = useState('')

  const flattenedNav = useMemo(() => flattenTree(navData), [navData])
  const selectedItem = useMemo(
    () => flattenedNav.find((item) => item.id === selectedId) || null,
    [flattenedNav, selectedId],
  )
  const parentLabels = useMemo(() => {
    const map: Record<string, string> = {}

    const visit = (items: NavItem[], parentLabel = 'Top level') => {
      items.forEach((item) => {
        map[item.id] = parentLabel
        visit(item.children, item.label || 'Untitled Link')
      })
    }

    visit(navData)
    return map
  }, [navData])
  const validationErrors = useMemo(() => {
    const urlCounts = flattenedNav.reduce<Record<string, number>>((acc, item) => {
      const key = normalizeComparableUrl(item.url)
      if (key) {
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {})

    return flattenedNav.reduce<Record<string, string[]>>((acc, item) => {
      const issues: string[] = []
      if (!item.label.trim()) {
        issues.push('Label is required.')
      }

      const comparableUrl = normalizeComparableUrl(item.url)
      if (comparableUrl && urlCounts[comparableUrl] > 1) {
        issues.push('URL must be unique across navigation items.')
      }

      if (issues.length) {
        acc[item.id] = issues
      }
      return acc
    }, {})
  }, [flattenedNav])
  const newLinkErrors = useMemo(() => {
    const issues: string[] = []
    if (newLinkLabel && !newLinkLabel.trim()) {
      issues.push('Label is required.')
    }

    const comparableUrl = normalizeComparableUrl(newLinkUrl)
    if (comparableUrl && flattenedNav.some((item) => normalizeComparableUrl(item.url) === comparableUrl)) {
      issues.push('URL already exists in navigation.')
    }

    return issues
  }, [flattenedNav, newLinkLabel, newLinkUrl])
  const hasNavValidationErrors = Object.keys(validationErrors).length > 0

  useEffect(() => {
    let active = true

    async function loadAll() {
      setLoading(true)
      try {
        const [navRes, pagesRes, headersRes, footersRes, settingsRes, bannersRes, templatesRes] = await Promise.all([
          fetch('/api/navigation', { credentials: 'include' }),
          fetch('/api/pages', { credentials: 'include' }),
          fetch('/api/headers', { credentials: 'include' }),
          fetch('/api/footers', { credentials: 'include' }),
          fetch('/api/settings', { credentials: 'include' }),
          fetch('/api/banners', { credentials: 'include' }),
          fetch('/api/templates/list?limit=8', { credentials: 'include' }),
        ])

        const [navPayload, pagesData, headersData, footersData, settingsData, bannersData, templatesData] = await Promise.all([
          navRes.json(),
          pagesRes.json(),
          headersRes.json(),
          footersRes.json(),
          settingsRes.json(),
          bannersRes.json().catch(() => null),
          templatesRes.json().catch(() => null),
        ])

        if (!active) {
          return
        }

        const nextNav = Array.isArray(navPayload?.items)
          ? navPayload.items.map(normalizeNavItem)
          : Array.isArray(navPayload?.navigation)
            ? navPayload.navigation.map(normalizeNavItem)
            : []

        setNavData(nextNav)
        setExpanded(
          flattenTree(nextNav).reduce<Record<string, boolean>>((acc, item) => {
            if (item.children.length) {
              acc[item.id] = true
            }
            return acc
          }, {}),
        )

        setPages(
          Array.isArray(pagesData?.pages)
            ? [...pagesData.pages]
                .map((page: any) => ({
                  id: page.id,
                  name: page.name || page.label || 'Untitled Page',
                  label: page.label || page.name || 'Untitled Page',
                  url: page.url || '/',
                  status: normalizeStatus(page.status),
                }))
                .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))
            : [],
        )

        const header = headersData?.header || headersData?.headers?.[0]
        setHeaderForm({
          logo_url: header?.logo_url || header?.logo || '',
          cta_label: header?.cta_label || 'Contact Us',
          cta_link: header?.cta_link || '/contact',
          style: header?.style || header?.settings?.style || 'sticky',
        })

        const footer = footersData?.footer || footersData?.footers?.[0]
        setFooterForm({
          copyright_text:
            footer?.copyright_text ||
            footer?.copyright ||
            '© 2026 Curve Metrics Solutions Pvt. Ltd.',
          logo_url: footer?.logo_url || footer?.settings?.logo_url || '',
          newsletter_enabled:
            typeof footer?.newsletter_enabled === 'boolean'
              ? footer.newsletter_enabled
              : true,
        })

        const settings = settingsData?.settings || {}
        setSocialForm({
          instagram: settings.instagram_url || '',
          linkedin: settings.linkedin_url || '',
          twitter: settings.twitter_url || '',
          whatsapp: settings.whatsapp_number || '',
        })
        setThemeSnapshot({
          site_name: settings.site_name || 'Curve Metrics',
          primary_color: settings.primary_color || '',
          secondary_color: settings.secondary_color || '',
          heading_font: settings.heading_font || '',
          body_font: settings.body_font || '',
          meta_description: settings.meta_description || '',
        })

        setBanners(Array.isArray(bannersData?.banners) ? bannersData.banners : [])
        setTemplates(
          Array.isArray(templatesData?.templates)
            ? templatesData.templates
            : Array.isArray(templatesData?.data)
              ? templatesData.data
              : [],
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    const handlePagesUpdated = () => {
      void loadAll()
    }

    const handleFooterUpdated = () => {
      void loadAll()
    }

    window.addEventListener('cm-pages-updated', handlePagesUpdated)
    window.addEventListener('cm-footer-updated', handleFooterUpdated)
    void loadAll()

    return () => {
      active = false
      window.removeEventListener('cm-pages-updated', handlePagesUpdated)
      window.removeEventListener('cm-footer-updated', handleFooterUpdated)
    }
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timer = window.setTimeout(() => setToast(''), 2800)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!showNavSaved) {
      return
    }

    const timer = window.setTimeout(() => setShowNavSaved(false), 2800)
    return () => window.clearTimeout(timer)
  }, [showNavSaved])

  const availablePages = useMemo(() => {
    const existingUrls = new Set(flattenedNav.map((item) => item.url))
    return pages.filter((page) => !existingUrls.has(page.url))
  }, [flattenedNav, pages])

  const navStats = useMemo(
    () => ({
      links: flattenedNav.length,
      topLevel: navData.length,
      pagesAvailable: availablePages.length,
      banners: banners.length,
      templates: templates.length,
    }),
    [availablePages.length, banners.length, flattenedNav.length, navData.length, templates.length],
  )

  const headerConfigured = Boolean(headerForm.logo_url || headerForm.cta_label || headerForm.cta_link)
  const footerConfigured = Boolean(footerForm.copyright_text || footerForm.logo_url)
  const themeConfigured = Boolean(
    themeSnapshot.primary_color ||
      themeSnapshot.secondary_color ||
      themeSnapshot.heading_font ||
      themeSnapshot.body_font,
  )

  const parentOptions = useMemo(
    () => [{ id: 'root', label: 'Top level' }, ...flattenedNav.map((item) => ({ id: item.id, label: `${'— '.repeat(item.depth)}${item.label}` }))],
    [flattenedNav],
  )

  const addItemToTree = (item: NavItem, parentId: string | null = null) => {
    setBuilderMessage('')
    setNavData((current) => {
      if (parentId === null) {
        return [...current, item]
      }

      return updateTree(current, parentId, (parent) => ({
        ...parent,
        children: [...parent.children, item],
      }))
    })

    if (parentId) {
      setExpanded((current) => ({ ...current, [parentId]: true }))
    }
    setSelectedId(item.id)
  }

  const addCustomLink = () => {
    const label = newLinkLabel.trim()
    const url = newLinkUrl.trim()

    if (!label || !url) {
      setBuilderMessage('Label and URL are required before adding a link.')
      return
    }

    if (newLinkErrors.length) {
      setBuilderMessage(newLinkErrors[0])
      return
    }

    addItemToTree(
      createNavItem({
        label,
        url,
        status: 'live',
        newTab: /^https?:\/\//i.test(url),
      }),
      newLinkParentId === 'root' ? null : newLinkParentId,
    )

    setNewLinkLabel('')
    setNewLinkUrl('')
    setNewLinkParentId('root')
  }

  const addFromPage = (page: PagePoolItem, parentId: string | null = null) => {
    const comparableUrl = normalizeComparableUrl(page.url)
    if (flattenedNav.some((item) => normalizeComparableUrl(item.url) === comparableUrl)) {
      setBuilderMessage('That page is already attached to the navigation.')
      return
    }

    addItemToTree(
      createNavItem({
        label: page.label || page.name,
        url: page.url,
        status: page.status,
      }),
      parentId,
    )
  }

  const createPageAndAttach = async () => {
    const name = newPageName.trim()
    if (!name) {
      setBuilderMessage('Enter a page name before creating it.')
      return
    }

    setPageCreateSaving(true)
    setBuilderMessage('')
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      const data = await response.json()

      if (!response.ok || !data?.success || !data?.page) {
        throw new Error(data?.error || 'Failed to create page')
      }

      const createdPage = {
        id: data.page.id,
        name: data.page.name || data.page.title || name,
        label: data.page.label || data.page.name || data.page.title || name,
        url: data.page.url || `/${data.page.slug || ''}`.replace(/\/+/g, '/'),
        status: data.page.disabled ? 'draft' : 'live',
      } satisfies PagePoolItem

      setPages((current) => {
        const withoutDuplicate = current.filter((page) => page.url !== createdPage.url)
        return [createdPage, ...withoutDuplicate]
      })
      addFromPage(createdPage, newLinkParentId === 'root' ? null : newLinkParentId)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cm-pages-updated', { detail: { pageId: createdPage.id } }))
      }
      setNewPageName('')
      setToast(`Page "${createdPage.label}" created and linked to navigation.`)
    } catch (error) {
      setBuilderMessage(error instanceof Error ? error.message : 'Failed to create page')
    } finally {
      setPageCreateSaving(false)
    }
  }

  const addChildToSelected = () => {
    if (!selectedId) {
      return
    }

    addItemToTree(createNavItem({ status: 'draft' }), selectedId)
  }

  const deleteSelected = () => {
    if (!selectedId) {
      return
    }

    setNavData((current) => removeTreeItem(current, selectedId))
    setSelectedId(null)
  }

  const saveNav = async () => {
    if (hasNavValidationErrors) {
      setToast('Fix navigation validation errors before saving.')
      return
    }

    setNavSaving(true)
    try {
      const response = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: navData }),
      })

      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to save navigation')
      }

      const savedTree = Array.isArray(data?.items)
        ? data.items.map(normalizeNavItem)
        : Array.isArray(data?.navigation)
          ? data.navigation.map(normalizeNavItem)
          : []

      setNavData(savedTree)
      setShowNavSaved(true)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cm-navigation-updated'))
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to save navigation')
    } finally {
      setNavSaving(false)
    }
  }

  const saveAll = async () => {
    setLayoutSaving(true)
    try {
      const responses = await Promise.all([
        fetch('/api/headers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(headerForm),
        }),
        fetch('/api/footers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(footerForm),
        }),
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            instagram_url: socialForm.instagram,
            linkedin_url: socialForm.linkedin,
            twitter_url: socialForm.twitter,
            whatsapp_number: socialForm.whatsapp,
          }),
        }),
      ])

      if (responses.some((response) => !response.ok)) {
        throw new Error('Failed to save layout')
      }

      setToast('Layout saved successfully')
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Failed to save layout')
    } finally {
      setLayoutSaving(false)
    }
  }

  const renderNavTree = (items: NavItem[], parentId: string | null = null, depth = 0): React.ReactNode =>
    items.map((item, index) => {
      const isSelected = selectedId === item.id
      const isExpanded = expanded[item.id] !== false
      const hasChildren = item.children.length > 0
      const itemErrors = validationErrors[item.id] || []

      return (
        <div key={item.id} className={`nav-node ${depth > 0 ? 'is-child' : ''}`}>
          <div
            draggable
            className={`nav-row ${isSelected ? 'selected' : ''} ${item.status === 'draft' ? 'is-draft' : ''} ${itemErrors.length ? 'has-error' : ''}`}
            style={{ paddingLeft: `${14 + depth * 22}px` }}
            onClick={() => setSelectedId(item.id)}
            onDragStart={() => setDragState({ parentId, index })}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragState && dragState.parentId === parentId && dragState.index !== index) {
                setNavData((current) => moveTreeItem(current, parentId, dragState.index, index))
              }
              setDragState(null)
            }}>
            <button
              type="button"
              className={`nav-expand ${hasChildren ? '' : 'empty'}`}
              onClick={(event) => {
                event.stopPropagation()
                if (hasChildren) {
                  setExpanded((current) => ({ ...current, [item.id]: !isExpanded }))
                }
              }}>
              {hasChildren ? (isExpanded ? '▾' : '▸') : '•'}
            </button>
            <span className={`node-dot ${item.status === 'live' ? 'is-live' : 'is-draft'}`} />
            <div className="nav-copy">
              <div className="nav-title">{item.label}</div>
              <div className="nav-url">{item.url}</div>
            </div>
            <div className="nav-badges">
              <span className={`nm-badge ${item.status === 'live' ? 'badge-live' : 'badge-draft'}`}>
                {item.status === 'live' ? 'Live' : 'Draft'}
              </span>
              <button
                type="button"
                className="nav-mini-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  addItemToTree(createNavItem({ status: 'draft' }), item.id)
                }}>
                + Add Child
              </button>
              {item.children.length ? <span className="nm-badge badge-drop">{item.children.length} child</span> : null}
              {item.newTab ? <span className="nm-badge badge-ext">New tab</span> : null}
            </div>
          </div>

          {itemErrors.length ? (
            <div className="nav-inline-error">
              {itemErrors.map((message) => (
                <div key={message}>{message}</div>
              ))}
            </div>
          ) : null}

          {hasChildren && isExpanded ? <div className="nav-children">{renderNavTree(item.children, item.id, depth + 1)}</div> : null}
        </div>
      )
    })

  const renderPreviewTree = (items: NavItem[], depth = 0): React.ReactNode =>
    items.map((item) => (
      <div key={`preview-${item.id}`} className={`preview-node ${item.status === 'draft' ? 'is-draft' : ''}`} style={{ marginLeft: depth ? `${depth * 18}px` : 0 }}>
        <div className="preview-row">
          <span className="preview-bullet">{item.children.length ? (expanded[item.id] === false ? '▶' : '▼') : '•'}</span>
          <div>
            <div className="preview-title">{item.label}</div>
            <div className="preview-url">{item.url}</div>
          </div>
        </div>
        {item.children.length && expanded[item.id] !== false ? (
          <div className="preview-children">{renderPreviewTree(item.children, depth + 1)}</div>
        ) : null}
      </div>
    ))

  return (
    <ModuleShell
      className="layout-wrap"
      title="Layout"
      description="Manage header, footer, menus, banners, templates, and global theme settings."
      actions={(
        <>
          <button className="gbtn" type="button" onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}>
            Preview Site
          </button>
          <button className="gbtn pu" type="button" onClick={() => void saveAll()} disabled={layoutSaving}>
            {layoutSaving ? 'Saving...' : 'Save Layout'}
          </button>
        </>
      )}>
      <div className="layout-overview-grid">
        <Link className="layout-overview-card" href="/layout/navigation">
          <div className="layout-overview-kicker">Menus</div>
          <div className="layout-overview-title">Navigation Builder</div>
          <div className="layout-overview-value">{navStats.links} links</div>
          <div className="layout-overview-meta">{navStats.topLevel} top-level items · open manager</div>
        </Link>
        <Link className="layout-overview-card" href="/layout/header">
          <div className="layout-overview-kicker">Global</div>
          <div className="layout-overview-title">Header Manager</div>
          <div className="layout-overview-value">{headerConfigured ? 'Configured' : 'Needs setup'}</div>
          <div className="layout-overview-meta">Logo, CTA, sticky behavior, and full header navigation</div>
        </Link>
        <Link className="layout-overview-card" href="/layout/footer">
          <div className="layout-overview-kicker">Global</div>
          <div className="layout-overview-title">Footer Manager</div>
          <div className="layout-overview-value">{footerConfigured ? 'Configured' : 'Needs setup'}</div>
          <div className="layout-overview-meta">Columns, socials, copyright, and live preview</div>
        </Link>
        <a className="layout-overview-card" href="#layout-banners">
          <div className="layout-overview-kicker">Promo</div>
          <div className="layout-overview-title">Banner Registry</div>
          <div className="layout-overview-value">{navStats.banners} active</div>
          <div className="layout-overview-meta">Announcement / hero banners</div>
        </a>
        <a className="layout-overview-card" href="#layout-templates">
          <div className="layout-overview-kicker">Reusable</div>
          <div className="layout-overview-title">Templates</div>
          <div className="layout-overview-value">{navStats.templates} saved</div>
          <div className="layout-overview-meta">Page templates and reusable starts</div>
        </a>
        <a className="layout-overview-card" href="#layout-theme">
          <div className="layout-overview-kicker">Design</div>
          <div className="layout-overview-title">Theme & Settings</div>
          <div className="layout-overview-value">{themeConfigured ? 'Ready' : 'Needs setup'}</div>
          <div className="layout-overview-meta">{themeSnapshot.site_name}</div>
        </a>
      </div>

      <div className="ic layout-nav-manager" id="layout-navigation">
          <div className="ic-h">
            <div>
              <div className="layout-nav-title">Navigation Builder</div>
            <div className="layout-nav-subtitle">Tree-based CMS navigation with nested children, ordering, and page linking</div>
          </div>
          <div className="pg-actions">
            <Link className="gbtn" href="/layout/navigation">
              Open Navigation Manager
            </Link>
            <button className="gbtn" type="button" onClick={() => addItemToTree(createNavItem({ status: 'draft' }))}>
              + Add Top Level Link
            </button>
            <button className="gbtn pu" type="button" onClick={() => void saveNav()} disabled={navSaving}>
              {navSaving ? 'Saving...' : 'Save Navigation'}
            </button>
          </div>
        </div>

        <div className="layout-nav-grid">
          <div className="layout-nav-main nm-left">
            <div className="layout-nav-label">Live Preview</div>
            <div className="layout-preview-card">
              {navData.length ? renderPreviewTree(navData) : <div className="layout-empty">Preview will appear as you add items.</div>}
            </div>

            <div className="layout-nav-label">Navigation Structure</div>
            <div className="nav-builder">
              {loading ? <div className="layout-empty">Loading navigation...</div> : null}
              {!loading && navData.length ? renderNavTree(navData) : null}
              {!loading && !navData.length ? <div className="layout-empty">No navigation items yet. Add your first link from the right panel.</div> : null}
            </div>

            {builderMessage ? <div className="nav-inline-error standalone">{builderMessage}</div> : null}

            {showNavSaved ? (
              <div className="layout-save-note">
                Navigation saved. Parent and child links will render from the database on the public site.
              </div>
            ) : null}
          </div>

          <div className="layout-nav-side nm-right">
            <div className="layout-nav-label">Edit Selected Item</div>
            <div className="layout-side-card">
              {selectedItem ? (
                <div className="layout-edit-panel">
                  <div className="layout-side-note">
                    Parent Item: <strong>{parentLabels[selectedItem.id] || 'Top level'}</strong>
                  </div>
                  <div className="ig">
                    <label>Label</label>
                    <input
                      value={selectedItem.label}
                      onChange={(event) =>
                        setNavData((current) =>
                          updateTree(current, selectedItem.id, (item) => ({ ...item, label: event.target.value })),
                        )
                      }
                    />
                    {validationErrors[selectedItem.id]?.includes('Label is required.') ? <div className="field-error">Label is required.</div> : null}
                  </div>
                  <div className="ig">
                    <label>URL / Path</label>
                    <input
                      value={selectedItem.url}
                      onChange={(event) =>
                        setNavData((current) =>
                          updateTree(current, selectedItem.id, (item) => ({ ...item, url: event.target.value })),
                        )
                      }
                    />
                    {validationErrors[selectedItem.id]?.includes('URL must be unique across navigation items.') ? (
                      <div className="field-error">URL must be unique across navigation items.</div>
                    ) : null}
                  </div>
                  <div className="layout-toggles">
                    <div className="tgrow">
                      <span className="tglbl">Open in new tab</span>
                      <div
                        className={`tg ${selectedItem.newTab ? 'on' : ''}`}
                        onClick={() =>
                          setNavData((current) =>
                            updateTree(current, selectedItem.id, (item) => ({ ...item, newTab: !item.newTab })),
                          )
                        }
                      />
                    </div>
                    <div className="tgrow">
                      <span className="tglbl">Status</span>
                      <select
                        value={selectedItem.status}
                        onChange={(event) =>
                          setNavData((current) =>
                            updateTree(current, selectedItem.id, (item) => ({
                              ...item,
                              status: normalizeStatus(event.target.value),
                            })),
                          )
                        }>
                        <option value="live">Live</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div className="layout-edit-actions">
                    <button type="button" className="gbtn" onClick={addChildToSelected}>
                      + Add Child
                    </button>
                    <button type="button" className="gbtn danger-outline" onClick={deleteSelected}>
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="layout-side-empty">Select a navigation item to edit it.</div>
              )}
            </div>

            <div className="layout-nav-label">Add Link From Pages</div>
            <div className="layout-side-card">
              <div className="ig">
                <label>Parent Item</label>
                <select value={newLinkParentId} onChange={(event) => setNewLinkParentId(event.target.value)}>
                  {parentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="layout-side-note">
                  New links will be created under <strong>{parentOptions.find((option) => option.id === newLinkParentId)?.label || 'Top level'}</strong>.
                </div>
              </div>
              {availablePages.map((page) => (
                <button
                  key={page.url}
                  type="button"
                  className={`pool-item ${page.status === 'draft' ? 'is-draft' : ''}`}
                  onClick={() => addFromPage(page, newLinkParentId === 'root' ? null : newLinkParentId)}>
                  <span className="dot" style={{ background: page.status === 'live' ? 'var(--gr)' : 'var(--am)' }} />
                  <span className="pool-name">{page.label || page.name}</span>
                  <span className="pool-url">{page.url}</span>
                  <span className="add-icon">+ add</span>
                </button>
              ))}
              {!availablePages.length ? <div className="layout-side-empty tight">All pages are already present in the navigation tree.</div> : null}

              <div className="layout-side-note" style={{ marginTop: '12px' }}>
                Need a new page first? Create it here and it will be added to the navigation right away.
              </div>
              <div className="ig" style={{ marginTop: '10px' }}>
                <label>New Page Name</label>
                <input value={newPageName} onChange={(event) => setNewPageName(event.target.value)} placeholder="Blog" />
              </div>
              <button className="gbtn pu" type="button" onClick={() => void createPageAndAttach()} disabled={pageCreateSaving}>
                {pageCreateSaving ? 'Creating...' : 'Create Page & Add'}
              </button>
            </div>

            <div className="layout-nav-label">Add Custom Link</div>
            <div className="layout-side-card">
              <div className="ig">
                <label>Label</label>
                <input value={newLinkLabel} onChange={(event) => setNewLinkLabel(event.target.value)} placeholder="Services" />
                {!newLinkLabel.trim() && newLinkLabel.length > 0 ? <div className="field-error">Label is required.</div> : null}
              </div>
              <div className="ig">
                <label>URL</label>
                <input value={newLinkUrl} onChange={(event) => setNewLinkUrl(event.target.value)} placeholder="/services" />
                {newLinkErrors.includes('URL already exists in navigation.') ? <div className="field-error">URL already exists in navigation.</div> : null}
              </div>
              <button className="gbtn pu" type="button" onClick={addCustomLink}>
                Add Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="layout-settings-grid">
        <div>
          <div className="ic" id="layout-header">
            <div className="ic-h">
              <div>Header Settings</div>
              <div className="pg-actions">
                <Link className="gbtn" href="/layout/header">
                  Open Header Manager
                </Link>
                <button className="gbtn" type="button" onClick={() => void saveAll()} disabled={layoutSaving}>
                  Save Header
                </button>
              </div>
            </div>
            <div className="ic-b">
              <div className="ig">
                <label>Logo</label>
                <input
                  value={headerForm.logo_url}
                  onChange={(event) => setHeaderForm((current) => ({ ...current, logo_url: event.target.value }))}
                  placeholder="Logo URL"
                />
              </div>
              <div className="ig">
                <label>CTA Button Label</label>
                <input value={headerForm.cta_label} onChange={(event) => setHeaderForm((current) => ({ ...current, cta_label: event.target.value }))} />
              </div>
              <div className="ig">
                <label>CTA Button Link</label>
                <input value={headerForm.cta_link} onChange={(event) => setHeaderForm((current) => ({ ...current, cta_link: event.target.value }))} />
              </div>
              <div className="ig">
                <label>Header Style</label>
                <select value={headerForm.style} onChange={(event) => setHeaderForm((current) => ({ ...current, style: event.target.value }))}>
                  <option value="sticky">Sticky</option>
                  <option value="fixed">Fixed top</option>
                  <option value="static">Static</option>
                </select>
              </div>
            </div>
          </div>

          <div className="ic" id="layout-footer">
            <div className="ic-h">
              <div>Footer Settings</div>
              <div className="d-flex gap-2">
                <Link className="gbtn" href="/layout/footer">
                  Open Footer Manager
                </Link>
                <button className="gbtn" type="button" onClick={() => void saveAll()} disabled={layoutSaving}>
                  Save Footer
                </button>
              </div>
            </div>
            <div className="ic-b">
              <div className="ig full">
                <label>Copyright Text</label>
                <input value={footerForm.copyright_text} onChange={(event) => setFooterForm((current) => ({ ...current, copyright_text: event.target.value }))} />
              </div>
              <div className="ig">
                <label>Footer Logo</label>
                <input value={footerForm.logo_url} onChange={(event) => setFooterForm((current) => ({ ...current, logo_url: event.target.value }))} />
              </div>
              <div className="ig">
                <label>Newsletter Signup</label>
                <select
                  value={footerForm.newsletter_enabled ? 'enabled' : 'disabled'}
                  onChange={(event) =>
                    setFooterForm((current) => ({
                      ...current,
                      newsletter_enabled: event.target.value === 'enabled',
                    }))
                  }>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="ic">
            <div className="ic-h">
              <div>Social Links</div>
              <button className="gbtn" type="button" onClick={() => void saveAll()} disabled={layoutSaving}>
                Save Socials
              </button>
            </div>
            <div className="ic-b">
              <div className="ig">
                <label>Instagram</label>
                <input value={socialForm.instagram} onChange={(event) => setSocialForm((current) => ({ ...current, instagram: event.target.value }))} />
              </div>
              <div className="ig">
                <label>LinkedIn</label>
                <input value={socialForm.linkedin} onChange={(event) => setSocialForm((current) => ({ ...current, linkedin: event.target.value }))} />
              </div>
              <div className="ig">
                <label>Twitter / X</label>
                <input value={socialForm.twitter} onChange={(event) => setSocialForm((current) => ({ ...current, twitter: event.target.value }))} />
              </div>
              <div className="ig">
                <label>WhatsApp</label>
                <input value={socialForm.whatsapp} onChange={(event) => setSocialForm((current) => ({ ...current, whatsapp: event.target.value }))} />
              </div>
            </div>
          </div>

          <div className="ic" id="layout-theme">
            <div className="ic-h">
              <div>Theme Snapshot</div>
              <Link className="gbtn" href="/settings">
                Open Settings
              </Link>
            </div>
            <div className="ic-b theme-grid">
              <div className="theme-item">
                <span className="theme-label">Site Name</span>
                <strong>{themeSnapshot.site_name || 'Curve Metrics'}</strong>
              </div>
              <div className="theme-item">
                <span className="theme-label">Primary Color</span>
                <strong>{themeSnapshot.primary_color || 'Not set'}</strong>
              </div>
              <div className="theme-item">
                <span className="theme-label">Secondary Color</span>
                <strong>{themeSnapshot.secondary_color || 'Not set'}</strong>
              </div>
              <div className="theme-item">
                <span className="theme-label">Heading Font</span>
                <strong>{themeSnapshot.heading_font || 'Not set'}</strong>
              </div>
              <div className="theme-item">
                <span className="theme-label">Body Font</span>
                <strong>{themeSnapshot.body_font || 'Not set'}</strong>
              </div>
              <div className="theme-item full">
                <span className="theme-label">Meta Description</span>
                <strong>{themeSnapshot.meta_description || 'Not set'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ic" id="layout-banners">
        <div className="ic-h">
          <div>
            <div className="layout-nav-title">Banner Registry</div>
            <div className="layout-nav-subtitle">Active promotional banners pulled from the global banner table</div>
          </div>
          <Link className="gbtn" href="/page-editor">
            Manage in Page Editor
          </Link>
        </div>
        <div className="ic-b">
          <div className="layout-banner-grid">
            {banners.length ? (
              banners.map((banner) => (
                <div key={banner.id} className="layout-banner-card">
                  <div className="layout-banner-top">
                    <div>
                      <div className="layout-banner-title">{banner.name || banner.slug}</div>
                      <div className="layout-banner-subtitle">{banner.slug}</div>
                    </div>
                    <span className={`banner-chip ${banner.is_active ? 'good' : 'bad'}`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="layout-banner-copy">
                    {banner.content?.title || banner.content?.subtitle || banner.content?.description || 'No banner content set yet.'}
                  </div>
                </div>
              ))
            ) : (
              <div className="layout-empty">No active banners found. Banners can be wired in from the page editor when you need them.</div>
            )}
          </div>
        </div>
      </div>

      <div className="ic" id="layout-templates">
        <div className="ic-h">
          <div>
            <div className="layout-nav-title">Reusable Templates</div>
            <div className="layout-nav-subtitle">Pre-built layouts you can apply to pages from the editor</div>
          </div>
          <Link className="gbtn pu" href="/page-editor">
            Open Templates
          </Link>
        </div>
        <div className="ic-b">
          <div className="layout-template-grid">
            {templates.length ? (
              templates.slice(0, 6).map((template) => (
                <div key={template.id} className="layout-template-card">
                  <div className="layout-template-title">{template.name}</div>
                  <div className="layout-template-subtitle">{template.description || template.category || 'Reusable page starting point'}</div>
                </div>
              ))
            ) : (
              <div className="layout-empty">No templates available yet. Create or apply templates from the Page Editor.</div>
            )}
          </div>
        </div>
      </div>

      {toast ? <div className="layout-toast">{toast}</div> : null}

      <style jsx global>{`
        .layout-overview-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }

        .layout-overview-card {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          border: 1px solid var(--b1);
          border-radius: 12px;
          background: var(--s1);
          text-decoration: none;
          min-height: 110px;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .ic[id] {
          scroll-margin-top: 92px;
        }

        .layout-overview-card:hover {
          transform: translateY(-1px);
          border-color: rgba(124, 92, 252, 0.35);
          background: var(--s2);
        }

        .layout-overview-kicker {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--t3);
          font-weight: 700;
        }

        .layout-overview-title {
          color: var(--t1);
          font-weight: 700;
          font-size: 14px;
        }

        .layout-overview-value {
          color: var(--pul);
          font-size: 18px;
          font-weight: 700;
        }

        .layout-overview-meta {
          color: var(--t3);
          font-size: 11px;
          line-height: 1.45;
        }

        .nav-builder {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-node {
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .nav-node.is-child::before {
          content: '';
          position: absolute;
          left: 16px;
          top: -8px;
          bottom: -8px;
          width: 1px;
          background: var(--b1);
        }

        .nav-row {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 56px;
          padding: 12px 14px;
          border: 1px solid var(--b1);
          border-radius: 12px;
          background: var(--s1);
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }

        .nav-row:hover {
          border-color: rgba(124, 92, 252, 0.28);
          background: var(--s2);
          transform: translateY(-1px);
        }

        .nav-row.selected {
          border-color: rgba(124, 92, 252, 0.52);
          background: var(--pud);
        }

        .nav-row.is-draft {
          opacity: 0.74;
        }

        .nav-row.has-error {
          border-color: rgba(233, 84, 84, 0.45);
        }

        .nav-expand {
          width: 20px;
          height: 20px;
          border: 1px solid var(--b2);
          background: var(--s3);
          border-radius: 6px;
          color: var(--t2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          flex-shrink: 0;
        }

        .nav-expand.empty {
          opacity: 0.72;
        }

        .node-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          flex-shrink: 0;
        }

        .node-dot.is-live {
          background: var(--gr);
          box-shadow: 0 0 0 4px var(--grd);
        }

        .node-dot.is-draft {
          background: var(--am);
          box-shadow: 0 0 0 4px var(--amd);
        }

        .nav-copy {
          min-width: 0;
          flex: 1;
        }

        .nav-title {
          font-weight: 600;
          color: var(--t1);
        }

        .nav-url {
          margin-top: 3px;
          font-family: monospace;
          font-size: 11px;
          color: var(--t3);
        }

        .nav-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .nav-mini-btn {
          border: 1px solid var(--b1);
          background: var(--s2);
          color: var(--t2);
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 11px;
          font-weight: 600;
        }

        .nav-mini-btn:hover {
          border-color: rgba(124, 92, 252, 0.4);
          color: var(--pul);
          background: var(--pud);
        }

        .nm-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 5px 9px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .badge-live {
          background: var(--grd);
          color: var(--grl);
        }

        .badge-draft {
          background: var(--amd);
          color: var(--aml);
        }

        .badge-drop {
          background: var(--pud);
          color: var(--pul);
        }

        .badge-ext {
          background: var(--b2);
          color: var(--t3);
        }

        .nav-children {
          margin-left: 18px;
          padding-left: 12px;
          border-left: 1px dashed var(--b2);
        }

        .nav-inline-error {
          margin: -2px 0 4px 40px;
          padding: 8px 10px;
          border-radius: 10px;
          background: var(--rdd);
          color: var(--rd);
          font-size: 12px;
        }

        .nav-inline-error.standalone {
          margin: 10px 0 0;
        }

        .layout-preview-card {
          border: 1px solid var(--b1);
          border-radius: 12px;
          background: var(--s1);
          padding: 14px;
          margin-bottom: 14px;
        }

        .preview-node {
          position: relative;
        }

        .preview-node.is-draft {
          opacity: 0.66;
        }

        .preview-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
        }

        .preview-bullet {
          width: 16px;
          color: var(--t3);
          flex-shrink: 0;
          display: inline-flex;
          justify-content: center;
        }

        .preview-title {
          font-weight: 600;
          color: var(--t1);
        }

        .preview-url {
          font-family: monospace;
          font-size: 11px;
          color: var(--t3);
          margin-top: 2px;
        }

        .preview-children {
          margin-left: 8px;
          padding-left: 14px;
          border-left: 1px dashed var(--b2);
        }

        .tg {
          width: 28px;
          height: 15px;
          background: var(--s4);
          border: 1px solid var(--b2);
          border-radius: 8px;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }

        .tg.on {
          background: var(--pu);
        }

        .tg::after {
          content: '';
          position: absolute;
          width: 9px;
          height: 9px;
          left: 2px;
          top: 2px;
          border-radius: 50%;
          background: white;
        }

        .tg.on::after {
          left: 15px;
        }

        .tgrow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--b1);
          padding: 5px 0;
          gap: 12px;
        }

        .tgrow:last-child {
          border-bottom: none;
        }

        .tglbl {
          font-size: 10px;
          color: var(--t2);
        }

        .pool-item {
          display: flex;
          gap: 7px;
          align-items: center;
          background: var(--s3);
          border: 1px solid var(--b1);
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
          margin-bottom: 6px;
        }

        .pool-item:hover {
          border-color: rgba(124, 92, 252, 0.4);
          color: var(--pul);
          background: var(--pud);
        }

        .pool-item.is-draft {
          opacity: 0.72;
        }

        .field-error {
          margin-top: 6px;
          font-size: 12px;
          color: var(--rd);
        }

        .layout-banner-grid,
        .layout-template-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .layout-banner-card,
        .layout-template-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          background:
            radial-gradient(circle at top right, rgba(124, 92, 252, 0.1), transparent 38%),
            linear-gradient(180deg, rgba(24, 24, 31, 0.96), rgba(17, 17, 22, 0.98));
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.18);
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .layout-template-card:hover {
          transform: translateY(-1px);
          border-color: rgba(124, 92, 252, 0.24);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
        }

        .layout-banner-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .layout-banner-title,
        .layout-template-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--t1);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .layout-banner-subtitle,
        .layout-template-subtitle {
          font-size: 12px;
          color: var(--t2);
          line-height: 1.6;
        }

        .layout-banner-copy {
          color: var(--t2);
          font-size: 12px;
          line-height: 1.5;
        }

        .banner-chip {
          font-size: 10px;
          font-weight: 700;
          padding: 5px 8px;
          border-radius: 999px;
          text-transform: uppercase;
        }

        .banner-chip.good {
          background: var(--grd);
          color: var(--grl);
        }

        .banner-chip.bad {
          background: var(--rdd);
          color: var(--rd);
        }

        .theme-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .theme-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border: 1px solid var(--b1);
          border-radius: 10px;
          padding: 12px;
          background: var(--s2);
          min-width: 0;
        }

        .theme-item.full {
          grid-column: 1 / -1;
        }

        .theme-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--t3);
          font-weight: 700;
        }

        .theme-item strong {
          color: var(--t1);
          font-size: 12px;
          line-height: 1.5;
          word-break: break-word;
        }

        @media (max-width: 1400px) {
          .layout-overview-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .layout-overview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .theme-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .layout-overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ModuleShell>
  )
}
