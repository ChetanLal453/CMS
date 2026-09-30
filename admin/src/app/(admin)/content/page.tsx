'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { extractFieldValue, updateComponentFieldSafely } from '../../../../../shared/page/clientContentHelpers'

type SitePage = {
  id: number
  title: string
  slug: string
  path: string
  status: 'published' | 'draft'
  metaTitle?: string
  metaDescription?: string
}

type SiteInfo = {
  name: string
  slug: string
  domain: string
  url: string
  status: 'published' | 'draft' | 'live'
}

type EditableComponent = {
  id: string
  type: string
  sectionId: string
  sectionIndex: number
  compIndex: number
  location: {
    sectionIndex: number
    rowIndex: number
    colIndex: number
    compIndex: number
  }
  content: {
    title?: string
    text?: string
    highlightText?: string
    link?: string
    src?: string
    alt?: string
    badge?: string
    buttonText?: string
    buttonLink?: string
    items?: Array<{ id?: string; title?: string; text?: string; description?: string; icon?: string; link?: string }>
  }
}

type SectionGroup = {
  sectionId: string
  sectionIndex: number
  name: string
  components: EditableComponent[]
}

// Legacy Collections Bucket Definition
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
  { key: 'blog', title: 'Blogs', description: 'Articles, news, and long-form content.', href: '/content/blog', endpoint: '/api/blog', listKey: 'posts', primaryAction: 'Write post' },
  { key: 'faqs', title: 'FAQs', description: 'Frequently asked questions and answers.', href: '/content/faqs', endpoint: '/api/faqs', listKey: 'faqs', primaryAction: 'Add FAQ' },
  { key: 'gallery', title: 'Gallery', description: 'Portfolio images and visual sections.', href: '/content/gallery', endpoint: '/api/gallery', listKey: 'gallery', primaryAction: 'Add image' },
  { key: 'stats', title: 'Stats', description: 'Numeric counters used in hero and proof sections.', href: '/content/stats', endpoint: '/api/stats', listKey: 'stats', primaryAction: 'Add stat' },
  { key: 'projects', title: 'Projects', description: 'Portfolio projects and case-study style cards.', href: '/content/projects', endpoint: '/api/projects', listKey: 'projects', primaryAction: 'Add project' },
  { key: 'services', title: 'Services', description: 'Service blocks used across landing pages.', href: '/content/services', endpoint: '/api/services', listKey: 'services', primaryAction: 'Add service' },
  { key: 'team', title: 'Team', description: 'Team members, bios, and profile links.', href: '/content/team', endpoint: '/api/team', listKey: 'team', primaryAction: 'Add member' },
  { key: 'testimonials', title: 'Testimonials', description: 'Customer quotes and social proof.', href: '/content/testimonials', endpoint: '/api/testimonials', listKey: 'testimonials', primaryAction: 'Add quote' },
]

