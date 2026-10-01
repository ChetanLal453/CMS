'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createBlockViewModel, normalizeBlockProps } from '@uadmin/shared/blocks/registry'
import type { LayoutComponent } from '@/types/page-editor'
import { PencilLine, Plus, Trash2 } from 'lucide-react'

interface TabsAdminRendererProps {
  component?: LayoutComponent
  onUpdate?: (props: Record<string, any>) => void
}

const TabsAdminRenderer: React.FC<TabsAdminRendererProps & Record<string, any>> = ({ component, onUpdate, ...props }) => {
  const componentProps = component?.props || props || {}
  const viewModel = useMemo(() => createBlockViewModel('tabs', componentProps) as any, [componentProps])
  const [tabs, setTabs] = useState(() => (Array.isArray(viewModel.tabs) ? viewModel.tabs : []))
  const [activeTab, setActiveTab] = useState(Number(viewModel.activeIndex || 0))
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<'title' | 'content' | null>(null)

  useEffect(() => {
    setTabs(Array.isArray(viewModel.tabs) ? viewModel.tabs : [])
    setActiveTab(Number(viewModel.activeIndex || 0))
  }, [viewModel])

  const commit = (nextTabs: any[], nextActiveTab = activeTab) => {
    setTabs(nextTabs)
    onUpdate?.(normalizeBlockProps('tabs', { ...componentProps, tabs: nextTabs, activeTab: nextActiveTab }))
  }

  const addTab = () => {
    const nextProps = normalizeBlockProps('tabs', { ...componentProps, tabs: [...tabs, {}], activeTab })
    const nextTabs = Array.isArray(nextProps.tabs) ? nextProps.tabs : []
    const nextActiveTab = Math.max(0, Math.min(activeTab, Math.max(nextTabs.length - 1, 0)))
    setTabs(nextTabs)
    onUpdate?.(nextProps)
    setActiveTab(nextActiveTab)
    setEditingIndex(nextTabs.length - 1)
    setEditingField('title')
  }

  const removeTab = (index: number) => {
    const nextTabs = tabs.filter((_: any, currentIndex: number) => currentIndex !== index)
    const nextActiveTab = Math.max(0, Math.min(activeTab, Math.max(nextTabs.length - 1, 0)))
    commit(nextTabs, nextActiveTab)
    setActiveTab(nextActiveTab)
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditingField(null)
    }
  }

  const updateTab = (index: number, field: 'title' | 'content', value: string) => {
    const nextTabs = [...tabs]
    nextTabs[index] = { ...nextTabs[index], [field]: value }
    commit(nextTabs)
  }

  const currentViewModel = createBlockViewModel('tabs', { ...componentProps, tabs, activeTab }) as any
  const activeContent = tabs[activeTab]?.content ?? ''

  return (
    <div className="overflow-hidden rounded-[10px] border-[0.5px] border-[#2e3450] bg-[#1e2235]">
      <div className="flex items-center justify-between gap-3 border-b-[0.5px] border-[#2e3450] px-[14px] py-[10px]">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#a89cf5]">Interactive</div>
          <div className="mt-1 text-[12px] font-medium text-[#c8cce6]">Tabs</div>
        </div>
        <button
          type="button"
          onClick={addTab}
          className="inline-flex items-center gap-1 rounded-md border-[0.5px] border-[#3d3870] bg-[#252a40] px-[10px] py-[5px] text-[10px] font-medium text-[#a89cf5] transition hover:bg-[#2a2f4a]">
          <Plus size={14} />
          Add Tab
        </button>
      </div>

      <div className="px-[14px] py-[14px]">
        <div className="mb-3 flex gap-0 border-b-[0.5px] border-[#2e3450]" style={currentViewModel.tabListStyle}>
        {tabs.map((tab: any, index: number) => (
          <div key={tab.id || index} className="min-w-[90px]">
            {editingIndex === index && editingField === 'title' ? (
              <input
                type="text"
                value={tab.title}
                onChange={(event) => updateTab(index, 'title', event.target.value)}
                onBlur={() => {
                  setEditingIndex(null)
                  setEditingField(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setEditingIndex(null)
                    setEditingField(null)
                  }
                }}
                className="w-full rounded-md border-[0.5px] border-[#3d3870] bg-[#252a40] px-3 py-2 text-[11px] font-medium text-[#c8cce6] outline-none"
                autoFocus
              />
            ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab(index)}
                  className={`relative px-[14px] py-[7px] text-[11px] ${
                    activeTab === index ? 'text-[#a89cf5]' : 'text-[#6b7299]'
                  }`}
                  style={activeTab === index ? { ...currentViewModel.tabButtonStyle, ...currentViewModel.activeTabButtonStyle } : currentViewModel.tabButtonStyle}
                  onDoubleClick={() => {
                    setEditingIndex(index)
                    setEditingField('title')
                  }}>
                  <div className="truncate">{tab.title}</div>
                  {activeTab === index ? <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-t-sm bg-[#a89cf5]" /> : null}
                </button>
            )}
          </div>
        ))}
        </div>

        <div className="mb-[10px] grid grid-cols-2 gap-2">
          {tabs.map((tab: any, index: number) => (
            <div key={`meta-${tab.id || index}`} className="rounded-md border-[0.5px] border-[#3d4460] bg-[#252a40] px-[10px] py-[8px]">
              <div className="text-[10px] font-medium text-[#c8cce6]">{tab.title}</div>
              <div className="mt-[2px] text-[9px] text-[#6b7299]">Double-click to rename</div>
              <div className="mt-[6px] flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(index)
                    setEditingField('title')
                  }}
                  className="inline-flex items-center gap-1 rounded-[4px] border-[0.5px] border-[#2e3450] bg-[#1e2235] px-[6px] py-[2px] text-[9px] text-[#9ba3c4]"
                  title="Rename tab">
                  <PencilLine size={10} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeTab(index)}
                  className="inline-flex items-center gap-1 rounded-[4px] border-[0.5px] border-[#3d2a2a] bg-[#2a1f1f] px-[6px] py-[2px] text-[9px] text-[#e05555]"
                  title="Delete tab">
                  <Trash2 size={10} />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[14px] pb-[14px]" style={currentViewModel.contentStyle}>
        <div className="mb-[6px] text-[9px] font-semibold uppercase tracking-[0.06em] text-[#6b7299]">Tab Content</div>
        {editingIndex !== null && editingField === 'content' && editingIndex === activeTab ? (
          <textarea
            value={activeContent}
            onChange={(event) => updateTab(activeTab, 'content', event.target.value)}
            onBlur={() => {
              setEditingIndex(null)
              setEditingField(null)
            }}
            className="min-h-[160px] w-full rounded-md border-[0.5px] border-[#3d4460] bg-[#252a40] px-[10px] py-[10px] text-[12px] text-[#c8cce6] outline-none"
            rows={7}
            autoFocus
          />
        ) : (
          <div
            className="cursor-pointer rounded-md bg-[#252a40] px-[10px] py-[10px] transition"
            onClick={() => {
              setEditingIndex(activeTab)
              setEditingField('content')
            }}>
            {typeof activeContent === 'string' && activeContent ? (
              <div className="whitespace-pre-wrap text-[12px] leading-[1.5] text-[#c8cce6]">{activeContent}</div>
            ) : typeof activeContent === 'object' && typeof (activeContent as any)?.content === 'string' && (activeContent as any).content ? (
              <div className="whitespace-pre-wrap text-[12px] leading-[1.5] text-[#c8cce6]">{(activeContent as any).content}</div>
            ) : (
              <div className="text-[10px] text-[#6b7299]">Drop components here</div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-center border-t-[0.5px] border-[#2e3450] px-[14px] py-[6px]">
        <span className="text-[9px] uppercase tracking-[0.08em] text-[#4a5070]">Tabs (Tabs)</span>
      </div>
    </div>
  )
}

export default TabsAdminRenderer
