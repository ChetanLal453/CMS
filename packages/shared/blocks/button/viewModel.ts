import { normalizeButton } from './normalize'
import type { ButtonProps, ButtonShadow, ButtonSize, ButtonViewModel } from './types'
import { resolveActionHref } from '../../page/actionHelpers'

const SHADOW_MAP: Record<ButtonShadow, string> = {
  none: 'none',
  sm: '0 6px 14px rgba(15, 23, 42, 0.08)',
  md: '0 10px 24px rgba(15, 23, 42, 0.14)',
  lg: '0 18px 34px rgba(15, 23, 42, 0.18)',
  xl: '0 24px 42px rgba(15, 23, 42, 0.24)',
}

const SIZE_MAP: Record<ButtonSize, { fontSize: string; paddingY: string; paddingX: string }> = {
  small: { fontSize: '14px', paddingY: '10px', paddingX: '18px' },
  medium: { fontSize: '16px', paddingY: '14px', paddingX: '28px' },
  large: { fontSize: '18px', paddingY: '18px', paddingX: '36px' },
}

function getVariantColors(viewModel: ButtonProps) {
  const isDefaultPrimary = !viewModel.primaryColor || viewModel.primaryColor.toLowerCase() === '#7c6dfa'
  const isDefaultBg = !viewModel.backgroundColor || viewModel.backgroundColor.toLowerCase() === '#7c6dfa'
  const primary = (isDefaultPrimary && isDefaultBg)
    ? 'var(--theme-primary, #7C6DFA)'
    : (viewModel.primaryColor || viewModel.backgroundColor || '#7C6DFA')
  const textColor = viewModel.textColor || '#FFFFFF'
  const borderColor = viewModel.borderColor && viewModel.borderColor.toLowerCase() !== '#7c6dfa' ? viewModel.borderColor : primary

  const hasCustomBg = Boolean(viewModel.backgroundColor && viewModel.backgroundColor.toLowerCase() !== '#7c6dfa')
  const hasCustomBorder = Boolean(viewModel.borderColor && viewModel.borderColor.toLowerCase() !== '#7c6dfa')

  switch (viewModel.variant) {
    case 'secondary':
      return {
        backgroundColor: hasCustomBg ? viewModel.backgroundColor! : '#475569',
        color: viewModel.textColor ?? textColor,
        borderColor: hasCustomBorder ? viewModel.borderColor! : '#475569',
      }
    case 'outline':
      return {
        backgroundColor: hasCustomBg ? viewModel.backgroundColor! : 'transparent',
        color: viewModel.textColor ?? primary,
        borderColor: hasCustomBorder ? viewModel.borderColor! : borderColor,
      }
    case 'ghost':
      return {
        backgroundColor: hasCustomBg ? viewModel.backgroundColor! : 'transparent',
        color: viewModel.textColor ?? primary,
        borderColor: hasCustomBorder ? viewModel.borderColor! : 'transparent',
      }
    case 'danger':
      return {
        backgroundColor: hasCustomBg ? viewModel.backgroundColor! : '#dc2626',
        color: viewModel.textColor ?? '#ffffff',
        borderColor: hasCustomBorder ? viewModel.borderColor! : '#dc2626',
      }
    case 'success':
      return {
        backgroundColor: hasCustomBg ? viewModel.backgroundColor! : '#16a34a',
        color: viewModel.textColor ?? '#ffffff',
        borderColor: hasCustomBorder ? viewModel.borderColor! : '#16a34a',
      }
    case 'warning':
      return {
        backgroundColor: hasCustomBg ? viewModel.backgroundColor! : '#f59e0b',
        color: viewModel.textColor ?? '#111827',
        borderColor: hasCustomBorder ? viewModel.borderColor! : '#f59e0b',
      }
    case 'primary':
    default:
      return {
        backgroundColor: viewModel.backgroundColor ?? primary,
        color: viewModel.textColor ?? textColor,
        borderColor: viewModel.borderColor ?? borderColor,
      }
  }
}

function buildGradientBackground(props: ButtonProps) {
  if (!props.useGradient) {
    return undefined
  }

  const colors = String(props.gradientColors || '').trim()
  if (!colors) {
    return undefined
  }

  return props.gradientType === 'radial'
    ? `radial-gradient(circle, ${colors})`
    : `linear-gradient(${props.gradientDirection || '135deg'}, ${colors})`
}

function buildAnimation(type: ButtonProps['animationType'], duration: string) {
  if (type === 'pulse') return `cm-button-pulse ${duration} ease-in-out infinite`
  if (type === 'bounce') return `cm-button-bounce ${duration} ease-in-out infinite`
  if (type === 'fade-in') return `cm-button-fade-in ${duration} ease both`
  return 'none'
}

