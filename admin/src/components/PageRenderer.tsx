import React from 'react'
import { getComponentRenderer } from '../../../curvemetricswebsite/src/components/registry'
import { createBlockViewModel } from '../../../shared/blocks/registry'

interface LayoutComponent {
  id: string
  type: string
  label?: string
  props?: Record<string, any>
}

interface Column {
  id: string
  width?: number
  components?: LayoutComponent[]
}

interface Row {
  id: string
  columns?: Column[]
}

interface Section {
  id: string
  settings?: {
    rowVerticalAlign?: 'top' | 'center' | 'bottom'
  }
  rows?: Row[]
  blocks?: LayoutComponent[]
  container?: {
    id: string
    rows?: Row[]
  }
}

interface PageRendererProps {
  layout: {
    sections?: Section[]
  } | null
}

function renderComponent(component: LayoutComponent) {
  let Renderer: React.ComponentType<any>

  try {
    Renderer = getComponentRenderer(component.type)
  } catch (error) {
    console.error(`Error resolving website renderer for component ${component.type}:`, error)
    return (
      <div key={component.id} style={{ padding: '20px', border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
        Unsupported component type "{component.type}"
      </div>
    )
  }

  try {
    return (
      <div key={component.id}>
        <Renderer
          {...(component.props || {})}
          __sharedViewModel={createBlockViewModel(component.type, component.props || {})}
          _isInPageLayout={true}
          isPageView={true}
          hideLayout={true}
          suppressContainer={true}
          renderComponent={renderComponent}
        />
      </div>
    )
  } catch (error) {
    console.error(`Error rendering component ${component.type}:`, error)
    return (
      <div key={component.id} style={{ padding: '20px', border: '1px solid #fecaca', backgroundColor: '#fef2f2' }}>
        Error rendering {component.type}
      </div>
    )
  }
}

function getSectionRows(section: Section): Row[] {
  if (Array.isArray(section.rows) && section.rows.length) {
    return section.rows
  }

  if (Array.isArray(section.container?.rows) && section.container.rows.length) {
    return section.container.rows
  }

  if (Array.isArray(section.blocks) && section.blocks.length) {
    return [
      {
        id: `${section.id}-row-1`,
        columns: [
          {
            id: `${section.id}-col-1`,
            width: 12,
            components: section.blocks,
          },
        ],
      },
    ]
  }

  return []
}

function renderSection(section: Section, index: number) {
  const rows = getSectionRows(section)
  const rowAlignItems =
    section.settings?.rowVerticalAlign === 'center'
      ? 'center'
      : section.settings?.rowVerticalAlign === 'bottom'
        ? 'end'
        : 'start'

  return (
    <section key={section.id || `section-${index + 1}`} className="mb-10">
      {rows.map((row) => (
        <div
          key={row.id}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${row.columns?.length || 1}, minmax(0, 1fr))`,
            alignItems: rowAlignItems,
            gap: '24px',
            marginBottom: '24px',
          }}>
          {(row.columns || []).map((column) => (
            <div key={column.id} style={{ width: '100%' }}>
              {(column.components || []).map(renderComponent)}
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

export function PageRenderer({ layout }: PageRendererProps) {
  const sections = Array.isArray(layout?.sections) ? layout.sections : []

  if (!sections.length) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        No content available.
      </div>
    )
  }

  return <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6">{sections.map(renderSection)}</div>
}
