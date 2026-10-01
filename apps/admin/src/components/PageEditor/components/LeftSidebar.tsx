'use client'

import React, { useEffect, useState } from 'react'
import { ComponentLibrary } from '../ComponentLibrary'
import { StructureTree } from './StructureTree'
import { GlobalStylePanel } from './GlobalStylePanel'
import { Section, LayoutComponent, ComponentDefinition } from '@/types/page-editor'
import { GlobalTheme } from '@uadmin/shared/theme'

interface LeftSidebarProps {
  layout?: { sections?: Section[]; theme?: GlobalTheme; presets?: Record<string, any> }
  selectedSectionId?: string
  selectedComponentId?: string
  selectedComponent?: LayoutComponent | null
  onSectionSelect: (sectionId: string) => void
  onComponentSelect: (component: LayoutComponent, context: { sectionId: string; containerId: string; rowId: string; colId: string }) => void
  onComponentAdd: (componentDef: ComponentDefinition) => void
  onThemeChange?: (updatedTheme: GlobalTheme) => void
  onSavePreset?: (presetName: string, component: LayoutComponent) => void
  onApplyPreset?: (presetKey: string) => void
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  layout,
  selectedSectionId,
  selectedComponentId,
  selectedComponent,
  onSectionSelect,
  onComponentSelect,
  onComponentAdd,
  onThemeChange,
  onSavePreset,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'structure' | 'theme'>('library')

  // Allow user to freely switch between Components, Structure, and Theme tabs without forced switching

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
        <button
          onClick={() => setActiveTab('theme')}
          className={`panel-tab lptab ${activeTab === 'theme' ? 'active' : ''}`}
          type="button"
        >
          Theme
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

      <div id="tab-theme" className={`left-tab-panel ${activeTab === 'theme' ? 'active' : 'hidden'} flex-1 overflow-hidden`}>
        {activeTab === 'theme' && onThemeChange && (
          <GlobalStylePanel
            theme={layout?.theme}
            onThemeChange={onThemeChange}
            selectedComponent={selectedComponent}
            savedPresets={layout?.presets}
            onSavePreset={onSavePreset}
            onApplyPreset={onApplyPreset}
          />
        )}
      </div>
    </div>
  )
}
