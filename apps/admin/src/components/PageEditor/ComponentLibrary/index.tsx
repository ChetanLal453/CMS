'use client'

import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { componentRegistry } from '@/lib/componentRegistry'
import { ComponentDefinition } from '@/types/page-editor'
import { ComponentCategories } from './ComponentCategories'

interface ComponentLibraryProps {
  onComponentSelect?: (component: ComponentDefinition) => void
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onComponentSelect }) => {
  const [query, setQuery] = useState('')
  const categories = componentRegistry.getCategories()

  const { setNodeRef } = useDroppable({
    id: 'component-library',
    data: {
      type: 'component-library',
    },
  })

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="panel-search lp-srch">
        <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search components..." />
      </div>

      <div className="panel-scroll lp-body flex-1 overflow-y-auto">
        <div ref={setNodeRef} className="h-full">
          <ComponentCategories categories={categories} query={query} onComponentSelect={onComponentSelect} />
        </div>
      </div>
    </div>
  )
}
