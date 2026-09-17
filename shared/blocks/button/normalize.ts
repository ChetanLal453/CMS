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

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'boolean') return value
  const normalized = String(value).trim().toLowerCase()
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true
  if (['false', '0', 'no', 'off'].includes(normalized)) return false
  return Boolean(value)
}

function asNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseFloat(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

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

export function normalizeButton(props: Record<string, any> = {}): ButtonProps {
  const primaryColor = asString(props.primaryColor ?? props.backgroundColor, defaultButtonProps.primaryColor || '#7C6DFA')
  const width = asString(props.width, defaultButtonProps.width || 'auto')
  const fullWidth = asBoolean(props.fullWidth, width === '100%' ? true : defaultButtonProps.fullWidth ?? false)

  return {
    ...defaultButtonProps,
    ...props,
    text: asString(props.text, defaultButtonProps.text || 'Click Me'),
    link: asString(props.link, defaultButtonProps.link || '#'),
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
    alignment: asAlignment(props.alignment, defaultButtonProps.alignment || 'left'),
    fullWidth,
    width: fullWidth ? '100%' : width,
    marginTop: asString(props.marginTop, defaultButtonProps.marginTop || '0px'),
    marginRight: asString(props.marginRight, defaultButtonProps.marginRight || '0px'),
    marginBottom: asString(props.marginBottom, defaultButtonProps.marginBottom || '0px'),
    marginLeft: asString(props.marginLeft, defaultButtonProps.marginLeft || '0px'),
    paddingTop: asString(props.paddingTop, defaultButtonProps.paddingTop || '14px'),
    paddingRight: asString(props.paddingRight, defaultButtonProps.paddingRight || '28px'),
    paddingBottom: asString(props.paddingBottom, defaultButtonProps.paddingBottom || '14px'),
    paddingLeft: asString(props.paddingLeft, defaultButtonProps.paddingLeft || '28px'),
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
