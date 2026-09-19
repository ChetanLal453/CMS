'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Section } from '@/types/page-editor'
import { useDragDrop } from './DragDropProvider'

interface DroppableSectionProps {
  section: Section;
  index: number;
  isSelected?: boolean;
  editingSectionId?: string | null;
  onSelect?: (sectionId: string) => void;
  onEdit?: (sectionId: string) => void;
  onSave?: () => void;
  onDuplicate?: (sectionId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: (sectionId: string) => void;
  onConfigureColumns?: (sectionId: string) => void;
  children: React.ReactNode;
  [key: string]: any;
}

export const DroppableSection: React.FC<DroppableSectionProps> = ({
  section,
  index,
  isSelected = false,
  editingSectionId,
  onSelect,
  onEdit,
  onSave,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onConfigureColumns,
  onDelete,
  children
}) => {
  const { isDragging, validDropZones, isDraggingOverNested } = useDragDrop()

  const isValidDropZone = validDropZones.some(zone =>
    zone.type === 'section' && zone.id === 'page-layout'
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: `section:${section.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDraggingOverNested ? 1 : 'auto',
    overflow: 'visible' as 'visible',
  }

  // ==================== ✅ CRITICAL FIX: APPLY SECTION SETTINGS ====================
  const sectionSettings = section?.settings || {}
  
  const sectionBg = sectionSettings?.backgroundColor && sectionSettings.backgroundColor !== 'transparent'
    ? sectionSettings.backgroundColor
    : undefined

  // Apply section settings to the MAIN wrapper (not header)
  const mainWrapperStyle: React.CSSProperties = {
    ...style,
    margin: sectionSettings?.margin
      ? typeof sectionSettings.margin === 'number'
        ? `${sectionSettings.margin}px`
        : sectionSettings.margin
      : undefined,
    marginBottom:
      sectionSettings?.marginBottom ??
      (typeof sectionSettings?.margin === 'string' && sectionSettings.margin.includes(' ') ? undefined : '60px'),
    display: sectionSettings?.visible === false ? 'none' : 'block',
    ...(sectionBg ? ({ ['--section-bg']: sectionBg } as any) : {}),
  }

  const containerType = String(sectionSettings?.containerType || 'boxed')
  const maxWidth = Number(sectionSettings?.maxWidth || 1200)
  const sideSpacing = Number(sectionSettings?.sideSpacing ?? 20)
  const toCssLength = (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${value}px`
    }

    const trimmed = String(value).trim()
    if (!trimmed) {
      return undefined
    }

    return /^-?\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed
  }

  const resolvedSideSpacing = containerType === 'full-width' ? 0 : Math.max(0, sideSpacing)
  const resolvedMaxWidth =
    containerType === 'full-width' ? '100%' : containerType === 'fluid' ? '100%' : `${Math.max(320, maxWidth)}px`
  const resolvedSectionPadding = toCssLength(sectionSettings?.padding)
  const horizontalPadding = resolvedSectionPadding ? `max(${resolvedSectionPadding}, ${resolvedSideSpacing}px)` : `${resolvedSideSpacing}px`

  // ✅ Apply container width settings to the section content shell.
  const contentAreaStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 'auto',
    width: '100%',
    maxWidth: resolvedMaxWidth,
    margin: containerType === 'full-width' ? '0' : '0 auto',
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    backgroundColor: sectionSettings?.backgroundColor || 'transparent',
    borderRadius:
      toCssLength(sectionSettings?.borderRadius),
    opacity:
      sectionSettings?.opacity !== undefined ? Math.max(0, Math.min(100, Number(sectionSettings.opacity))) / 100 : undefined,
    ...((sectionSettings?.customCSS ? parseCustomCSS(sectionSettings.customCSS) : {}) as React.CSSProperties),
  }

  // Helper function to parse custom CSS
  function parseCustomCSS(css: string): Record<string, string> {
    const styleObj: Record<string, string> = {}
    
    // Simple CSS parsing for inline styles
    const rules = css.split(';').filter(rule => rule.trim())
    
    rules.forEach(rule => {
      const [property, value] = rule.split(':').map(part => part.trim())
      if (property && value) {
        // Convert CSS property to React style property
        const reactProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        
        // Special handling for opacity
        if (property.toLowerCase() === 'opacity') {
          styleObj.opacity = value
        } else {
          styleObj[reactProperty] = value
        }
      }
    })
    
    return styleObj
  }

  return (
    <div
      ref={setNodeRef}
      style={mainWrapperStyle} // ✅ Apply section settings to MAIN wrapper
      {...attributes}
      data-selected={isSelected}
      className={`sf section-block group overflow-visible ${isSelected ? 'sel' : ''} ${isSortableDragging ? 'opacity-50' : ''}`}
      data-section-id={section.id}
      data-background-color={sectionSettings?.backgroundColor || 'none'}
      data-sticky-enabled={sectionSettings?.sticky_enabled || false}
      onClick={() => onSelect?.(section.id)}
    >
      <div className="sf-stripe"></div>
      <div className="sf-overlay"></div>

      <div {...listeners} className="sf-lbl cursor-move">
        <div className="sf-badge">
          {String(index + 1).padStart(2, '0')} · {section.name && section.name.replace(/[-_\s]/g, '').length > 0 ? section.name : `Section ${index + 1}`}
        </div>
        <div className="sf-type">{section.type || 'container'}</div>
      </div>

      <div className="sf-acts">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onMoveUp?.()
          }}
          className={`sact ${onMoveUp ? '' : 'is-disabled'}`}
          title="Move section up"
          aria-label="Move section up"
          disabled={!onMoveUp}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onMoveDown?.()
          }}
          className={`sact ${onMoveDown ? '' : 'is-disabled'}`}
          title="Move section down"
          aria-label="Move section down"
          disabled={!onMoveDown}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate?.(section.id)
          }}
          className={`sact ${onDuplicate ? '' : 'is-disabled'}`}
          title="Duplicate section"
          aria-label="Duplicate section"
          disabled={!onDuplicate}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(section.id)
          }}
          className={`sact ${onEdit ? '' : 'is-disabled'}`}
          title="Edit Section"
          aria-label="Edit section"
          disabled={!onEdit}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(section.id)
          }}
          className={`sact del ${onDelete ? '' : 'is-disabled'}`}
          title="Delete Section"
          aria-label="Delete section"
          disabled={!onDelete}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>

      <div
        className="sf-content"
        style={{
          ...contentAreaStyle,
          overflow: 'visible',
        }}>
        {children}
      </div>
    </div>
  )
}
