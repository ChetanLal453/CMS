import { defaultNewGridProps } from './defaults'
import type {
  LegacyNewGridProps,
  NewGrid,
  NewGridAlignItems,
  NewGridBehaviorGroup,
  NewGridCell,
  NewGridInput,
  NewGridJustifyContent,
  NewGridLayoutGroup,
  NewGridResponsiveGroup,
  NewGridStyleGroup,
} from './types'
import { asString, asBoolean, asNumber, asInteger, isPlainObject } from '../../utils/merge'
import type { DeepPartial } from '../../utils/merge'

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
  const layout = (isPlainObject(input.layout) ? input.layout : {}) as Partial<NewGridLayoutGroup>
  const responsive = (isPlainObject(input.responsive) ? input.responsive : {}) as Partial<NewGridResponsiveGroup>
  const style = (isPlainObject(input.style) ? input.style : {}) as Partial<NewGridStyleGroup>
  const behavior = (isPlainObject(input.behavior) ? input.behavior : {}) as Partial<NewGridBehaviorGroup>

  const columns = asInteger(input.columns ?? legacy.columns ?? layout.columns, defaultNewGridProps.layout.columns)
  const rows = asInteger(input.rows ?? legacy.rows ?? layout.rows, defaultNewGridProps.layout.rows)
  const gap = asNumber(input.gap ?? legacy.gap ?? layout.gap, defaultNewGridProps.layout.gap)
  const padding = asNumber(input.padding ?? legacy.padding ?? layout.padding, defaultNewGridProps.layout.padding)
  const margin = asNumber(input.margin ?? legacy.margin ?? layout.margin, defaultNewGridProps.layout.margin)
  const justifyContent = asJustifyContent(input.justifyContent ?? legacy.justifyContent ?? layout.justifyContent, defaultNewGridProps.layout.justifyContent)
  const alignItems = asAlignItems(input.alignItems ?? legacy.alignItems ?? layout.alignItems, defaultNewGridProps.layout.alignItems)
  const gridTemplateColumns = asString(input.gridTemplateColumns ?? legacy.gridTemplateColumns ?? layout.gridTemplateColumns, `repeat(${columns}, 1fr)`)
  const gridAutoRows = asString(input.gridAutoRows ?? legacy.gridAutoRows ?? layout.gridAutoRows, defaultNewGridProps.layout.gridAutoRows)
  const minHeight = asString(input.minHeight ?? legacy.minHeight ?? layout.minHeight, defaultNewGridProps.layout.minHeight)

  const mobileColumns = asInteger(input.mobileColumns ?? legacy.mobileColumns ?? responsive.mobileColumns, defaultNewGridProps.responsive.mobileColumns)
  const tabletColumns = asInteger(input.tabletColumns ?? legacy.tabletColumns ?? responsive.tabletColumns, defaultNewGridProps.responsive.tabletColumns)
  const desktopColumns = asInteger(input.desktopColumns ?? legacy.desktopColumns ?? responsive.desktopColumns, defaultNewGridProps.responsive.desktopColumns)
  const hideOnMobile = asBoolean(input.hideOnMobile ?? legacy.hideOnMobile ?? responsive.hideOnMobile, defaultNewGridProps.responsive.hideOnMobile)
  const hideOnTablet = asBoolean(input.hideOnTablet ?? legacy.hideOnTablet ?? responsive.hideOnTablet, defaultNewGridProps.responsive.hideOnTablet)

  const backgroundColor = asString(input.backgroundColor ?? legacy.backgroundColor ?? style.backgroundColor, defaultNewGridProps.style.backgroundColor)
  const border = asString(input.border ?? legacy.border ?? style.border, defaultNewGridProps.style.border)
  const borderRadius = asNumber(input.borderRadius ?? legacy.borderRadius ?? style.borderRadius, defaultNewGridProps.style.borderRadius)
  const gridLineColor = asString(input.gridLineColor ?? legacy.gridLineColor ?? style.gridLineColor, defaultNewGridProps.style.gridLineColor)
  const customCSS = asString(input.customCSS ?? legacy.customCSS ?? style.customCSS, defaultNewGridProps.style.customCSS)
  const className = asString(input.className ?? legacy.className ?? style.className, defaultNewGridProps.style.className)
  const id = asString(input.id ?? legacy.id ?? style.id, defaultNewGridProps.style.id)
  const dataAttributes = asString(input.dataAttributes ?? legacy.dataAttributes ?? style.dataAttributes, defaultNewGridProps.style.dataAttributes)

  const draggable = asBoolean(input.draggable ?? legacy.draggable ?? behavior.draggable, defaultNewGridProps.behavior.draggable)
  const resizable = asBoolean(input.resizable ?? legacy.resizable ?? behavior.resizable, defaultNewGridProps.behavior.resizable)
  const showGridLines = asBoolean(input.showGridLines ?? legacy.showGridLines ?? behavior.showGridLines, defaultNewGridProps.behavior.showGridLines)
  const snapToGrid = asBoolean(input.snapToGrid ?? legacy.snapToGrid ?? behavior.snapToGrid, defaultNewGridProps.behavior.snapToGrid)
  const visible = asBoolean(input.visible ?? legacy.visible ?? behavior.visible, defaultNewGridProps.behavior.visible)

  const contentInput = (input as any).content && typeof (input as any).content === 'object' ? (input as any).content : {}
  const cells = normalizeCells(contentInput.cells ?? input.cells ?? legacy.cells, rows, columns)
  const components = normalizeComponents(contentInput.components ?? input.components ?? legacy.components, cells, rows, columns)

  return {
    type: 'newgrid',
    schemaVersion: 1,
    version: 1,
    content: {
      cells,
      components,
    },
    columns,
    rows,
    gap,
    padding,
    margin,
    justifyContent,
    alignItems,
    gridTemplateColumns,
    gridAutoRows,
    minHeight,
    mobileColumns,
    tabletColumns,
    desktopColumns,
    hideOnMobile,
    hideOnTablet,
    backgroundColor,
    border,
    borderRadius,
    gridLineColor,
    customCSS,
    className,
    id,
    dataAttributes,
    draggable,
    resizable,
    showGridLines,
    snapToGrid,
    visible,
    layout: {
      columns,
      rows,
      gap,
      padding,
      margin,
      justifyContent,
      alignItems,
      gridTemplateColumns,
      gridAutoRows,
      minHeight,
    },
    responsive: {
      mobileColumns,
      tabletColumns,
      desktopColumns,
      hideOnMobile,
      hideOnTablet,
    },
    style: {
      backgroundColor,
      border,
      borderRadius,
      gridLineColor,
      customCSS,
      className,
      id,
      dataAttributes,
      gridTestFromComponent: defaultNewGridProps.style.gridTestFromComponent,
    },
    behavior: {
      draggable,
      resizable,
      showGridLines,
      snapToGrid,
      visible,
    },
    cells,
    components,
  }
}
