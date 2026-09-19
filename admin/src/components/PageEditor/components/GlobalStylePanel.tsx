'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  GlobalTheme,
  THEME_PRESETS,
  FONT_OPTIONS,
  RADIUS_PRESETS,
  getDefaultTheme,
  applyThemePreset,
} from '../../../../../shared/theme'
import { LayoutComponent } from '@/types/page-editor'
import { Palette, Type, Sparkles, Code2, BookmarkPlus, Check, ArrowRight, RotateCcw } from 'lucide-react'

interface GlobalStylePanelProps {
  theme?: GlobalTheme
  onThemeChange: (updatedTheme: GlobalTheme) => void
  selectedComponent?: LayoutComponent | null
  savedPresets?: Record<string, any>
  onSavePreset?: (presetName: string, component: LayoutComponent) => void
  onApplyPreset?: (presetKey: string) => void
}

export const GlobalStylePanel: React.FC<GlobalStylePanelProps> = ({
  theme,
  onThemeChange,
  selectedComponent,
  savedPresets = {},
  onSavePreset,
  onApplyPreset,
}) => {
  const activeTheme = useMemo(() => theme || getDefaultTheme(), [theme])
  const [activeTab, setActiveTab] = useState<'presets' | 'customize' | 'advanced'>('presets')
  const [newPresetName, setNewPresetName] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleColorChange = useCallback(
    (colorKey: keyof GlobalTheme['colors'], value: string) => {
      onThemeChange({
        ...activeTheme,
        preset: 'custom',
        colors: {
          ...activeTheme.colors,
          [colorKey]: value,
        },
      })
    },
    [activeTheme, onThemeChange],
  )

  const handleTypographyChange = useCallback(
    (key: keyof GlobalTheme['typography'], value: string) => {
      onThemeChange({
        ...activeTheme,
        typography: {
          ...activeTheme.typography,
          [key]: value,
        },
      })
    },
    [activeTheme, onThemeChange],
  )

  const handleRadiusChange = useCallback(
    (radius: number) => {
      onThemeChange({
        ...activeTheme,
        styles: {
          ...activeTheme.styles,
          borderRadius: radius,
        },
      })
    },
    [activeTheme, onThemeChange],
  )

  const handleCustomCssChange = useCallback(
    (css: string) => {
      onThemeChange({
        ...activeTheme,
        customCSS: css,
      })
    },
    [activeTheme, onThemeChange],
  )

  const handleResetToDefault = () => {
    onThemeChange(getDefaultTheme())
  }

  const handleSavePresetClick = () => {
    if (!selectedComponent || !newPresetName.trim() || !onSavePreset) return
    onSavePreset(newPresetName.trim(), selectedComponent)
    setNewPresetName('')
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const presetEntries = useMemo(() => Object.entries(savedPresets || {}), [savedPresets])

  return (
    <div className="global-style-panel flex flex-col h-full bg-[#13161e] text-[#e8eaf0] select-none text-[12px]">
      {/* Top 3-Segment Navigation */}
      <div className="flex border-b border-white/[0.08] bg-[#0d0f14] p-1.5 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-[#7c6dfa] text-white shadow-sm'
              : 'text-[#8b90a8] hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Curated Themes">
          <Sparkles size={12} />
          <span>Themes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customize')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
            activeTab === 'customize'
              ? 'bg-[#7c6dfa] text-white shadow-sm'
              : 'text-[#8b90a8] hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Colors & Typography">
          <Palette size={12} />
          <span>Customize</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
            activeTab === 'advanced'
              ? 'bg-[#7c6dfa] text-white shadow-sm'
              : 'text-[#8b90a8] hover:text-white hover:bg-white/[0.04]'
          }`}
          title="Component Presets & Custom CSS">
          <Code2 size={12} />
          <span>Advanced</span>
        </button>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ====================================================================
            TAB 1: CURATED THEME PRESETS (2-Column Grid)
            ==================================================================== */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] font-semibold text-white">Preset Themes</div>
                <div className="text-[10px] text-[#8b90a8]">1-click instant site-wide restyle</div>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[10px] text-[#8b90a8] hover:text-[#a594ff] flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/[0.05] transition cursor-pointer"
                title="Reset to Dark Slate default">
                <RotateCcw size={10} />
                <span>Reset</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEME_PRESETS).map((preset) => {
                const isActive = activeTheme.preset === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onThemeChange(applyThemePreset(activeTheme, preset.id))}
                    className={`relative text-left p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'border-[#7c6dfa] bg-[#7c6dfa]/15 ring-1 ring-[#7c6dfa]'
                        : 'border-white/[0.08] bg-[#1a1d28] hover:border-white/[0.22] hover:bg-[#202534]'
                    }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-white truncate max-w-[85px]" title={preset.name}>
                          {preset.name.replace(/\s*\(Default\)/, '')}
                        </span>
                        <span
                          className={`text-[8px] px-1 py-0.2 rounded uppercase font-mono font-medium ${
                            preset.isDark ? 'bg-white/[0.08] text-slate-300' : 'bg-amber-400/20 text-amber-300'
                          }`}>
                          {preset.isDark ? 'Dark' : 'Light'}
                        </span>
                      </div>

                      {/* Circular Color Palette Swatches */}
                      <div className="flex items-center gap-1 my-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: preset.theme.colors.primary }}
                          title={`Primary: ${preset.theme.colors.primary}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: preset.theme.colors.accent }}
                          title={`Accent: ${preset.theme.colors.accent}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: preset.theme.colors.surface }}
                          title={`Surface: ${preset.theme.colors.surface}`}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs flex-shrink-0"
                          style={{ backgroundColor: preset.theme.colors.background }}
                          title={`Background: ${preset.theme.colors.background}`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.06]">
                      <span className="text-[9px] text-[#8b90a8] truncate max-w-[80px]">
                        {preset.theme.typography.fontFamily.split(',')[0].replace(/['"]/g, '')}
                      </span>
                      {isActive && (
                        <span className="text-[9px] text-[#7c6dfa] font-bold flex items-center gap-0.5">
                          <Check size={10} /> Active
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: CUSTOMIZE (Colors, Typography & Radius)
            ==================================================================== */}
        {activeTab === 'customize' && (
          <div className="space-y-4">
            {/* Color Palette Tokens */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-white">Color Tokens</div>
              <div className="space-y-1.5">
                {(
                  [
                    { key: 'primary', label: 'Primary Brand', desc: 'Main buttons and accents' },
                    { key: 'secondary', label: 'Secondary Brand', desc: 'Badges and secondary buttons' },
                    { key: 'accent', label: 'Accent Color', desc: 'Highlights and active outlines' },
                    { key: 'background', label: 'Page Background', desc: 'Canvas backdrop tone' },
                    { key: 'surface', label: 'Section Surface', desc: 'Default container background' },
                    { key: 'text', label: 'Main Text', desc: 'Headings and high-contrast text' },
                    { key: 'textMuted', label: 'Muted Text', desc: 'Subheadings and captions' },
                    { key: 'border', label: 'Border Color', desc: 'Section outlines and dividers' },
                  ] as const
                ).map(({ key, label, desc }) => {
                  const currentColor = activeTheme.colors[key]
                  return (
                    <div
                      key={key}
                      className="p-2 rounded-md border border-white/[0.06] bg-[#1a1d28]/80 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-[11px] font-medium text-white truncate">{label}</div>
                        <div className="text-[9px] text-[#8b90a8] truncate">{desc}</div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="relative w-6 h-6 rounded-md overflow-hidden border border-white/20 shadow-xs cursor-pointer">
                          <input
                            type="color"
                            value={currentColor.startsWith('#') ? currentColor : '#7c6dfa'}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <div
                            className="w-full h-full pointer-events-none"
                            style={{ backgroundColor: currentColor }}
                          />
                        </div>
                        <input
                          type="text"
                          value={currentColor}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-20 px-1.5 py-1 bg-[#0d0f14] border border-white/[0.1] rounded text-[10px] font-mono text-[#e8eaf0] text-center"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Typography */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2.5">
              <div className="text-[11px] font-semibold text-white">Typography Scale</div>

              <div>
                <label className="text-[10px] text-[#8b90a8] block mb-1">Global Font Family</label>
                <select
                  value={activeTheme.typography.fontFamily}
                  onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#1a1d28] border border-white/[0.1] rounded text-[11px] text-white focus:outline-none focus:border-[#7c6dfa]">
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8b90a8] block mb-1">Heading Font Family</label>
                <select
                  value={activeTheme.typography.headingFontFamily || activeTheme.typography.fontFamily}
                  onChange={(e) => handleTypographyChange('headingFontFamily', e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#1a1d28] border border-white/[0.1] rounded text-[11px] text-white focus:outline-none focus:border-[#7c6dfa]">
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-[#8b90a8] block mb-0.5">H1 Size</label>
                  <input
                    type="text"
                    value={activeTheme.typography.h1Size}
                    onChange={(e) => handleTypographyChange('h1Size', e.target.value)}
                    className="w-full px-2 py-1 bg-[#1a1d28] border border-white/[0.1] rounded text-[10px] text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#8b90a8] block mb-0.5">H2 Size</label>
                  <input
                    type="text"
                    value={activeTheme.typography.h2Size}
                    onChange={(e) => handleTypographyChange('h2Size', e.target.value)}
                    className="w-full px-2 py-1 bg-[#1a1d28] border border-white/[0.1] rounded text-[10px] text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Corner Radius */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div className="text-[11px] font-semibold text-white">Corner Radius</div>
              <div className="grid grid-cols-3 gap-1">
                {RADIUS_PRESETS.map((preset) => {
                  const isSelected = activeTheme.styles.borderRadius === preset.value
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleRadiusChange(preset.value)}
                      className={`px-2 py-1.5 rounded text-[10px] font-medium border transition cursor-pointer text-center ${
                        isSelected
                          ? 'border-[#7c6dfa] bg-[#7c6dfa]/20 text-white font-bold'
                          : 'border-white/[0.08] bg-[#1a1d28] text-[#8b90a8] hover:text-white hover:bg-white/[0.05]'
                      }`}>
                      {preset.label.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 3: ADVANCED (Block Style Presets & Global CSS)
            ==================================================================== */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            {/* Block Style Presets */}
            <div className="space-y-2.5">
              <div>
                <div className="text-[11px] font-semibold text-white">Component Presets</div>
                <div className="text-[10px] text-[#8b90a8]">Save styled components for 1-click reuse</div>
              </div>

              {selectedComponent ? (
                <div className="p-2.5 rounded-lg border border-[#7c6dfa]/40 bg-[#7c6dfa]/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">Selected Block:</span>
                    <span className="text-[#a594ff] uppercase tracking-wider font-mono text-[9px]">
                      {selectedComponent.type}
                    </span>
                  </div>

                  <div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Preset Name (e.g. Hero Card)"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        className="flex-1 px-2 py-1 bg-[#0d0f14] border border-white/[0.1] rounded text-[10px] text-white"
                      />
                      <button
                        type="button"
                        onClick={handleSavePresetClick}
                        disabled={!newPresetName.trim()}
                        className="px-2.5 py-1 rounded bg-[#7c6dfa] hover:bg-[#6c5ce7] text-white text-[10px] font-medium disabled:opacity-40 transition flex items-center gap-1 cursor-pointer">
                        {saveSuccess ? <Check size={11} /> : <BookmarkPlus size={11} />}
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-white/[0.1] bg-[#1a1d28]/40 text-center">
                  <div className="text-[10px] text-[#8b90a8]">
                    Click any component on canvas to save its styles as a reusable preset.
                  </div>
                </div>
              )}

              {/* Saved Presets list */}
              {presetEntries.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-semibold text-white">Saved Library ({presetEntries.length})</div>
                  {presetEntries.map(([key, presetData]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2 rounded border border-white/[0.08] bg-[#1a1d28]">
                      <div>
                        <div className="text-[10px] font-medium text-white">{presetData.name || key}</div>
                        <div className="text-[8px] text-[#8b90a8] uppercase font-mono">{presetData.componentType}</div>
                      </div>
                      {selectedComponent && onApplyPreset && (
                        <button
                          type="button"
                          onClick={() => onApplyPreset(key)}
                          className="px-2 py-0.5 rounded bg-white/[0.08] hover:bg-[#7c6dfa] text-white text-[9px] font-medium transition flex items-center gap-1 cursor-pointer">
                          <span>Apply</span>
                          <ArrowRight size={9} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Global CSS */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <div>
                <div className="text-[11px] font-semibold text-white">Page-Wide Custom CSS</div>
                <div className="text-[10px] text-[#8b90a8]">Injected directly into canvas styles</div>
              </div>

              <textarea
                rows={8}
                value={activeTheme.customCSS || ''}
                onChange={(e) => handleCustomCssChange(e.target.value)}
                placeholder="/* Custom CSS */&#10;.my-hero {&#10;  border-radius: var(--theme-radius);&#10;}"
                className="w-full p-2 bg-[#0d0f14] border border-white/[0.1] rounded text-[10px] font-mono text-[#a594ff] focus:outline-none focus:border-[#7c6dfa]"
              />
              <div className="text-[9px] text-[#8b90a8]">
                Tokens available: <code className="text-[#a594ff]">var(--theme-primary)</code>,{' '}
                <code className="text-[#a594ff]">var(--theme-surface)</code>,{' '}
                <code className="text-[#a594ff]">var(--theme-radius)</code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
