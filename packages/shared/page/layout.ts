import type { PageBlock } from './PageRenderBundle'
import { normalizeBlockProps } from '../blocks/registry'
import { normalizeAdvancedCard, sanitizeAdvancedCardForStorage } from '../blocks/advancedcard/normalize'
import { createAdvancedCardView } from '../blocks/advancedcard/viewModel'
import { PAGE_RENDER_BUNDLE_SCHEMA_VERSION } from './schemaVersion'
import { migrateLayoutInput } from './migrateLayoutInput'
import { sanitizeSectionProps, validateSectionProps } from './sectionSchemas'

function createId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `generated-${Math.random().toString(36).slice(2, 10)}`
}

function parseJsonValue(value: unknown) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return value
}

function getPageName(page: Record<string, any> = {}) {
  return page.name || page.title || (page.id ? `Page ${page.id}` : 'Untitled Page')
}

function ensureComponent(component: any, componentIndex: number, sectionIndex: number, rowIndex: number, columnIndex: number) {
  const type = component?.type || 'custom'
  const rawProps = component?.props && typeof component.props === 'object' ? component.props : {}
  const normalizedType = String(type || '').trim().toLowerCase()

  let sanitizedProps = rawProps

  if (normalizedType === 'advancedcard' || normalizedType === 'advancedcardcomponent') {
    try {
      sanitizedProps = sanitizeAdvancedCardForStorage(rawProps)
    } catch {
      sanitizedProps = rawProps
    }
  }

  if (normalizedType !== 'custom') {
    try {
      sanitizedProps = normalizeBlockProps(type, sanitizedProps)
    } catch {
      sanitizedProps = sanitizedProps
    }
  }

  if (Array.isArray(sanitizedProps?.children) && sanitizedProps.children.length > 0) {
    const childComponents = sanitizedProps.children.map((child: any, childIdx: number) =>
      ensureComponent(child, childIdx, sectionIndex, rowIndex, columnIndex),
    )
    sanitizedProps = {
      ...sanitizedProps,
      children: childComponents,
      ...(sanitizedProps.content && typeof sanitizedProps.content === 'object'
        ? { content: { ...sanitizedProps.content, children: childComponents } }
        : {}),
    }
  } else if (Array.isArray(sanitizedProps?.content?.children) && sanitizedProps.content.children.length > 0) {
    const childComponents = sanitizedProps.content.children.map((child: any, childIdx: number) =>
      ensureComponent(child, childIdx, sectionIndex, rowIndex, columnIndex),
    )
    sanitizedProps = {
      ...sanitizedProps,
      children: childComponents,
      content: { ...sanitizedProps.content, children: childComponents },
    }
  }

  return {
    id: component?.id || `component-${sectionIndex + 1}-${rowIndex + 1}-${columnIndex + 1}-${componentIndex + 1}`,
    type,
    label: component?.label || type,
    props: sanitizedProps,
  }
}

function toEditorCompatibleAdvancedCardProps(rawProps: any) {
  const safeProps = rawProps && typeof rawProps === 'object' ? rawProps : {}

  try {
    const normalizedCard = normalizeAdvancedCard(safeProps)
    const view = createAdvancedCardView(normalizedCard, {}, String(normalizedCard?.content?.image?.src || ''))

    return {
      ...view,
      id: view.id || normalizedCard.id || '',
      customClass: view.customClass || normalizedCard?.system?.customClass || '',
    }
  } catch {
    return safeProps
  }
}

