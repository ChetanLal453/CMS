'use client'

import React, { useState, useEffect } from 'react'
import { Section, Column } from '@/types/page-editor'
import { PropertyField } from '@/components/PageEditor/PropertyPanel/PropertyField'
import { getSectionSchema, sanitizeSectionProps } from '@/lib/sectionSchemas'

// Define local defaults
const sectionDefaultProps = {
  sticky_enabled: false,
  sticky_column_index: 0,
  sticky_position: 'top' as const,
  sticky_offset: 0,
  rowVerticalAlign: 'top' as const,
  containerType: 'boxed' as const,
  maxWidth: 1200,
  sideSpacing: 20
}

// Extend the Section interface locally
interface ExtendedSection extends Section {
  settings?: Section['settings'] & {
    sticky_enabled?: boolean;
    sticky_column_index?: number;
    sticky_position?: 'top' | 'center' | 'bottom';
    sticky_offset?: number;
    rowVerticalAlign?: 'top' | 'center' | 'bottom';
    containerType?: 'boxed' | 'full-width' | 'fluid';
    maxWidth?: number;
    sideSpacing?: number;
  }
}

interface SectionPropertiesProps {
  section: ExtendedSection
  onUpdate: (sectionId: string, updates: any) => void
}

export const SectionProperties: React.FC<SectionPropertiesProps> = ({ section, onUpdate }) => {
  // ✅ Get settings with defaults
  const settings = section.settings || {}
  const sectionSchema = getSectionSchema(section.type)
  const sectionProps = sanitizeSectionProps(section.type, section.props)
  const rows = Array.isArray(section.container?.rows) ? section.container.rows : []
  const primaryRow = rows[0] || null
  const columns = primaryRow?.columns || []
  
  const [sticky, setSticky] = useState({
    enabled: settings.sticky_enabled ?? sectionDefaultProps.sticky_enabled,
    columnIndex: settings.sticky_column_index ?? sectionDefaultProps.sticky_column_index,
    position: (settings.sticky_position ?? sectionDefaultProps.sticky_position) as 'top' | 'center' | 'bottom',
    offset: settings.sticky_offset ?? sectionDefaultProps.sticky_offset
  })
  
  const [containerSettings, setContainerSettings] = useState({
    type: settings.containerType ?? sectionDefaultProps.containerType,
    maxWidth: settings.maxWidth ?? sectionDefaultProps.maxWidth,
    sideSpacing: settings.sideSpacing ?? sectionDefaultProps.sideSpacing
  })

  useEffect(() => {
    setSticky({
      enabled: settings.sticky_enabled ?? sectionDefaultProps.sticky_enabled,
      columnIndex: settings.sticky_column_index ?? sectionDefaultProps.sticky_column_index,
      position: (settings.sticky_position ?? sectionDefaultProps.sticky_position) as 'top' | 'center' | 'bottom',
      offset: settings.sticky_offset ?? sectionDefaultProps.sticky_offset
    })
    setContainerSettings({
      type: settings.containerType ?? sectionDefaultProps.containerType,
      maxWidth: settings.maxWidth ?? sectionDefaultProps.maxWidth,
      sideSpacing: settings.sideSpacing ?? sectionDefaultProps.sideSpacing
    })
  }, [section.id, settings.containerType, settings.maxWidth, settings.sideSpacing, settings.sticky_column_index, settings.sticky_enabled, settings.sticky_offset, settings.sticky_position])

  // ✅ Update section width settings
  const updateContainerSettings = (updates: any) => {
    const newSettings = { ...containerSettings, ...updates }
    setContainerSettings(newSettings)
    
    onUpdate(section.id, {
      settings: {
        ...settings,
        containerType: newSettings.type,
        maxWidth: newSettings.maxWidth,
        sideSpacing: newSettings.sideSpacing
      }
    })
  }

  // ✅ Update column width
  const updateColumnWidth = (colIndex: number, width: number) => {
    if (!columns.length) return

    const updatedRows = rows.map((row) => {
      const rowColumns = Array.isArray(row.columns) ? row.columns.map((col) => ({ ...col })) : []
      if (!rowColumns.length || colIndex < 0 || colIndex >= rowColumns.length) {
        return row
      }

      if (rowColumns.length === 1) {
        rowColumns[0].width = 100
        return { ...row, columns: rowColumns }
      }

      rowColumns[colIndex].width = width

      const remainingColumns = rowColumns.filter((_, idx) => idx !== colIndex)
      const remainingWidth = Math.max(0, 100 - width)
      const perColumnWidth = Math.round(remainingWidth / remainingColumns.length)

      rowColumns.forEach((col, idx) => {
        if (idx !== colIndex) {
          col.width = perColumnWidth
        }
      })

      const total = rowColumns.reduce((sum, col) => sum + (Number(col.width) || 0), 0)
      if (total !== 100) {
        const diff = 100 - total
        let targetIndex = colIndex
        for (let idx = rowColumns.length - 1; idx >= 0; idx -= 1) {
          if (idx !== colIndex) {
            targetIndex = idx
            break
          }
        }
        rowColumns[targetIndex].width = Math.max(10, (Number(rowColumns[targetIndex].width) || 0) + diff)
      }

      return { ...row, columns: rowColumns }
    })

    onUpdate(section.id, {
      container: {
        ...section.container,
        rows: updatedRows
      }
    })
  }
  
  // ✅ Update sticky settings
  const updateSticky = (updates: any) => {
    const newSticky = { ...sticky, ...updates }
    setSticky(newSticky)
    
    onUpdate(section.id, {
      settings: {
        ...settings,
        sticky_enabled: newSticky.enabled,
        sticky_column_index: newSticky.columnIndex,
        sticky_position: newSticky.position,
        sticky_offset: newSticky.offset
      }
    })
  }

  // ✅ Update general settings
  const updateSetting = (key: string, value: any) => {
    onUpdate(section.id, {
      settings: {
        ...settings,
        [key]: value
      }
    })
  }

  if (columns.length === 0) {
    return (
      <div className="rp-empty">
        <div className="rp-empty-icon">+</div>
        <div className="font-medium text-slate-900">No columns found in this section</div>
        <div className="text-xs text-slate-500 mt-1">Use the structure controls to add a column layout first.</div>
      </div>
    )
  }

  return (
    <div className="rp-form space-y-4">
      {sectionSchema ? (
        <div className="rp-card rp-card-stack">
          <div className="rp-section-title">
            <div className="rp-section-title-main">Dynamic section content</div>
            <div className="rp-section-title-sub">Schema-driven fields for the currently selected section type.</div>
          </div>
          <div className="space-y-3">
            {sectionSchema.fields.map((field: any) => (
              <PropertyField
                key={field.name}
                propName={field.name}
                config={field}
                value={sectionProps[field.name]}
                onChange={(value) =>
                  onUpdate(section.id, {
                    props: {
                      ...sectionProps,
                      [field.name]: value,
                    },
                  })
                }
              />
            ))}
          </div>
        </div>
      ) : null}
      
      <div className="rp-card rp-card-stack">
        <div className="rp-section-title">
          <div className="rp-section-title-main">Section width</div>
          <div className="rp-section-title-sub">Control how the section spans the page frame.</div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <span>Current mode</span>
          <span className="rounded-full bg-violet-500/15 px-2 py-1 font-medium text-violet-200">
            {containerSettings.type === 'boxed' ? 'Boxed container' : containerSettings.type === 'fluid' ? 'Fluid container' : 'Full width'}
          </span>
        </div>
        
        {/* Container Type */}
        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">Container Type</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateContainerSettings({ type: 'boxed' })}
              className={`p-3 rounded-2xl border text-sm transition ${
                containerSettings.type === 'boxed'
                  ? 'border-violet-400/50 bg-violet-500/10 text-violet-100 shadow-[0_0_0_1px_rgba(124,92,252,0.15)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
              }`}>
              Boxed
            </button>
            <button
              onClick={() => updateContainerSettings({ type: 'fluid' })}
              className={`p-3 rounded-2xl border text-sm transition ${
                containerSettings.type === 'fluid'
                  ? 'border-violet-400/50 bg-violet-500/10 text-violet-100 shadow-[0_0_0_1px_rgba(124,92,252,0.15)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
              }`}>
              Fluid
            </button>
            <button
              onClick={() => updateContainerSettings({ type: 'full-width' })}
              className={`p-3 rounded-2xl border text-sm transition ${
                containerSettings.type === 'full-width'
                  ? 'border-violet-400/50 bg-violet-500/10 text-violet-100 shadow-[0_0_0_1px_rgba(124,92,252,0.15)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
              }`}>
              Full Width
            </button>
          </div>
          
          <div className="text-xs text-slate-400 mt-2">
            {containerSettings.type === 'boxed' && '✅ Content with side space (recommended)'}
            {containerSettings.type === 'fluid' && '📱 Content adjusts automatically with screen'}
            {containerSettings.type === 'full-width' && '🌊 Full browser width without side space'}
          </div>
        </div>
        
        {/* Max Width Control (only for boxed type) */}
        {containerSettings.type === 'boxed' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Max Width: {containerSettings.maxWidth}px
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="800"
                  max="1600"
                  step="50"
                  value={containerSettings.maxWidth}
                  onChange={(e) => updateContainerSettings({ maxWidth: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={containerSettings.maxWidth}
                  onChange={(e) => updateContainerSettings({ maxWidth: parseInt(e.target.value) || 1200 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                  min="800"
                  max="1600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Side Space: {containerSettings.sideSpacing}px
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={containerSettings.sideSpacing}
                  onChange={(e) => updateContainerSettings({ sideSpacing: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  value={containerSettings.sideSpacing}
                  onChange={(e) => updateContainerSettings({ sideSpacing: parseInt(e.target.value) || 20 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                  min="0"
                  max="100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Space on left and right sides when screen is wider than max width
              </p>
            </div>
          </div>
        )}
        
        {/* Fluid container info */}
        {containerSettings.type === 'fluid' && (
          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Fluid Container:</span> Content will adjust width automatically based on screen size with responsive side spacing.
            </p>
          </div>
        )}
        
        {/* Full-width container info */}
        {containerSettings.type === 'full-width' && (
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Full Width Container:</span> Content will span the entire browser width without side spacing.
            </p>
          </div>
        )}
      </div>
      
      {/* COLUMN LAYOUT CONTROLS */}
      <div className="rp-card rp-card-stack">
        <div className="rp-section-title">
          <div className="rp-section-title-main">Column layout</div>
          <div className="rp-section-title-sub">{`Adjust widths for ${columns.length} columns.`}</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-2">Vertical Align Columns</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'top', label: 'Top' },
              { value: 'center', label: 'Center' },
              { value: 'bottom', label: 'Bottom' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateSetting('rowVerticalAlign', option.value)}
                className={`p-3 rounded-2xl border text-sm transition ${
                  (settings.rowVerticalAlign ?? sectionDefaultProps.rowVerticalAlign) === option.value
                    ? 'border-violet-400/50 bg-violet-500/10 text-violet-100'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                }`}>
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Use <strong>Center</strong> when one column has text and the other has a taller image.
          </p>
        </div>
        
        <div className="space-y-4">
          {columns.map((col: Column, index: number) => {
            const columnWidth = col.width || Math.round(100 / columns.length)
            
            return (
              <div key={col.id} className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    Column {index + 1}
                    {sticky.enabled && sticky.columnIndex === index ? ' · Sticky' : ''}
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-300">
                    {columnWidth}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={columnWidth}
                  onChange={(e) => updateColumnWidth(index, parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )
          })}
        </div>
      </div>
      
      {/* STICKY SETTINGS */}
      <div className="rp-card rp-card-stack">
        <div className="rp-section-title">
          <div className="rp-section-title-main">Sticky column</div>
          <div className="rp-section-title-sub">Keep one column fixed while scrolling.</div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-200">Sticky enabled</h3>
            <p className="text-xs text-slate-400">Pin a specific column on long sections.</p>
          </div>
          
          <button
            onClick={() => updateSticky({ enabled: !sticky.enabled })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              sticky.enabled
                ? 'bg-violet-500/15 text-violet-100 hover:bg-violet-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}>
            {sticky.enabled ? 'Sticky ON' : 'Sticky OFF'}
          </button>
        </div>
        
        {sticky.enabled && (
          <div className="space-y-4">
            {/* Column Selection */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Sticky Column</label>
              <div className="grid grid-cols-2 gap-2">
                {columns.map((_: Column, index: number) => (
                  <button
                    key={index}
                    onClick={() => updateSticky({ columnIndex: index })}
                    className={`p-3 rounded-2xl border text-sm transition ${
                      sticky.columnIndex === index
                        ? 'border-violet-400/50 bg-violet-500/10 text-violet-100'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}>
                    Column {index + 1}
                    {index === 0 && " (Left)"}
                    {index === columns.length - 1 && " (Right)"}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Position & Offset */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Position</label>
                <select
                  value={sticky.position}
                  onChange={(e) => updateSticky({ position: e.target.value as 'top' | 'center' | 'bottom' })}
                  className="w-full px-3 py-2 border border-white/10 rounded-2xl text-sm bg-white/[0.03] text-slate-200">
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Offset: {sticky.offset}px from top
                </label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={sticky.offset}
                  onChange={(e) => updateSticky({ offset: parseInt(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* OTHER SECTION PROPERTIES */}
      <div className="border-t border-white/5 pt-4">
        <h3 className="text-sm font-medium text-slate-200 mb-3">Advanced Settings</h3>
        
        {/* Background Color */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-1">Background Color</label>
          <input
            type="color"
            value={settings.backgroundColor || '#ffffff'}
            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
            className="w-full h-10 border border-white/10 rounded-2xl cursor-pointer bg-white/[0.03]"
          />
        </div>
        
        {/* Padding */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-1">Padding (px)</label>
          <input
            type="number"
            value={typeof settings.padding === 'string' ? parseInt(settings.padding) || 20 : settings.padding || 20}
            onChange={(e) => updateSetting('padding', parseInt(e.target.value) || 20)}
            className="w-full px-3 py-2 border border-white/10 rounded-2xl text-sm bg-white/[0.03] text-slate-200"
            min="0"
            max="100"
          />
        </div>
        
        {/* Margin */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-1">Margin (px)</label>
          <input
            type="number"
            value={typeof settings.margin === 'string' ? parseInt(settings.margin) || 0 : settings.margin || 0}
            onChange={(e) => updateSetting('margin', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-white/10 rounded-2xl text-sm bg-white/[0.03] text-slate-200"
            min="0"
            max="50"
          />
        </div>
        
        {/* Border Radius */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-1">Border Radius (px)</label>
          <input
            type="number"
            value={typeof settings.borderRadius === 'string' ? parseInt(settings.borderRadius) || 0 : settings.borderRadius || 0}
            onChange={(e) => updateSetting('borderRadius', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-white/10 rounded-2xl text-sm bg-white/[0.03] text-slate-200"
            min="0"
            max="50"
          />
        </div>
        
        {/* Opacity */}
        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-1">
            Opacity: {((settings.opacity ?? 100) / 100).toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity ?? 100}
            onChange={(e) => updateSetting('opacity', parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* Visibility Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id={`visible-${section.id}`}
            checked={settings.visible !== false}
            onChange={(e) => updateSetting('visible', e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor={`visible-${section.id}`} className="text-sm text-slate-200">
            Visible on Page
          </label>
        </div>
      </div>
    </div>
  )
}
