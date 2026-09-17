'use client'

import React, { useState } from 'react'

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

interface TemplateCardProps {
  template: Template
  onPreview: () => void
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onPreview,
  onSelect,
  onEdit,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false)
  const updatedLabel = new Date(template.updated_at).toLocaleDateString()
  const sectionCount = Array.isArray(template.layout?.sections) ? template.layout.sections.length : 0
  const tagPreview = template.tags.slice(0, 3)

  return (
    <div
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,24,31,0.96),rgba(17,17,22,0.98))] shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(124,92,252,0.3)] hover:shadow-[0_18px_48px_rgba(0,0,0,0.25)]"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onPreview()
        }
      }}
      onClick={onPreview}
    >
      <div className="relative aspect-video overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,92,252,0.22),transparent_35%),linear-gradient(135deg,rgba(18,19,31,0.96),rgba(33,36,54,0.9))]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.26))]" />
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgba(124,92,252,0.12)] blur-2xl" />
        {template.thumbnail ? (
          <img src={template.thumbnail} alt={template.name} className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="grid place-items-center rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-5 py-4 text-center shadow-[0_10px_28px_rgba(0,0,0,0.15)]">
              <svg className="h-10 w-10 text-[var(--pul)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--t3)]">
                Template preview
              </span>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-[rgba(0,0,0,0.55)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md">
            {template.category}
          </span>
          <span className="rounded-full border border-white/10 bg-[rgba(124,92,252,0.15)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pul)] backdrop-blur-md">
            {sectionCount} sections
          </span>
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center bg-[rgba(7,9,14,0.72)] transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className={`flex gap-2 transition-transform duration-200 ${showActions ? 'translate-y-0' : 'translate-y-3'}`}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPreview()
              }}
              className="gbtn ghost">
              Preview
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
              className="gbtn pu">
              Use Template
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="gbtn">
              Edit
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4">
        <div>
          <h3 className="truncate text-[15px] font-semibold text-[var(--t1)]">
            {template.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--t2)]">
            {template.description}
          </p>
        </div>

        {template.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tagPreview.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[var(--t2)]">
                {tag}
              </span>
            ))}
            {template.tags.length > tagPreview.length && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[var(--t2)]">
                +{template.tags.length - tagPreview.length}
              </span>
            )}
          </div>
        ) : (
          <div className="text-sm text-[var(--t3)]">No tags yet.</div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-[var(--t3)]">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{updatedLabel}</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            {sectionCount} sections
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="rounded-full p-1 text-[var(--rd)] transition hover:bg-[rgba(255,82,82,0.1)] hover:text-red-300"
            title="Delete template"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TemplateCard
