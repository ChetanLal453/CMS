import { normalizeAdvancedAccordion } from './normalize'
import type { AdvancedAccordionInput, AdvancedAccordionViewModel } from './types'

export function createAdvancedAccordionViewModel(input: AdvancedAccordionInput = {}): AdvancedAccordionViewModel {
  const accordion = normalizeAdvancedAccordion(input)
  const sourceItems = accordion.content?.items ?? accordion.items

  return {
    items: sourceItems.filter((item) => item.visible !== false),
    behavior: accordion.interaction.behavior,
    allowAllClosed: accordion.interaction.allowAllClosed,
    iconPosition: accordion.interaction.iconPosition,
    icon: accordion.interaction.icon,
    activeIcon: accordion.interaction.activeIcon,
    animation: accordion.interaction.animation,
    animationDuration: accordion.interaction.animationDuration,
    containerStyle: {
      padding: accordion.style.padding,
      margin: accordion.style.margin,
      fontFamily: accordion.style.fontFamily,
      lineHeight: accordion.style.lineHeight,
      cursor: 'pointer',
      width: '100%',
      maxWidth: '520px',
    },
    itemStyle: {
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      background: '#13161e',
      marginBottom: accordion.style.itemSpacing,
      border: accordion.style.border,
      borderRadius: accordion.style.borderRadius,
    },
    headerStyle: {
      padding: '13px 16px',
      color: accordion.style.titleColor,
      backgroundColor: accordion.style.titleBackground,
      fontSize: accordion.style.titleFontSize,
      fontWeight: accordion.style.titleFontWeight,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      transition: 'all 0.2s ease',
      borderBottom: '1px solid transparent',
      fontFamily: accordion.style.fontFamily,
    },
    activeHeaderStyle: {
      color: accordion.style.activeTitleColor,
      backgroundColor: accordion.style.activeTitleBackground,
      borderBottom: '1px solid rgba(124,109,250,0.15)',
    },
    contentStyle: {
      backgroundColor: accordion.style.contentBackground,
      color: accordion.style.contentColor,
      fontSize: accordion.style.contentFontSize,
      overflow: 'hidden',
      transition: accordion.interaction.animation !== 'none' ? `all ${accordion.interaction.animationDuration}ms ease` : 'none',
    },
    titleStyle: {
      textAlign: 'left',
      lineHeight: 1.3,
    },
  }
}
