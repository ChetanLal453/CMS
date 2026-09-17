import { normalizeButton } from './normalize'
import type { ButtonProps, ButtonShadow, ButtonSize, ButtonViewModel } from './types'

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
  const primary = viewModel.primaryColor || viewModel.backgroundColor || '#7C6DFA'
  const textColor = viewModel.textColor || '#FFFFFF'
  const borderColor = viewModel.borderColor || primary

  switch (viewModel.variant) {
    case 'secondary':
      return { backgroundColor: viewModel.backgroundColor || '#475569', color: textColor, borderColor: borderColor || '#475569' }
    case 'outline':
      return { backgroundColor: 'transparent', color: textColor || primary, borderColor }
    case 'ghost':
      return { backgroundColor: 'transparent', color: textColor || primary, borderColor: 'transparent' }
    case 'danger':
      return { backgroundColor: viewModel.backgroundColor || '#dc2626', color: '#ffffff', borderColor: viewModel.borderColor || '#dc2626' }
    case 'success':
      return { backgroundColor: viewModel.backgroundColor || '#16a34a', color: '#ffffff', borderColor: viewModel.borderColor || '#16a34a' }
    case 'warning':
      return { backgroundColor: viewModel.backgroundColor || '#f59e0b', color: '#111827', borderColor: viewModel.borderColor || '#f59e0b' }
    case 'primary':
    default:
      return { backgroundColor: primary, color: textColor, borderColor }
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
  const hasLink = Boolean(normalized.link && normalized.link.trim() && !normalized.disabled && !normalized.loading)
  const target = normalized.openInNewTab ? '_blank' : '_self'
  const justifyContent = normalized.alignment === 'center' ? 'center' : normalized.alignment === 'right' ? 'flex-end' : 'flex-start'
  const paddingTop = normalized.paddingTop || sizePreset.paddingY
  const paddingRight = normalized.paddingRight || sizePreset.paddingX
  const paddingBottom = normalized.paddingBottom || sizePreset.paddingY
  const paddingLeft = normalized.paddingLeft || sizePreset.paddingX

  return {
    ...normalized,
    hasLink,
    target,
    rel: normalized.openInNewTab ? 'noopener noreferrer' : undefined,
    label: normalized.loading ? normalized.loadingText || 'Loading...' : normalized.text || 'Click Me',
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
      width: '100%',
      margin: `${normalized.marginTop} ${normalized.marginRight} ${normalized.marginBottom} ${normalized.marginLeft}`,
    },
    buttonStyle: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: normalized.fullWidth ? '100%' : normalized.width || 'auto',
      minWidth: normalized.fullWidth ? '100%' : undefined,
      gap: '0',
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      borderRadius: normalized.borderRadius,
      borderWidth: normalized.borderWidth,
      borderStyle: 'solid',
      borderColor: variant.borderColor,
      background: gradientBackground || variant.backgroundColor,
      backgroundColor: gradientBackground ? undefined : variant.backgroundColor,
      color: variant.color,
      fontFamily: normalized.fontFamily,
      fontSize: normalized.fontSize || sizePreset.fontSize,
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
