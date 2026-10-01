// src/components/PageEditor/components/AdvancedAccordion.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  createAdvancedAccordionViewModel,
  normalizeAdvancedAccordion,
  type AdvancedAccordionInput,
  type AdvancedAccordionItem,
} from '@uadmin/shared/blocks/advancedaccordion'

export type AdvancedAccordionProps = AdvancedAccordionInput & {
  onUpdate?: (props: Partial<AdvancedAccordionProps>) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  componentId?: string
  onSelect?: () => void
}

// ==================== ACCORDION ITEM COMPONENT ====================
const AccordionItem: React.FC<{
  item: AdvancedAccordionItem
  isOpen: boolean
  onToggle: () => void
  viewModel: ReturnType<typeof createAdvancedAccordionViewModel>
}> = ({ item, isOpen, onToggle, viewModel }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current && isOpen) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen, item.content])

  const itemStyle: React.CSSProperties = {
    ...viewModel.itemStyle,
  }

  const headerStyle: React.CSSProperties = {
    ...viewModel.headerStyle,
    ...(isOpen ? viewModel.activeHeaderStyle : null),
  }

  const contentStyle: React.CSSProperties = {
    ...viewModel.contentStyle,
  }

  // Apply animation
  if (viewModel.animation === 'slide') {
    contentStyle.maxHeight = isOpen ? `${contentHeight}px` : '0px'
    contentStyle.opacity = isOpen ? 1 : 0.8
  } else if (viewModel.animation === 'fade') {
    contentStyle.maxHeight = isOpen ? 'none' : '0px'
    contentStyle.opacity = isOpen ? 1 : 0
  } else {
    contentStyle.display = isOpen ? 'block' : 'none'
  }

  const closedIcon = viewModel.icon || 'chevron'
  const openIcon = viewModel.activeIcon || closedIcon
  const useChevron = closedIcon === 'chevron' && openIcon === 'chevron'

  return (
    <div style={itemStyle} className="accordion-item">
      <button
        style={headerStyle}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
        className="accordion-header"
      >
        {viewModel.iconPosition === 'left' && (
          <span className="accordion-icon" style={{ minWidth: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {useChevron ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            ) : (
              <span style={{ fontSize: '12px' }}>{isOpen ? openIcon : closedIcon}</span>
            )}
          </span>
        )}

        <span className="accordion-title flex-1" style={viewModel.titleStyle}>
          {item.title}
        </span>

        {viewModel.iconPosition !== 'left' && (
          <span className="accordion-icon" style={{ minWidth: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {useChevron ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            ) : (
              <span style={{ fontSize: '12px' }}>{isOpen ? openIcon : closedIcon}</span>
            )}
          </span>
        )}
      </button>

      <div
        ref={contentRef}
        style={contentStyle}
        id={`accordion-content-${item.id}`}
        aria-labelledby={`accordion-header-${item.id}`}
        role="region"
        className="accordion-content"
      >
        <div style={{ padding: '14px 16px', lineHeight: viewModel.containerStyle.lineHeight }}>
          {typeof item.content === 'string'
            ? item.content
            : typeof item.content === 'object' && typeof (item.content as any)?.content === 'string'
            ? (item.content as any).content
            : null}
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN ACCORDION COMPONENT ====================
const AdvancedAccordion: React.FC<AdvancedAccordionProps> = (props) => {
  const { onUpdate, onComponentUpdate, componentId, onSelect, ...accordionProps } = props
  const normalized = useMemo(() => normalizeAdvancedAccordion(accordionProps), [accordionProps])
  const viewModel = useMemo(() => createAdvancedAccordionViewModel(normalized), [normalized])
  const [openItems, setOpenItems] = useState<Set<string>>(() =>
    new Set(viewModel.allowAllClosed ? [] : [viewModel.items[0]?.id].filter(Boolean) as string[]),
  )
  
  // Initialize with first item open if allowAllClosed is false
  useEffect(() => {
    if (!viewModel.allowAllClosed && viewModel.items.length > 0 && openItems.size === 0) {
      setOpenItems(new Set([viewModel.items[0].id]))
    }
  }, [viewModel.allowAllClosed, viewModel.items, openItems.size])

  const toggleItem = useCallback((itemId: string) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev)
      
      if (viewModel.behavior === 'single') {
        if (prev.has(itemId)) {
          if (!viewModel.allowAllClosed) {
            return prev
          }
          newOpenItems.clear()
        } else {
          newOpenItems.clear()
          newOpenItems.add(itemId)
        }
      } else {
        if (newOpenItems.has(itemId)) {
          if (!viewModel.allowAllClosed && newOpenItems.size === 1) {
            return prev
          }
          newOpenItems.delete(itemId)
        } else {
          newOpenItems.add(itemId)
        }
      }
      
      return newOpenItems
    })
  }, [viewModel.behavior, viewModel.allowAllClosed])

  const isItemOpen = useCallback((itemId: string) => {
    return openItems.has(itemId)
  }, [openItems])

  const accordionStyle = viewModel.containerStyle

  if (viewModel.items.length === 0) {
    return (
      <div style={accordionStyle} className="accordion-empty-state p-4 text-center text-gray-500 border border-dashed rounded-lg">
        <p>No accordion items to display. Add some items in the editor.</p>
      </div>
    )
  }

  return (
    <div
      style={accordionStyle}
      className="advanced-accordion"
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.()
      }}>
      {viewModel.items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={isItemOpen(item.id)}
          onToggle={() => toggleItem(item.id)}
          viewModel={viewModel}
        />
      ))}
    </div>
  )
}

export default AdvancedAccordion
