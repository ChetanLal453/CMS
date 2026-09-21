'use client'

import React, { useMemo } from 'react'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

function optionalString(value?: string) {
  return value && value !== '' ? value : undefined
}

interface NewGridComponentProps {
  id?: string
  className?: string
  renderComponent?: (component: any) => React.ReactNode
  __sharedViewModel?: {
    id?: string
    className?: string
    rows: number
    columns: number
    visible: boolean
    cells: Array<Array<{ component: any | null }>>
    pageLayoutStyle: React.CSSProperties
    dataAttributesObject: Record<string, string>
  }
  [key: string]: any
}

function renderNestedComponent(component: any, renderComponent?: (component: any) => React.ReactNode) {
  if (!component?.type) {
    throw new Error('NewGrid component is missing a block type.')
  }

  if (!renderComponent) {
    throw new Error('NewGrid component is missing the shared render boundary.')
  }

  return renderComponent(component)
}

const NewGridInner: React.FC<{
  viewModel: NonNullable<NewGridComponentProps['__sharedViewModel']>
  renderComponent?: NewGridComponentProps['renderComponent']
}> = ({ viewModel, renderComponent }) => {
  const gridCells = useMemo(() => {
    const cells: React.ReactNode[] = []

    for (let rowIndex = 0; rowIndex < viewModel.rows; rowIndex += 1) {
      for (let colIndex = 0; colIndex < viewModel.columns; colIndex += 1) {
        const row = viewModel.cells[rowIndex]
        const cell = row ? row[colIndex] : undefined
        const component = cell ? cell.component : null

        cells.push(
          <div
            key={`cell-${rowIndex}-${colIndex}`}
            style={{
              position: 'relative',
              overflow: 'visible',
              boxSizing: 'border-box',
              minHeight: 'auto',
              height: 'auto',
              width: '100%',
              minWidth: 0,
            }}
          >
            {component ? renderNestedComponent(component, renderComponent) : null}
          </div>,
        )
      }
    }

    return cells
  }, [renderComponent, viewModel.cells, viewModel.columns, viewModel.rows])

  if (!viewModel.visible) {
    return null
  }

  return (
    <div
      style={viewModel.pageLayoutStyle}
      className={`new-grid-container ${viewModel.className}`.trim()}
      id={optionalString(viewModel.id)}
      {...viewModel.dataAttributesObject}
    >
      {gridCells}
    </div>
  )
}

const NewGridComponent: React.FC<NewGridComponentProps> = (inputProps) => {
  const viewModel = inputProps.__sharedViewModel ?? null

  if (!viewModel) {
    return reportCmsBoundaryViolation('newgrid', 'Missing required shared view model.')
  }

  return <NewGridInner viewModel={viewModel} renderComponent={inputProps.renderComponent} />
}

export default NewGridComponent
