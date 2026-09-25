'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  DndContext,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type Collision,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

// 🆕 FIX: Create local types to avoid TypeScript issues
interface LocalDragItem {
  type: string;
  id: string;
  data: any;
}

interface LocalDropZone {
  type: string;
  id: string;
  accepts: string[];
  index?: number;
  priority?: number;
  carouselId?: string;
}

interface DragDropContextType {
  isDragging: boolean
  draggedItem: LocalDragItem | null
  validDropZones: LocalDropZone[]
  isDraggingOverNested: boolean
  setValidDropZones: (zones: LocalDropZone[]) => void
  clearValidDropZones: () => void
}

const DragDropContextValue = createContext<DragDropContextType | undefined>(undefined)

export const useDragDrop = () => {
  const context = useContext(DragDropContextValue)
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider')
  }
  return context
}

interface DragDropProviderProps {
  children: React.ReactNode
  onDragEnd: (result: any, draggedItem: any) => void
}

const DEBUG_DND = false
const debugLog = (...args: unknown[]) => {
  if (DEBUG_DND) {
    console.log(...args)
  }
}

const getDropPriority = (id: string): number => {
  if (id.startsWith('component:empty:grid:')) return 0
  if (id.startsWith('flexbox-')) return 1        // ← Flexbox drop zone (nested, high priority)
  if (id.startsWith('swiper-')) return 2
  if (id.startsWith('component:carousel-')) return 3
  if (id.startsWith('column:')) return 10
  if (id === 'page-sections') return 20
  return 15
}

const prioritizeNestedTargets = (collisions: Collision[]): Collision[] => {
  if (!collisions.length) return collisions

  return [...collisions].sort((a, b) => {
    const aId = String(a.id)
    const bId = String(b.id)
    const pDiff = getDropPriority(aId) - getDropPriority(bId)
    if (pDiff !== 0) return pDiff

    const aValue = typeof a.data?.value === 'number' ? a.data.value : 0
    const bValue = typeof b.data?.value === 'number' ? b.data.value : 0
    return bValue - aValue
  })
}

const smoothCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) {
    return prioritizeNestedTargets(pointerCollisions)
  }

  const rectCollisions = rectIntersection(args)
  if (rectCollisions.length > 0) {
    return prioritizeNestedTargets(rectCollisions)
  }

  return prioritizeNestedTargets(closestCenter(args))
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children, onDragEnd }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<LocalDragItem | null>(null)
  const [validDropZones, setValidDropZones] = useState<LocalDropZone[]>([])
  const [isDraggingOverNested, setIsDraggingOverNested] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    debugLog('🚀 Drag started:', event.active.id)
    setIsDragging(true)
    document.body.setAttribute('data-cm-dragging', 'true')

    const { active } = event
    const draggableId = active.id as string

    let type = 'component'
    let id: string = draggableId

    const parts = draggableId.split(':')
    if (parts[0] === 'component' && parts[1]) {
      type = 'component'
      id = parts[1]
    }

    const item: LocalDragItem = { type, id, data: active.data.current }
    setDraggedItem(item)

    const zones = calculateValidDropZones(item)
    setValidDropZones(zones)
    debugLog('🎯 Valid drop zones:', zones)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : ''
    const isNestedTarget =
      overId.startsWith('component:empty:grid:') ||
      overId.startsWith('swiper-') ||
      overId.startsWith('component:carousel-') ||
      overId.startsWith('flexbox-')

    setIsDraggingOverNested(isNestedTarget)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      debugLog('🎯 Drag ended:', { active: event.active.id, over: event.over?.id, draggedItem })

      setIsDragging(false)
      setIsDraggingOverNested(false)
      document.body.setAttribute('data-cm-dragging', 'false')
      setValidDropZones([])

      const { active, over } = event
      if (!over) {
        debugLog('❌ No drop target')
        setDraggedItem(null)
        return
      }

      let componentType = draggedItem?.type || 'component'
      if (componentType === 'component' && draggedItem?.id) {
        const idParts = draggedItem.id.split(':')
        componentType = idParts.length > 1 ? idParts[1] : draggedItem.id
      }

      debugLog('🔧 Using component type:', componentType)

      const result = {
        draggableId: active.id as string,
        type: componentType,
        source: {
          droppableId: active.data.current?.sortable?.containerId || 'component-library',
          index: active.data.current?.sortable?.index || 0,
        },
        destination: {
          droppableId: over.id as string,
          index: over.data.current?.sortable?.index || 0,
        },
      }

      debugLog('📦 Processing drop:', { result, draggedItem, destinationId: over.id })

      const finalDraggedItem = {
        type: componentType,
        id: draggedItem?.id || active.id as string,
        data: draggedItem?.data || active.data.current
      }

      onDragEnd(result, finalDraggedItem)
      setDraggedItem(null)
    },
    [onDragEnd, draggedItem],
  )

  const handleDragCancel = useCallback((_event: DragCancelEvent) => {
    setIsDragging(false)
    setIsDraggingOverNested(false)
    setDraggedItem(null)
    setValidDropZones([])
    document.body.setAttribute('data-cm-dragging', 'false')
  }, [])

  const clearValidDropZones = useCallback(() => {
    setValidDropZones([])
  }, [])

  const contextValue: DragDropContextType = {
    isDragging,
    draggedItem,
    validDropZones,
    isDraggingOverNested,
    setValidDropZones,
    clearValidDropZones,
  }

  return (
    <DragDropContextValue.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={smoothCollisionDetection}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </DragDropContextValue.Provider>
  )
}