function ensureOutputComponent(component: any, componentIndex: number, sectionIndex: number, rowIndex: number, columnIndex: number, options: Record<string, any> = {}) {
  const type = component?.type || 'custom'
  const normalizedType = String(type || '').trim().toLowerCase()
  const rawProps = component?.props && typeof component.props === 'object' ? component.props : {}
  const { flattenAdvancedCard = true } = options

  const props =
    flattenAdvancedCard && (normalizedType === 'advancedcard' || normalizedType === 'advancedcardcomponent')
      ? toEditorCompatibleAdvancedCardProps(rawProps)
      : rawProps

  const normalizedProps =
    normalizedType !== 'custom'
      ? (() => {
          try {
            return normalizeBlockProps(type, props)
          } catch {
            return props
          }
        })()
      : props

  let finalProps = normalizedProps
  if (Array.isArray(finalProps?.children) && finalProps.children.length > 0) {
    const childComponents = finalProps.children.map((child: any, childIdx: number) =>
      ensureOutputComponent(child, childIdx, sectionIndex, rowIndex, columnIndex, options),
    )
    finalProps = {
      ...finalProps,
      children: childComponents,
      ...(finalProps.content && typeof finalProps.content === 'object'
        ? { content: { ...finalProps.content, children: childComponents } }
        : {}),
    }
  } else if (Array.isArray(finalProps?.content?.children) && finalProps.content.children.length > 0) {
    const childComponents = finalProps.content.children.map((child: any, childIdx: number) =>
      ensureOutputComponent(child, childIdx, sectionIndex, rowIndex, columnIndex, options),
    )
    finalProps = {
      ...finalProps,
      children: childComponents,
      content: { ...finalProps.content, children: childComponents },
    }
  }

  return {
    id: component?.id || `component-${sectionIndex + 1}-${rowIndex + 1}-${columnIndex + 1}-${componentIndex + 1}`,
    type,
    label: component?.label || type,
    props: finalProps,
  }
}

function normalizeColumns(rawColumns: any, sectionIndex: number, rowIndex: number) {
  const safeColumns = Array.isArray(rawColumns) && rawColumns.length
    ? rawColumns
    : [
        {
          id: `column-${sectionIndex + 1}-${rowIndex + 1}-1`,
          width: 100,
          components: [],
        },
      ]

  return safeColumns.map((column: any, columnIndex: number) => ({
    id: column?.id || `column-${sectionIndex + 1}-${rowIndex + 1}-${columnIndex + 1}`,
    width: column?.width ?? 100,
    components: Array.isArray(column?.components)
      ? column.components.map((component: any, componentIndex: number) =>
          ensureComponent(component, componentIndex, sectionIndex, rowIndex, columnIndex),
        )
      : [],
  }))
}

function normalizeColumnsForOutput(rawColumns: any, sectionIndex: number, rowIndex: number, options: Record<string, any> = {}) {
  const safeColumns = Array.isArray(rawColumns) && rawColumns.length
    ? rawColumns
    : [
        {
          id: `column-${sectionIndex + 1}-${rowIndex + 1}-1`,
          width: 100,
          components: [],
        },
      ]

  return safeColumns.map((column: any, columnIndex: number) => ({
    id: column?.id || `column-${sectionIndex + 1}-${rowIndex + 1}-${columnIndex + 1}`,
    width: column?.width ?? 100,
    components: Array.isArray(column?.components)
      ? column.components.map((component: any, componentIndex: number) =>
          ensureOutputComponent(component, componentIndex, sectionIndex, rowIndex, columnIndex, options),
        )
      : [],
  }))
}

function normalizeRows(section: any, sectionIndex: number) {
  if (Array.isArray(section?.container?.rows) && section.container.rows.length) {
    return section.container.rows.map((row: any, rowIndex: number) => ({
      id: row?.id || `row-${sectionIndex + 1}-${rowIndex + 1}`,
      columns: normalizeColumns(row?.columns, sectionIndex, rowIndex),
    }))
  }

  if (Array.isArray(section?.rows) && section.rows.length) {
    return section.rows.map((row: any, rowIndex: number) => ({
      id: row?.id || `row-${sectionIndex + 1}-${rowIndex + 1}`,
      columns: normalizeColumns(row?.columns, sectionIndex, rowIndex),
    }))
  }

  if (Array.isArray(section?.columns)) {
    return [
      {
        id: `row-${sectionIndex + 1}-1`,
        columns: normalizeColumns(section.columns, sectionIndex, 0),
      },
    ]
  }

  return [
    {
      id: `row-${sectionIndex + 1}-1`,
      columns: normalizeColumns([], sectionIndex, 0),
    },
  ]
}

