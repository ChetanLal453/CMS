import type { PageBlock, PageColumn, PageRow, PageSection } from '../page/PageRenderBundle'
import type { SectionPreset } from './types'
import { normalizeBlockProps } from '../blocks/registry'

function generateUniqueId(prefix = 'id'): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    const raw = globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 10)
    return `${prefix}-${raw}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function cloneComponentWithFreshIds(component: PageBlock, idMap: Map<string, string>): PageBlock {
  const oldId = String(component.id)
  const newId = generateUniqueId(component.type || 'comp')
  idMap.set(oldId, newId)

  const clonedProps = JSON.parse(JSON.stringify(component.props || {}))

  // Remap nested children (Flexbox, Container, etc.)
  if (Array.isArray(clonedProps.children)) {
    clonedProps.children = clonedProps.children.map((child: PageBlock) =>
      cloneComponentWithFreshIds(child, idMap),
    )
  }

  // Remap grid cells
  if (Array.isArray(clonedProps.cells)) {
    clonedProps.cells = clonedProps.cells.map((row: any[]) =>
      Array.isArray(row)
        ? row.map((cell: any) =>
            cell?.component ? { ...cell, component: cloneComponentWithFreshIds(cell.component, idMap) } : cell,
          )
        : row,
    )
  }

  // Remap swiper slides
  if (Array.isArray(clonedProps.slides)) {
    clonedProps.slides = clonedProps.slides.map((slide: any) => ({
      ...slide,
      id: generateUniqueId('slide'),
      components: Array.isArray(slide.components)
        ? slide.components.map((c: PageBlock) => cloneComponentWithFreshIds(c, idMap))
        : [],
    }))
  }

  const normalizedProps = normalizeBlockProps(component.type, clonedProps)

  return {
    id: newId,
    type: component.type,
    label: component.label || null,
    props: normalizedProps,
  }
}

function collectAllBlocks(components: PageBlock[]): PageBlock[] {
  const result: PageBlock[] = []

  function traverse(comp: PageBlock) {
    result.push({
      id: comp.id,
      type: comp.type,
      label: comp.label || null,
      props: comp.props,
    })
    if (Array.isArray(comp.props?.children)) {
      comp.props.children.forEach(traverse)
    }
  }

  components.forEach(traverse)
  return result
}

export function instantiateSectionPreset(preset: SectionPreset): PageSection {
  const idMap = new Map<string, string>()
  const rawSection = preset.section

  const newSectionId = generateUniqueId('sec')
  const newContainerId = generateUniqueId('container')

  const clonedRows: PageRow[] = (rawSection.rows || []).map((row) => {
    const newRowId = generateUniqueId('row')
    const clonedColumns: PageColumn[] = (row.columns || []).map((col) => {
      const newColId = generateUniqueId('col')
      const clonedComponents: PageBlock[] = (col.components || []).map((comp) =>
        cloneComponentWithFreshIds(comp, idMap),
      )

      return {
        id: newColId,
        width: col.width,
        components: clonedComponents,
      }
    })

    return {
      id: newRowId,
      columns: clonedColumns,
    }
  })

  // Collect top-level column blocks for section.blocks
  const allColumnComponents = clonedRows.flatMap((r) => r.columns.flatMap((c) => c.components))
  const allFlatBlocks = collectAllBlocks(allColumnComponents)

  return {
    id: newSectionId,
    name: preset.name,
    type: rawSection.type || 'default',
    content: rawSection.content || '',
    props: JSON.parse(JSON.stringify(rawSection.props || {})),
    settings: JSON.parse(JSON.stringify(rawSection.settings || {})),
    blocks: allFlatBlocks,
    rows: clonedRows,
    container: {
      id: newContainerId,
      rows: clonedRows,
    },
  }
}
