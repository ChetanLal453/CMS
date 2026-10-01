'use client'

import React, { useMemo, useState } from 'react'
import {
  type AdvancedListViewModel,
  type AdvancedListResolvedItem,
} from '@uadmin/shared/blocks/advancedlist'
import * as FaIcons from 'react-icons/fa'
import * as Fa6Icons from 'react-icons/fa6'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

export interface AdvancedListProps {
  className?: string
  style?: React.CSSProperties
  __sharedViewModel?: AdvancedListViewModel
  [key: string]: any
}

function getResolvedIconComponent(iconComponentName: string) {
  return (
    (Fa6Icons as Record<string, React.ComponentType<{ size?: string | number; color?: string }>>)[iconComponentName] ||
    (FaIcons as Record<string, React.ComponentType<{ size?: string | number; color?: string }>>)[iconComponentName] ||
    FaIcons.FaStar
  )
}

function ListItemComponent({
  item,
  iconPosition,
}: {
  item: AdvancedListResolvedItem
  iconPosition: 'left' | 'right' | 'top'
}) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getIconContent = () => {
    switch (item.iconType) {
      case 'image': {
        if (item.resolvedIconImage && !imageError) {
          return (
            <img
              src={item.resolvedIconImage}
              alt=""
              onError={() => setImageError(true)}
              style={{
                width: item.iconStyle.fontSize,
                height: item.iconStyle.fontSize,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )
        }

        return <span>{item.resolvedIconText}</span>
      }
      case 'fontawesome': {
        const IconComponent = getResolvedIconComponent(item.resolvedIconComponentName)
        return <IconComponent size={item.iconStyle.fontSize} color={String(item.iconStyle.color)} />
      }
      default:
        return <span>{item.resolvedIconText}</span>
    }
  }

  return (
    <div
      style={isHovered ? item.hoveredItemStyle : item.baseItemStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {iconPosition !== 'right' ? <div style={item.iconStyle}>{getIconContent()}</div> : null}
      <div style={item.contentStyle}>
        <div style={item.titleStyle}>{item.title}</div>
        {item.description ? <div style={item.descriptionStyle}>{item.description}</div> : null}
      </div>
      {iconPosition === 'right' ? <div style={item.iconStyle}>{getIconContent()}</div> : null}
    </div>
  )
}

const AdvancedList: React.FC<AdvancedListProps> = ({
  className = '',
  style = {},
  renderComponent,
  __sharedViewModel,
}) => {
  const [isListHovered, setIsListHovered] = useState(false)
  void renderComponent
  const viewModel = useMemo(() => __sharedViewModel ?? null, [__sharedViewModel])

  if (!viewModel) {
    return reportCmsBoundaryViolation('advancedlist', 'Missing required shared view model.')
  }

  const containerStyle = {
    ...viewModel.containerStyle,
    ...(isListHovered ? viewModel.hoveredContainerStyle : {}),
    ...style,
  }

  if (viewModel.items.length === 0) {
    return (
      <div
        style={containerStyle}
        className={className}
        onMouseEnter={() => setIsListHovered(true)}
        onMouseLeave={() => setIsListHovered(false)}
      >
        <div style={viewModel.emptyStateStyle}>
          <p>No list items to display</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={containerStyle}
      className={className}
      onMouseEnter={() => setIsListHovered(true)}
      onMouseLeave={() => setIsListHovered(false)}
    >
      {viewModel.style.columns === 1 ? (
        <div style={viewModel.singleColumnStyle}>
          {viewModel.items.map((item) => (
            <ListItemComponent key={item.id} item={item} iconPosition={viewModel.style.iconPosition} />
          ))}
        </div>
      ) : (
        <div style={viewModel.gridStyle}>
          {viewModel.items.map((item) => (
            <div key={item.id} style={{ textAlign: viewModel.style.alignment }}>
              <ListItemComponent item={item} iconPosition={viewModel.style.iconPosition} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdvancedList
