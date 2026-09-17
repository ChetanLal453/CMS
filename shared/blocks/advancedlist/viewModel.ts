import { normalizeAdvancedList } from './normalize'
import type { AdvancedListInput, AdvancedListResolvedItem, AdvancedListViewModel } from './types'
import { resolveAdminMediaUrl } from '../../page/adminUrls'

function getShadowStyle(shadowType: string | undefined) {
  switch (shadowType) {
    case 'sm':
      return { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
    case 'md':
      return { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }
    case 'lg':
      return { boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
    case 'xl':
      return { boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }
    default:
      return {}
  }
}

function resolveIconText(item: AdvancedListResolvedItem, listType: AdvancedListViewModel['listType'], defaultIcon: string, autoNumbering: boolean) {
  switch (listType) {
    case 'numbered':
      return String(autoNumbering ? item.resolvedIndex + 1 : item.iconNumber || item.resolvedIndex + 1)
    case 'bullet':
      return defaultIcon || '•'
    case 'custom':
    case 'icon':
    default:
      if (item.iconType === 'number') return String(item.iconNumber || item.resolvedIndex + 1)
      if (item.iconType === 'emoji') return item.iconEmoji || defaultIcon
      return defaultIcon
  }
}

function normalizeIconName(iconName: string) {
  return iconName
    .replace(/^fa6?-?/i, '')
    .replace(/^fas?-?/i, '')
    .replace(/^far?-?/i, '')
    .replace(/^fal?-?/i, '')
    .replace(/^fab?-?/i, '')
    .replace(/^fad?-?/i, '')
}

function resolveIconComponentName(iconName: string) {
  const raw = String(iconName).trim()
  const cleaned = normalizeIconName(raw)
  const pascal = cleaned
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  return cleaned
    ? `Fa${pascal}`
    : 'FaStar'
}

function getBaseItemStyle(list: ReturnType<typeof normalizeAdvancedList>) {
  return {
    padding: list.style.itemPadding,
    borderRadius: list.style.borderRadius,
    marginBottom: list.style.itemSpacing,
    display: 'flex',
    flexDirection: list.style.iconPosition === 'top' ? 'column' : 'row',
    alignItems: list.style.iconPosition === 'top' ? 'center' : 'flex-start',
    textAlign: list.style.iconPosition === 'top' ? 'center' : 'left',
    gap: '12px',
    transition: 'all 0.3s ease',
    width: '100%',
  }
}

function getResolvedItemStyle(baseStyle: ReturnType<typeof getBaseItemStyle>, list: ReturnType<typeof normalizeAdvancedList>, hovered = false) {
  switch (list.style.displayStyle) {
    case 'plain':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        border: 'none',
      }
    case 'bordered':
      return {
        ...baseStyle,
        backgroundColor: list.style.itemBackground,
        border: `${list.style.boxBorderWidth} solid ${list.style.boxBorderColor}`,
      }
    case 'boxed':
      return {
        ...baseStyle,
        backgroundColor: list.style.itemBackground,
        border: `${list.style.boxBorderWidth} solid ${list.style.boxBorderColor}`,
        ...getShadowStyle(hovered ? list.style.boxHoverShadow : list.style.boxShadow),
        transform: hovered ? 'translateY(-2px)' : 'none',
      }
    case 'full-box':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        border: 'none',
        marginBottom: list.style.itemSpacing,
        padding: '8px 0',
      }
    default:
      return baseStyle
  }
}

export function createAdvancedListViewModel(input: AdvancedListInput = {}): AdvancedListViewModel {
  const list = normalizeAdvancedList(input)
  const items = [...list.items]
    .filter((item) => item.visible !== false)
    .sort((a, b) => a.order - b.order)
    .map((item, index) => {
      const baseStyle = getBaseItemStyle(list)
      const resolved: AdvancedListResolvedItem = {
        ...item,
        resolvedIndex: index,
        resolvedIconText: '',
        resolvedIconComponentName: resolveIconComponentName(item.iconFontAwesome),
        resolvedIconImage: resolveAdminMediaUrl(item.iconImage),
        contentStyle: {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
        },
        titleStyle: {
          fontSize: list.style.titleFontSize,
          fontWeight: list.style.titleFontWeight,
          color: list.style.titleColor,
          margin: 0,
          padding: 0,
          lineHeight: list.style.lineHeight,
        },
        descriptionStyle: {
          fontSize: list.style.descriptionFontSize,
          color: list.style.descriptionColor,
          margin: '4px 0 0 0',
          padding: 0,
          lineHeight: list.style.lineHeight,
        },
        baseItemStyle: getResolvedItemStyle(baseStyle, list, false),
        hoveredItemStyle: getResolvedItemStyle(baseStyle, list, true),
        iconStyle: {
          color: list.style.iconColor,
          fontSize: list.style.iconSize,
          minWidth: list.style.iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
      }

      resolved.resolvedIconText = resolveIconText(resolved, list.listType, list.style.defaultIcon, list.style.autoNumbering)
      return resolved
    })

  return {
    items,
    listType: list.listType,
    style: list.style,
    containerStyle:
      list.style.displayStyle === 'full-box'
        ? {
            fontFamily: list.style.fontFamily,
            lineHeight: list.style.lineHeight,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            backgroundColor: list.style.fullBoxBackground || list.style.backgroundColor,
            padding: list.style.fullBoxPadding,
            margin: list.style.margin,
            border: list.style.fullBoxBorder,
            borderRadius: list.style.fullBoxBorderRadius,
            ...getShadowStyle(list.style.fullBoxShadow),
          }
        : {
            fontFamily: list.style.fontFamily,
            lineHeight: list.style.lineHeight,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            backgroundColor: list.style.backgroundColor,
            padding: list.style.padding,
            margin: list.style.margin,
            border: list.style.border,
            borderRadius: list.style.borderRadius,
          },
    hoveredContainerStyle:
      list.style.displayStyle === 'full-box'
        ? {
            transform: 'translateY(-2px)',
          }
        : {},
    gridStyle: {
      display: 'grid',
      gridTemplateColumns: `repeat(${list.style.columns}, 1fr)`,
      gap: list.style.gap,
      alignItems: 'flex-start',
    },
    singleColumnStyle: {
      textAlign: list.style.alignment,
      width: '100%',
    },
    emptyStateStyle: {
      padding: '16px',
      textAlign: 'center',
      color: '#6b7280',
      border: '1px dashed #d1d5db',
      borderRadius: '8px',
    },
    previewOverrides: {
      displayStyle: 'bordered',
      columns: 1,
      itemSpacing: '10px',
      gap: '12px',
      itemPadding: '12px 14px',
      padding: '0px',
      margin: '0px',
      alignment: 'left',
      titleFontSize: '13px',
      titleFontWeight: '600',
      descriptionFontSize: '12.5px',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      lineHeight: '1.65',
      titleColor: 'var(--canvas-text, #e8eaf0)',
      descriptionColor: 'var(--canvas-muted, #8b90a8)',
      iconColor: 'var(--canvas-accent2, #a594ff)',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      itemBackground: 'var(--canvas-surface2, #1a1d28)',
      boxBorderWidth: '1px',
      boxBorderColor: 'var(--canvas-border2, rgba(255,255,255,0.13))',
      defaultIcon: '•',
      iconSize: '16px',
    },
  }
}
