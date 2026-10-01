'use client'

import React, { useCallback, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { LayoutComponent } from '@/types/page-editor'
import { createFlexboxViewModel } from '@uadmin/shared/blocks/flexbox/viewModel'
import { DynamicComponent } from '../DynamicComponent'
import { ComponentWrapper } from './ComponentWrapper'
import { useDeviceMode } from '../context/DeviceModeContext'

// ── Props ────────────────────────────────────────────────────────────────────
interface FlexboxAdminRendererProps {
  component?: LayoutComponent
  componentId?: string
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  onComponentSelect?: (component: LayoutComponent, context: any) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  deleteComponent?: (componentId: string, context?: any) => void
  setSelectedComponent?: (sel: { sectionId: string; compId: string; component: LayoutComponent }) => void
  layout?: any
  setLayout?: (layout: any) => void
  isSelected?: boolean
  onSelect?: () => void
  [key: string]: any
}

// ── Drop Slot Card (Exact match with NewGrid cell design) ─────────────────────
function DropSlotCard({
  itemIndex,
  isOver,
  direction,
  alignItems,
}: {
  itemIndex: number
  isOver: boolean
  direction: string
  alignItems: string
}) {
  const isCol = direction === 'column' || direction === 'column-reverse'

  // Varied heights in row mode so vertical alignment (flex-start / center / flex-end / stretch)
  // is visually obvious, exactly matching the CSS Flexbox cheat-sheet!
  const rowHeights = ['80px', '110px', '90px']
  const variedHeight = rowHeights[(itemIndex - 1) % rowHeights.length]

  const cardStyle: React.CSSProperties = {
    borderRadius: '8px',
    border: isOver
      ? '1px solid #7c6dfa'
      : '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: isOver ? 'rgba(124, 109, 250, 0.14)' : '#13161e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '16px',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    fontFamily:
      "'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    // Width and height adhere to cheat sheet flex behavior:
    width: isCol
      ? alignItems === 'stretch'
        ? '100%'
        : '260px'
      : alignItems === 'stretch'
        ? '180px'
        : '180px',
    height: isCol
      ? '78px'
      : alignItems === 'stretch'
        ? '100%'
        : variedHeight,
    minHeight: isCol ? '78px' : alignItems === 'stretch' ? '120px' : variedHeight,
    flexShrink: 0,
    boxShadow: isOver ? '0 0 0 1px rgba(124,109,250,0.2) inset' : undefined,
  }

  return (
    <div style={cardStyle}>
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '6px',
          display: 'grid',
          placeItems: 'center',
          background: isOver
            ? 'rgba(124, 109, 250, 0.28)'
            : 'rgba(124, 109, 250, 0.12)',
          color: '#a594ff',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: '15px',
          fontWeight: 700,
        }}
      >
        +
      </div>
      <div
        style={{
          fontSize: '10.5px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontWeight: 600,
          color: isOver ? '#a594ff' : '#8b90a8',
        }}
      >
        Drop Here
      </div>
      <div
        style={{
          fontSize: '10px',
          color: '#5a5f7a',
        }}
      >
        item {itemIndex}
      </div>
    </div>
  )
}

