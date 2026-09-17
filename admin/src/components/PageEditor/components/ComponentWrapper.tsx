'use client'

import React, { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { LayoutComponent } from '@/types/page-editor'

interface ComponentWrapperProps {
  children: React.ReactNode
  onEdit: () => void
  onDelete?: () => void
  className?: string
  isGridLevel?: boolean
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  component?: LayoutComponent
  deleteComponent?: (componentId: string, context?: any) => void
  // 🆕 CRITICAL: Add nested context props
  carouselId?: string
  slideIndex?: number
  gridId?: string
  cellRow?: number
  cellCol?: number
  parentGridId?: string
  onComponentSelect?: (component: LayoutComponent, context: any) => void
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({
  children,
  onEdit,
  onDelete,
  className = '',
  isGridLevel = false,
  sectionId,
  containerId,
  rowId,
  colId,
  component,
  deleteComponent,
  // 🆕 New props
  carouselId,
  slideIndex,
  gridId,
  cellRow,
  cellCol,
  parentGridId,
  onComponentSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const hasNestedContext = Boolean(carouselId || gridId || parentGridId || cellRow !== undefined || cellCol !== undefined)
  const actionClassName = hasNestedContext || isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (component && onComponentSelect) {
      const context = {
        sectionId: sectionId || '',
        containerId: containerId || '',
        rowId: rowId || '',
        colId: colId || '',
        carouselId,
        slideIndex,
        gridId: gridId || parentGridId,
        cellRow,
        cellCol,
        parentGridId,
        source: gridId ? 'grid-cell' : carouselId ? 'carousel-direct' : 'regular',
        isNestedSelection: !!(carouselId || gridId),
      }

      onComponentSelect(component, context)
      return
    }

    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!component) {
      return
    }

    const deleteContext = {
      sectionId: sectionId || '',
      containerId: containerId || '',
      rowId: rowId || '',
      colId: colId || '',
      carouselId,
      slideIndex,
      gridId: gridId || parentGridId,
      cellRow,
      cellCol,
      parentGridId,
      source: gridId ? 'grid-cell' : carouselId ? 'carousel-direct' : 'regular',
      isNestedSelection: !!(carouselId || gridId),
      deletedFrom: 'ComponentWrapper',
    }

    if (deleteComponent) {
      deleteComponent(component.id, deleteContext)
    } else if (onDelete) {
      onDelete()
    }
  }

  const getContextBadge = () => {
    const parts = []

    if (carouselId) {
      parts.push(`🎠 Slide ${(slideIndex || 0) + 1}`)
    }

    if (gridId || parentGridId) {
      parts.push(`🔳 Grid`)
    }

    if (cellRow !== undefined && cellCol !== undefined) {
      parts.push(`Cell ${cellRow},${cellCol}`)
    }

    return parts.join(' • ')
  }

  return (
    <div
      className={`relative group component-wrapper overflow-visible ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-component-id={component?.id}
      data-carousel-id={carouselId}
      data-slide-index={slideIndex}
      data-grid-id={gridId || parentGridId}
      data-cell-row={cellRow}
      data-cell-col={cellCol}>
      {children}

      {component && !isGridLevel && (
        <div
          className={`absolute left-2 top-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 bg-white/90 px-2.5 py-1 rounded-full shadow-sm transition-opacity duration-200 z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
          {component.type}
          {hasNestedContext && ' • '}
          {hasNestedContext && <span className="text-[10px] text-slate-500 normal-case tracking-normal">{getContextBadge()}</span>}
        </div>
      )}

      {hasNestedContext && (
        <div
          className={`absolute bottom-2 left-2 text-[10px] font-medium text-slate-600 bg-white/88 px-2.5 py-1 rounded-full shadow-sm transition-opacity duration-200 z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
          {getContextBadge()}
        </div>
      )}

      <div className={`absolute right-2 top-2 flex gap-1.5 transition-all duration-200 z-20 ${actionClassName}`}>
        <button
          onClick={handleEdit}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
          title={isGridLevel ? 'Edit Grid' : 'Edit Component'}>
          <Edit size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
          title={isGridLevel ? 'Delete Grid' : 'Delete Component'}>
          <Trash2 size={14} />
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && isHovered && (
        <div className="absolute inset-0 border-2 border-blue-300 border-dashed rounded pointer-events-none z-0" />
      )}
    </div>
  )
}
