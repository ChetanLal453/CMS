'use client'

import React, { useMemo } from 'react'
import { PageLayout, LayoutComponent, Section } from '@/types/page-editor'
import { ChevronRight, Layers, LayoutGrid, Box, Square, Move } from 'lucide-react'

interface HierarchyBreadcrumbsProps {
  layout: PageLayout
  selectedSectionId?: string | null
  selectedComponent?: {
    sectionId: string
    containerId?: string
    rowId?: string
    colId?: string
    compId?: string
    component?: LayoutComponent
  } | null
  onSectionSelect: (sectionId: string) => void
  onComponentSelect: (component: LayoutComponent, context: any) => void
}

interface CrumbItem {
  id: string
  label: string
  type: 'page' | 'section' | 'column' | 'grid' | 'cell' | 'container' | 'component'
  icon?: React.ReactNode
  isActive: boolean
  onClick?: () => void
}

export const HierarchyBreadcrumbs: React.FC<HierarchyBreadcrumbsProps> = ({
  layout,
  selectedSectionId,
  selectedComponent,
  onSectionSelect,
  onComponentSelect,
}) => {
  const crumbs = useMemo<CrumbItem[]>(() => {
    const list: CrumbItem[] = [
      {
        id: 'page-root',
        label: 'Page',
        type: 'page',
        icon: <Layers size={12} className="text-slate-400" />,
        isActive: !selectedSectionId && !selectedComponent,
      },
    ]

    const sections = Array.isArray(layout?.sections) ? layout.sections : []

    // If nothing selected, just show page root
    if (!selectedSectionId && !selectedComponent) {
      return list
    }

    const activeSectionId = selectedComponent?.sectionId || selectedSectionId
    const currentSection = sections.find((s) => s?.id === activeSectionId)

    if (currentSection) {
      const isSectionActive = Boolean(selectedSectionId && (!selectedComponent || selectedComponent.compId === currentSection.id))
      list.push({
        id: `sec-${currentSection.id}`,
        label: currentSection.name || 'Section',
        type: 'section',
        icon: <Box size={12} className={isSectionActive ? 'text-indigo-400' : 'text-slate-400'} />,
        isActive: isSectionActive,
        onClick: () => onSectionSelect(currentSection.id),
      })

      if (selectedComponent?.component) {
        const activeComp = selectedComponent.component
        const targetId = activeComp.id

        // Check if component is in a column or nested inside Grid / Carousel
        let found = false
        const rows = currentSection.container?.rows || (currentSection as any)?.rows || []

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const row = rows[rIdx]
          const cols = row?.columns || []

          for (let cIdx = 0; cIdx < cols.length; cIdx++) {
            const col = cols[cIdx]
            const comps = col?.components || []

            // Check direct components in column
            for (let compIdx = 0; compIdx < comps.length; compIdx++) {
              const comp = comps[compIdx]
              if (!comp) continue

              // Direct match in column
              if (comp.id === targetId) {
                list.push({
                  id: `col-${col.id || cIdx}`,
                  label: `Col ${cIdx + 1}`,
                  type: 'column',
                  isActive: false,
                })
                list.push({
                  id: `comp-${comp.id}`,
                  label: comp.label || comp.type,
                  type: 'component',
                  icon: <Square size={12} className="text-indigo-400" />,
                  isActive: true,
                })
                found = true
                break
              }

              // Check if inside Grid
              const compType = String(comp.type || '').toLowerCase()
              if (compType === 'newgrid' || compType === 'grid') {
                const cells = comp.props?.cells
                if (Array.isArray(cells)) {
                  for (let cellRow = 0; cellRow < cells.length; cellRow++) {
                    const rowCells = cells[cellRow]
                    if (!Array.isArray(rowCells)) continue

                    for (let cellCol = 0; cellCol < rowCells.length; cellCol++) {
                      const cell = rowCells[cellCol]
                      if (cell?.component?.id === targetId) {
                        list.push({
                          id: `col-${col.id || cIdx}`,
                          label: `Col ${cIdx + 1}`,
                          type: 'column',
                          isActive: false,
                        })
                        // Grid parent
                        list.push({
                          id: `grid-${comp.id}`,
                          label: comp.label || 'Grid',
                          type: 'grid',
                          icon: <LayoutGrid size={12} className="text-indigo-400" />,
                          isActive: false,
                          onClick: () => {
                            onComponentSelect(comp, {
                              sectionId: currentSection.id,
                              containerId: col.id || 'grid-col',
                              rowId: row.id || 'grid-row',
                              colId: col.id || 'grid-col',
                            })
                          },
                        })
                        // Cell coordinate
                        list.push({
                          id: `cell-${cellRow}-${cellCol}`,
                          label: `Cell [${cellRow + 1}, ${cellCol + 1}]`,
                          type: 'cell',
                          isActive: false,
                        })
                        // Child component
                        list.push({
                          id: `comp-${targetId}`,
                          label: cell.component.label || cell.component.type,
                          type: 'component',
                          icon: <Square size={12} className="text-indigo-400" />,
                          isActive: true,
                        })
                        found = true
                        break
                      }
                    }
                    if (found) break
                  }
                }
              }

              if (found) break
            }
            if (found) break
          }
          if (found) break
        }

        // Fallback if not found in standard rows
        if (!found) {
          list.push({
            id: `comp-${targetId}`,
            label: activeComp.label || activeComp.type,
            type: 'component',
            icon: <Square size={12} className="text-indigo-400" />,
            isActive: true,
          })
        }
      }
    }

    return list
  }, [layout, selectedSectionId, selectedComponent, onSectionSelect, onComponentSelect])

  if (crumbs.length <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Component Breadcrumbs"
      className="cm-hierarchy-breadcrumbs flex items-center gap-1.5 px-4 py-1.5 bg-[#12151f] border-b border-white/[0.07] text-[11px] select-none overflow-x-auto scrollbar-none z-20">
      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mr-1 flex items-center gap-1">
        <Layers size={11} className="text-slate-400" /> Path:
      </span>
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1
        return (
          <React.Fragment key={crumb.id}>
            {idx > 0 && <ChevronRight size={12} className="text-slate-600 flex-shrink-0" />}
            <button
              type="button"
              onClick={crumb.onClick}
              disabled={!crumb.onClick || crumb.isActive}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all flex-shrink-0 ${
                crumb.isActive
                  ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40 shadow-sm'
                  : crumb.onClick
                  ? 'text-slate-300 hover:text-white hover:bg-white/[0.08] cursor-pointer'
                  : 'text-slate-400 cursor-default'
              }`}
              title={crumb.onClick ? `Select ${crumb.label}` : crumb.label}>
              {crumb.icon}
              <span className="capitalize">{crumb.label}</span>
            </button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
