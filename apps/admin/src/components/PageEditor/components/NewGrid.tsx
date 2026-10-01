'use client'

import React, { useEffect, useRef, useMemo, useCallback, useState, memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LayoutComponent } from '@/types/page-editor'
import { DynamicComponent } from '../DynamicComponent'
import { ComponentWrapper } from './ComponentWrapper'
import { Edit, Trash2 } from 'lucide-react'
import { useStableComponentsArray } from '../hooks/useStableComponentsArray'
import { useDeviceMode } from '../context/DeviceModeContext'
import { newGridContract } from '@uadmin/shared/blocks/newgrid'
import { createNewGridViewModel } from '@uadmin/shared/blocks/newgrid/viewModel'

const DEBUG_NEW_GRID = false
const debugLog = (...args: unknown[]) => {
  if (DEBUG_NEW_GRID) {
    console.log(...args)
  }
}

const safeJsonParse = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

interface GridCellProps {
  rowIndex: number
  colIndex: number
  cellIndex: number
  droppableId: string
  component: LayoutComponent | null
  onComponentSelect?: (component: LayoutComponent, context: GridComponentContext) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  onComponentDuplicate?: (component: LayoutComponent) => void
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  carouselId?: string
  slideIndex?: number
  setSelectedComponent?: (component: { sectionId: string; compId: string; component: LayoutComponent }) => void
  deleteComponent?: (componentId: string, context?: any) => void
  parentGridId?: string
  onDeleteChildComponent?: (componentId: string, context?: any) => void
}

interface GridComponentContext {
  sectionId: string
  containerId: string
  rowId: string
  colId: string
  carouselId?: string
  slideIndex?: number
  source?: 'grid-cell' | 'carousel-direct' | 'slide'
  isNestedSelection?: boolean
  parentComponentId?: string
  parentGridId?: string
  gridId?: string
  cellRow?: number
  cellCol?: number
}

interface SelectedComponentInfo {
  sectionId: string
  compId: string
  component: LayoutComponent
}

interface NewGridComponentProps {
  columns?: number
  rows?: number
  gap?: number | string
  padding?: number | string
  margin?: number | string
  children?: React.ReactNode
  id?: string
  component?: LayoutComponent
  components?: (LayoutComponent | null)[]
  cells?: any[]
  onComponentsChange?: (newProps: Record<string, any>) => void
  onSelect?: () => void
  onComponentSelect?: (component: LayoutComponent, context: GridComponentContext) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  onComponentDuplicate?: (component: LayoutComponent) => void
  layout?: any
  setLayout?: (layout: any) => void
  setSelectedComponent?: (component: SelectedComponentInfo) => void
  deleteComponent?: (componentId: string, context?: any) => void
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  carouselId?: string
  slideIndex?: number
  onUpdate?: (newProps: Record<string, any>) => void
  parentComponentId?: string
  parentGridId?: string
  [key: string]: any
}

