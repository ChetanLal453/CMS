import { defaultButtonProps } from './defaults'
import type {
  ButtonAlignment,
  ButtonAnimationType,
  ButtonGradientType,
  ButtonHoverEffect,
  ButtonProps,
  ButtonShadow,
  ButtonSize,
  ButtonTextTransform,
  ButtonVariant,
} from './types'
import { asString, asBoolean, asNumber } from '../../utils/merge'

function asVariant(value: unknown, fallback: ButtonVariant): ButtonVariant {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning'].includes(normalized)) {
    return normalized as ButtonVariant
  }
  return fallback
}

function asAlignment(value: unknown, fallback: ButtonAlignment): ButtonAlignment {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'left' || normalized === 'center' || normalized === 'right') return normalized
  return fallback
}

function asSize(value: unknown, fallback: ButtonSize): ButtonSize {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'small' || normalized === 'medium' || normalized === 'large') return normalized
  return fallback
}

function asShadow(value: unknown, fallback: ButtonShadow): ButtonShadow {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['none', 'sm', 'md', 'lg', 'xl'].includes(normalized)) return normalized as ButtonShadow
  return fallback
}

function asHoverEffect(value: unknown, fallback: ButtonHoverEffect): ButtonHoverEffect {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['none', 'scale', 'lift', 'glow', 'color-shift'].includes(normalized)) return normalized as ButtonHoverEffect
  return fallback
}

function asAnimationType(value: unknown, fallback: ButtonAnimationType): ButtonAnimationType {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['none', 'pulse', 'bounce', 'fade-in'].includes(normalized)) return normalized as ButtonAnimationType
  return fallback
}

function asGradientType(value: unknown, fallback: ButtonGradientType): ButtonGradientType {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'linear' || normalized === 'radial') return normalized
  return fallback
}

function asTextTransform(value: unknown, fallback: ButtonTextTransform): ButtonTextTransform {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['none', 'uppercase', 'lowercase', 'capitalize'].includes(normalized)) return normalized as ButtonTextTransform
  return fallback
}

function normalizeClassName(props: Record<string, any>) {
  return asString(props.className ?? props.customClass, defaultButtonProps.className || '')
}

function parseBoxSpacing(val: unknown, fallback: { top: string; right: string; bottom: string; left: string }) {
  if (!val || typeof val !== 'string') return fallback
  const parts = val.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  }
  if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  }
  if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  }
  if (parts.length >= 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
  }
  return fallback
}