// ── Main FlexboxAdminRenderer ─────────────────────────────────────────────────
export default function FlexboxAdminRenderer(props: FlexboxAdminRendererProps) {
  const {
    component,
    componentId,
    sectionId,
    containerId,
    rowId,
    colId,
    onComponentSelect,
    onComponentUpdate,
    deleteComponent,
    setSelectedComponent,
    layout,
    setLayout,
    isSelected,
    onSelect,
    ...flexboxProps
  } = props

  const flexboxId = componentId || component?.id || 'flexbox-unknown'

  // Read children array from props
  const rawChildren = component?.props?.children ?? flexboxProps.children
  const children: LayoutComponent[] = Array.isArray(rawChildren)
    ? (rawChildren.filter(Boolean) as LayoutComponent[])
    : []

  // Resolve viewModel
  const viewModelInput = useMemo(
    () => ({
      ...(component?.props || {}),
      ...Object.fromEntries(
        Object.entries(flexboxProps).filter(([k]) => !['children'].includes(k)),
      ),
    }),
    [component?.props, flexboxProps],
  )
  const vm = useMemo(() => createFlexboxViewModel(viewModelInput), [viewModelInput])

  // Drop zone registration
  const dropId = `flexbox-${flexboxId}`
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'flexbox',
      flexboxId,
      sectionId,
      containerId,
      rowId,
      colId,
      accepts: [
        'text',
        'button',
        'image',
        'card',
        'grid',
        'NewGrid',
        'advancedImage',
        'advancedCard',
        'advancedheading',
        'advancedparagraph',
        'advancedbutton',
        'richtext',
        'video',
        'icon',
        'divider',
        'advancedaccordion',
        'tabs',
        'advancedlist',
        'spacer',
        'quote',
        'container',
        'flexbox',
        'component',
      ],
    },
  })

  const { deviceMode } = useDeviceMode()
  const isMobile = deviceMode === 'mobile'

  const effectiveDirection = (
    isMobile && vm.stackOnMobile
      ? (vm.directionMobile || 'column')
      : (vm.direction || 'row')
  ) as React.CSSProperties['flexDirection']

  const effectiveGap = isMobile && vm.mobileGap ? vm.mobileGap : (vm.gap || '16px')
  const effectiveWrap = vm.wrap && vm.wrap !== 'nowrap' ? vm.wrap : (isMobile ? 'wrap' : 'wrap')
  const isCol = effectiveDirection === 'column' || effectiveDirection === 'column-reverse'

  const hasChildren = children.length > 0

  // ── Child event handlers ───────────────────────────────────────────────────
  const handleSelectChild = useCallback(
    (child: LayoutComponent, childIndex: number) => {
      if (onComponentSelect) {
        onComponentSelect(child, {
          sectionId: sectionId || '',
          containerId: containerId || flexboxId,
          rowId: rowId || `flexbox-${flexboxId}`,
          colId: colId || `flexbox-child-${childIndex}`,
          source: 'flexbox-child',
          isNestedSelection: true,
          parentComponentId: flexboxId,
        })
      }
      setSelectedComponent?.({
        sectionId: sectionId || '',
        compId: child.id,
        component: child,
      })
    },
    [onComponentSelect, setSelectedComponent, sectionId, containerId, flexboxId, rowId, colId],
  )

  const handleUpdateChild = useCallback(
    (childId: string, newProps: Record<string, any>) => {
      onComponentUpdate?.(childId, newProps)
    },
    [onComponentUpdate],
  )

  const handleDeleteChild = useCallback(
    (childId: string) => {
      if (deleteComponent) {
        deleteComponent(childId, {
          source: 'flexbox-child',
          parentComponentId: flexboxId,
          flexboxId,
        })
      } else if (props.onDelete) {
        props.onDelete(childId)
      }
    },
    [deleteComponent, flexboxId, props],
  )

  const handleDuplicateChild = useCallback(
    (child: LayoutComponent) => {
      if (!setLayout) return
      setLayout((prevLayout: any) => {
        const newLayout = JSON.parse(JSON.stringify(prevLayout))
        const clonedChild: LayoutComponent = {
          ...child,
          id: `${child.type || 'comp'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          props: JSON.parse(JSON.stringify(child.props || {})),
        }

        const findAndDup = (comps: any[]): boolean => {
          for (const c of comps || []) {
            if (!c) continue
            if (c.id === flexboxId) {
              if (!Array.isArray(c.props?.children)) c.props.children = []
              const idx = c.props.children.findIndex((k: any) => k?.id === child.id)
              if (idx >= 0) {
                c.props.children.splice(idx + 1, 0, clonedChild)
              } else {
                c.props.children.push(clonedChild)
              }
              return true
            }
            if (c.props?.cells) {
              for (const row of c.props.cells) {
                for (const cell of row || []) {
                  if (cell?.component && findAndDup([cell.component])) return true
                }
              }
            }
            if (Array.isArray(c.props?.children)) {
              if (findAndDup(c.props.children)) return true
            }
          }
          return false
        }

        for (const sec of newLayout.sections || []) {
          const rows = sec.container?.rows || sec.rows || []
          for (const r of rows) {
            for (const c of r.columns || []) {
              if (findAndDup(c.components || [])) return newLayout
            }
          }
        }
        return newLayout
      })
    },
    [flexboxId, setLayout],
  )

  if (hasChildren) {
    const liveFlexStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: effectiveDirection,
      justifyContent: (vm.justifyContent || 'flex-start') as React.CSSProperties['justifyContent'],
      alignItems: (vm.alignItems || 'stretch') as React.CSSProperties['alignItems'],
      alignContent: (vm.alignContent || 'stretch') as React.CSSProperties['alignContent'],
      flexWrap: effectiveWrap as React.CSSProperties['flexWrap'],
      gap: effectiveGap,
      padding: vm.padding || '0px',
      margin: vm.margin || undefined,
      width: vm.width || '100%',
      maxWidth: vm.maxWidth || undefined,
      minHeight: vm.minHeight && vm.minHeight !== 'auto' ? vm.minHeight : undefined,
      backgroundColor: vm.backgroundColor && vm.backgroundColor !== 'transparent' ? vm.backgroundColor : 'transparent',
      borderRadius: vm.borderRadius || '0px',
      border: vm.border && vm.border !== 'none' ? vm.border : undefined,
      boxShadow: vm.boxShadow && vm.boxShadow !== 'none' ? vm.boxShadow : undefined,
      boxSizing: 'border-box',
      position: 'relative',
      outline: isSelected ? '1.5px solid #7c6dfa' : isOver ? '2px dashed #7c6dfa' : undefined,
    }

    return (
      <div
        ref={setNodeRef}
        style={liveFlexStyle}
        data-flexbox-id={flexboxId}
        data-drop-zone={dropId}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
      >
        {children.map((child, ci) => {
          const isChildStretch =
            isCol && (vm.alignItems === 'stretch' || !vm.alignItems)

          return (
            <div
              key={child.id || `child-${ci}`}
              style={{
                width: isChildStretch ? '100%' : 'auto',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                position: 'relative',
                alignSelf: vm.alignItems === 'stretch' ? 'stretch' : undefined,
                flex: isCol ? undefined : '0 1 auto',
                display: 'inline-flex',
              }}
            >
              <ComponentWrapper
                component={child}
                onEdit={() => handleSelectChild(child, ci)}
                onDelete={() => handleDeleteChild(child.id)}
                onDuplicate={() => handleDuplicateChild(child)}
                isGridLevel={false}
                sectionId={sectionId}
                containerId={containerId || flexboxId}
                rowId={rowId}
                colId={colId}
                deleteComponent={deleteComponent}
                onComponentSelect={onComponentSelect}
              >
                <DynamicComponent
                  component={child}
                  isSelected={false}
                  onSelect={() => handleSelectChild(child, ci)}
                  onUpdate={(newProps) => handleUpdateChild(child.id, newProps)}
                  onComponentSelect={onComponentSelect}
                  onComponentUpdate={handleUpdateChild}
                  setSelectedComponent={setSelectedComponent}
                  deleteComponent={deleteComponent}
                  onDelete={() => handleDeleteChild(child.id)}
                  layout={layout}
                  setLayout={setLayout}
                  sectionId={sectionId}
                  containerId={containerId || flexboxId}
                  rowId={rowId}
                  colId={colId}
                />
              </ComponentWrapper>
            </div>
          )
        })}

        {/* Inline drop slot indicator when flex already has children */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 14px',
            borderRadius: '6px',
            border: isOver ? '1.5px dashed #7c6dfa' : '1px dashed rgba(255, 255, 255, 0.15)',
            backgroundColor: isOver ? 'rgba(124, 109, 250, 0.15)' : 'rgba(255, 255, 255, 0.02)',
            color: isOver ? '#a594ff' : '#737996',
            fontSize: '11px',
            fontFamily: "'DM Mono', monospace",
            gap: '5px',
            alignSelf: 'center',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>+</span>
          <span>Drop item here</span>
        </div>
      </div>
    )
  }

  // ── Overall Card Shell Style for empty Flexbox Drop Target ──────────────────
  const shellStyle: React.CSSProperties = {
    background: '#1a1d28',
    borderRadius: vm.borderRadius || '10px',
    border: isSelected
      ? '1px solid #7c6dfa'
      : isOver
        ? '1px solid #7c6dfa'
        : vm.border && vm.border !== 'none'
          ? vm.border
          : '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: isSelected
      ? '0 0 0 1px #7c6dfa, 0 8px 24px rgba(0, 0, 0, 0.4)'
      : vm.boxShadow || '0 4px 16px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.2s ease',
    width: vm.width || '100%',
    maxWidth: vm.maxWidth || undefined,
    boxSizing: 'border-box',
  }

  const flexBodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: (vm.direction || 'row') as React.CSSProperties['flexDirection'],
    justifyContent: (vm.justifyContent || 'flex-start') as React.CSSProperties['justifyContent'],
    alignItems: (vm.alignItems || 'stretch') as React.CSSProperties['alignItems'],
    alignContent: (vm.alignContent || 'stretch') as React.CSSProperties['alignContent'],
    flexWrap: (vm.wrap || 'nowrap') as React.CSSProperties['flexWrap'],
    gap: vm.gap || '16px',
    padding: vm.padding || '20px',
    minHeight: '220px',
    backgroundColor:
      vm.backgroundColor && vm.backgroundColor !== 'transparent'
        ? vm.backgroundColor
        : '#13161e',
    boxSizing: 'border-box',
    position: 'relative',
    transition: 'all 0.22s ease',
    overflow: 'visible',
  }

  return (
    <div
      ref={setNodeRef}
      style={shellStyle}
      data-flexbox-id={flexboxId}
      data-drop-zone={dropId}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
      }}
    >
      {/* ── 1. Header ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          background: '#1a1d28',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: 'rgba(124, 109, 250, 0.12)',
            color: '#a594ff',
            padding: '2px 8px',
            borderRadius: '20px',
            border: '1px solid rgba(124, 109, 250, 0.2)',
          }}
        >
          Layout
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8eaf0' }}>
          Flexbox
        </span>
        <span
          style={{
            marginLeft: 'auto',
            color: '#5a5f7a',
            fontSize: '11.5px',
            fontFamily:
              "'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {vm.direction || 'row'} · {vm.justifyContent || 'flex-start'} · {vm.alignItems || 'stretch'}
        </span>
      </div>

      {/* ── 2. Flex Content Body (Empty Drop Slots) ──────────────────────── */}
      <div style={flexBodyStyle}>
        <DropSlotCard
          itemIndex={1}
          isOver={isOver}
          direction={vm.direction || 'row'}
          alignItems={vm.alignItems || 'stretch'}
        />
        <DropSlotCard
          itemIndex={2}
          isOver={isOver}
          direction={vm.direction || 'row'}
          alignItems={vm.alignItems || 'stretch'}
        />
        <DropSlotCard
          itemIndex={3}
          isOver={isOver}
          direction={vm.direction || 'row'}
          alignItems={vm.alignItems || 'stretch'}
        />
      </div>

      {/* ── 3. Footer ────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 16px 12px',
          fontSize: '11.5px',
          color: '#5a5f7a',
          background: '#1a1d28',
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
          userSelect: 'none',
        }}
      >
        CSS Flexbox layout with direction, alignment, and spacing.
        <span
          style={{
            marginLeft: '8px',
            color: '#8b90a8',
            fontFamily:
              "'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {vm.direction || 'row'} · 0 components
        </span>
      </div>
    </div>
  )
}