const SortableGridCell: React.FC<{
  component: LayoutComponent | null
  draggableId: string
  context: GridComponentContext
  onComponentSelect?: (component: LayoutComponent, context: GridComponentContext) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  onComponentDuplicate?: (component: LayoutComponent) => void
  setSelectedComponent?: (component: { sectionId: string; compId: string; component: LayoutComponent }) => void
  deleteComponent?: (componentId: string, context?: any) => void
  onDeleteChildComponent?: (componentId: string, context?: any) => void
  children: React.ReactNode
}> = ({
  component,
  draggableId,
  context,
  onComponentSelect,
  onComponentUpdate,
  onComponentDuplicate,
  setSelectedComponent,
  deleteComponent,
  onDeleteChildComponent,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: draggableId })

  const style = {
    ...(transform
      ? {
          transform: CSS.Transform.toString(transform),
          transition,
        }
      : {}),
    opacity: isDragging ? 0.5 : 1,
    width: '100%',
    height: '100%',
    pointerEvents: 'auto' as const,
  }

  const handleDeleteComponent = useCallback(
    (componentId: string, nestedContext?: any) => {
      if (component) {
        const mergedContext = {
          ...context,
          ...nestedContext,
          parentGridId: context.parentGridId,
          source: 'grid-cell' as const,
          gridId: context.parentGridId,
        }

        if (onDeleteChildComponent) {
          onDeleteChildComponent(componentId, mergedContext)
        } else if (deleteComponent) {
          deleteComponent(componentId, mergedContext)
        }
      }
    },
    [deleteComponent, onDeleteChildComponent, context, component],
  )

  const handleChildUpdate = useCallback(
    (componentId: string, newProps: Record<string, any>) => {
      if (onComponentUpdate) {
        onComponentUpdate(componentId, newProps)
      }
    },
    [onComponentUpdate],
  )

  const handleEditClick = useCallback(() => {
    if (component && onComponentSelect) {
      onComponentSelect(component, {
        sectionId: context.sectionId,
        containerId: context.containerId,
        rowId: context.rowId,
        colId: context.colId,
        carouselId: context.carouselId,
        slideIndex: context.slideIndex,
        gridId: context.gridId || context.parentGridId,
        cellRow: context.cellRow,
        cellCol: context.cellCol,
        source: 'grid-cell' as const,
        isNestedSelection: true,
        parentComponentId: context.parentComponentId,
        parentGridId: context.parentGridId,
      })
    }
  }, [component, onComponentSelect, context])

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {component ? (
        <ComponentWrapper
          onEdit={handleEditClick}
          onDuplicate={onComponentDuplicate}
          isGridLevel={false}
          sectionId={context.sectionId}
          containerId={context.containerId}
          rowId={context.rowId}
          colId={context.colId}
          component={component}
          deleteComponent={handleDeleteComponent}
          carouselId={context.carouselId}
          slideIndex={context.slideIndex}
          gridId={context.gridId || context.parentGridId}
          cellRow={context.cellRow}
          cellCol={context.cellCol}
          parentGridId={context.parentGridId}
          // ✅✅✅ CRITICAL: Pass onComponentSelect to ComponentWrapper
          onComponentSelect={onComponentSelect}
        >
          <DynamicComponent
            component={component}
            isSelected={false}
            onSelect={() => {
              if (onComponentSelect) {
                onComponentSelect(component, {
                  sectionId: context.sectionId,
                  containerId: context.containerId,
                  rowId: context.rowId,
                  colId: context.colId,
                  carouselId: context.carouselId,
                  slideIndex: context.slideIndex,
                  gridId: context.gridId || context.parentGridId,
                  cellRow: context.cellRow,
                  cellCol: context.cellCol,
                  source: 'grid-cell' as const,
                  isNestedSelection: true,
                  parentComponentId: context.parentComponentId,
                  parentGridId: context.parentGridId,
                })
              }
            }}
            onUpdate={(newProps) => {
              handleChildUpdate(component.id, newProps)
            }}
            onComponentSelect={onComponentSelect}
            onComponentUpdate={handleChildUpdate}
            setSelectedComponent={setSelectedComponent}
            deleteComponent={handleDeleteComponent}
            onDelete={handleDeleteComponent}
            sectionId={context.sectionId}
            containerId={context.containerId}
            rowId={context.rowId}
            colId={context.colId}
            carouselId={context.carouselId}
            slideIndex={context.slideIndex}
            parentGridId={context.parentGridId}
            gridId={context.gridId || context.parentGridId}
            cellRow={context.cellRow}
            cellCol={context.cellCol}
          />
        </ComponentWrapper>
      ) : (
        children
      )}
    </div>
  )
}