export function normalizeButton(props: Record<string, any> = {}): ButtonProps {
  const primaryColor = asString(props.primaryColor ?? props.backgroundColor, defaultButtonProps.primaryColor || '#7C6DFA')

  const rawFullWidth = props.fullWidth !== undefined && props.fullWidth !== null ? asBoolean(props.fullWidth, false) : undefined
  const rawWidth = props.width !== undefined && props.width !== null ? String(props.width).trim() : undefined

  let fullWidth = false
  let width = 'auto'

  if (rawFullWidth !== undefined) {
    fullWidth = rawFullWidth
    if (fullWidth) {
      width = '100%'
    } else {
      width = rawWidth && rawWidth !== '100%' ? rawWidth : 'auto'
    }
  } else if (rawWidth !== undefined) {
    if (rawWidth === '100%') {
      fullWidth = true
      width = '100%'
    } else {
      fullWidth = false
      width = rawWidth || 'auto'
    }
  } else {
    fullWidth = defaultButtonProps.fullWidth ?? false
    width = defaultButtonProps.width || 'auto'
  }

  const rawMargin = props.margin !== undefined && props.margin !== null ? String(props.margin).trim() : undefined
  const defaultMarginBox = {
    top: defaultButtonProps.marginTop || '0px',
    right: defaultButtonProps.marginRight || '0px',
    bottom: defaultButtonProps.marginBottom || '0px',
    left: defaultButtonProps.marginLeft || '0px',
  }
  const parsedMargin = rawMargin ? parseBoxSpacing(rawMargin, defaultMarginBox) : defaultMarginBox

  const marginTop = asString(props.marginTop ?? parsedMargin.top, '0px')
  const marginRight = asString(props.marginRight ?? parsedMargin.right, '0px')
  const marginBottom = asString(props.marginBottom ?? parsedMargin.bottom, '0px')
  const marginLeft = asString(props.marginLeft ?? parsedMargin.left, '0px')
  const margin = rawMargin ?? (props.marginTop || props.marginRight || props.marginBottom || props.marginLeft
    ? `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`
    : defaultButtonProps.margin || '0px')

  const rawPadding = props.padding !== undefined && props.padding !== null ? String(props.padding).trim() : undefined
  const defaultPaddingBox = {
    top: defaultButtonProps.paddingTop || '14px',
    right: defaultButtonProps.paddingRight || '28px',
    bottom: defaultButtonProps.paddingBottom || '14px',
    left: defaultButtonProps.paddingLeft || '28px',
  }
  const parsedPadding = rawPadding ? parseBoxSpacing(rawPadding, defaultPaddingBox) : defaultPaddingBox

  const paddingTop = asString(props.paddingTop ?? parsedPadding.top, '14px')
  const paddingRight = asString(props.paddingRight ?? parsedPadding.right, '28px')
  const paddingBottom = asString(props.paddingBottom ?? parsedPadding.bottom, '14px')
  const paddingLeft = asString(props.paddingLeft ?? parsedPadding.left, '28px')
  const padding = rawPadding ?? (props.paddingTop || props.paddingRight || props.paddingBottom || props.paddingLeft
    ? `${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft}`
    : defaultButtonProps.padding || '14px 28px')

  return {
    ...defaultButtonProps,
    ...props,
    text: asString(props.text ?? props.label, defaultButtonProps.text || 'Click Me'),
    link: asString(props.link ?? props.linkUrl ?? props.url ?? props.href, defaultButtonProps.link || '#'),
    linkUrl: asString(props.linkUrl ?? props.link ?? props.url ?? props.href, defaultButtonProps.link || '#'),
    openInNewTab: asBoolean(props.openInNewTab, defaultButtonProps.openInNewTab ?? false),
    variant: asVariant(props.variant, defaultButtonProps.variant || 'primary'),
    size: asSize(props.size, defaultButtonProps.size || 'medium'),
    primaryColor,
    backgroundColor: asString(props.backgroundColor ?? primaryColor, defaultButtonProps.backgroundColor || primaryColor),
    textColor: asString(props.textColor, defaultButtonProps.textColor || '#FFFFFF'),
    hoverColor: asString(props.hoverColor, defaultButtonProps.hoverColor || '#A594FF'),
    activeColor: asString(props.activeColor, defaultButtonProps.activeColor || '#6A5AE5'),
    borderColor: asString(props.borderColor ?? primaryColor, defaultButtonProps.borderColor || primaryColor),
    useGradient: asBoolean(props.useGradient, defaultButtonProps.useGradient ?? false),
    gradientColors: asString(props.gradientColors, defaultButtonProps.gradientColors || '#7f00ff, #e100ff'),
    gradientDirection: asString(props.gradientDirection, defaultButtonProps.gradientDirection || '135deg'),
    gradientType: asGradientType(props.gradientType, defaultButtonProps.gradientType || 'linear'),
    borderRadius: asString(props.borderRadius, defaultButtonProps.borderRadius || '8px'),
    borderWidth: asString(props.borderWidth, defaultButtonProps.borderWidth || '2px'),
    shadow: asShadow(props.shadow, defaultButtonProps.shadow || 'md'),
    alignment: asAlignment(props.alignment ?? props.textAlign ?? props.align, defaultButtonProps.alignment || 'left'),
    textAlign: asAlignment(props.textAlign ?? props.alignment ?? props.align, defaultButtonProps.alignment || 'left'),
    fullWidth,
    width,
    margin,
    padding,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    fontFamily: asString(props.fontFamily, defaultButtonProps.fontFamily || 'inherit'),
    fontSize: asString(props.fontSize, defaultButtonProps.fontSize || '16px'),
    fontWeight: asString(props.fontWeight, defaultButtonProps.fontWeight || '600'),
    letterSpacing: asString(props.letterSpacing, defaultButtonProps.letterSpacing || '0px'),
    textTransform: asTextTransform(props.textTransform, defaultButtonProps.textTransform || 'none'),
    lineHeight: asString(props.lineHeight, defaultButtonProps.lineHeight || '1.5'),
    icon: asString(props.icon, defaultButtonProps.icon || ''),
    iconPosition: asString(props.iconPosition, defaultButtonProps.iconPosition || 'left') as ButtonProps['iconPosition'],
    iconSize: asString(props.iconSize, defaultButtonProps.iconSize || '16px'),
    iconSpacing: asString(props.iconSpacing, defaultButtonProps.iconSpacing || '8px'),
    disabled: asBoolean(props.disabled, defaultButtonProps.disabled ?? false),
    loading: asBoolean(props.loading, defaultButtonProps.loading ?? false),
    loadingText: asString(props.loadingText, defaultButtonProps.loadingText || 'Loading...'),
    hoverEffect: asHoverEffect(props.hoverEffect, defaultButtonProps.hoverEffect || 'scale'),
    hoverScale: asNumber(props.hoverScale, defaultButtonProps.hoverScale || 1.05),
    hoverShadow: asShadow(props.hoverShadow, defaultButtonProps.hoverShadow || 'lg'),
    animationType: asAnimationType(props.animationType, defaultButtonProps.animationType || 'none'),
    animationDuration: asString(props.animationDuration, defaultButtonProps.animationDuration || '0.3s'),
    className: normalizeClassName(props),
    customClass: normalizeClassName(props),
    customId: asString(props.customId, defaultButtonProps.customId || ''),
    ariaLabel: asString(props.ariaLabel, defaultButtonProps.ariaLabel || ''),
    onClick: asString(props.onClick, defaultButtonProps.onClick || ''),
    dataTracking: asString(props.dataTracking, defaultButtonProps.dataTracking || ''),
    mobileSize: asSize(props.mobileSize, defaultButtonProps.mobileSize || 'medium'),
    mobileFullWidth: asBoolean(props.mobileFullWidth, defaultButtonProps.mobileFullWidth ?? false),
    hideOnMobile: asBoolean(props.hideOnMobile, defaultButtonProps.hideOnMobile ?? false),
  }
}
