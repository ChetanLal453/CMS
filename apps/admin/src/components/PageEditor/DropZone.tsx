'use client'

import React, { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { DropZone as DropZoneType } from '@/types/page-editor'
import { useDragDrop } from './DragDropProvider'

interface DropZoneProps {
  zone: DropZoneType;
  children: React.ReactNode;
  className?: string;
  placeholder?: React.ReactNode;
  showDropIndicator?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  zone,
  children,
  className = '',
  placeholder,
  showDropIndicator = true
}) => {
  const { isDragging, draggedItem, validDropZones } = useDragDrop()

  // 🆕 FIX: Enhanced validation logic with type assertion
  const isValidDropZone = useMemo(() => {
    // For grid-cell drop zones, check if we have the special grid-cell dropzone
    if (zone.type === 'grid-cell') {
      return validDropZones.some(validZone => 
        validZone.type === 'grid-cell' && 
        (validZone.id === 'grid-cell-dropzone' || validZone.id === zone.id)
      )
    }
    
    // 🆕 FIX: Use type assertion for other zones
    return validDropZones.some(validZone =>
      validZone.type === zone.type && validZone.id === zone.id
    )
  }, [validDropZones, zone.type, zone.id])

  // 🆕 FIX: Use type assertion for dragged item type checking
  const isDraggingValidItem = useMemo(() => {
    if (!draggedItem) return false
    // Use type assertion to bypass TypeScript checking
    return (zone.accepts as string[]).includes(draggedItem.type as string)
  }, [draggedItem, zone.accepts])

  const { isOver, setNodeRef } = useDroppable({
    id: `${zone.type}:${zone.id}`,
    disabled: !isValidDropZone,
    data: {
      type: zone.type,
      accepts: zone.accepts,
      zoneId: zone.id
    }
  })

  return (
    <div
      ref={setNodeRef}
      data-drop-active={isOver && isValidDropZone}
      className={`relative transition-all duration-200 ${className} ${
        isOver && isValidDropZone
          ? 'bg-blue-50/80 border-2 border-blue-300 border-dashed rounded-lg shadow-[0_0_0_1px_rgba(59,130,246,0.14)]'
          : ''
      } ${
        isDragging && isValidDropZone
          ? 'border-2 border-dashed border-gray-300 rounded-lg'
          : ''
      }`}
      data-drop-zone-type={zone.type}
      data-drop-zone-id={zone.id}
      data-is-valid={isValidDropZone}
      data-is-over={isOver}
    >
      {children}

      {/* Drop Indicator */}
      {showDropIndicator && isOver && isValidDropZone && (
        <div className="absolute inset-x-3 top-3 z-10 flex justify-center pointer-events-none">
          <div className="rounded-full border border-blue-400/40 bg-blue-500 px-4 py-2 text-white shadow-[0_10px_30px_rgba(59,130,246,0.25)] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">
              Drop {draggedItem?.type} here
            </span>
          </div>
        </div>
      )}

      {showDropIndicator && isOver && isValidDropZone && (
        <div className="pointer-events-none absolute inset-x-4 top-2 z-[1] h-1 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" />
      )}

      {/* Placeholder for empty zones */}
      {!isOver && placeholder && React.Children.count(children) === 0 && (
        <div className="text-center py-8 text-gray-400">
          {placeholder}
        </div>
      )}

      {/* Empty state when dragging */}
      {isDragging && isValidDropZone && React.Children.count(children) === 0 && (
        <div className="min-h-20 border-2 border-dashed border-blue-200 rounded-lg bg-blue-25"></div>
      )}
    </div>
  )
}

// Specialized drop zones for different contexts
export const SectionDropZone: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  onAddSection?: () => void;
}> = ({ children, placeholder, onAddSection }) => (
  <DropZone
    zone={{
      type: 'section',
      id: 'page-sections',
      accepts: ['section', 'template'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-32"
    placeholder={placeholder || (
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Drag sections or templates here to build your page</p>
          {onAddSection && (
            <button
              onClick={onAddSection}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Container
            </button>
          )}
        </div>
      </div>
    )}
  >
    {children}
  </DropZone>
)

export const ContainerDropZone: React.FC<{
  sectionId: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ sectionId, children, placeholder }) => (
  <DropZone
    zone={{
      type: 'container',
      id: `section-${sectionId}`,
      accepts: ['container', 'template'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-24"
    placeholder={placeholder || (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-xs text-gray-500">Drop containers here</p>
      </div>
    )}
  >
    {children}
  </DropZone>
)

export const RowDropZone: React.FC<{
  containerId: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ containerId, children, placeholder }) => (
  <DropZone
    zone={{
      type: 'row',
      id: `container-${containerId}`,
      accepts: ['row'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-16"
    placeholder={placeholder || (
      <div className="flex items-center justify-center py-2">
        <p className="text-xs text-gray-500">Drop rows here</p>
      </div>
    )}
  >
    {children}
  </DropZone>
)

export const ColumnDropZone: React.FC<{
  rowId: string;
  colId: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ rowId, colId, children, placeholder }) => (
  <DropZone
    zone={{
      type: 'column',
      id: `row-${rowId}-col-${colId}`,
      accepts: ['column', 'component'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-20"
    placeholder={placeholder || (
      <div className="flex flex-col items-center gap-1 py-4">
        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <p className="text-xs text-gray-500">Drop components here</p>
      </div>
    )}
  >
    {children}
  </DropZone>
)

export const ComponentDropZone: React.FC<{
  columnId: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ columnId, children, placeholder }) => (
  <DropZone
    zone={{
      type: 'component',
      id: `column-${columnId}`,
      accepts: ['component'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-12"
    placeholder={placeholder || (
      <div className="flex items-center justify-center py-2">
        <p className="text-xs text-gray-400">Drop components here</p>
      </div>
    )}
  >
    {children}
  </DropZone>
)

// Template drop zone for templates panel
export const TemplatesPanelDropZone: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ children, placeholder }) => (
  <DropZone
    zone={{
      type: 'template',
      id: 'templates-panel',
      accepts: ['template'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-20"
    placeholder={placeholder || (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">Drag templates from here</p>
      </div>
    )}
    showDropIndicator={false}
  >
    {children}
  </DropZone>
)

// Grid drop zones
export const GridDropZone: React.FC<{
  gridId: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ gridId, children, placeholder }) => (
  <DropZone
    zone={{
      type: 'grid',
      id: `grid-${gridId}`,
      accepts: ['grid-cell', 'component'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-24"
    placeholder={placeholder || (
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
        </div>
        <p className="text-xs text-gray-500">Drop grid cells here</p>
      </div>
    )}
  >
    {children}
  </DropZone>
)

export const GridCellDropZone: React.FC<{
  gridId: string;
  cellId: string;
  children: React.ReactNode;
  placeholder?: React.ReactNode;
}> = ({ gridId, cellId, children, placeholder }) => (
  <DropZone
    zone={{
      type: 'grid-cell',
      id: `grid-${gridId}-cell-${cellId}`,
      accepts: ['component'] as any, // 🆕 FIX: Type assertion
      index: 0
    }}
    className="min-h-20"
    placeholder={placeholder || (
      <div className="flex items-center justify-center py-2">
        <p className="text-xs text-gray-400">Drop components here</p>
      </div>
    )}
  >
    {children}
  </DropZone>
)
