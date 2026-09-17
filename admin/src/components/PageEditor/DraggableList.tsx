'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ListItem {
  id: string
  content: string
}

interface DraggableListProps {
  onDragEnd: (result: any) => void
}

// Sortable Item Component
const SortableItem: React.FC<{ item: ListItem; onRemove: (id: string) => void }> = ({ item, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex items-center p-3 mb-2 bg-gray-50 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div
        {...listeners}
        className="cursor-move mr-3 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4h14a1 1 0 010 2H3a1 1 0 010-2zM3 8h14a1 1 0 010 2H3a1 1 0 010-2zM3 12h14a1 1 0 010 2H3a1 1 0 010-2z"/>
        </svg>
      </div>
      <span className="flex-1">{item.content}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="ml-2 text-red-500 hover:text-red-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

const DraggableList: React.FC<DraggableListProps> = ({ onDragEnd }) => {
  const [items, setItems] = useState<ListItem[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' }
  ])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const addItem = () => {
    const newId = Date.now().toString()
    const newContent = `Item ${items.length + 1}`
    setItems([...items, { id: newId, content: newContent }])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const reorderedItems = arrayMove(items, oldIndex, newIndex)
        
        // Convert to @hello-pangea/dnd format for compatibility
        const result = {
          draggableId: active.id as string,
          source: { index: oldIndex, droppableId: 'list' },
          destination: { index: newIndex, droppableId: 'list' },
        }
        
        onDragEnd(result)
        
        return reorderedItems
      })
    }
  }

  return (
    <div className="flex flex-col">
      <div className="h-64 border border-gray-300 rounded-lg bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto p-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {items.map((item) => (
                <SortableItem key={item.id} item={item} onRemove={removeItem} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <div className="mt-2">
        <button
          onClick={addItem}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
      </div>
    </div>
  )
}

export default DraggableList