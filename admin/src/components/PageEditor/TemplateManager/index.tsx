'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { TemplateCard } from './TemplateCard'
import { TemplateEditor } from './TemplateEditor'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  layout: any
  tags: string[]
  created_at: string
  updated_at: string
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: Template) => void
  currentLayout?: any
  currentPageId?: string | null
  onTemplateApplied?: (template: Template) => Promise<boolean> | boolean
  className?: string
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onSelectTemplate,
  currentLayout,
  currentPageId,
  onTemplateApplied,
  className = ''
}) => {
  const getApiErrorMessage = (payload: any, fallback: string) => {
    const message = typeof payload?.error === 'string'
      ? payload.error
      : typeof payload?.error?.message === 'string'
        ? payload.error.message
        : typeof payload?.message === 'string'
          ? payload.message
          : ''

    return message || fallback
  }

  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [notice, setNotice] = useState('')

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/templates/list')
      const data = await response.json()
      if (!response.ok || !data.success) {
        setNotice(getApiErrorMessage(data, 'Failed to load templates'))
        setTemplates([])
        return
      }

      setTemplates(Array.isArray(data.templates) ? data.templates : [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      setNotice('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTemplates()
  }, [fetchTemplates])

  useEffect(() => {
    if (!notice) {
      return
    }

    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const categories = useMemo(() => ['all', ...Array.from(new Set(templates.map((t) => t.category).filter(Boolean)))], [templates])

  const filteredTemplates = useMemo(() => {
    const lowered = searchQuery.toLowerCase().trim()

    const nextTemplates = [...templates]
      .filter((template) => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
        const matchesSearch =
          !lowered ||
          template.name.toLowerCase().includes(lowered) ||
          template.description.toLowerCase().includes(lowered) ||
          template.tags.some((tag) => tag.toLowerCase().includes(lowered))

        return matchesCategory && matchesSearch
      })
      .sort((left, right) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(left.updated_at).getTime() - new Date(right.updated_at).getTime()
          case 'name-asc':
            return left.name.localeCompare(right.name)
          case 'name-desc':
            return right.name.localeCompare(left.name)
          default:
            return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
        }
      })

    return nextTemplates
  }, [searchQuery, selectedCategory, sortBy, templates])

  const previewTemplate = useMemo(() => {
    if (previewTemplateId) {
      return filteredTemplates.find((template) => template.id === previewTemplateId) || filteredTemplates[0] || null
    }

    return filteredTemplates[0] || null
  }, [filteredTemplates, previewTemplateId])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const template of templates) {
      counts.set(template.category, (counts.get(template.category) || 0) + 1)
    }
    return counts
  }, [templates])

  const layoutSections = Array.isArray(currentLayout?.sections) ? currentLayout.sections : []
  const templateStats = useMemo(
    () => ({
      total: templates.length,
      categories: categories.filter((category) => category !== 'all').length,
      visible: filteredTemplates.length,
      readySections: layoutSections.length,
    }),
    [categories, filteredTemplates.length, layoutSections.length, templates.length],
  )

  const handleCreateTemplate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplateId(template.id)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/templates/delete?id=${templateId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setNotice(getApiErrorMessage(data, 'Failed to delete template'))
        return
      }

      setTemplates(prev => prev.filter(t => t.id !== templateId))
      setNotice('Template deleted.')
    } catch (error) {
      console.error('Error deleting template:', error)
      setNotice('Failed to delete template')
    }
  }

  const handleSaveTemplate = async (templateData: Partial<Template>) => {
    try {
      const method = editingTemplate ? 'PUT' : 'POST'
      const url = editingTemplate ? `/api/templates/update` : '/api/templates/create'
      const resolvedLayout = templateData.layout ?? currentLayout ?? editingTemplate?.layout ?? { sections: [] }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateData,
          layout: resolvedLayout
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        setNotice(getApiErrorMessage(data, editingTemplate ? 'Failed to update template' : 'Failed to create template'))
        return
      }

      if (editingTemplate) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data.template : t))
      } else {
        setTemplates(prev => [...prev, data.template])
      }
      setShowEditor(false)
      setEditingTemplate(null)
      setNotice(editingTemplate ? 'Template updated.' : 'Template created.')
    } catch (error) {
      console.error('Error saving template:', error)
      setNotice(editingTemplate ? 'Failed to update template' : 'Failed to create template')
    }
  }

  const handleUseTemplate = async (template: Template) => {
    if (onTemplateApplied && currentPageId) {
      const success = await onTemplateApplied(template)
      if (success) {
        setNotice(`Template "${template.name}" applied.`)
        return
      }
    }

    setPreviewTemplateId(template.id)
    onSelectTemplate?.(template)
  }

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        currentLayout={currentLayout}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setShowEditor(false)
          setEditingTemplate(null)
        }}
        className={className}
      />
    )
  }

  return (
    <div
      className={`relative flex min-h-0 flex-col gap-4 overflow-y-auto overflow-x-hidden pb-4 pr-1 ${className}`.trim()}
      style={{ minHeight: 0 }}>
      <div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-[rgba(124,92,252,0.14)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-32 h-56 w-56 rounded-full bg-[rgba(16,217,130,0.08)] blur-3xl" />
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(30,32,46,0.96),rgba(16,18,27,0.97))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,92,252,0.22)] bg-[rgba(124,92,252,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pul)]">
              Template Library
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--t1)] md:text-[2rem]">Reusable layouts with a polished starting point</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--t2)]">
              Browse saved page blueprints, preview them in context, and keep the page builder fast without losing consistency.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void fetchTemplates()} className="gbtn ghost">
              Refresh
            </button>
            <button type="button" onClick={handleCreateTemplate} className="gbtn pu">
              Create Template
            </button>
          </div>
        </div>
      </div>

      {notice ? (
        <div className="rounded-2xl border border-[rgba(124,92,252,0.24)] bg-[rgba(124,92,252,0.08)] px-4 py-3 text-sm text-[var(--t1)]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,92,252,0.14),transparent_42%),linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Saved</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--t1)]">{templateStats.total}</div>
          <div className="mt-1 text-sm text-[var(--t2)]">Reusable layouts in the library.</div>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(16,217,130,0.12),transparent_42%),linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Categories</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--t1)]">{templateStats.categories}</div>
          <div className="mt-1 text-sm text-[var(--t2)]">Saved groupings for quicker browsing.</div>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.1),transparent_42%),linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Visible</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--t1)]">{templateStats.visible}</div>
          <div className="mt-1 text-sm text-[var(--t2)]">Templates matching the current filters.</div>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(255,176,32,0.12),transparent_42%),linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Current Layout</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--t1)]">{templateStats.readySections}</div>
          <div className="mt-1 text-sm text-[var(--t2)]">
            {templateStats.readySections ? 'Sections available to save.' : 'Open a page to save its layout.'}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">
                  Search templates
                </label>
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]"
                />
              </div>

              <div className="min-w-[220px]">
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]">
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = selectedCategory === category
                const count = category === 'all' ? templates.length : categoryCounts.get(category) || 0
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold capitalize transition ${
                      active
                        ? 'border-[rgba(124,92,252,0.38)] bg-[rgba(124,92,252,0.12)] text-[var(--t1)]'
                        : 'border-white/10 bg-white/5 text-[var(--t2)] hover:text-[var(--t1)]'
                    }`}>
                    {category} <span className="ml-1 text-xs text-[var(--t3)]">({count})</span>
                  </button>
                )
              })}

              {(selectedCategory !== 'all' || searchQuery.trim()) ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearchQuery('')
                  }}
                  className="gbtn ghost">
                  Clear
                </button>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.035)] px-4 py-3 text-sm leading-6 text-[var(--t2)]">
              Click a template to load its preview. Use the <span className="font-semibold text-[var(--t1)]">Use Template</span> button when the layout feels right.
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-[var(--t2)]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[var(--pu)]" />
                <span>Loading templates...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="grid place-items-center rounded-[24px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] px-6 py-14 text-center">
                <div className="max-w-md">
                  <svg className="mx-auto mb-4 h-14 w-14 text-[var(--t3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-base font-semibold text-[var(--t1)]">No templates found</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--t2)]">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Create your first reusable template to get started.'}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={handleCreateTemplate} className="gbtn pu">
                      Create Template
                    </button>
                    {(searchQuery || selectedCategory !== 'all') ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('all')
                          setSearchQuery('')
                        }}
                        className="gbtn">
                        Clear Filters
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={() => handlePreviewTemplate(template)}
                    onSelect={() => {
                      void handleUseTemplate(template)
                    }}
                    onEdit={() => handleEditTemplate(template)}
                    onDelete={() => handleDeleteTemplate(template.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-220px)] xl:overflow-y-auto xl:pr-1">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(28,30,42,0.96),rgba(16,18,27,0.96))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--t3)]">Live Preview</div>
                  <div className="mt-1 text-xs text-[var(--t3)]">Inspect before you apply.</div>
                </div>
                {previewTemplate ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--t2)]">
                    Ready
                  </span>
                ) : null}
              </div>
              {previewTemplate ? (
                <div className="mt-4 grid gap-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
                    {previewTemplate.thumbnail ? (
                      <img src={previewTemplate.thumbnail} alt={previewTemplate.name} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(124,92,252,0.18),transparent_40%),linear-gradient(135deg,rgba(18,19,31,0.96),rgba(33,36,54,0.9))]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Preview</div>
                          <div className="mt-1 text-sm text-[var(--t1)]">No thumbnail set</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-[var(--t1)]">{previewTemplate.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--t2)]">
                      {previewTemplate.description || 'No description has been saved for this template yet.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--t3)]">Category</div>
                      <div className="mt-2 text-sm font-semibold text-[var(--t1)]">{previewTemplate.category || 'general'}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--t3)]">Sections</div>
                      <div className="mt-2 text-sm font-semibold text-[var(--t1)]">
                        {Array.isArray(previewTemplate.layout?.sections) ? previewTemplate.layout.sections.length : 0}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Tags</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {previewTemplate.tags.length ? (
                        previewTemplate.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[var(--t2)]">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[var(--t3)]">No tags yet.</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[rgba(124,92,252,0.24)] bg-[linear-gradient(135deg,rgba(124,92,252,0.12),rgba(124,92,252,0.04))] p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">How to use</div>
                    <ol className="mt-3 space-y-2 text-sm leading-6 text-[var(--t2)]">
                      <li>1. Open the page you want to change in Page Editor.</li>
                      <li>2. Preview a template here before applying it.</li>
                      <li>3. Click <span className="font-semibold text-[var(--t1)]">Use Template</span> on the card when you are ready.</li>
                      <li>4. Save the page after the layout is applied.</li>
                    </ol>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleUseTemplate(previewTemplate)}
                      className="gbtn pu">
                      Use Template
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditTemplate(previewTemplate)}
                      className="gbtn">
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 text-sm leading-6 text-[var(--t2)]">
                  Click any template card to load a live preview here. You can then apply it, edit it, or create a fresh template from the current page layout.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default TemplateManager