export function createButtonViewModel(props: Record<string, any> = {}): ButtonViewModel {
  const normalized = normalizeButton(props)
  const sizePreset = SIZE_MAP[normalized.size || 'medium']
  const variant = getVariantColors(normalized)
  const gradientBackground = buildGradientBackground(normalized)
  const rawLink = normalized.content?.link ?? normalized.link ?? ''
  const openInNewTab = Boolean(normalized.content?.openInNewTab ?? normalized.openInNewTab)
  const resolvedAction = resolveActionHref(props.action ?? normalized.action ?? rawLink, openInNewTab)
  const link = resolvedAction.href || rawLink
  const hasLink = Boolean(link.trim() && !normalized.disabled && !normalized.loading)
  const target = resolvedAction.target || (openInNewTab ? '_blank' : '_self')
  const rel = resolvedAction.rel || (openInNewTab ? 'noopener noreferrer' : undefined)
  const justifyContent = normalized.alignment === 'center' ? 'center' : normalized.alignment === 'right' ? 'flex-end' : 'flex-start'
  const hasCustomPadding = Boolean(
    normalized.paddingTop && (normalized.size === 'medium' || normalized.paddingTop !== '14px')
  )
  const hasCustomFontSize = Boolean(
    normalized.fontSize && (normalized.size === 'medium' || normalized.fontSize !== '16px')
  )

  const paddingTop = hasCustomPadding ? normalized.paddingTop! : sizePreset.paddingY
  const paddingRight = hasCustomPadding ? (normalized.paddingRight ?? sizePreset.paddingX) : sizePreset.paddingX
  const paddingBottom = hasCustomPadding ? (normalized.paddingBottom ?? sizePreset.paddingY) : sizePreset.paddingY
  const paddingLeft = hasCustomPadding ? (normalized.paddingLeft ?? sizePreset.paddingX) : sizePreset.paddingX

  return {
    ...normalized,
    link,
    openInNewTab,
    resolvedAction,
    hasLink,
    target,
    rel,
    label: normalized.loading
      ? (normalized.content?.loadingText || normalized.loadingText || 'Loading...')
      : (normalized.content?.text || normalized.text || 'Click Me'),
    resolvedClassName: `${normalized.className || normalized.customClass || ''}`.trim(),
    showIcon: Boolean(String(normalized.icon || '').trim()),
    iconName: normalized.icon || '',
    iconStyle: {
      fontSize: normalized.iconSize || '16px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: normalized.iconPosition === 'left' ? normalized.iconSpacing || '8px' : 0,
      marginLeft: normalized.iconPosition === 'right' ? normalized.iconSpacing || '8px' : 0,
      lineHeight: 1,
    },
    containerStyle: {
      display: 'flex',
      justifyContent,
      width: normalized.fullWidth ? '100%' : (normalized.width && normalized.width !== '100%' ? normalized.width : undefined),
      margin: normalized.margin || `${normalized.marginTop} ${normalized.marginRight} ${normalized.marginBottom} ${normalized.marginLeft}`,
    },
    buttonStyle: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: normalized.fullWidth ? '100%' : (normalized.width && normalized.width !== '100%' ? normalized.width : 'auto'),
      minWidth: normalized.fullWidth ? '100%' : undefined,
      maxWidth: normalized.fullWidth ? '100%' : undefined,
      gap: '0',
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      borderRadius: normalized.borderRadius && normalized.borderRadius !== '8px' ? normalized.borderRadius : 'var(--theme-radius, 8px)',
      borderWidth: normalized.borderWidth,
      borderStyle: 'solid',
      borderColor: variant.borderColor,
      background: gradientBackground || variant.backgroundColor,
      backgroundColor: gradientBackground ? undefined : variant.backgroundColor,
      color: variant.color,
      fontFamily: normalized.fontFamily && normalized.fontFamily !== "'DM Sans', system-ui, sans-serif" ? normalized.fontFamily : 'var(--theme-font-family, inherit)',
      fontSize: hasCustomFontSize ? normalized.fontSize! : sizePreset.fontSize,
      fontWeight: normalized.fontWeight,
      letterSpacing: normalized.letterSpacing,
      textTransform: normalized.textTransform,
      lineHeight: normalized.lineHeight,
      textDecoration: 'none',
      boxShadow: SHADOW_MAP[normalized.shadow || 'none'],
      cursor: normalized.disabled || normalized.loading ? 'not-allowed' : 'pointer',
      opacity: normalized.disabled ? 0.6 : 1,
      transition: `transform ${normalized.animationDuration}, box-shadow ${normalized.animationDuration}, background-color ${normalized.animationDuration}, color ${normalized.animationDuration}, opacity ${normalized.animationDuration}`,
      animation: buildAnimation(normalized.animationType, normalized.animationDuration || '0.3s'),
      position: 'relative',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    hoverStyle: {
      transform:
        normalized.hoverEffect === 'scale'
          ? `scale(${normalized.hoverScale || 1.05})`
          : normalized.hoverEffect === 'lift'
            ? 'translateY(-3px)'
            : 'none',
      boxShadow: normalized.hoverEffect === 'glow' || normalized.hoverEffect === 'lift' ? SHADOW_MAP[normalized.hoverShadow || 'lg'] : undefined,
      backgroundColor: !gradientBackground && normalized.hoverEffect === 'color-shift' ? normalized.hoverColor : undefined,
      filter: normalized.hoverEffect === 'glow' ? 'brightness(1.05)' : undefined,
    },
    activeStyle: {
      transform: 'translateY(1px)',
      backgroundColor: !gradientBackground ? normalized.activeColor : undefined,
      opacity: 0.92,
    },
    mobileStyle: {
      width: normalized.mobileFullWidth ? '100%' : undefined,
      display: normalized.hideOnMobile ? 'none' : undefined,
      fontSize: SIZE_MAP[normalized.mobileSize || normalized.size || 'medium'].fontSize,
    },
  }
}
