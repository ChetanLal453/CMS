'use client'

import React, { useEffect, useState } from 'react'
import { ComponentLibrary } from '../ComponentLibrary'
import { StructureTree } from './StructureTree'
import { Section, LayoutComponent, ComponentDefinition } from '@/types/page-editor'

interface LeftSidebarProps {
  layout?: { sections?: Section[] }
  selectedSectionId?: string
  selectedComponentId?: string
  onSectionSelect: (sectionId: string) => void
  onComponentSelect: (component: LayoutComponent, context: { sectionId: string; containerId: string; rowId: string; colId: string }) => void
  onComponentAdd: (componentDef: ComponentDefinition) => void
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  layout,
  selectedSectionId,
  selectedComponentId,
  onSectionSelect,
  onComponentSelect,
  onComponentAdd
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'structure'>('library')

  useEffect(() => {
    if (selectedSectionId || selectedComponentId) {
      setActiveTab('structure')
    }
  }, [selectedComponentId, selectedSectionId])

  return (
    <div className="left-panel h-full flex flex-col">
      <div className="panel-tabs lp-tabs">
        <button
          onClick={() => setActiveTab('library')}
          className={`panel-tab lptab ${activeTab === 'library' ? 'active' : ''}`}
          type="button"
        >
          Components
        </button>
        <button
          onClick={() => setActiveTab('structure')}
          className={`panel-tab lptab ${activeTab === 'structure' ? 'active' : ''}`}
          type="button"
        >
          Structure
        </button>
      </div>

      <div id="tab-components" className={`left-tab-panel ${activeTab === 'library' ? 'active' : 'hidden'}`}>
        {activeTab === 'library' && (
          <ComponentLibrary onComponentSelect={onComponentAdd} />
        )}
      </div>

      <div id="tab-structure" className={`left-tab-panel ${activeTab === 'structure' ? 'active' : 'hidden'}`}>
        {activeTab === 'structure' && (
          <StructureTree
            layout={layout}
            selectedSectionId={selectedSectionId}
            selectedComponentId={selectedComponentId}
            onSectionSelect={onSectionSelect}
            onComponentSelect={onComponentSelect}
          />
        )}
      </div>
    </div>
  )
}