export default function ContentPage() {
  const searchParams = useSearchParams()
  const siteSlug = searchParams?.get('site') || 'curvemetrics'

  // View mode: 'pages' (Real Site Content) or 'collections' (Blogs, FAQs, etc.)
  const [viewMode, setViewMode] = useState<'pages' | 'collections'>('pages')

  // Site & Page state
  const [site, setSite] = useState<SiteInfo | null>(null)
  const [pages, setPages] = useState<SitePage[]>([])
  const [activePageId, setActivePageId] = useState<number | null>(null)
  const [pageLayout, setPageLayout] = useState<any>(null)

  // Loading & status states
  const [isLoadingSite, setIsLoadingSite] = useState(true)
  const [isLoadingLayout, setIsLoadingLayout] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [currentRevisionId, setCurrentRevisionId] = useState<number | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Collections state
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [bucketStates, setBucketStates] = useState<Record<string, 'ready' | 'missing' | 'error'>>({})

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // 1. Fetch site and pages
  const loadSiteData = useCallback(async () => {
    try {
      setIsLoadingSite(true)
      const res = await fetch(`/api/sites/${encodeURIComponent(siteSlug)}`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load site data')
      }
      setSite(json.site)
      setPages(json.pages || [])
      if (json.pages?.length > 0) {
        setActivePageId((prev) => prev || json.pages[0].id)
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading site')
    } finally {
      setIsLoadingSite(false)
    }
  }, [siteSlug])

  useEffect(() => {
    void loadSiteData()
  }, [loadSiteData])

  // 2. Fetch active page layout
  const loadPageLayout = useCallback(async (pageId: number) => {
    try {
      setIsLoadingLayout(true)
      const res = await fetch(`/api/pages/${pageId}`, { credentials: 'include' })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load page layout')
      }
      const rawLayout = json.page?.layout || json.layout || { sections: [] }
      setPageLayout(rawLayout)
      if (json.revision?.id || json.page?.current_revision_id) {
        setCurrentRevisionId(json.revision?.id ?? json.page?.current_revision_id ?? null)
      }
      setHasChanges(false)
    } catch (err: any) {
      showToast(err.message || 'Error loading page layout')
    } finally {
      setIsLoadingLayout(false)
    }
  }, [])

  useEffect(() => {
    if (activePageId) {
      void loadPageLayout(activePageId)
    }
  }, [activePageId, loadPageLayout])

  // 3. Load Collections Counts (in background)
  useEffect(() => {
    let active = true
    async function loadCollections() {
      const nextCounts: Record<string, number> = {}
      const nextStates: Record<string, 'ready' | 'missing' | 'error'> = {}
      await Promise.all(
        contentBuckets.map(async (bucket) => {
          try {
            const response = await fetch(bucket.endpoint, { credentials: 'include' })
            const data = await response.json().catch(() => null)
            if (response.status === 503 || data?.available === false) {
              nextCounts[bucket.key] = 0
              nextStates[bucket.key] = 'missing'
              return
            }
            if (!response.ok || !data) throw new Error()
            const items = Array.isArray(data?.[bucket.listKey]) ? data[bucket.listKey] : Array.isArray(data) ? data : []
            nextCounts[bucket.key] = items.length
            nextStates[bucket.key] = 'ready'
          } catch {
            nextCounts[bucket.key] = 0
            nextStates[bucket.key] = 'error'
          }
        }),
      )
      if (active) {
        setCounts(nextCounts)
        setBucketStates(nextStates)
      }
    }
    void loadCollections()
    return () => {
      active = false
    }
  }, [])

  // 4. Extract editable components grouped by section
  const sectionGroups = useMemo<SectionGroup[]>(() => {
    if (!pageLayout || !Array.isArray(pageLayout.sections)) return []

    const groups: SectionGroup[] = []

    pageLayout.sections.forEach((section: any, sIdx: number) => {
      const components: EditableComponent[] = []
      const rows = section.rows || section.container?.rows || []

      rows.forEach((row: any, rIdx: number) => {
        const cols = row.columns || []
        cols.forEach((col: any, cIdx: number) => {
          const comps = col.components || []
          comps.forEach((comp: any, compIdx: number) => {
            if (!comp || !comp.type) return

            const type = String(comp.type).toLowerCase()
            const props = comp.props || {}
            const cContent = props.content || {}

            const extractedContent: EditableComponent['content'] = {
              title: extractFieldValue(cContent.title ?? props.title ?? props.heading, 'text'),
              text: extractFieldValue(cContent.text ?? props.text ?? props.subheading ?? props.description ?? props.body ?? cContent.description, 'text'),
              highlightText: extractFieldValue(cContent.highlightText ?? props.highlightText, 'text'),
              link: extractFieldValue(cContent.link ?? props.link ?? props.url ?? props.href ?? cContent.button?.href, 'href'),
              src: extractFieldValue(cContent.src ?? props.src ?? cContent.image ?? props.image ?? props.imageUrl, 'src'),
              alt: extractFieldValue(cContent.alt ?? props.alt ?? cContent.image?.alt, 'alt'),
              badge: extractFieldValue(cContent.badge ?? props.badge ?? props.tag, 'text'),
              buttonText: extractFieldValue(cContent.buttonText ?? props.buttonText ?? props.label ?? props.btnText ?? cContent.button?.label, 'label'),
              buttonLink: extractFieldValue(cContent.buttonLink ?? props.buttonLink ?? props.url ?? props.link ?? cContent.button?.href, 'href'),
              items: Array.isArray(cContent.items) ? cContent.items : Array.isArray(props.items) ? props.items : undefined,
            }

            components.push({
              id: comp.id || `comp-${sIdx}-${rIdx}-${cIdx}-${compIdx}`,
              type,
              sectionId: section.id || `sec-${sIdx}`,
              sectionIndex: sIdx,
              compIndex: compIdx,
              location: { sectionIndex: sIdx, rowIndex: rIdx, colIndex: cIdx, compIndex: compIdx },
              content: extractedContent,
            })
          })
        })
      })

      // Fallback: check section.blocks or section.components if rows yielded no components
      if (components.length === 0) {
        const blocks = Array.isArray(section.blocks) ? section.blocks : Array.isArray(section.components) ? section.components : []
        blocks.forEach((comp: any, bIdx: number) => {
          if (!comp || !comp.type) return
          const type = String(comp.type).toLowerCase()
          const props = comp.props || {}
          const cContent = props.content || {}
          const extractedContent: EditableComponent['content'] = {
            title: extractFieldValue(cContent.title ?? props.title ?? props.heading, 'text'),
            text: extractFieldValue(cContent.text ?? props.text ?? props.subheading ?? props.description ?? props.body ?? cContent.description, 'text'),
            highlightText: extractFieldValue(cContent.highlightText ?? props.highlightText, 'text'),
            link: extractFieldValue(cContent.link ?? props.link ?? props.url ?? props.href ?? cContent.button?.href, 'href'),
            src: extractFieldValue(cContent.src ?? props.src ?? cContent.image ?? props.image ?? props.imageUrl, 'src'),
            alt: extractFieldValue(cContent.alt ?? props.alt ?? cContent.image?.alt, 'alt'),
            badge: extractFieldValue(cContent.badge ?? props.badge ?? props.tag, 'text'),
            buttonText: extractFieldValue(cContent.buttonText ?? props.buttonText ?? props.label ?? props.btnText ?? cContent.button?.label, 'label'),
            buttonLink: extractFieldValue(cContent.buttonLink ?? props.buttonLink ?? props.url ?? props.link ?? cContent.button?.href, 'href'),
            items: Array.isArray(cContent.items) ? cContent.items : Array.isArray(props.items) ? props.items : undefined,
          }
          components.push({
            id: comp.id || `comp-${sIdx}-block-${bIdx}`,
            type,
            sectionId: section.id || `sec-${sIdx}`,
            sectionIndex: sIdx,
            compIndex: bIdx,
            location: { sectionIndex: sIdx, rowIndex: -1, colIndex: -1, compIndex: bIdx },
            content: extractedContent,
          })
        })
      }

      const rawName = section.name || section.title || `Section ${sIdx + 1}`
      const cleanName = rawName.replace(/^0\d+\s*-\s*/, '')

      groups.push({
        sectionId: section.id || `sec-${sIdx}`,
        sectionIndex: sIdx,
        name: cleanName,
        components,
      })
    })

    return groups
  }, [pageLayout])

  // 5. Update component content in layout
  const handleUpdateComponentField = (
    location: EditableComponent['location'],
    field: string,
    value: any,
  ) => {
    setPageLayout((prevLayout: any) => {
      if (!prevLayout) return prevLayout
      const nextLayout = JSON.parse(JSON.stringify(prevLayout))
      const section = nextLayout.sections?.[location.sectionIndex]
      if (!section) return prevLayout

      if (location.rowIndex === -1) {
        const block = section.blocks?.[location.compIndex] || section.components?.[location.compIndex]
        if (block) {
          updateComponentFieldSafely(block, field, value)
        }
        return nextLayout
      }

      const rows = section.rows || section.container?.rows || []
      const col = rows?.[location.rowIndex]?.columns?.[location.colIndex]
      const comp = col?.components?.[location.compIndex]
      if (!comp) return prevLayout

      updateComponentFieldSafely(comp, field, value)

      return nextLayout
    })
    setHasChanges(true)
  }

  // 6. Save Draft
  const handleSaveDraft = async () => {
    if (!activePageId || !pageLayout) return
    try {
      setIsSaving(true)
      const res = await fetch(`/api/pages/${activePageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          layout: pageLayout,
          base_revision_id: currentRevisionId,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save draft')
      }
      if (data.revision?.id || data.page?.current_revision_id) {
        setCurrentRevisionId(data.revision?.id ?? data.page?.current_revision_id ?? null)
      }
      setHasChanges(false)
      showToast('Draft content saved successfully!')
    } catch (err: any) {
      showToast(err.message || 'Error saving draft')
    } finally {
      setIsSaving(false)
    }
  }

  // 7. Publish Changes Live
  const handlePublish = async () => {
    if (!activePageId) return
    try {
      setIsPublishing(true)
      // Save any pending changes first
      if (hasChanges && pageLayout) {
        await fetch(`/api/pages/${activePageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            layout: pageLayout,
            base_revision_id: currentRevisionId,
          }),
        })
      }
      // Trigger publish cutover
      const res = await fetch(`/api/pages/${activePageId}/publish`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish page')
      }
      if (data.revision?.id || data.published_revision?.id) {
        setCurrentRevisionId(data.revision?.id ?? data.published_revision?.id ?? null)
      }
      showToast('🎉 Published live to website!')
      await loadSiteData()
    } catch (err: any) {
      showToast(err.message || 'Error publishing page')
    } finally {
      setIsPublishing(false)
    }
  }

  const activePage = pages.find((p) => p.id === activePageId) || pages[0]
  const isLive = site?.status === 'live' || site?.status === 'published'

  return (
    <div className="client-content-shell">
      {/* Toast Notification */}
      {toastMessage && <div className="client-toast">{toastMessage}</div>}

      {/* Top Header Command Bar */}
      <header className="client-topbar">
        <div className="topbar-left">
          <Link href={`/workspace/${siteSlug}`} className="back-link" title="Open Studio Workspace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Workspace</span>
          </Link>

          <div className="v-sep" />

          <div className="site-badge">
            <span className="site-avatar">{(site?.name || 'C').charAt(0).toUpperCase()}</span>
            <div className="site-details">
              <span className="site-name">{site?.name || 'CurveMetrics'}</span>
              <span className="site-mode-tag">Content Mode</span>
            </div>
          </div>

          <a
            href={site?.url || `/${siteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="domain-link"
            title="Open Live Website"
          >
            <span>{site?.domain || `${siteSlug}.curvemetrics.com`}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        {/* View Mode Switcher: Page Content vs Collections */}
        <div className="topbar-center">
          <div className="mode-toggle-pills">
            <button
              type="button"
              className={`mode-pill ${viewMode === 'pages' ? 'active' : ''}`}
              onClick={() => setViewMode('pages')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <span>Page Content</span>
            </button>
            <button
              type="button"
              className={`mode-pill ${viewMode === 'collections' ? 'active' : ''}`}
              onClick={() => setViewMode('collections')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
              <span>Collections</span>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="topbar-right">
          <div className={`status-badge ${isLive ? 'live' : 'draft'}`}>
            <span className="dot" />
            <span>{isLive ? 'Live' : 'Draft'}</span>
          </div>

          <a
            href={site?.url || `/${siteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn secondary"
            title="View Live Site"
          >
            <span>Live Site ↗</span>
          </a>

          {viewMode === 'pages' && (
            <>
              <button
                type="button"
                className="action-btn secondary"
                onClick={handleSaveDraft}
                disabled={isSaving || !hasChanges}
                title="Save content changes as draft"
              >
                {isSaving ? 'Saving...' : hasChanges ? 'Save Draft •' : 'Saved'}
              </button>

              <button
                type="button"
                className="action-btn publish-btn"
                onClick={handlePublish}
                disabled={isPublishing}
                title="Publish changes to live site"
              >
                <span>{isPublishing ? 'Publishing...' : 'Publish ↗'}</span>
              </button>
            </>
          )}

          <Link
            href={`/workspace/${siteSlug}?tab=editor`}
            className="action-btn ghost"
            title="Open Visual Builder (Developer)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            <span>Visual Builder</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="client-main">
        {viewMode === 'pages' ? (
          <div className="pages-view-wrap">
            {/* Page Navigation Switcher */}
            <div className="page-switcher-bar">
              <div className="switcher-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <span>Select Page:</span>
              </div>

              <div className="page-pills">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`page-pill-btn ${activePageId === p.id ? 'active' : ''}`}
                    onClick={() => setActivePageId(p.id)}
                  >
                    <span className="p-dot" />
                    <span className="p-name">{p.title || p.slug}</span>
                    <span className="p-slug">{p.path}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Form Container */}
            <div className="content-container">
              {isLoadingLayout ? (
                <div className="loading-state">
                  <div className="spinner" />
                  <span>Loading content for {activePage?.title || 'page'}...</span>
                </div>
              ) : sectionGroups.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No content sections found on this page</h3>
                  <p>Open the visual page editor to add sections and blocks to this page.</p>
                  <Link href={`/workspace/${siteSlug}?tab=editor`} className="action-btn publish-btn">
                    Open Visual Page Editor
                  </Link>
                </div>
              ) : (
                <div className="sections-list">
                  {sectionGroups.map((group, gIdx) => (
                    <div key={group.sectionId} className="section-card">
                      <div className="section-card-header">
                        <div className="sec-header-left">
                          <span className="sec-badge">Section {gIdx + 1}</span>
                          <h3 className="sec-title">{group.name}</h3>
                        </div>
                        <span className="sec-meta">{group.components.length} editable items</span>
                      </div>

                      <div className="section-card-body">
                        {group.components.map((comp) => {
                          const isHeading = comp.type.includes('heading')
                          const isParagraph = comp.type.includes('paragraph') || comp.type === 'text'
                          const isButton = comp.type === 'button'
                          const isImage = comp.type.includes('image')
                          const isCard = comp.type.includes('card')
                          const isList = comp.type.includes('list')
                          const isAccordion = comp.type.includes('accordion')

                          return (
                            <div key={comp.id} className="component-field-box">
                              {/* Component Type Header */}
                              <div className="comp-field-header">
                                <span className={`comp-type-chip ${comp.type}`}>
                                  {isHeading && '🏷️ Heading'}
                                  {isParagraph && '📝 Paragraph Text'}
                                  {isButton && '🔘 Call to Action Button'}
                                  {isImage && '🖼️ Image'}
                                  {isCard && '🎴 Content Card'}
                                  {isList && '📋 List / Feature Items'}
                                  {isAccordion && '📂 Accordion / FAQ'}
                                  {!isHeading && !isParagraph && !isButton && !isImage && !isCard && !isList && !isAccordion && `📦 ${comp.type}`}
                                </span>
                              </div>

                              {/* Headings */}
                              {isHeading && (
                                <div className="fields-grid">
                                  <div className="field-group">
                                    <label>Headline Text</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.text || ''}
                                      placeholder="Enter headline text..."
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'text', e.target.value)
                                      }
                                    />
                                  </div>
                                  {comp.content.highlightText !== undefined && (
                                    <div className="field-group">
                                      <label>Highlight Text (Accent Color)</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={comp.content.highlightText || ''}
                                        placeholder="Words to highlight..."
                                        onChange={(e) =>
                                          handleUpdateComponentField(comp.location, 'highlightText', e.target.value)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Paragraphs */}
                              {isParagraph && (
                                <div className="field-group">
                                  <label>Body Content</label>
                                  <textarea
                                    className="form-textarea"
                                    rows={4}
                                    value={comp.content.text || ''}
                                    placeholder="Write your paragraph copy here..."
                                    onChange={(e) =>
                                      handleUpdateComponentField(comp.location, 'text', e.target.value)
                                    }
                                  />
                                </div>
                              )}

                              {/* Button */}
                              {isButton && (
                                <div className="fields-grid">
                                  <div className="field-group">
                                    <label>Button Label</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.text || ''}
                                      placeholder="e.g. Get Started, Learn More"
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'text', e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="field-group">
                                    <label>Button Link URL</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.link || ''}
                                      placeholder="e.g. /contact, https://example.com"
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'link', e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Images */}
                              {isImage && (
                                <div className="image-field-wrap">
                                  {comp.content.src && (
                                    <div className="image-preview-thumb">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={comp.content.src} alt={comp.content.alt || 'Preview'} />
                                    </div>
                                  )}
                                  <div className="image-inputs">
                                    <div className="field-group">
                                      <label>Image URL (Cloud Storage or Link)</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={comp.content.src || ''}
                                        placeholder="https://... or /uploads/..."
                                        onChange={(e) =>
                                          handleUpdateComponentField(comp.location, 'src', e.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="field-group">
                                      <label>Alt Description (SEO & Accessibility)</label>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={comp.content.alt || ''}
                                        placeholder="Describe the image..."
                                        onChange={(e) =>
                                          handleUpdateComponentField(comp.location, 'alt', e.target.value)
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Content Cards */}
                              {isCard && (
                                <div className="fields-grid">
                                  <div className="field-group">
                                    <label>Card Title</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.title || ''}
                                      placeholder="Card title..."
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'title', e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="field-group">
                                    <label>Badge / Tag</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.badge || ''}
                                      placeholder="e.g. Featured, New"
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'badge', e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="field-group full-width">
                                    <label>Card Description</label>
                                    <textarea
                                      className="form-textarea"
                                      rows={3}
                                      value={comp.content.text || ''}
                                      placeholder="Card description..."
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'text', e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="field-group">
                                    <label>Card Image URL</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.src || ''}
                                      placeholder="Image URL..."
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'src', e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="field-group">
                                    <label>Card Action Link</label>
                                    <input
                                      type="text"
                                      className="form-input"
                                      value={comp.content.buttonLink || comp.content.link || ''}
                                      placeholder="/service-details"
                                      onChange={(e) =>
                                        handleUpdateComponentField(comp.location, 'buttonLink', e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Lists / Accordions */}
                              {(isList || isAccordion) && Array.isArray(comp.content.items) && (
                                <div className="nested-items-wrap">
                                  <div className="nested-items-header">
                                    <label>List Items ({comp.content.items.length})</label>
                                    <button
                                      type="button"
                                      className="add-subitem-btn"
                                      onClick={() => {
                                        const currentItems = comp.content.items || []
                                        const newItem = {
                                          id: `item-${Date.now()}`,
                                          title: 'New Item',
                                          description: 'Item description text here...',
                                        }
                                        handleUpdateComponentField(comp.location, 'items', [...currentItems, newItem])
                                      }}
                                    >
                                      + Add Item
                                    </button>
                                  </div>

                                  <div className="subitems-list">
                                    {comp.content.items.map((item, itemIdx) => (
                                      <div key={item.id || itemIdx} className="subitem-box">
                                        <div className="subitem-top">
                                          <span className="subitem-num">#{itemIdx + 1}</span>
                                          <input
                                            type="text"
                                            className="form-input"
                                            value={item.title || ''}
                                            placeholder="Item title..."
                                            onChange={(e) => {
                                              const updated = [...(comp.content.items || [])]
                                              updated[itemIdx] = { ...updated[itemIdx], title: e.target.value }
                                              handleUpdateComponentField(comp.location, 'items', updated)
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className="del-subitem-btn"
                                            title="Delete item"
                                            onClick={() => {
                                              const updated = (comp.content.items || []).filter((_, idx) => idx !== itemIdx)
                                              handleUpdateComponentField(comp.location, 'items', updated)
                                            }}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        <textarea
                                          className="form-textarea subitem-desc"
                                          rows={2}
                                          value={item.description || item.text || ''}
                                          placeholder="Item description or answer..."
                                          onChange={(e) => {
                                            const updated = [...(comp.content.items || [])]
                                            updated[itemIdx] = { ...updated[itemIdx], description: e.target.value, text: e.target.value }
                                            handleUpdateComponentField(comp.location, 'items', updated)
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Reusable Collections (Blogs, FAQs, etc.) */
          <div className="collections-view-wrap">
            <div className="collections-header">
              <h2>Reusable Content Collections</h2>
              <p>Manage data collections shared across various parts of your websites.</p>
            </div>

            <div className="content-card-grid">
              {contentBuckets.map((bucket) => (
                <div key={bucket.key} className="content-card">
                  <div className="content-card-top">
                    <div>
                      <div className="content-card-title">{bucket.title}</div>
                      <div className="content-card-subtitle">{bucket.description}</div>
                    </div>
                    <div className="content-card-meta">
                      <span className="content-card-count">{counts[bucket.key] || 0}</span>
                      {bucketStates[bucket.key] === 'missing' && <span className="content-card-tag bad">Unavailable</span>}
                      {bucketStates[bucket.key] === 'error' && <span className="content-card-tag bad">Error</span>}
                    </div>
                  </div>

                  <div className="content-card-actions">
                    <Link className="action-btn publish-btn" href={bucket.href}>
                      Open
                    </Link>
                    <Link className="action-btn secondary" href={bucket.href}>
                      {bucket.primaryAction}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* STYLES */}
      <style jsx>{`
        .client-content-shell {
          width: 100%;
          min-height: 100vh;
          background: #090b10;
          color: #f1f3f9;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
        }

        .client-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #6366f1;
          color: #ffffff;
          font-weight: 600;
          font-size: 13px;
          padding: 10px 18px;
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.2s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Top Command Bar */
        .client-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 52px;
          background: rgba(18, 20, 28, 0.98);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(16px);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #9ea4b8;
          padding: 5px 9px;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .back-link:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
        }

        .v-sep {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.12);
        }

        .site-badge {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .site-avatar {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #3b82f6;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .site-details {
          display: flex;
          flex-direction: column;
        }
        .site-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #f1f3f9;
          line-height: 1.2;
        }
        .site-mode-tag {
          font-size: 10px;
          color: #818cf8;
          font-weight: 500;
        }

        .domain-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          color: #646a82;
          text-decoration: none;
          padding: 3px 6px;
          border-radius: 4px;
          transition: color 0.15s ease;
        }
        .domain-link:hover {
          color: #f1f3f9;
        }

        /* Topbar Center: Toggle */
        .topbar-center {
          display: flex;
          align-items: center;
        }
        .mode-toggle-pills {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.35);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .mode-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #9ea4b8;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .mode-pill:hover {
          color: #f1f3f9;
        }
        .mode-pill.active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
        }

        /* Topbar Right */
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 500;
          border: 1px solid rgba(16, 185, 129, 0.28);
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }
        .status-badge.draft {
          border-color: rgba(245, 158, 11, 0.28);
          background: rgba(245, 158, 11, 0.12);
          color: #f59e0b;
        }
        .status-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 6px currentColor;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s ease;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #c9ccd6;
          white-space: nowrap;
        }
        .action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(255, 255, 255, 0.22);
          color: #ffffff;
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-btn.publish-btn {
          background: #6366f1;
          border-color: #7c6dfa;
          color: #ffffff;
          font-weight: 600;
          padding: 5px 14px;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
        }
        .action-btn.publish-btn:hover:not(:disabled) {
          background: #5457e5;
          border-color: #6c5ce7;
        }
        .action-btn.ghost {
          background: transparent;
          border-color: transparent;
          color: #818cf8;
        }
        .action-btn.ghost:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #ffffff;
        }

        /* Main Container */
        .client-main {
          max-width: 1140px;
          margin: 0 auto;
          padding: 24px 20px 80px;
        }

        /* Page Switcher */
        .page-switcher-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          background: #131622;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .page-switcher-bar::-webkit-scrollbar {
          display: none;
        }
        .switcher-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #9ea4b8;
          white-space: nowrap;
          padding-right: 6px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }
        .page-pills {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .page-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #c9ccd6;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .page-pill-btn:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }
        .page-pill-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: rgba(99, 102, 241, 0.35);
          color: #a5b4fc;
        }
        .page-pill-btn .p-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10b981;
        }
        .page-pill-btn .p-name {
          font-weight: 600;
        }
        .page-pill-btn .p-slug {
          font-size: 10.5px;
          color: #646a82;
          font-family: ui-monospace, Menlo, monospace;
        }

        /* Section Cards */
        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-card {
          background: #131622;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }
        .section-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .sec-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sec-badge {
          font-size: 11px;
          font-weight: 600;
          color: #818cf8;
          background: rgba(99, 102, 241, 0.12);
          padding: 2px 7px;
          border-radius: 4px;
        }
        .sec-title {
          font-size: 14px;
          font-weight: 600;
          color: #f1f3f9;
          margin: 0;
        }
        .sec-meta {
          font-size: 11.5px;
          color: #646a82;
        }

        .section-card-body {
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Component Box */
        .component-field-box {
          background: #0e1017;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 14px;
        }
        .comp-field-header {
          margin-bottom: 10px;
        }
        .comp-type-chip {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: #9ea4b8;
          background: rgba(255, 255, 255, 0.04);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .field-group.full-width {
          grid-column: 1 / -1;
        }
        .field-group label {
          font-size: 11.5px;
          font-weight: 500;
          color: #9ea4b8;
        }

        .form-input {
          width: 100%;
          background: #141724;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 7px 11px;
          color: #f1f3f9;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .form-input:focus {
          border-color: #6366f1;
        }
        .form-textarea {
          width: 100%;
          background: #141724;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px 11px;
          color: #f1f3f9;
          font-size: 13px;
          line-height: 1.5;
          outline: none;
          resize: vertical;
          transition: border-color 0.15s ease;
        }
        .form-textarea:focus {
          border-color: #6366f1;
        }

        /* Image Field */
        .image-field-wrap {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .image-preview-thumb {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: #141724;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }
        .image-preview-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-inputs {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Nested list items */
        .nested-items-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .nested-items-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nested-items-header label {
          font-size: 12px;
          font-weight: 600;
          color: #9ea4b8;
        }
        .add-subitem-btn {
          font-size: 11.5px;
          font-weight: 600;
          color: #818cf8;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 3px 9px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .add-subitem-btn:hover {
          background: rgba(99, 102, 241, 0.22);
          color: #ffffff;
        }

        .subitems-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .subitem-box {
          background: #141724;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 7px;
          padding: 9px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .subitem-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .subitem-num {
          font-size: 11px;
          font-weight: 600;
          color: #646a82;
        }
        .del-subitem-btn {
          width: 26px;
          height: 26px;
          border-radius: 5px;
          background: transparent;
          border: none;
          color: #646a82;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .del-subitem-btn:hover {
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.1);
        }
        .subitem-desc {
          margin-top: 2px;
          font-size: 12px;
        }

        /* Loading & Empty States */
        .loading-state,
        .empty-state {
          text-align: center;
          padding: 4rem 1rem;
          color: #9ea4b8;
        }
        .spinner {
          width: 28px;
          height: 28px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .empty-state h3 {
          font-size: 16px;
          color: #f1f3f9;
          margin: 0 0 6px;
        }
        .empty-state p {
          font-size: 13px;
          color: #646a82;
          margin: 0 0 16px;
        }

        /* Collections view */
        .collections-view-wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .collections-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .collections-header p {
          font-size: 13px;
          color: #9ea4b8;
          margin: 0;
        }
        .content-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }
        .content-card {
          background: #131622;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 140px;
        }
        .content-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #f1f3f9;
        }
        .content-card-subtitle {
          font-size: 12px;
          color: #9ea4b8;
          margin-top: 3px;
        }
        .content-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
        }
        .content-card-count {
          font-size: 18px;
          font-weight: 700;
          color: #818cf8;
        }
        .content-card-tag.bad {
          font-size: 10.5px;
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .content-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        @media (max-width: 768px) {
          .fields-grid {
            grid-template-columns: 1fr;
          }
          .client-topbar {
            flex-wrap: wrap;
            height: auto;
            padding: 10px 14px;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  )
}
