import { normalizeNewGrid } from './normalize'
import type { NewGridInput, NewGridViewModel, CSSProperties } from './types'

function parseDataAttributes(dataAttributes: string): Record<string, string> {
  if (!dataAttributes.trim()) {
    return {}
  }

  try {
    const parsed = JSON.parse(dataAttributes)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {}
  } catch {
    return {}
  }
}

export function createNewGridViewModel(input: NewGridInput = {}): NewGridViewModel {
  const normalized = normalizeNewGrid(input)

  const containerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${normalized.layout.columns}, minmax(0, 1fr))`,
    gap: `${normalized.layout.gap}px`,
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    padding: `${normalized.layout.padding}px`,
    margin: `${normalized.layout.margin}px`,
    gridAutoRows: normalized.layout.gridAutoRows || 'minmax(150px, auto)',
    minHeight: normalized.layout.minHeight || '150px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0',
    justifyContent: normalized.layout.justifyContent,
    alignItems: normalized.layout.alignItems,
  }

  const pageLayoutStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${normalized.layout.columns}, minmax(0, 1fr))`,
    gap: `${normalized.layout.gap}px`,
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    gridAutoRows: 'min-content',
    padding: '0',
    margin: '0',
    backgroundColor: 'transparent',
    border: 'none',
  }

  return {
    type: normalized.type,
    schemaVersion: normalized.schemaVersion,
    columns: normalized.layout.columns,
    rows: normalized.layout.rows,
    gap: normalized.layout.gap,
    padding: normalized.layout.padding,
    margin: normalized.layout.margin,
    backgroundColor: normalized.style.backgroundColor,
    border: normalized.style.border,
    borderRadius: normalized.style.borderRadius,
    gridLineColor: normalized.style.gridLineColor,
    justifyContent: normalized.layout.justifyContent,
    alignItems: normalized.layout.alignItems,
    gridTemplateColumns: normalized.layout.gridTemplateColumns,
    gridAutoRows: normalized.layout.gridAutoRows,
    minHeight: normalized.layout.minHeight,
    mobileColumns: normalized.responsive.mobileColumns,
    tabletColumns: normalized.responsive.tabletColumns,
    desktopColumns: normalized.responsive.desktopColumns,
    hideOnMobile: normalized.responsive.hideOnMobile,
    hideOnTablet: normalized.responsive.hideOnTablet,
    draggable: normalized.behavior.draggable,
    resizable: normalized.behavior.resizable,
    showGridLines: normalized.behavior.showGridLines,
    snapToGrid: normalized.behavior.snapToGrid,
    customCSS: normalized.style.customCSS,
    className: normalized.style.className,
    id: normalized.style.id,
    dataAttributes: normalized.style.dataAttributes,
    gridTestFromComponent: normalized.style.gridTestFromComponent,
    dataAttributesObject: parseDataAttributes(normalized.style.dataAttributes),
    visible: normalized.behavior.visible,
    cells: normalized.cells,
    components: normalized.components,
    containerStyle,
    pageLayoutStyle,
    editorCellStyle: {
      position: 'relative',
      minHeight: '150px',
      border: '2px dashed #e5e7eb',
      borderRadius: '4px',
      backgroundColor: '#f9fafb',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px',
    },
    emptyCellStyle: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      fontSize: '13px',
      fontStyle: 'italic',
      textAlign: 'center',
    },
  }
}
