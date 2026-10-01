'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import * as FaIcons from 'react-icons/fa'
import * as Fa6Icons from 'react-icons/fa6'
import { defaultAdvancedListProps } from '@uadmin/shared/blocks/advancedlist/defaults'
import { createAdvancedListViewModel } from '@uadmin/shared/blocks/advancedlist/viewModel'
import { normalizeAdvancedList } from '@uadmin/shared/blocks/advancedlist/normalize'
import type { AdvancedListInput, AdvancedListItem as ListItem } from '@uadmin/shared/blocks/advancedlist/types'

export type AdvancedListProps = AdvancedListInput & {
  onUpdate?: (props: Record<string, any>) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  componentId?: string
  onSelect?: () => void
  [key: string]: any
}
const previewDefaultProps = {
  items: defaultAdvancedListProps.items,
  listType: defaultAdvancedListProps.listType,
  ...defaultAdvancedListProps.style,
}

// ==================== FONTAWESOME ICON HELPER ====================
const getFontAwesomeIcon = (iconName: string, size: string | number, color: string) => {
  if (!iconName) return null
  
  try {
    let cleanName = iconName.trim()
    
    // Remove prefixes
    if (cleanName.toLowerCase().startsWith('fa-')) {
      cleanName = cleanName.substring(3)
    }
    
    const prefixes = ['fas', 'far', 'fal', 'fab', 'fad', 'fa']
    prefixes.forEach(prefix => {
      if (cleanName.toLowerCase().startsWith(prefix + '-')) {
        cleanName = cleanName.substring(prefix.length + 1)
      }
    })
    
    // Convert to PascalCase
    const pascalName = cleanName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
    
    const iconVariations = [
      cleanName,
      pascalName,
      `Fa${pascalName}`,
      pascalName.replace(/^Fa/, ''),
      cleanName.toUpperCase(),
      pascalName.toUpperCase(),
    ]
    
    for (const variation of iconVariations) {
      const faName = variation.startsWith('Fa') ? variation : `Fa${variation}`
      
      if (Fa6Icons[faName as keyof typeof Fa6Icons]) {
        const IconComponent = Fa6Icons[faName as keyof typeof Fa6Icons]
        return (
          <IconComponent 
            size={typeof size === 'string' ? parseInt(size) : size} 
            color={color} 
          />
        )
      }
      
      if (FaIcons[faName as keyof typeof FaIcons]) {
        const IconComponent = FaIcons[faName as keyof typeof FaIcons]
        return (
          <IconComponent 
            size={typeof size === 'string' ? parseInt(size) : size} 
            color={color} 
          />
        )
      }
    }
    
    // Common icons fallback
    const commonIcons: Record<string, keyof typeof FaIcons> = {
      'home': 'FaHome',
      'user': 'FaUser',
      'star': 'FaStar',
      'heart': 'FaHeart',
      'check': 'FaCheck',
      'times': 'FaTimes',
      'bolt': 'FaBolt',
      'lock': 'FaLock',
      'phone': 'FaPhone',
      'envelope': 'FaEnvelope',
      'calendar': 'FaCalendar',
      'clock': 'FaClock',
      'cog': 'FaCog',
      'bell': 'FaBell',
      'search': 'FaSearch',
      'plus': 'FaPlus',
      'minus': 'FaMinus',
    }
    
    const lowerName = cleanName.toLowerCase()
    if (commonIcons[lowerName]) {
      const IconComponent = FaIcons[commonIcons[lowerName]]
      return (
        <IconComponent 
          size={typeof size === 'string' ? parseInt(size) : size} 
          color={color} 
        />
      )
    }
    
    return <FaIcons.FaQuestion size={typeof size === 'string' ? parseInt(size) : size} color={color} />
    
  } catch (error) {
    console.error('Error loading FontAwesome icon:', iconName, error)
    return null
  }
}

