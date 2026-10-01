'use client'

import React, { useCallback, memo, forwardRef } from 'react'
import { LayoutComponent } from '@/types/page-editor'
import { getAdminComponent, resolveBlockType } from '@uadmin/shared/blocks/registry'

interface DynamicComponentProps {
  component: LayoutComponent
  isSelected: boolean
  onSelect?: () => void
  onUpdate: (newProps: Record<string, any>) => void
  editing?: boolean
  onComponentSelect?: (
    component: LayoutComponent,
    context: {
      sectionId: string
      containerId: string
      rowId: string
      colId: string
      carouselId?: string
      slideIndex?: number
      gridId?: string
      cellRow?: number
      cellCol?: number
      source?: 'grid-cell' | 'carousel-direct' | 'slide'
      isNestedSelection?: boolean
      parentComponentId?: string
      parentGridId?: string
    },
  ) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  draggableProps?: any
  dragHandleProps?: any
  onDragEnd?: (result: any, draggedItem: any) => void
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  carouselId?: string
  slideIndex?: number
  gridId?: string
  cellRow?: number
  cellCol?: number
  parentGridId?: string
  setSelectedComponent?: (component: { sectionId: string; compId: string; component: LayoutComponent }) => void
  deleteComponent?: (componentId: string, context?: any) => void
  onDelete?: (componentId: string, context?: any) => void
  layout?: any
  setLayout?: (layout: any) => void
  parentComponentId?: string
}

const DynamicComponentInner = memo(
  forwardRef<HTMLDivElement, DynamicComponentProps>(function DynamicComponentInner(
    {
      component,
      isSelected,
      onSelect,
      onUpdate,
      editing = false,
      onComponentSelect,
      onComponentUpdate,
      draggableProps,
      dragHandleProps,
      onDragEnd,
      sectionId = '',
      containerId = '',
      rowId = '',
      colId = '',
      carouselId,
      slideIndex,
      gridId,
      cellRow,
      cellCol,
      setSelectedComponent,
      deleteComponent,
      onDelete,
      layout,
      setLayout,
      parentComponentId,
      parentGridId,
    },
    ref,
  ) {
    const createComponentContext = useCallback(
      (
        sectionIdValue: string,
        containerIdValue: string,
        rowIdValue: string,
        colIdValue: string,
        carouselIdValue?: string,
        slideIndexValue?: number,
        gridIdValue?: string,
        cellRowValue?: number,
        cellColValue?: number,
        parentGridIdValue?: string,
      ) => ({
        sectionId: sectionIdValue,
        containerId: containerIdValue,
        rowId: rowIdValue,
        colId: colIdValue,
        carouselId: carouselIdValue,
        slideIndex: slideIndexValue,
        gridId: gridIdValue || parentGridIdValue,
        cellRow: cellRowValue,
        cellCol: cellColValue,
        source: gridIdValue ? ('grid-cell' as const) : carouselIdValue ? ('carousel-direct' as const) : undefined,
        isNestedSelection: Boolean(gridIdValue || carouselIdValue),
        parentComponentId: containerIdValue,
        parentGridId: parentGridIdValue,
      }),
      [],
    )

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation()

        if (onComponentSelect) {
          onComponentSelect(
            component,
            createComponentContext(sectionId, containerId, rowId, colId, carouselId, slideIndex, gridId, cellRow, cellCol, parentGridId),
          )
        }

        onSelect?.()
      },
      [onComponentSelect, component, createComponentContext, sectionId, containerId, rowId, colId, carouselId, slideIndex, gridId, cellRow, cellCol, parentGridId, onSelect],
    )

    const handleUpdate = useCallback(
      (newProps: Record<string, any>) => {
        onUpdate(newProps)
        onComponentUpdate?.(component.id, newProps)
      },
      [onUpdate, onComponentUpdate, component.id],
    )

    const handleSelectForComponents = useCallback(() => {
      if (onComponentSelect) {
        onComponentSelect(
          component,
          createComponentContext(sectionId, containerId, rowId, colId, carouselId, slideIndex, gridId, cellRow, cellCol, parentGridId),
        )
      }

      onSelect?.()
    }, [onComponentSelect, component, createComponentContext, sectionId, containerId, rowId, colId, carouselId, slideIndex, gridId, cellRow, cellCol, parentGridId, onSelect])

    const handleDeleteForComponents = useCallback(() => {
      if (onDelete) {
        onDelete(component.id)
        return
      }

      deleteComponent?.(component.id)
    }, [onDelete, deleteComponent, component.id])

    const componentType = resolveBlockType(component.type) || component.type
    const AdminComponent = getAdminComponent(componentType)

    return (
      <div
        ref={ref}
        data-selected={isSelected}
        className={`component-shell relative w-full max-w-full h-auto overflow-x-hidden transition-all duration-200 ${isSelected ? 'is-selected' : ''}`}
        onClick={handleClick}
        {...draggableProps}
        {...dragHandleProps}>
        <AdminComponent
          {...(component.props || {})}
          component={component}
          componentId={component.id}
          isSelected={isSelected}
          editing={editing}
          onUpdate={handleUpdate}
          onSelect={handleSelectForComponents}
          onComponentSelect={onComponentSelect}
          onComponentUpdate={onComponentUpdate}
          onDelete={handleDeleteForComponents}
          deleteComponent={deleteComponent}
          sectionId={sectionId}
          containerId={containerId}
          rowId={rowId}
          colId={colId}
          carouselId={carouselId}
          slideIndex={slideIndex}
          gridId={gridId}
          cellRow={cellRow}
          cellCol={cellCol}
          setSelectedComponent={setSelectedComponent}
          layout={layout}
          setLayout={setLayout}
          parentComponentId={parentComponentId}
          parentGridId={parentGridId}
          onDragEnd={onDragEnd}
        />

        {isSelected && (
          <div className="component-selected-badge absolute -top-3 right-2 px-2 py-0.5 bg-indigo-600 text-[10px] font-semibold text-white rounded-full flex items-center shadow z-30 pointer-events-none capitalize">
            {componentType}
          </div>
        )}
      </div>
    )
  }),
)

export const DynamicComponent = DynamicComponentInner