const GridCell = memo(
  ({
    rowIndex,
    colIndex,
    cellIndex,
    droppableId,
    component,
    onComponentSelect,
    onComponentUpdate,
    onComponentDuplicate,
    sectionId,
    containerId,
    rowId,
    colId,
    carouselId,
    slideIndex,
    setSelectedComponent,
    deleteComponent,
    parentGridId,
    onDeleteChildComponent,
  }: GridCellProps) => {
    const isInsideCarousel = !!carouselId

    const { setNodeRef, isOver } = useDroppable({
      id: droppableId,
    })

    const gridCellContext = useMemo(
      (): GridComponentContext => ({
        sectionId: sectionId || '',
        containerId: containerId || '',
        rowId: rowId || `slide-${slideIndex}` || `grid-row-${rowIndex}`,
        colId: colId || `grid-cell-${rowIndex}-${colIndex}`,
        carouselId: carouselId,
        slideIndex: slideIndex,
        source: 'grid-cell' as const,
        isNestedSelection: true,
        parentComponentId: containerId,
        parentGridId: parentGridId,
        gridId: parentGridId,
        cellRow: rowIndex,
        cellCol: colIndex,
      }),
      [sectionId, containerId, rowId, slideIndex, rowIndex, colId, colIndex, carouselId, parentGridId],
    )

    const draggableId = useMemo(
      () =>
        carouselId
          ? `component:${component?.id || 'empty'}:grid:${parentGridId || containerId}:${rowIndex}:${colIndex}:carousel-${carouselId}:slide-${slideIndex}`
          : `component:${component?.id || 'empty'}:grid:${parentGridId || containerId}:${rowIndex}:${colIndex}`,
      [component?.id, carouselId, containerId, rowIndex, colIndex, slideIndex, parentGridId],
    )

    const cellStyle = useMemo((): React.CSSProperties => {
      const previewSurface = '#1a1d28'
      const previewSurfaceSoft = '#13161e'
      const previewBorder = 'rgba(255,255,255,0.07)'
      const previewBorderStrong = 'rgba(255,255,255,0.13)'
      const previewAccent = '#7c6dfa'
      const previewAccentSoft = 'rgba(124,109,250,0.12)'

      const baseStyle = {
        border: `1px solid ${component ? previewBorderStrong : previewBorder}`,
        borderRadius: '8px',
        minHeight: '104px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b90a8',
        fontSize: '11px',
        transition: 'all 0.2s ease-in-out',
        padding: component ? '0' : '16px',
        boxSizing: 'border-box' as const,
        position: 'relative' as const,
        pointerEvents: 'auto' as const,
        cursor: 'pointer',
        backgroundColor: component ? previewSurfaceSoft : previewSurface,
        overflow: 'visible' as const,
        fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      }

      return isOver
        ? {
            ...baseStyle,
            border: `1px solid ${previewAccent}`,
            backgroundColor: previewAccentSoft,
            color: '#a594ff',
            boxShadow: `0 0 0 1px ${previewAccentSoft} inset`,
          }
        : baseStyle
    }, [isOver, component])

    const handleDelete = useCallback(
      (componentId: string, nestedContext?: any) => {
        const mergedContext = {
          ...gridCellContext,
          ...nestedContext,
          parentGridId: parentGridId,
          source: 'grid-cell' as const,
          gridId: parentGridId,
        }

        if (onDeleteChildComponent) {
          onDeleteChildComponent(componentId, mergedContext)
        }
      },
      [onDeleteChildComponent, gridCellContext, parentGridId],
    )

    return (
      <div
        ref={setNodeRef}
        style={cellStyle}
        onClick={(e) => {
          e.stopPropagation()
        }}
        data-inside-carousel={isInsideCarousel}
        data-carousel-id={carouselId}
        data-slide-index={slideIndex}
        data-cell-index={cellIndex}
        data-row-index={rowIndex}
        data-col-index={colIndex}
        data-dragging-over={isOver}
        className={`grid-cell cm-preview-grid-cell ${isOver ? 'drag-over-active' : ''}`}>
        <SortableGridCell
          component={component}
          draggableId={draggableId}
          context={gridCellContext}
          onComponentSelect={onComponentSelect}
          onComponentUpdate={onComponentUpdate}
          onComponentDuplicate={onComponentDuplicate}
          setSelectedComponent={setSelectedComponent}
          deleteComponent={deleteComponent}
          onDeleteChildComponent={handleDelete}>
          {!component ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isOver ? '#a594ff' : '#8b90a8',
                fontWeight: 'normal',
                fontSize: '10px',
                pointerEvents: 'none',
                textAlign: 'center',
                padding: '0',
                opacity: isOver ? 0.7 : 1,
                flexDirection: 'column',
                gap: '6px',
              }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '5px',
                  display: 'grid',
                  placeItems: 'center',
                  background: isOver ? 'rgba(124,109,250,0.22)' : 'rgba(124,109,250,0.12)',
                  color: '#a594ff',
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                }}>
                +
              </div>
              <div style={{ letterSpacing: '0.03em', textTransform: 'uppercase' }}>Drop Here</div>
              <div style={{ opacity: 0.7 }}>r{rowIndex + 1} · c{colIndex + 1}</div>
            </div>
          ) : null}
        </SortableGridCell>
      </div>
    )
  },
)

GridCell.displayName = 'GridCell'