// ==================== SHADOW HELPER ====================
const getShadowStyle = (shadowType: string): React.CSSProperties => {
  switch (shadowType) {
    case 'none': return {}
    case 'sm': return { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
    case 'md': return { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
    case 'lg': return { boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
    case 'xl': return { boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }
    default: return {}
  }
}

const getHoverShadowStyle = (shadowType: string): React.CSSProperties => {
  switch (shadowType) {
    case 'none': return {}
    case 'sm': return { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
    case 'md': return { boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }
    case 'lg': return { boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }
    case 'xl': return { boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }
    default: return {}
  }
}

// ==================== LIST ITEM COMPONENT ====================
const ListItemComponent: React.FC<{
  item: ListItem
  index: number
  props: Omit<AdvancedListProps, 'onUpdate' | 'onComponentUpdate' | 'componentId' | 'onSelect'>
}> = ({ item, index, props }) => {
  const [iconImageError, setIconImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getIconContent = useCallback(() => {
    switch (props.listType) {
      case 'numbered':
        if (props.autoNumbering) {
          return <span>{index + 1}</span>
        }
        return <span>{item.iconNumber || index + 1}</span>
      
      case 'bullet':
        return <span>{props.defaultIcon || '•'}</span>
      
      case 'custom':
      case 'icon':
      default:
        switch (item.iconType) {
          case 'image':
            if (item.iconImage && !iconImageError) {
              return (
                <img 
                  src={item.iconImage} 
                  alt="" 
                  onError={() => setIconImageError(true)}
                  style={{
                    width: props.iconSize,
                    height: props.iconSize,
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              )
            }
            return <span>{props.defaultIcon}</span>
          
          case 'fontawesome':
            return getFontAwesomeIcon(item.iconFontAwesome, props.iconSize, props.iconColor)
          
          case 'number':
            return <span>{item.iconNumber || index + 1}</span>
          
          case 'emoji':
          default:
            return <span>{item.iconEmoji || props.defaultIcon}</span>
        }
    }
  }, [item, index, props, iconImageError])

  // Get item style based on displayStyle
  const getItemStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: props.itemPadding,
      borderRadius: props.borderRadius,
      marginBottom: props.itemSpacing,
      display: 'flex',
      flexDirection: props.iconPosition === 'top' ? 'column' : 'row',
      alignItems: props.iconPosition === 'top' ? 'center' : 'flex-start',
      textAlign: props.iconPosition === 'top' ? 'center' : 'left',
      gap: '12px',
      transition: 'all 0.3s ease',
      width: '100%',
    }

    // Different styles based on displayStyle
    switch (props.displayStyle) {
      case 'plain':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
        }
      
      case 'bordered':
        return {
          ...baseStyle,
          backgroundColor: props.itemBackground,
          border: `${props.boxBorderWidth} solid ${props.boxBorderColor}`,
        }
      
      case 'boxed':
        return {
          ...baseStyle,
          backgroundColor: props.itemBackground,
          border: `${props.boxBorderWidth} solid ${props.boxBorderColor}`,
          ...getShadowStyle(props.boxShadow),
          ...(isHovered && getHoverShadowStyle(props.boxHoverShadow)),
          transform: isHovered ? 'translateY(-2px)' : 'none',
        }
      
      case 'full-box':
        // In full-box mode, items have minimal styling
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
          marginBottom: props.itemSpacing,
          padding: '8px 0',
        }
      
      default:
        return baseStyle
    }
  }

  const itemStyle = getItemStyle()

  const iconStyle: React.CSSProperties = {
    color: props.iconColor,
    fontSize: props.iconSize,
    minWidth: props.iconSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: props.titleFontSize,
    fontWeight: props.titleFontWeight,
    color: props.titleColor,
    margin: 0,
    padding: 0,
    lineHeight: props.lineHeight,
    fontFamily: props.fontFamily,
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: props.descriptionFontSize,
    color: props.descriptionColor,
    margin: '4px 0 0 0',
    padding: 0,
    lineHeight: props.lineHeight,
    fontFamily: props.fontFamily,
  }

  return (
    <div 
      style={itemStyle} 
      className="advanced-list-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon based on position */}
      {props.iconPosition !== 'right' && (
        <div style={iconStyle} className="list-icon">
          {getIconContent()}
        </div>
      )}
      
      <div style={contentStyle} className="list-content">
        <div style={titleStyle} className="list-title">
          {item.title}
        </div>
        {item.description && (
          <div style={descriptionStyle} className="list-description">
            {item.description}
          </div>
        )}
      </div>
      
      {/* Icon on right side */}
      {props.iconPosition === 'right' && (
        <div style={iconStyle} className="list-icon">
          {getIconContent()}
        </div>
      )}
    </div>
  )
}

// ==================== MAIN COMPONENT ====================
const AdvancedList: React.FC<AdvancedListProps> = (props) => {
  const { 
    onUpdate, 
    onComponentUpdate, 
    componentId, 
    onSelect, 
    ...listProps 
  } = props

  const [isListHovered, setIsListHovered] = useState(false)
  const [isEditor, setIsEditor] = useState(false)
  const normalizedList = useMemo(() => normalizeAdvancedList(listProps), [listProps])
  const baseViewModel = useMemo(() => createAdvancedListViewModel(normalizedList), [normalizedList])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsEditor(Boolean(document.querySelector('.cm-page-editor')))
    }
  }, [])

  const resolvedListProps = useMemo(() => {
    const baseProps = {
      items: baseViewModel.items,
      listType: baseViewModel.listType,
      ...baseViewModel.style,
    }

    if (!isEditor) return baseProps

    const ifDefault = <T,>(value: T, originalDefault: T, previewValue: T): T => (value === originalDefault ? previewValue : value)

    return {
      ...baseProps,
      displayStyle: ifDefault(baseProps.displayStyle, previewDefaultProps.displayStyle, 'bordered' as const),
      columns: ifDefault(baseProps.columns, previewDefaultProps.columns, 1 as const),
      itemSpacing: ifDefault(baseProps.itemSpacing, previewDefaultProps.itemSpacing, '10px'),
      gap: ifDefault(baseProps.gap, previewDefaultProps.gap, '12px'),
      itemPadding: ifDefault(baseProps.itemPadding, previewDefaultProps.itemPadding, '12px 14px'),
      padding: ifDefault(baseProps.padding, previewDefaultProps.padding, '0px'),
      margin: ifDefault(baseProps.margin, previewDefaultProps.margin, '0px'),
      alignment: ifDefault(baseProps.alignment, previewDefaultProps.alignment, 'left' as const),
      titleFontSize: ifDefault(baseProps.titleFontSize, previewDefaultProps.titleFontSize, '13px'),
      titleFontWeight: ifDefault(baseProps.titleFontWeight, previewDefaultProps.titleFontWeight, '600'),
      descriptionFontSize: ifDefault(baseProps.descriptionFontSize, previewDefaultProps.descriptionFontSize, '12.5px'),
      fontFamily: ifDefault(baseProps.fontFamily, previewDefaultProps.fontFamily, "'DM Sans', system-ui, sans-serif"),
      lineHeight: ifDefault(baseProps.lineHeight, previewDefaultProps.lineHeight, '1.65'),
      titleColor: ifDefault(baseProps.titleColor, previewDefaultProps.titleColor, 'var(--canvas-text, #e8eaf0)'),
      descriptionColor: ifDefault(baseProps.descriptionColor, previewDefaultProps.descriptionColor, 'var(--canvas-muted, #8b90a8)'),
      iconColor: ifDefault(baseProps.iconColor, previewDefaultProps.iconColor, 'var(--canvas-accent2, #a594ff)'),
      backgroundColor: ifDefault(baseProps.backgroundColor, previewDefaultProps.backgroundColor, 'transparent'),
      border: ifDefault(baseProps.border, previewDefaultProps.border, 'none'),
      borderRadius: ifDefault(baseProps.borderRadius, previewDefaultProps.borderRadius, '8px'),
      itemBackground: ifDefault(baseProps.itemBackground, previewDefaultProps.itemBackground, 'var(--canvas-surface2, #1a1d28)'),
      boxBorderWidth: ifDefault(baseProps.boxBorderWidth, previewDefaultProps.boxBorderWidth, '1px'),
      boxBorderColor: ifDefault(baseProps.boxBorderColor, previewDefaultProps.boxBorderColor, 'var(--canvas-border2, rgba(255,255,255,0.13))'),
      defaultIcon: ifDefault(baseProps.defaultIcon, previewDefaultProps.defaultIcon, '•'),
      iconSize: ifDefault(baseProps.iconSize, previewDefaultProps.iconSize, '16px'),
    }
  }, [baseViewModel, isEditor])

  // Handle local updates
  const handleLocalUpdate = useCallback((updatedProps: Partial<AdvancedListProps>) => {
    if (onUpdate) {
      onUpdate(updatedProps)
    }
    if (onComponentUpdate && componentId) {
      onComponentUpdate(componentId, updatedProps)
    }
  }, [onUpdate, onComponentUpdate, componentId])

  // Handle click for selection
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect()
    }
  }, [onSelect])

  // Sort items by order
  const sortedItems = useMemo(() => {
    return [...resolvedListProps.items]
      .filter(item => item.visible !== false)
      .sort((a, b) => a.order - b.order)
  }, [resolvedListProps.items])

  // Get main list container style based on displayStyle
  const getListContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontFamily: resolvedListProps.fontFamily,
      lineHeight: resolvedListProps.lineHeight,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
    }

    switch (resolvedListProps.displayStyle) {
      case 'plain':
        return {
          ...baseStyle,
          backgroundColor: resolvedListProps.backgroundColor,
          padding: resolvedListProps.padding,
          margin: resolvedListProps.margin,
          border: resolvedListProps.border,
          borderRadius: resolvedListProps.borderRadius,
        }
      
      case 'boxed':
      case 'bordered':
        return {
          ...baseStyle,
          backgroundColor: resolvedListProps.backgroundColor,
          padding: resolvedListProps.padding,
          margin: resolvedListProps.margin,
          border: resolvedListProps.border,
          borderRadius: resolvedListProps.borderRadius,
        }
      
      case 'full-box':
        return {
          ...baseStyle,
          backgroundColor: resolvedListProps.fullBoxBackground || resolvedListProps.backgroundColor,
          padding: resolvedListProps.fullBoxPadding,
          margin: resolvedListProps.margin,
          border: resolvedListProps.fullBoxBorder,
          borderRadius: resolvedListProps.fullBoxBorderRadius,
          ...getShadowStyle(resolvedListProps.fullBoxShadow),
          ...(isListHovered && { transform: 'translateY(-2px)' }),
        }
      
      default:
        return baseStyle
    }
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${resolvedListProps.columns}, 1fr)`,
    gap: resolvedListProps.gap,
    alignItems: 'flex-start',
  }

  // Single column alignment
  const singleColumnStyle: React.CSSProperties = {
    textAlign: resolvedListProps.alignment,
    width: '100%',
  }

  if (sortedItems.length === 0) {
    return (
      <div 
        style={getListContainerStyle()} 
        className="list-empty-state p-4 text-center text-gray-500 border border-dashed rounded-lg"
        onClick={handleClick}
        onMouseEnter={() => setIsListHovered(true)}
        onMouseLeave={() => setIsListHovered(false)}
      >
        <p>No list items to display. Add some items in the editor.</p>
      </div>
    )
  }

  // Render different layouts
  const renderListContent = () => {
    if (resolvedListProps.columns === 1) {
      return (
        <div style={singleColumnStyle}>
          {sortedItems.map((item, index) => (
            <ListItemComponent
              key={item.id}
              item={item}
              index={index}
              props={resolvedListProps}
            />
          ))}
        </div>
      )
    } else {
      return (
        <div style={gridStyle}>
          {sortedItems.map((item, index) => (
            <div key={item.id} style={{ textAlign: resolvedListProps.alignment }}>
              <ListItemComponent
                item={item}
                index={index}
                props={resolvedListProps}
              />
            </div>
          ))}
        </div>
      )
    }
  }

  const listNode = (
    <div 
      style={getListContainerStyle()} 
      className="advanced-list"
      onClick={handleClick}
      onMouseEnter={() => setIsListHovered(true)}
      onMouseLeave={() => setIsListHovered(false)}
    >
      {renderListContent()}
    </div>
  )

  if (isEditor) {
    const previewCardStyle: React.CSSProperties = {
      width: '100%',
      borderRadius: '12px',
      border: '1px solid var(--canvas-border, rgba(255,255,255,0.07))',
      overflow: 'hidden',
      background: 'var(--canvas-surface, #13161e)',
    }
    const previewHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      background: 'var(--canvas-surface2, #1a1d28)',
      borderBottom: '1px solid var(--canvas-border, rgba(255,255,255,0.07))',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }
    const previewBodyStyle: React.CSSProperties = {
      padding: '32px 40px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: resolvedListProps.alignment === 'center' ? 'center' : resolvedListProps.alignment === 'right' ? 'flex-end' : 'flex-start',
      minHeight: '120px',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
    }

    return (
      <div style={{ width: '100%' }} onClick={handleClick}>
        <div style={previewCardStyle}>
          <div style={previewHeaderStyle}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--canvas-accent2, #a594ff)',
                background: 'var(--canvas-accentbg, rgba(124,109,250,0.12))',
                border: '1px solid rgba(124,109,250,0.2)',
                padding: '2px 8px',
                borderRadius: '20px',
              }}
            >
              Content
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--canvas-text, #e8eaf0)' }}>List</span>
            <span style={{ marginLeft: 'auto', fontSize: '11.5px', color: 'var(--canvas-text3, #5a5f7a)', fontFamily: "'DM Mono', monospace" }}>
              {`${resolvedListProps.listType} · ${resolvedListProps.columns} col`}
            </span>
          </div>
          <div style={previewBodyStyle}>{listNode}</div>
        </div>
      </div>
    )
  }

  return listNode
}

export default AdvancedList
