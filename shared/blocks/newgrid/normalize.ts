import { defaultNewGridProps } from './defaults'
import type {
  LegacyNewGridProps,
  NewGrid,
  NewGridAlignItems,
  NewGridCell,
  NewGridInput,
  NewGridJustifyContent,
} from './types'

function asString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  const normalized = String(value).trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return fallback
}

function asNumber(value: unknown, fallback: number, minimum = 0): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '').trim())
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(minimum, parsed)
}

function asInteger(value: unknown, fallback: number, minimum = 1): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value ?? '').trim(), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(minimum, parsed)
}

function asJustifyContent(value: unknown, fallback: NewGridJustifyContent): NewGridJustifyContent {
  const allowed: NewGridJustifyContent[] = ['stretch', 'start', 'center', 'end', 'space-between', 'space-around', 'space-evenly']
  return allowed.includes(value as NewGridJustifyContent) ? (value as NewGridJustifyContent) : fallback
}

function asAlignItems(value: unknown, fallback: NewGridAlignItems): NewGridAlignItems {
  const allowed: NewGridAlignItems[] = ['stretch', 'start', 'center', 'end', 'baseline']
  return allowed.includes(value as NewGridAlignItems) ? (value as NewGridAlignItems) : fallback
}

function createEmptyCells(rows: number, columns: number): NewGridCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      component: null,
    })),
  )
}

function normalizeCells(source: unknown, rows: number, columns: number): NewGridCell[][] {
  const fallback = createEmptyCells(rows, columns)
  if (!Array.isArray(source) || source.length === 0) {
    return fallback
  }

  if (Array.isArray(source[0])) {
    return Array.from({ length: rows }, (_, rowIndex) =>
      Array.from({ length: columns }, (_, colIndex) => {
        const cell = (source as any[])?.[rowIndex]?.[colIndex]
        return { component: cell?.component ?? null }
      }),
    )
  }

  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: columns }, (_, colIndex) => {
      const cell = (source as any[])?.[rowIndex * columns + colIndex]
      return { component: cell?.component ?? null }
    }),
  )
}

function normalizeComponents(source: unknown, cells: NewGridCell[][], rows: number, columns: number): Array<any | null> {
  const expectedLength = rows * columns
  if (Array.isArray(source) && source.length > 0) {
    return Array.from({ length: expectedLength }, (_, index) => (source as any[])[index] ?? null)
  }

  return cells.flat().map((cell) => cell.component ?? null)
}

export function normalizeNewGrid(input: NewGridInput = {}): NewGrid {
  const legacy = input as LegacyNewGridProps
  const layout = input.layout || {}
  const responsive = input.responsive || {}
  const style = input.style || {}
  const behavior = input.behavior || {}

  const columns = asInteger(layout.columns ?? legacy.columns, defaultNewGridProps.layout.columns)
  const rows = asInteger(layout.rows ?? legacy.rows, defaultNewGridProps.layout.rows)
  const cells = normalizeCells(input.cells ?? legacy.cells, rows, columns)
  const components = normalizeComponents(input.components ?? legacy.components, cells, rows, columns)

  return {
    type: 'newgrid',
    schemaVersion: 1,
    layout: {
      columns,
      rows,
      gap: asNumber(layout.gap ?? legacy.gap, defaultNewGridProps.layout.gap),
      padding: asNumber(layout.padding ?? legacy.padding, defaultNewGridProps.layout.padding),
      margin: asNumber(layout.margin ?? legacy.margin, defaultNewGridProps.layout.margin),
      justifyContent: asJustifyContent(layout.justifyContent ?? legacy.justifyContent, defaultNewGridProps.layout.justifyContent),
      alignItems: asAlignItems(layout.alignItems ?? legacy.alignItems, defaultNewGridProps.layout.alignItems),
      gridTemplateColumns: asString(layout.gridTemplateColumns ?? legacy.gridTemplateColumns, defaultNewGridProps.layout.gridTemplateColumns),
      gridAutoRows: asString(layout.gridAutoRows ?? legacy.gridAutoRows, defaultNewGridProps.layout.gridAutoRows),
      minHeight: asString(layout.minHeight ?? legacy.minHeight, defaultNewGridProps.layout.minHeight),
    },
    responsive: {
      mobileColumns: asInteger(responsive.mobileColumns ?? legacy.mobileColumns, defaultNewGridProps.responsive.mobileColumns),
      tabletColumns: asInteger(responsive.tabletColumns ?? legacy.tabletColumns, defaultNewGridProps.responsive.tabletColumns),
      desktopColumns: asInteger(responsive.desktopColumns ?? legacy.desktopColumns, defaultNewGridProps.responsive.desktopColumns),
      hideOnMobile: asBoolean(responsive.hideOnMobile ?? legacy.hideOnMobile, defaultNewGridProps.responsive.hideOnMobile),
      hideOnTablet: asBoolean(responsive.hideOnTablet ?? legacy.hideOnTablet, defaultNewGridProps.responsive.hideOnTablet),
    },
    style: {
      backgroundColor: asString(style.backgroundColor ?? legacy.backgroundColor, defaultNewGridProps.style.backgroundColor),
      border: asString(style.border ?? legacy.border, defaultNewGridProps.style.border),
      borderRadius: asNumber(style.borderRadius ?? legacy.borderRadius, defaultNewGridProps.style.borderRadius),
      gridLineColor: asString(style.gridLineColor ?? legacy.gridLineColor, defaultNewGridProps.style.gridLineColor),
      customCSS: asString(style.customCSS ?? legacy.customCSS, defaultNewGridProps.style.customCSS),
      className: asString(style.className ?? legacy.className, defaultNewGridProps.style.className),
      id: asString(style.id ?? legacy.id, defaultNewGridProps.style.id),
      dataAttributes: asString(style.dataAttributes ?? legacy.dataAttributes, defaultNewGridProps.style.dataAttributes),
      gridTestFromComponent: asString(style.gridTestFromComponent ?? legacy.gridTestFromComponent, defaultNewGridProps.style.gridTestFromComponent),
    },
    behavior: {
      draggable: asBoolean(behavior.draggable ?? legacy.draggable, defaultNewGridProps.behavior.draggable),
      resizable: asBoolean(behavior.resizable ?? legacy.resizable, defaultNewGridProps.behavior.resizable),
      showGridLines: asBoolean(behavior.showGridLines ?? legacy.showGridLines, defaultNewGridProps.behavior.showGridLines),
      snapToGrid: asBoolean(behavior.snapToGrid ?? legacy.snapToGrid, defaultNewGridProps.behavior.snapToGrid),
      visible: asBoolean(behavior.visible ?? legacy.visible, defaultNewGridProps.behavior.visible),
    },
    cells,
    components,
  }
}
