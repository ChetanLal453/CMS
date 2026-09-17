'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ResizableBox } from 'react-resizable'
import 'react-resizable/css/styles.css'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LayoutComponent } from '@/types/page-editor'
import { useDragDrop } from './DragDropProvider'
import { TrashIcon, EditIcon } from 'lucide-react'

interface DraggableComponentProps {
  component: LayoutComponent;
  index: number;
  sectionId: string;
  containerId: string;
  rowId: string;
  colId: string;
  isSelected?: boolean;
  onSelect?: (component: LayoutComponent, context: {
    sectionId: string;
    containerId: string;
    rowId: string;
    colId: string;
  }) => void;
  onEdit?: (componentId: string) => void;
  onDuplicate?: (component: LayoutComponent) => void;
  onDelete?: (componentId: string, context?: any) => void;
  onResize?: (componentId: string, size: { width: number; height: number }) => void;
  renderComponent: (component: LayoutComponent, context: { sectionId: string; containerId: string; rowId: string; colId: string }) => React.ReactNode;
  [key: string]: any;
}

export const DraggableComponent: React.FC<DraggableComponentProps> = ({
  component,
  index,
  sectionId,
  containerId,
  rowId,
  colId,
  isSelected = false,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onResize,
  renderComponent
}) => {
  const { isDragging } = useDragDrop()
  const [isDeleted, setIsDeleted] = useState(false) // 🆕 NEW STATE
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [resizableWidth, setResizableWidth] = useState(0)
  const isAdvancedHeading = component.type === 'advancedheading'
  const isAdvancedParagraph = component.type === 'advancedparagraph'
  const isAdvancedContent = isAdvancedHeading || isAdvancedParagraph

  const draggableId = `component:${component.id}:${sectionId}-${containerId}-${rowId}-${colId}`

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: draggableId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const resolvedHeight = (() => {
    const rawHeight = typeof component?.height === 'number' ? component.height : Number(String(component?.height || '').trim())
    return Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 200
  })()

  useEffect(() => {
    const node = contentRef.current
    if (!node) {
      return
    }

    const measure = () => {
      const nextWidth = Math.max(1, Math.round(node.getBoundingClientRect().width))
      setResizableWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth))
    }

    measure()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }

    const observer = new ResizeObserver(() => measure())
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  // ✅✅✅ **FIXED: handleDeleteClick - IMMEDIATE UI REMOVAL**
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDeleted) {
      console.log('⏳ Already deleted, please wait...');
      return;
    }
    
    console.log("🧹 Delete clicked for section component:", component.id, {
      sectionId,
      containerId,
      rowId,
      colId,
      componentType: component.type
    });
    
    // 🎯 **CRITICAL FIX: IMMEDIATELY HIDE COMPONENT FROM UI**
    setIsDeleted(true);
    
    console.log('👁️ Component hidden from UI - STATE UPDATED');
    
    // ✅ Pass complete context to onDelete
    onDelete?.(component.id, {
      sectionId,
      containerId,
      rowId,
      colId,
      source: 'draggable-component',
      componentType: component.type,
      timestamp: new Date().toISOString()
    });
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDeleted) {
      onSelect?.(component, { sectionId, containerId, rowId, colId });
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDeleted) {
      onEdit?.(component.id);
    }
  }

  // 🎯 **CRITICAL: If component is deleted, DON'T RENDER**
  if (isDeleted) {
    console.log('🚫 Component deleted, not rendering:', component.id);
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-selected={isSelected}
      className={`draggable-component group relative mb-3 w-full max-w-full ${isSortableDragging ? 'opacity-50' : ''} ${isSelected ? 'is-selected' : ''} dc-type-${component.type}`}
      onClick={handleSelectClick}
    >
      {/* Component Top Badge on hover/selection */}
      <div className="dc-tag">
        <span {...listeners} className="dc-tag-handle cursor-grab" title="Drag to reorder">⋮⋮</span>
        <span className="dc-tag-label">{component.label || component.type}</span>
      </div>

      {/* Component Content */}
      <div ref={contentRef} className="dc-body h-auto w-full p-0">
        <div className="h-auto w-full">
          {renderComponent(component, { sectionId, containerId, rowId, colId })}
        </div>
      </div>

      {/* Action Buttons Top-Right */}
      <div className="dc-actions">
        <button
          onClick={handleDeleteClick}
          disabled={isDeleted}
          className={`dc-action-btn is-danger ${isDeleted ? 'is-disabled' : ''}`}
          title="Delete Component"
        >
          <TrashIcon size={13} />
        </button>
      </div>
    </div>
  )
}