// 🆕 FIXED: Enhanced calculateValidDropZones function
// 🆕 FIXED: Enhanced calculateValidDropZones function
function calculateValidDropZones(item: LocalDragItem): LocalDropZone[] {
  if (item.type !== 'component') return []

  debugLog('🔄 Calculating valid drop zones for:', item.type, item.id)
  
  // 🆕 FIX: Get ALL drop zones from DOM in REAL-TIME
  const allDropZones: LocalDropZone[] = []
  
  // 1. Get swiper slide drop zones
  const swiperSlideDropZones = Array.from(document.querySelectorAll('[data-swiper-id][data-ready-for-drop="true"]'))
    .flatMap(swiperElement => {
      const swiperId = swiperElement.getAttribute('data-swiper-id')
      const sectionId = swiperElement.getAttribute('data-section-id')
      
      if (!swiperId) return []
      
      // Get all slides in this swiper
      const slideElements = swiperElement.querySelectorAll('[data-slide-index]')
      
      return Array.from(slideElements).map(slideElement => {
        const slideIndex = slideElement.getAttribute('data-slide-index')
        const dropZoneId = `swiper-${swiperId}-slide-${slideIndex}`
        
        return {
          type: 'swiper-slide',
          id: dropZoneId,
          accepts: ['component'],
          index: 0,
          priority: 1,
          swiperId: swiperId,
          sectionId: sectionId || '',
          slideIndex: parseInt(slideIndex || '0', 10),
        }
      })
    })
    .filter(Boolean) as LocalDropZone[]

  debugLog('🎯 Real-time swiper slide drop zones:', swiperSlideDropZones.length)
  
  // 🆕 FIX: Get carousel drop zones from DOM in REAL-TIME
  const carouselDropZones = Array.from(document.querySelectorAll('[data-carousel-id][data-ready-for-drop="true"]'))
    .map(element => {
      const dropZoneId = element.getAttribute('data-drop-zone-id')
      const carouselId = element.getAttribute('data-carousel-id')
      
      if (dropZoneId && carouselId) {
        return {
          type: 'carousel',
          id: dropZoneId,
          accepts: ['component'],
          index: 0,
          priority: 2,
          carouselId: carouselId
        }
      }
      return null
    })
    .filter(Boolean) as LocalDropZone[]

  debugLog('🎯 Real-time carousel drop zones:', carouselDropZones.length)

  // 🆕 FIX: Get grid cell drop zones from DOM
  const gridCellDropZones = Array.from(document.querySelectorAll('[data-grid-container="true"]'))
    .flatMap(gridElement => {
      const gridId = gridElement.getAttribute('data-grid-id')
      const carouselId = gridElement.getAttribute('data-carousel-id')
      const slideIndex = gridElement.getAttribute('data-slide-index')
      
      if (!gridId) return []
      
      // Create drop zones for each potential grid cell
      const zones: LocalDropZone[] = []
      const rows = 2 // Default rows
      const cols = 3 // Default columns
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const dropZoneId = carouselId 
            ? `component:empty:grid:${gridId}:${row}:${col}:carousel-${carouselId}:slide-${slideIndex || 0}`
            : `component:empty:grid:${gridId}:${row}:${col}`
            
          zones.push({
            type: 'grid-cell',
            id: dropZoneId,
            accepts: ['component'],
            index: 1,
            priority: 3,
          })
        }
      }
      
      return zones
    })

  debugLog('🎯 Grid cell drop zones:', gridCellDropZones.length)

  const otherDropZones: LocalDropZone[] = [
    { type: 'column', id: 'column-content', accepts: ['component'], index: 4, priority: 5 },
    { type: 'section', id: 'page-sections', accepts: ['component', 'template'], index: 5, priority: 6 },
    { type: 'container', id: 'section-container', accepts: ['component'], index: 6, priority: 7 },
    { type: 'component', id: 'component', accepts: ['component'], index: 7, priority: 8 },
  ]

  // 🆕 Combine and sort by priority
  const allZones = [
    ...swiperSlideDropZones,
    ...carouselDropZones, 
    ...gridCellDropZones, 
    ...otherDropZones
  ]
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))

  debugLog('🎯 Final valid drop zones:', allZones.length)
  debugLog('📋 Zones breakdown:', {
    swiperSlides: swiperSlideDropZones.length,
    carousel: carouselDropZones.length,
    gridCells: gridCellDropZones.length,
    column: 1,
    section: 1,
    container: 1,
    component: 1
  })
  
  return allZones
}
