'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { AdvancedAccordionItem } from '@uadmin/shared/blocks/advancedaccordion/types'
import type { PublicBlockProps } from '../PublicBlocks/shared'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value?: string) {
  return value && value !== '' ? value : undefined
}

type AccordionRendererProps = PublicBlockProps & {
  __sharedViewModel?: Record<string, any>
}

const AccordionInner: React.FC<{ viewModel: Record<string, any> }> = ({ viewModel }) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(viewModel.allowAllClosed ? [] : [viewModel.items[0]?.id].filter(Boolean) as string[]))

  useEffect(() => {
    if (!viewModel.allowAllClosed && viewModel.items.length > 0 && openItems.size === 0) {
      setOpenItems(new Set([viewModel.items[0].id]))
    }
  }, [viewModel.allowAllClosed, viewModel.items, openItems.size])

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)

      if (viewModel.behavior === 'single') {
        if (prev.has(itemId)) {
          if (!viewModel.allowAllClosed) {
            return prev
          }
          next.clear()
        } else {
          next.clear()
          next.add(itemId)
        }
      } else {
        if (next.has(itemId)) {
          if (!viewModel.allowAllClosed && next.size === 1) {
            return prev
          }
          next.delete(itemId)
        } else {
          next.add(itemId)
        }
      }

      return next
    })
  }

  if (!viewModel.items.length) {
    return reportCmsBoundaryViolation('advancedaccordion', 'No accordion items were provided for rendering.')
  }

  return (
    <div className={optionalString(viewModel.className)} style={viewModel.containerStyle}>
      {viewModel.items.map((item: AdvancedAccordionItem, index: number) => (
        <AccordionRow
          key={item.id || `${index}`}
          item={item}
          isOpen={openItems.has(item.id)}
          onToggle={() => toggleItem(item.id)}
          viewModel={viewModel}
        />
      ))}
    </div>
  )
}

const Accordion: React.FC<AccordionRendererProps> = (props) => {
  const viewModel = props.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('advancedaccordion', 'Missing required shared view model.')
  }

  return <AccordionInner viewModel={viewModel} />
}

const AccordionRow: React.FC<{
  item: any
  isOpen: boolean
  onToggle: () => void
  viewModel: Record<string, any>
}> = ({ item, isOpen, onToggle, viewModel }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current && isOpen) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen, item.content])

  const contentStyle: React.CSSProperties = {
    ...viewModel.contentStyle,
  }

  if (viewModel.animation === 'slide') {
    contentStyle.maxHeight = isOpen ? `${contentHeight}px` : '0px'
    contentStyle.opacity = isOpen ? 1 : 0.8
  } else if (viewModel.animation === 'fade') {
    contentStyle.maxHeight = isOpen ? 'none' : '0px'
    contentStyle.opacity = isOpen ? 1 : 0
  } else {
    contentStyle.display = isOpen ? 'block' : 'none'
  }

  const closedIcon = viewModel.icon
  const openIcon = viewModel.activeIcon
  const useChevron = closedIcon === 'chevron' && openIcon === 'chevron'

  return (
    <div style={viewModel.itemStyle}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={isOpen ? { ...viewModel.headerStyle, ...viewModel.activeHeaderStyle } : viewModel.headerStyle}>
        {viewModel.iconPosition === 'left' ? (
          <AccordionIcon isOpen={isOpen} useChevron={useChevron} closedIcon={closedIcon} openIcon={openIcon} />
        ) : null}
        <span style={viewModel.titleStyle}>{item.title}</span>
        {viewModel.iconPosition !== 'left' ? (
          <AccordionIcon isOpen={isOpen} useChevron={useChevron} closedIcon={closedIcon} openIcon={openIcon} />
        ) : null}
      </button>

      <div ref={contentRef} style={contentStyle}>
        <div style={{ padding: '14px 16px', lineHeight: viewModel.containerStyle.lineHeight }} dangerouslySetInnerHTML={{ __html: item.content }} />
      </div>
    </div>
  )
}

const AccordionIcon: React.FC<{ isOpen: boolean; useChevron: boolean; closedIcon: string; openIcon: string }> = ({
  isOpen,
  useChevron,
  closedIcon,
  openIcon,
}) => {
  if (useChevron) {
    return (
      <span style={{ minWidth: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
      </span>
    )
  }

  return (
    <span style={{ minWidth: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
      {isOpen ? openIcon : closedIcon}
    </span>
  )
}

export default Accordion
