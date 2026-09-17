'use client'

import React from 'react'
import { Section, LayoutComponent, Row, Column } from '@/types/page-editor'

interface StructureTreeProps {
  layout?: { sections?: Section[] }
  selectedSectionId?: string
  selectedComponentId?: string
  onSectionSelect: (sectionId: string) => void
  onComponentSelect: (component: LayoutComponent, context: { sectionId: string; containerId: string; rowId: string; colId: string }) => void
}

export const StructureTree: React.FC<StructureTreeProps> = ({
  layout,
  selectedSectionId,
  selectedComponentId,
  onSectionSelect,
  onComponentSelect,
}) => {
  const [sectionExpansion, setSectionExpansion] = React.useState<Record<string, boolean>>({})
  const sections = layout?.sections || []

  const getComponentDisplay = React.useCallback((component: LayoutComponent) => {
    const type = String(component.type || '').toLowerCase()
    const level = String(component.props?.level || component.props?.semanticLevel || 'h2').toLowerCase()
    const customLabel = typeof component.label === 'string' ? component.label.trim() : ''

    if (type.includes('advancedheading')) {
      return { label: customLabel || 'Advanced Heading', meta: level }
    }

    if (type.includes('advancedparagraph') || type.includes('richtext') || type.includes('quote')) {
      return { label: customLabel || 'Paragraph', meta: 'p' }
    }

    if (type.includes('advancedimage') || type === 'image') {
      return { label: customLabel || 'Advanced Image', meta: 'img' }
    }

    if (type.includes('advancedbutton')) {
      return { label: customLabel || 'Button', meta: 'button' }
    }

    if (type.includes('advancedlist') || type === 'list') {
      return { label: customLabel || 'Advanced List', meta: 'list' }
    }

    if (type.includes('swiper') || type.includes('carousel') || type.includes('slider')) {
      return { label: customLabel || 'Carousel', meta: 'carousel' }
    }

    if (type.includes('accordion')) {
      return { label: customLabel || 'Accordion', meta: 'accordion' }
    }

    if (type.includes('tabs')) {
      return { label: customLabel || 'Tabs', meta: 'tabs' }
    }

    if (type.includes('video')) {
      return { label: customLabel || 'Video', meta: 'video' }
    }

    if (type.includes('newgrid') || type === 'grid') {
      return { label: customLabel || 'Grid', meta: 'grid' }
    }

    if (type.includes('advancedcard') || type.includes('card')) {
      return { label: customLabel || 'Card', meta: 'card' }
    }

    return {
      label: customLabel || component.type || 'Component',
      meta: type || 'component',
    }
  }, [])

  const sectionContainsSelectedComponent = React.useCallback(
    (section: Section) => {
      if (!selectedComponentId) return false

      return Boolean(
        section.container?.rows?.some((row) =>
          row.columns?.some((column) => column.components?.some((component) => component.id === selectedComponentId)),
        ),
      )
    },
    [selectedComponentId],
  )

  React.useEffect(() => {
    const sectionIds = new Set(sections.map((section) => section.id))

    setSectionExpansion((prev) => {
      const nextEntries = Object.entries(prev).filter(([sectionId]) => sectionIds.has(sectionId))
      if (nextEntries.length === Object.keys(prev).length) {
        return prev
      }

      return nextEntries.reduce<Record<string, boolean>>((accumulator, [sectionId, expanded]) => {
        accumulator[sectionId] = expanded
        return accumulator
      }, {})
    })
  }, [sections])

  React.useEffect(() => {
    if (!selectedSectionId && !selectedComponentId) {
      return
    }

    setSectionExpansion((prev) => {
      let hasChanges = false
      const next = { ...prev }

      sections.forEach((section) => {
        if (selectedSectionId === section.id || sectionContainsSelectedComponent(section)) {
          if (next[section.id] !== true) {
            next[section.id] = true
            hasChanges = true
          }
        }
      })

      return hasChanges ? next : prev
    })
  }, [sections, sectionContainsSelectedComponent, selectedComponentId, selectedSectionId])

  const isSectionExpanded = React.useCallback(
    (section: Section, sectionIndex: number) => {
      const explicitState = sectionExpansion[section.id]

      if (typeof explicitState === 'boolean') {
        return explicitState
      }

      return sectionIndex === 0 || selectedSectionId === section.id || sectionContainsSelectedComponent(section)
    },
    [sectionContainsSelectedComponent, sectionExpansion, selectedSectionId],
  )

  const toggleSectionExpansion = React.useCallback((sectionId: string, expanded: boolean) => {
    setSectionExpansion((prev) => ({
      ...prev,
      [sectionId]: !expanded,
    }))
  }, [])

  const renderIcon = (kind: 'section' | 'container' | 'column' | 'component', componentType?: string, active?: boolean) => {
    const stroke = active ? 'var(--canvas-accent2, #a594ff)' : 'currentColor'
    const type = String(componentType || '').toLowerCase()

    if (kind === 'section' || kind === 'container' || kind === 'column') {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )
    }

    if (type.includes('heading')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      )
    }

    if (type.includes('paragraph') || type.includes('quote') || type.includes('richtext')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      )
    }

    if (type.includes('image') || type.includes('icon') || type.includes('video')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
        </svg>
      )
    }

    if (type.includes('button')) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
          <rect x="3" y="8" width="18" height="8" rx="4" />
        </svg>
      )
    }

    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    )
  }

  const structureItems = React.useMemo(() => {
    const items: Array<{
      id: string
      label: string
      prefix?: string
      meta: string
      active: boolean
      depth: number
      kind: 'section' | 'container' | 'column' | 'component'
      componentType?: string
      expandable?: boolean
      expanded?: boolean
      onToggle?: () => void
      onClick: () => void
    }> = []

    sections.forEach((section, sectionIndex) => {
      const isDefaultOpen = !selectedSectionId && !selectedComponentId && sectionIndex === 0
      const isExpanded = isSectionExpanded(section, sectionIndex)
      const isSectionActive = selectedSectionId === section.id || isDefaultOpen

      items.push({
        id: section.id,
        prefix: `${String(sectionIndex + 1).padStart(2, '0')}·`,
        label: section.name || `Section ${sectionIndex + 1}`,
        meta: 'section',
        active: isSectionActive,
        depth: 0,
        kind: 'section',
        expandable: true,
        expanded: isExpanded,
        onToggle: () => toggleSectionExpansion(section.id, isExpanded),
        onClick: () => onSectionSelect(section.id),
      })

      if (!isExpanded) {
        return
      }

      items.push({
        id: `${section.id}-container`,
        label: 'Container',
        meta: 'flex',
        active: false,
        depth: 1,
        kind: 'container',
        onClick: () => onSectionSelect(section.id),
      })

      section.container?.rows?.forEach((row: Row) => {
        row.columns?.forEach((col: Column, colIndex: number) => {
          const hasMultipleColumns = (row.columns?.length || 0) > 1
          const componentDepth = hasMultipleColumns ? 3 : 2

          if (hasMultipleColumns && col.components?.length) {
            items.push({
              id: `${section.id}-${row.id}-${col.id}`,
              label: `Column ${colIndex + 1}`,
              meta: 'column',
              active: false,
              depth: 2,
              kind: 'column',
              onClick: () => onSectionSelect(section.id),
            })
          }

          col.components?.forEach((component: LayoutComponent, componentIndex: number) => {
            const componentDisplay = getComponentDisplay(component)
            items.push({
              id: component.id,
              label: componentDisplay.label || `Component ${componentIndex + 1}`,
              meta: componentDisplay.meta,
              active: selectedComponentId === component.id,
              depth: componentDepth,
              kind: 'component',
              componentType: component.type,
              onClick: () =>
                onComponentSelect(component, {
                  sectionId: section.id,
                  containerId: section.container.id,
                  rowId: row.id,
                  colId: col.id,
                }),
            })
          })
        })
      })
    })

    return items
  }, [isSectionExpanded, onComponentSelect, onSectionSelect, sections, selectedComponentId, selectedSectionId, toggleSectionExpansion])

  if (structureItems.length === 0) {
    return <div className="str-empty">No sections yet. Add components to start building.</div>
  }

  return (
    <div id="struct-list" className="panel-scroll lp-body str-list">
      {structureItems.map((item) => (
        <div
          key={item.id}
          className={`str-row kind-${item.kind} depth-${item.depth} ${item.active ? 'is-active' : ''}`}
          style={{ paddingLeft: `${item.depth === 0 ? 0 : item.depth === 1 ? 16 : item.depth === 2 ? 30 : 44}px` }}>
          {item.expandable ? (
            <button
              type="button"
              className={`str-expander ${item.expanded ? 'open' : ''}`}
              onClick={(event) => {
                event.stopPropagation()
                item.onToggle?.()
              }}
              aria-label={item.expanded ? `Collapse ${item.label}` : `Expand ${item.label}`}>
              {renderIcon('section', undefined, item.active)}
            </button>
          ) : (
            <span className="layer-icon str-leading-icon">{renderIcon(item.kind, item.componentType, item.active)}</span>
          )}

          <button type="button" className={`layer-item str-item flex-1 text-left ${item.active ? 'active on' : ''}`} onClick={item.onClick}>
            {item.prefix ? <span className="str-prefix">{item.prefix}</span> : null}
            <span className="layer-name str-name flex-1 truncate">{item.label}</span>
            <span className="layer-type str-meta">{item.meta}</span>
          </button>
        </div>
      ))}
    </div>
  )
}
