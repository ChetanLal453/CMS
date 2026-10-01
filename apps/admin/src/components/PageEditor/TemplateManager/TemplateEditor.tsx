'use client'

import React, { useEffect, useMemo, useState } from 'react'

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

interface TemplateEditorProps {
  template: Template | null
  currentLayout?: any
  onSave: (templateData: Partial<Template>) => void
  onCancel: () => void
  className?: string
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  currentLayout,
  onSave,
  onCancel,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: [] as string[],
    thumbnail: ''
  })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const currentSections = useMemo(() => {
    return Array.isArray(currentLayout?.sections) ? currentLayout.sections : []
  }, [currentLayout])

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        category: template.category,
        tags: [...template.tags],
        thumbnail: template.thumbnail
      })
    }
  }, [template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave({
        ...formData,
        layout: template?.layout ?? currentLayout ?? { sections: [] },
      })
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const categories = [
    'general',
    'hero',
    'features',
    'testimonials',
    'pricing',
    'contact',
    'about',
    'blog',
    'portfolio',
    'landing'
  ]

  return (
    <div
      className={`relative flex min-h-0 flex-col gap-4 overflow-y-auto overflow-x-hidden pb-4 pr-1 ${className}`.trim()}
      style={{ minHeight: 0 }}>
      <div className="pointer-events-none absolute -right-10 top-10 h-44 w-44 rounded-full bg-[rgba(124,92,252,0.12)] blur-3xl" />
      <div className="pointer-events-none absolute left-8 bottom-0 h-36 w-36 rounded-full bg-[rgba(0,212,255,0.08)] blur-3xl" />
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(30,32,46,0.96),rgba(16,18,27,0.96))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(124,92,252,0.22)] bg-[rgba(124,92,252,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--pul)]">
              Template Editor
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--t1)] md:text-[2rem]">
              {template ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--t2)]">
              {template
                ? 'Update template details without changing its saved layout.'
                : 'Save the current page layout as a reusable starting point.'}
            </p>
          </div>

          <button type="button" onClick={onCancel} className="gbtn ghost">
            Close
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]"
                  placeholder="e.g. Hero section with CTA"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm leading-6 text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]"
                placeholder="Describe what this template is for..."
              />
            </div>

            <div className="grid gap-2">
              <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Thumbnail URL</label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Tags</label>
                <span className="text-xs text-[var(--t3)]">{formData.tags.length} saved</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--t1)] outline-none transition focus:border-[rgba(124,92,252,0.45)] focus:ring-2 focus:ring-[rgba(124,92,252,0.15)]"
                  placeholder="Add a tag"
                />
                <button type="button" onClick={addTag} className="gbtn">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.length ? (
                  formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--t1)]">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full p-0.5 text-[var(--t3)] transition hover:bg-white/10 hover:text-[var(--t1)]">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--t3)]">No tags yet.</span>
                )}
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] shadow-[0_14px_34px_rgba(0,0,0,0.16)]">
              <div className="border-b border-white/10 px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Template Preview</div>
              </div>
              <div className="grid gap-4 p-4">
                <div className="rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(124,92,252,0.14),transparent_40%),linear-gradient(135deg,rgba(18,19,31,0.96),rgba(33,36,54,0.9))] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[var(--t1)]">{formData.name || 'Untitled template'}</div>
                      <div className="mt-1 text-sm leading-6 text-[var(--t2)]">
                        {formData.description || 'Add a description so people know when to use this template.'}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--t2)]">
                      {currentSections.length || 0} sections
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--t3)]">Category</div>
                    <div className="mt-2 text-sm font-semibold text-[var(--t1)]">{formData.category}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--t3)]">Tags</div>
                    <div className="mt-2 text-sm font-semibold text-[var(--t1)]">{formData.tags.length}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[rgba(124,92,252,0.24)] bg-[linear-gradient(135deg,rgba(124,92,252,0.12),rgba(124,92,252,0.04))] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--t3)]">Save source</div>
                  <p className="mt-2 text-sm leading-6 text-[var(--t2)]">
                    {template
                      ? 'Editing keeps the same saved layout.'
                      : currentSections.length
                        ? 'The current page layout will be stored in this template.'
                        : 'No page sections found. The template will save empty until a layout is loaded.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.14)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">Categories</div>
                <span className="text-xs text-[var(--t3)]">{categories.length} options</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category }))}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
                      formData.category === category
                        ? 'border-[rgba(124,92,252,0.4)] bg-[rgba(124,92,252,0.12)] text-[var(--t1)]'
                        : 'border-white/10 bg-white/5 text-[var(--t2)] hover:text-[var(--t1)]'
                    }`}>
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="text-sm text-[var(--t3)]">
            Templates can be reused across pages to keep structure and branding consistent.
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="gbtn ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="gbtn pu disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TemplateEditor
