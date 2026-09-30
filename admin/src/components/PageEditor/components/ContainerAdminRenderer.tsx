'use client'

import React, { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { LayoutComponent } from '@/types/page-editor'
import { createContainerViewModel } from '../../../../../shared/blocks/container/viewModel'
import { DynamicComponent } from '../DynamicComponent'
import { ComponentWrapper } from './ComponentWrapper'

interface ContainerAdminRendererProps {
  component?: LayoutComponent
  componentId?: string
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  onComponentSelect?: (component: LayoutComponent, context: any) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  deleteComponent?: (componentId: string, context?: any) => void
  setSelectedComponent?: (sel: any) => void
  layout?: any
  setLayout?: (layout: any) => void
  isSelected?: boolean
  onSelect?: () => void
  [key: string]: any
}

export default function ContainerAdminRenderer(props: ContainerAdminRendererProps) {
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
    isSelected,
    onSelect,
    layout,
    setLayout,
  } = props

  const rawProps = component?.props || props || {}
  const vm = useMemo(() => createContainerViewModel(rawProps), [rawProps])
  const children: LayoutComponent[] = Array.isArray(rawProps.children) ? rawProps.children : []
  const hasChildren = children.length > 0

  const containerIdResolved = componentId || component?.id || `container-${Date.now()}`
  const dropId = `container-${containerIdResolved}`
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      type: 'container',
      containerId: containerIdResolved,
      sectionId,
      rowId,
      colId,
      accepts: [
        'button',
        'heading',
        'paragraph',
        'text',
        'image',
        'card',
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

  const style: React.CSSProperties = {
    maxWidth: vm.maxWidth || '100%',
    width: vm.width || '100%',
    minHeight: vm.minHeight && vm.minHeight !== 'auto' ? vm.minHeight : hasChildren ? undefined : '80px',
    padding: vm.padding || (hasChildren ? '0px' : '16px'),
    margin: vm.margin || '0 auto',
    backgroundColor: vm.backgroundColor && vm.backgroundColor !== 'transparent' ? vm.backgroundColor : 'transparent',
    borderRadius: vm.borderRadius || '0px',
    border: vm.border && vm.border !== 'none' ? vm.border : hasChildren ? 'none' : '1.5px dashed rgba(255, 255, 255, 0.15)',
    borderColor: vm.borderColor || undefined,
    boxShadow: vm.shadow && vm.shadow !== 'none' ? vm.shadow : undefined,
    position: (vm.position as any) || 'static',
    top: vm.top || undefined,
    right: vm.right || undefined,
    bottom: vm.bottom || undefined,
    left: vm.left || undefined,
    zIndex: vm.zIndex !== undefined && vm.zIndex !== '' ? Number(vm.zIndex) || 1 : undefined,
    overflow: (vm.overflow as any) || 'visible',
    boxSizing: 'border-box',
    outline: isSelected ? '1.5px solid #7c6dfa' : isOver ? '2px dashed #7c6dfa' : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-container-id={containerIdResolved}
      data-drop-zone={dropId}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
      }}
    >
      {hasChildren ? (
        <>
          {children.map((child, idx) => {
            const isChildAbsolute = child.props?.position === 'absolute'
            const wrapperStyle: React.CSSProperties | undefined = isChildAbsolute
              ? {
                  position: 'absolute',
                  top: child.props?.top || undefined,
                  right: child.props?.right || undefined,
                  bottom: child.props?.bottom || undefined,
                  left: child.props?.left || undefined,
                  width: child.props?.width || 'auto',
                  maxWidth: child.props?.maxWidth || 'max-content',
                  zIndex: child.props?.zIndex !== undefined && child.props.zIndex !== '' ? Number(child.props.zIndex) || 10 : 10,
                }
              : undefined

            const effectiveChild = isChildAbsolute
              ? {
                  ...child,
                  props: {
                    ...child.props,
                    position: 'relative',
                    top: undefined,
                    right: undefined,
                    bottom: undefined,
                    left: undefined,
                  },
                }
              : child

            return (
              <ComponentWrapper
                key={child.id || `child-${idx}`}
                component={child}
                style={wrapperStyle}
                onEdit={() => onComponentSelect?.(child, { sectionId, containerId: containerIdResolved, rowId, colId })}
                onDelete={() => deleteComponent?.(child.id)}
                onDuplicate={() => {}}
                isGridLevel={false}
                sectionId={sectionId}
                containerId={containerIdResolved}
                rowId={rowId}
                colId={colId}
                deleteComponent={deleteComponent}
                onComponentSelect={onComponentSelect}
              >
                <DynamicComponent
                  component={effectiveChild}
                  isSelected={false}
                  onSelect={() => onComponentSelect?.(child, { sectionId, containerId: containerIdResolved, rowId, colId })}
                  onUpdate={(newProps) => onComponentUpdate?.(child.id, newProps)}
                  onComponentSelect={onComponentSelect}
                  onComponentUpdate={onComponentUpdate}
                  setSelectedComponent={setSelectedComponent}
                  deleteComponent={deleteComponent}
                  onDelete={() => deleteComponent?.(child.id)}
                  layout={layout}
                  setLayout={setLayout}
                  sectionId={sectionId}
                  containerId={containerIdResolved}
                  rowId={rowId}
                  colId={colId}
                />
              </ComponentWrapper>
            )
          })}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              margin: '6px 0',
              borderRadius: '6px',
              border: isOver ? '1.5px dashed #7c6dfa' : '1px dashed rgba(255, 255, 255, 0.15)',
              backgroundColor: isOver ? 'rgba(124, 109, 250, 0.15)' : 'rgba(255, 255, 255, 0.02)',
              color: isOver ? '#a594ff' : '#737996',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              pointerEvents: 'none',
            }}
          >
            + Drop item inside Container
          </div>
        </>
      ) : (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: isOver ? '#a89cf5' : '#8890b5',
            fontSize: '12px',
            fontWeight: 500,
            border: isOver ? '1.5px dashed #7c6dfa' : '1.5px dashed rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            background: isOver ? 'rgba(124, 109, 250, 0.12)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.15s ease',
            pointerEvents: 'none',
          }}
        >
          + Drop components inside Container
        </div>
      )}
    </div>
  )
}
