'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { componentRegistry } from '@/lib/componentRegistry'
import { ComponentDefinition } from '@/types/page-editor'
import { ComponentCard } from './ComponentCard'
import { blockDefinitions, type BlockLibraryGroup } from '@uadmin/shared/blocks/registry'

interface ComponentCategoriesProps {
  categories: string[]
  onComponentSelect?: (component: ComponentDefinition) => void
  query?: string
}

type PreviewLibraryItem = {
  componentId: string
  label: string
  glyphKey: string
}

const groupLabelMap: Record<BlockLibraryGroup, string> = {
  layout: 'Layout',
  content: 'Content',
  interactive: 'Interactive',
  advanced: 'Advanced',
}

export const ComponentCategories: React.FC<ComponentCategoriesProps> = ({ categories: _categories, onComponentSelect, query = '' }) => {
  const normalizedQuery = query.trim().toLowerCase()
  const previewGroups: Array<{ label: string; items: PreviewLibraryItem[] }> = Object.entries(groupLabelMap).map(([group, label]) => ({
    label,
    items: blockDefinitions
      .filter((definition) => definition.libraryGroup === group)
      .map((definition) => ({
        componentId: definition.admin.componentId,
        label: definition.label,
        glyphKey: definition.admin.glyphKey,
      })),
  }))

  const categorized = previewGroups
    .map(({ label, items }) => {
      const resolvedItems = items
        .map((item) => {
          const component = componentRegistry.getComponent(item.componentId)
          if (!component) return null

          const haystack = [item.label, component.name, component.description, component.category, component.type, component.id].join(' ').toLowerCase()
          if (normalizedQuery && !haystack.includes(normalizedQuery)) {
            return null
          }

          return { ...item, component }
        })
        .filter((item): item is PreviewLibraryItem & { component: ComponentDefinition } => Boolean(item))

      return { label, items: resolvedItems }
    })
    .filter((group) => group.items.length > 0)

  return (
    <div className="flex flex-col">
      {categorized.map((group) => (
        <CategoryDroppable key={group.label} category={group.label.toLowerCase()} items={group.items} displayName={group.label} onComponentSelect={onComponentSelect} />
      ))}
    </div>
  )
}

function CategoryDroppable({
  category,
  items,
  displayName,
  onComponentSelect,
}: {
  category: string
  items: Array<PreviewLibraryItem & { component: ComponentDefinition }>
  displayName: string
  onComponentSelect?: (component: ComponentDefinition) => void
}) {
  const { setNodeRef } = useDroppable({
    id: `component-category:${category}`,
    data: {
      type: 'component-category',
      category,
    },
  })

  return (
    <div ref={setNodeRef}>
      <div className="comp-category cat">{displayName}</div>
      <div className="comp-grid cgrid">
        {items.map((item, index) => (
          <ComponentCard
            key={item.component.id}
            component={item.component}
            index={index}
            displayName={item.label}
            glyphKey={item.glyphKey}
            onClick={() => onComponentSelect?.(item.component)}
          />
        ))}
      </div>
    </div>
  )
}