const NewGridComponent: React.FC<NewGridComponentProps> = ({
  columns,
  rows,
  gap,
  padding,
  margin,
  children,
  id,
  components = [],
  cells = [],
  onComponentsChange,
  onSelect,
  onComponentSelect,
  onComponentUpdate,
  onComponentDuplicate,
  layout,
  setLayout,
  setSelectedComponent,
  deleteComponent,
  sectionId,
  containerId,
  rowId,
  colId,
  carouselId,
  slideIndex,
  component: propComponent,
  onUpdate,
  parentComponentId,
  parentGridId,
  ...props
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const effectiveColumns = Number(columns ?? propComponent?.props?.columns ?? propComponent?.props?.layout?.columns ?? props?.layout?.columns) || 3
  const effectiveRows = Number(rows ?? propComponent?.props?.rows ?? propComponent?.props?.layout?.rows ?? props?.layout?.rows) || 2
  const effectiveGap = gap ?? propComponent?.props?.gap ?? propComponent?.props?.layout?.gap ?? props?.layout?.gap ?? 10
  const effectivePadding = padding ?? propComponent?.props?.padding ?? propComponent?.props?.layout?.padding ?? props?.layout?.padding ?? 24
  const effectiveMargin = margin ?? propComponent?.props?.margin ?? propComponent?.props?.layout?.margin ?? props?.layout?.margin ?? 0
  const effectiveCells = (Array.isArray(cells) && cells.length) ? cells : ((Array.isArray(propComponent?.props?.cells) && propComponent.props.cells.length) ? propComponent.props.cells : props?.cells)

  const componentProps = createNewGridViewModel({
    ...props,
    ...propComponent?.props,
    columns: effectiveColumns,
    rows: effectiveRows,
    gap: effectiveGap,
    padding: effectivePadding,
    margin: effectiveMargin,
    cells: effectiveCells,
    components,
  }) as Record<string, any>

  const [localComponent, setLocalComponent] = useState(propComponent)

  useEffect(() => {
    debugLog('🔄 NewGrid: Prop component updated:', {
      propComponentId: propComponent?.id,
      propComponentType: propComponent?.type,
      hasProps: !!propComponent?.props,
      hasCells: !!propComponent?.props?.cells,
      hasPropsCells: !!props.cells,
      carouselId,
      slideIndex,
    })

    if (propComponent) {
      setLocalComponent(propComponent)
    }
  }, [propComponent])

  const parsedRows = componentProps.rows
  const parsedColumns = componentProps.columns
  const parsedGap = componentProps.gap
  const parsedPadding = componentProps.padding
  const parsedMargin = componentProps.margin
  const { isMobile, isTablet } = useDeviceMode()
  const effectiveColumnsForDisplay = useMemo(() => {
    if (isMobile) {
      return componentProps.mobileColumns || componentProps.responsive?.mobileColumns || 1
    }
    if (isTablet) {
      return componentProps.tabletColumns || componentProps.responsive?.tabletColumns || Math.min(2, parsedColumns)
    }
    return parsedColumns
  }, [isMobile, isTablet, componentProps, parsedColumns])

  const currentComponentsCount = components.filter((c) => c !== null && c !== undefined && typeof c === 'object' && c.id && c.type).length

  const fallbackGridIdRef = useRef(`NewGrid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`)
  const gridId = useMemo(() => {
    debugLog('🔍 NewGrid: Determining grid ID:', {
      localComponentId: localComponent?.id,
      propId: id,
      componentId: propComponent?.id,
      propsId: props?.id,
      carouselId,
      slideIndex,
    })

    if (propComponent?.id) {
      debugLog('✅ Using propComponent ID:', propComponent.id)
      return propComponent.id
    }

    if (localComponent?.id) {
      debugLog('✅ Using localComponent ID:', localComponent.id)
      return localComponent.id
    }

    if (props?.id) {
      debugLog('✅ Using props ID:', props.id)
      return props.id
    }

    if (id) {
      debugLog('✅ Using prop ID:', id)
      return id
    }

    const fallbackId = carouselId ? `grid-${carouselId}-slide-${slideIndex}` : fallbackGridIdRef.current

    debugLog('🔧 Generated fallback grid ID:', fallbackId)
    return fallbackId
  }, [localComponent?.id, id, propComponent?.id, props?.id, carouselId, slideIndex])

  const gridComponents = useStableComponentsArray(components, parsedColumns, parsedRows)

  useEffect(() => {
    debugLog('🎯 NewGrid Component Debug:', {
      gridId,
      carouselId,
      slideIndex,
      hasLocalComponent: !!localComponent,
      localComponentCells: localComponent?.props?.cells?.map((row: any[]) =>
        row.map((cell) => ({
          hasComponent: !!cell?.component,
          componentId: cell?.component?.id,
        })),
      ),
      hasPropComponent: !!propComponent,
      propComponentCells: propComponent?.props?.cells?.map((row: any[]) =>
        row.map((cell) => ({
          hasComponent: !!cell?.component,
          componentId: cell?.component?.id,
        })),
      ),
      hasPropsCells: !!props.cells,
      propsCells: props.cells?.map((row: any[]) =>
        row?.map((cell) => ({
          hasComponent: !!cell?.component,
          componentId: cell?.component?.id,
        })),
      ),
      parsedRows,
      parsedColumns,
      gridComponentsLength: gridComponents?.length,
    })
  }, [gridId, localComponent, propComponent, parsedRows, parsedColumns, gridComponents, carouselId, slideIndex, props.cells])

  const handleComponentUpdate = useCallback(
    (componentId: string, newProps: Record<string, any>) => {
      debugLog('🔄 NewGrid: handleComponentUpdate called:', {
        componentId,
        gridId,
        carouselId,
        slideIndex,
        isGridChild: componentId !== gridId,
      })

      if (componentId === gridId) {
        return
      }

      let updatedComponent = null

      if (localComponent?.props?.cells) {
        const updatedCells = localComponent.props.cells.map((row: any) =>
          row.map((cell: any) => {
            if (cell?.component?.id === componentId) {
              return {
                ...cell,
                component: {
                  ...cell.component,
                  props: {
                    ...cell.component.props,
                    ...newProps,
                  },
                },
              }
            }
            return cell
          }),
        )

        updatedComponent = {
          ...localComponent,
          props: {
            ...localComponent.props,
            cells: updatedCells,
          },
        }
      } else {
        if (localComponent?.props?.components) {
          updatedComponent = {
            ...localComponent,
            props: {
              ...localComponent.props,
              components: localComponent.props.components.map((comp: any) =>
                comp?.id === componentId ? { ...comp, props: { ...comp.props, ...newProps } } : comp,
              ),
            },
          }
        }
      }

      if (updatedComponent) {
        debugLog('✅ NewGrid: Updated local component with new props')
        setLocalComponent(updatedComponent)
      }

      if (onUpdate && updatedComponent) {
        debugLog('📤 NewGrid: Calling onUpdate with new props')
        onUpdate(updatedComponent.props)
      }

      if (onComponentUpdate) {
        debugLog('📤 NewGrid: Bubbling update to parent')
        onComponentUpdate(componentId, newProps)
      }
    },
    [localComponent, onUpdate, onComponentUpdate, gridId, parentGridId],
  )

  const getComponentFromCell = useCallback(
    (rowIndex: number, colIndex: number): LayoutComponent | null => {
      // Prioritize local component's cells first (holds immediate user edits and synced prop updates)
      if (localComponent?.props?.cells && Array.isArray(localComponent.props.cells)) {
        const row = localComponent.props.cells[rowIndex]
        if (row && row[colIndex] && row[colIndex].component) {
          return row[colIndex].component
        }
      }

      // Then check prop component's cells (from parent editor updates)
      if (propComponent?.props?.cells && Array.isArray(propComponent.props.cells)) {
        const row = propComponent.props.cells[rowIndex]
        if (row && row[colIndex] && row[colIndex].component) {
          return row[colIndex].component
        }
      }

      // Then check direct props.cells
      if (props.cells && Array.isArray(props.cells)) {
        const row = props.cells[rowIndex]
        if (row && row[colIndex] && row[colIndex].component) {
          return row[colIndex].component
        }
      }

      // Fallback to gridComponents array (legacy support)
      const cellIndex = rowIndex * parsedColumns + colIndex
      const comp = gridComponents[cellIndex]
      if (comp) {
        return comp
      }

      return null
    },
    [localComponent?.props, propComponent?.props, gridComponents, parsedColumns, gridId, carouselId, slideIndex, props.cells],
  )

  const handleDeleteChildComponent = useCallback(
    (componentId: string) => {
      let componentRemoved = false
      let updatedProps = localComponent?.props ? { ...localComponent.props } : {}

      if (localComponent?.props?.cells) {
        const updatedCells = localComponent.props.cells.map((row: any) =>
          row.map((cell: any) => {
            if (cell?.component?.id === componentId) {
              componentRemoved = true
              return {
                ...cell,
                component: null,
              }
            }
            return cell
          }),
        )

        if (componentRemoved) {
          updatedProps.cells = updatedCells
        }
      }

      if (!componentRemoved && localComponent?.props?.components) {
        const updatedComponents = localComponent.props.components.map((comp: any) => {
          if (comp?.id === componentId) {
            componentRemoved = true
            return null
          }
          return comp
        })

        if (componentRemoved) {
          updatedProps.components = updatedComponents
        }
      }

      if (componentRemoved && localComponent) {
        const newLocalComponent = {
          ...localComponent,
          props: updatedProps,
        }

        setLocalComponent(newLocalComponent)

        if (onUpdate) {
          onUpdate(updatedProps)
        }
      }

      if (deleteComponent) {
        const enhancedContext = {
          sectionId,
          containerId,
          rowId,
          colId,
          carouselId,
          slideIndex,
          parentGridId: gridId,
          parentComponentId: parentComponentId || containerId || gridId,
          source: 'grid-cell' as const,
          gridId: gridId,
          deletedFromGrid: componentRemoved,
        }

        deleteComponent(componentId, enhancedContext)
      }
    },
    [localComponent, onUpdate, deleteComponent, gridId, parentComponentId, containerId, sectionId, rowId, colId, carouselId, slideIndex],
  )

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (localComponent && sectionId && setSelectedComponent) {
        setSelectedComponent({
          sectionId,
          compId: gridId,
          component: localComponent,
        })
      }
    },
    [localComponent, sectionId, setSelectedComponent, gridId],
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (deleteComponent) {
        deleteComponent(gridId, {
          sectionId,
          containerId,
          rowId,
          colId,
          carouselId,
          slideIndex,
          source: 'grid-direct',
          isNestedSelection: !!carouselId,
          parentComponentId: parentComponentId || containerId,
          gridId: gridId,
        })
      }
    },
    [deleteComponent, gridId, sectionId, containerId, rowId, colId, carouselId, slideIndex, parentComponentId],
  )

  const parsedDataAttributes = useMemo(
    () => safeJsonParse<Record<string, string>>(componentProps.dataAttributes, {}),
    [componentProps.dataAttributes],
  )

  const parsedCustomCss = useMemo(
    () => safeJsonParse<Record<string, string | number>>(componentProps.customCSS, {}),
    [componentProps.customCSS],
  )

  const previewCardStyle = useMemo(
    (): React.CSSProperties => ({
      position: 'relative',
      width: '100%',
      margin: `${parsedMargin}px`,
      background: componentProps.backgroundColor && componentProps.backgroundColor !== 'transparent' ? componentProps.backgroundColor : '#13161e',
      border:
        componentProps.border && componentProps.border !== 'none'
          ? componentProps.border
          : '1px solid rgba(255,255,255,0.07)',
      borderRadius: `${componentProps.borderRadius && componentProps.borderRadius > 0 ? componentProps.borderRadius : 12}px`,
      overflow: 'hidden',
      boxSizing: 'border-box',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      ...parsedCustomCss,
    }),
    [parsedMargin, componentProps.backgroundColor, componentProps.border, componentProps.borderRadius, parsedCustomCss],
  )

  const previewBodyStyle = useMemo(
    (): React.CSSProperties => ({
      padding: `${parsedPadding}px ${Math.max(parsedPadding + 8, 18)}px`,
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      backgroundColor: '#13161e',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }),
    [parsedPadding],
  )

  const gridStyle = useMemo(
    (): React.CSSProperties => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${effectiveColumnsForDisplay}, 1fr)`,
      gridAutoRows: 'minmax(100px, auto)',
      gap: `${parsedGap}px`,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      minHeight: '150px',
    }),
    [effectiveColumnsForDisplay, parsedGap],
  )

  const gridConfig = useMemo(
    () => ({
      rows: parsedRows,
      columns: parsedColumns,
      totalCells: parsedColumns * parsedRows,
    }),
    [parsedRows, parsedColumns],
  )

  const getDroppableId = useCallback(
    (rowIndex: number, colIndex: number): string => {
      const actualGridId = gridId || localComponent?.id || id

      if (!actualGridId) {
        console.error('❌ No grid ID available for droppableId')
        return `component:empty:grid:unknown:${rowIndex}:${colIndex}`
      }

      const baseId = `component:empty:grid:${actualGridId}:${rowIndex}:${colIndex}`

      if (carouselId && slideIndex !== undefined) {
        return `${baseId}:carousel-${carouselId}:slide-${slideIndex}`
      }

      return baseId
    },
    [gridId, localComponent?.id, id, carouselId, slideIndex],
  )

  const gridCells = useMemo(() => {
    debugLog('🔄 NewGrid: Re-rendering gridCells - DEBUG:', {
      hasOnComponentSelect: !!onComponentSelect,
      onComponentSelectType: typeof onComponentSelect,
      gridId,
    });

    const cells = [];

    for (let rowIndex = 0; rowIndex < gridConfig.rows; rowIndex++) {
      for (let colIndex = 0; colIndex < gridConfig.columns; colIndex++) {
        const cellIndex = rowIndex * gridConfig.columns + colIndex;
        const droppableId = getDroppableId(rowIndex, colIndex);
        const cellComponent = getComponentFromCell(rowIndex, colIndex);

        cells.push(
          <GridCell
            key={`cell-${gridId}-${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
            cellIndex={cellIndex}
            droppableId={droppableId}
            component={cellComponent}
            // ✅✅✅ CRITICAL: Pass onComponentSelect FIXED HERE
            onComponentSelect={onComponentSelect}
            onComponentUpdate={onComponentUpdate}
            onComponentDuplicate={onComponentDuplicate}
            sectionId={sectionId}
            containerId={gridId}
            rowId={rowId || `slide-${slideIndex}`}
            colId={`grid-cell-${rowIndex}-${colIndex}`}
            carouselId={carouselId}
            slideIndex={slideIndex}
            setSelectedComponent={setSelectedComponent}
            deleteComponent={deleteComponent}
            onDeleteChildComponent={handleDeleteChildComponent}
            parentGridId={gridId}
          />
        );
      }
    }

    return cells;
  }, [
    gridConfig.rows,
    gridConfig.columns,
    getDroppableId,
    getComponentFromCell,
    gridId,
    // ✅✅✅ CRITICAL: onComponentSelect dependency add karo
    onComponentSelect,
    onComponentUpdate,
    onComponentDuplicate,
    sectionId,
    rowId,
    slideIndex,
    carouselId,
    setSelectedComponent,
    deleteComponent,
    handleDeleteChildComponent,
    localComponent?.props?.cells,
    propComponent?.props?.cells,
    props.cells,
    components,
  ])

  if (componentProps.visible === false) {
    return null
  }

  return (
    <div
      ref={gridRef}
      style={previewCardStyle}
      className={`new-grid-container cm-preview-grid relative group ${componentProps.className || ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.()
      }}
      data-grid-container="true"
      data-grid-id={gridId}
      data-parent-component-id={parentComponentId}
      data-carousel-id={carouselId}
      data-slide-index={slideIndex}
      id={componentProps.id || gridId}
      {...parsedDataAttributes}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: '#1a1d28',
        }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: 'rgba(124,109,250,0.12)',
            color: '#a594ff',
            padding: '2px 8px',
            borderRadius: '20px',
            border: '1px solid rgba(124,109,250,0.2)',
          }}>
          Advanced
        </span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e8eaf0' }}>Grid</span>
        <span
          style={{
            marginLeft: 'auto',
            color: '#5a5f7a',
            fontSize: '11.5px',
            fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}>
          {parsedColumns} cols · responsive
        </span>
      </div>

      <div style={previewBodyStyle}>
        <div style={gridStyle}>{gridCells}</div>
      </div>

      <div
        className="absolute top-2 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50"
        style={{ right: '10px' }}>
        <button
          onClick={handleEditClick}
          className="p-1 transition-colors"
          style={{
            background: '#13161e',
            color: '#8b90a8',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: '6px',
          }}
          title="Edit Grid">
          <Edit size={12} />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-1 transition-colors"
          style={{
            background: '#13161e',
            color: '#8b90a8',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRadius: '6px',
          }}
          title="Delete Grid">
          <Trash2 size={12} />
        </button>
      </div>

      <div
        style={{
          padding: '10px 16px 12px',
          fontSize: '11.5px',
          color: '#5a5f7a',
          background: '#1a1d28',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
        CSS Grid layout with configurable columns, gap, and responsive breakpoints.
        <span style={{ marginLeft: '8px', color: '#8b90a8', fontFamily: "'DM Mono', ui-monospace, monospace" }}>
          {parsedColumns}x{parsedRows} · {currentComponentsCount} components
        </span>
      </div>
    </div>
  )
}

;(NewGridComponent as any).schema = newGridContract.schema

export default NewGridComponent
export { NewGridComponent }

const gridPropsAreEqual = (prevProps: NewGridComponentProps, nextProps: NewGridComponentProps) => {
  if (prevProps.id !== nextProps.id) return false
  if (prevProps.component?.id !== nextProps.component?.id) return false
  if (prevProps.carouselId !== nextProps.carouselId) return false
  if (prevProps.slideIndex !== nextProps.slideIndex) return false
  if (prevProps.rows !== nextProps.rows) return false
  if (prevProps.columns !== nextProps.columns) return false
  if (prevProps.gap !== nextProps.gap) return false
  if (prevProps.padding !== nextProps.padding) return false
  if (prevProps.margin !== nextProps.margin) return false
  if (prevProps.backgroundColor !== nextProps.backgroundColor) return false
  if (prevProps.border !== nextProps.border) return false
  if (prevProps.borderRadius !== nextProps.borderRadius) return false
  if (prevProps.gridLineColor !== nextProps.gridLineColor) return false
  if (prevProps.justifyContent !== nextProps.justifyContent) return false
  if (prevProps.alignItems !== nextProps.alignItems) return false
  if (prevProps.parentComponentId !== nextProps.parentComponentId) return false
  if (prevProps.parentGridId !== nextProps.parentGridId) return false

  const prevP = prevProps.component?.props
  const nextP = nextProps.component?.props
  if (prevP !== nextP) {
    if (!prevP || !nextP) return false
    if (prevP.columns !== nextP.columns) return false
    if (prevP.rows !== nextP.rows) return false
    if (prevP.gap !== nextP.gap) return false
    if (prevP.padding !== nextP.padding) return false
    if (prevP.margin !== nextP.margin) return false
    if (prevP.backgroundColor !== nextP.backgroundColor) return false
    if (prevP.border !== nextP.border) return false
    if (prevP.borderRadius !== nextP.borderRadius) return false
    if (prevP.gridLineColor !== nextP.gridLineColor) return false
    if (prevP.justifyContent !== nextP.justifyContent) return false
    if (prevP.alignItems !== nextP.alignItems) return false
    if (prevP.layout?.columns !== nextP.layout?.columns) return false
    if (prevP.layout?.rows !== nextP.layout?.rows) return false
    if (prevP.layout?.gap !== nextP.layout?.gap) return false
    if (prevP.layout?.padding !== nextP.layout?.padding) return false
    if (prevP.layout?.margin !== nextP.layout?.margin) return false
    if (prevP.style?.backgroundColor !== nextP.style?.backgroundColor) return false
    if (prevP.style?.border !== nextP.style?.border) return false
    if (prevP.style?.borderRadius !== nextP.style?.borderRadius) return false
    if (prevP.responsive?.mobileColumns !== nextP.responsive?.mobileColumns) return false
    if (prevP.responsive?.tabletColumns !== nextP.responsive?.tabletColumns) return false
    if (prevP.responsive?.desktopColumns !== nextP.responsive?.desktopColumns) return false
  }

  // Check props.cells
  if (prevProps.cells !== nextProps.cells) {
    if (!prevProps.cells && !nextProps.cells) {
      // Both undefined/null, continue
    } else if (!prevProps.cells || !nextProps.cells) {
      return false
    } else if (prevProps.cells.length !== nextProps.cells.length) {
      return false
    } else {
      for (let i = 0; i < prevProps.cells.length; i++) {
        if (prevProps.cells[i].length !== nextProps.cells[i].length) return false
        for (let j = 0; j < prevProps.cells[i].length; j++) {
          const prevCell = prevProps.cells[i][j]
          const nextCell = nextProps.cells[i][j]

          if (!!prevCell?.component !== !!nextCell?.component) {
            return false
          }

          if (prevCell?.component && nextCell?.component) {
            if (prevCell.component.id !== nextCell.component.id) {
              return false
            }
          }
        }
      }
    }
  }

  const prevCells = prevProps.component?.props?.cells
  const nextCells = nextProps.component?.props?.cells

  if (prevCells !== nextCells) {
    if (!prevCells && !nextCells) {
      // Both undefined/null, continue
    } else if (!prevCells || !nextCells) {
      return false
    } else if (prevCells.length !== nextCells.length) {
      return false
    } else {
      for (let i = 0; i < prevCells.length; i++) {
        if (prevCells[i].length !== nextCells[i].length) return false
        for (let j = 0; j < prevCells[i].length; j++) {
          const prevCell = prevCells[i][j]
          const nextCell = nextCells[i][j]

          if (!!prevCell?.component !== !!nextCell?.component) {
            return false
          }

          if (prevCell?.component && nextCell?.component) {
            if (prevCell.component.id !== nextCell.component.id) {
              return false
            }

            const prevProps = prevCell.component.props || {}
            const nextProps = nextCell.component.props || {}

            if (JSON.stringify(prevProps) !== JSON.stringify(nextProps)) {
              return false
            }
          }
        }
      }
    }
  }

  if (prevProps.components !== nextProps.components) {
    const prevComponents = prevProps.components || []
    const nextComponents = nextProps.components || []

    if (prevComponents.length !== nextComponents.length) return false

    for (let i = 0; i < prevComponents.length; i++) {
      const prevComp = prevComponents[i]
      const nextComp = nextComponents[i]
      if (prevComp?.id !== nextComp?.id || prevComp?.type !== nextComp?.type) {
        return false
      }
    }
  }

  return true
}

export const MemoizedNewGrid = memo(NewGridComponent, gridPropsAreEqual)
MemoizedNewGrid.displayName = 'NewGrid'
;(MemoizedNewGrid as any).schema = newGridContract.schema
export { MemoizedNewGrid as NewGrid }