function collectSectionBlocks(rows: Array<{ columns?: Array<{ components?: unknown[] }> }> = []): PageBlock[] {
  return rows.flatMap((row) =>
    (Array.isArray(row?.columns) ? row.columns : []).flatMap((column) =>
      (Array.isArray(column?.components) ? (column.components as PageBlock[]) : []),
    ),
  )
}

export function normalizeLayoutToCanonical(layout: unknown, page: Record<string, any> = {}) {
  const migratedInput = migrateLayoutInput(parseJsonValue(layout), {
    pageId: page.id ?? null,
    slug: page.slug ?? null,
  }).value
  const parsed = parseJsonValue(migratedInput)
  const baseLayout = parsed && typeof parsed === 'object' ? (parsed as Record<string, any>) : {}
  const rawSections = Array.isArray(baseLayout.sections) ? baseLayout.sections : []

  const sections = rawSections.map((section: any, sectionIndex: number) => {
    const type = section?.type || 'custom'
    const validation = validateSectionProps(type, section?.props)
    const rows = normalizeRows(section, sectionIndex)

    return {
      id: section?.id || `section-${sectionIndex + 1}`,
      name: section?.name || section?.title || `Section ${sectionIndex + 1}`,
      type,
      props: validation.sanitized ?? sanitizeSectionProps(type, section?.props),
      settings: section?.settings && typeof section.settings === 'object' ? section.settings : {},
      rows,
      blocks: collectSectionBlocks(rows),
    }
  })

  return {
    schemaVersion: PAGE_RENDER_BUNDLE_SCHEMA_VERSION,
    id: String(baseLayout.id || page.id || createId()),
    name: String(baseLayout.name || getPageName(page)),
    sections,
  }
}

export function normalizeLayoutToEditor(layout: unknown, page: Record<string, any> = {}, options: Record<string, any> = {}) {
  const canonical = normalizeLayoutToCanonical(layout, page)
  const { flattenAdvancedCard = true } = options

  return {
    schemaVersion: PAGE_RENDER_BUNDLE_SCHEMA_VERSION,
    id: canonical.id,
    name: canonical.name,
    sections: canonical.sections.map((section: any, sectionIndex: number) => {
      const firstRow = Array.isArray(section.rows) && section.rows.length
        ? section.rows[0]
        : { id: `row-${sectionIndex + 1}-1`, columns: [] }
      const rootColumns = normalizeColumnsForOutput(firstRow.columns, sectionIndex, 0, { flattenAdvancedCard })

      return {
        id: section.id,
        name: section.name,
        type: section.type,
        props: section.props ?? {},
        settings: section.settings ?? {},
        rows: section.rows,
        blocks: collectSectionBlocks(section.rows),
        columns: rootColumns,
        container: {
          id: `container-${sectionIndex + 1}`,
          rows: section.rows.map((row: any, rowIndex: number) => ({
            id: row.id || `row-${sectionIndex + 1}-${rowIndex + 1}`,
            columns: normalizeColumnsForOutput(row.columns, sectionIndex, rowIndex, { flattenAdvancedCard }),
          })),
        },
      }
    }),
  }
}

export function normalizeLayout(layout: unknown, page: Record<string, any> = {}, options: Record<string, any> = {}) {
  const normalized = normalizeLayoutToEditor(layout, page, options)

  return {
    ...normalized,
    id: normalized.id || page.id || createId(),
    name: normalized.name || page.name || page.title || `Page ${page.id || ''}`.trim(),
  }
}
