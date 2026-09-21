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
  CanonicalButtonContent,
  CanonicalButtonStyle,
  CanonicalButtonResponsive,
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

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

export function normalizeButton(props: Record<string, any> = {}): ButtonProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}
  const mobileInput = responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {}

  const text = asString(contentInput.text ?? props.text ?? props.label, defaultButtonProps.text || 'Click Me')
  const link = asString(contentInput.link ?? props.link ?? props.linkUrl ?? props.url ?? props.href, defaultButtonProps.link || '#')
  const linkUrl = link
  const openInNewTab = asBoolean(contentInput.openInNewTab ?? props.openInNewTab, defaultButtonProps.openInNewTab ?? false)
  const loadingText = asString(contentInput.loadingText ?? props.loadingText, defaultButtonProps.loadingText || 'Loading...')
  const ariaLabel = asString(contentInput.ariaLabel ?? props.ariaLabel, defaultButtonProps.ariaLabel || '')

  const primaryColor = asOptionalString(styleInput.primaryColor ?? props.primaryColor)

  const rawFullWidth =
    styleInput.fullWidth !== undefined && styleInput.fullWidth !== null
      ? asBoolean(styleInput.fullWidth, false)
      : props.fullWidth !== undefined && props.fullWidth !== null
        ? asBoolean(props.fullWidth, false)
        : undefined

  const rawWidth =
    styleInput.width !== undefined && styleInput.width !== null
      ? String(styleInput.width).trim()
      : props.width !== undefined && props.width !== null
        ? String(props.width).trim()
        : undefined

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

  const rawMargin =
    styleInput.margin !== undefined && styleInput.margin !== null
      ? String(styleInput.margin).trim()
      : props.margin !== undefined && props.margin !== null
        ? String(props.margin).trim()
        : undefined

  const defaultMarginBox = {
    top: defaultButtonProps.marginTop || '0px',
    right: defaultButtonProps.marginRight || '0px',
    bottom: defaultButtonProps.marginBottom || '0px',
    left: defaultButtonProps.marginLeft || '0px',
  }
  const parsedMargin = rawMargin ? parseBoxSpacing(rawMargin, defaultMarginBox) : defaultMarginBox

  const marginTop = asString(styleInput.marginTop ?? props.marginTop ?? parsedMargin.top, '0px')
  const marginRight = asString(styleInput.marginRight ?? props.marginRight ?? parsedMargin.right, '0px')
  const marginBottom = asString(styleInput.marginBottom ?? props.marginBottom ?? parsedMargin.bottom, '0px')
  const marginLeft = asString(styleInput.marginLeft ?? props.marginLeft ?? parsedMargin.left, '0px')
  const margin =
    rawMargin ??
    (styleInput.marginTop ||
    props.marginTop ||
    styleInput.marginRight ||
    props.marginRight ||
    styleInput.marginBottom ||
    props.marginBottom ||
    styleInput.marginLeft ||
    props.marginLeft
      ? `${marginTop} ${marginRight} ${marginBottom} ${marginLeft}`
      : defaultButtonProps.margin || '0px')

  const rawPadding =
    styleInput.padding !== undefined && styleInput.padding !== null
      ? String(styleInput.padding).trim()
      : props.padding !== undefined && props.padding !== null
        ? String(props.padding).trim()
        : undefined

  const defaultPaddingBox = {
    top: defaultButtonProps.paddingTop || '14px',
    right: defaultButtonProps.paddingRight || '28px',
    bottom: defaultButtonProps.paddingBottom || '14px',
    left: defaultButtonProps.paddingLeft || '28px',
  }
  const parsedPadding = rawPadding ? parseBoxSpacing(rawPadding, defaultPaddingBox) : defaultPaddingBox

  const paddingTop = asOptionalString(styleInput.paddingTop ?? props.paddingTop)
  const paddingRight = asOptionalString(styleInput.paddingRight ?? props.paddingRight)
  const paddingBottom = asOptionalString(styleInput.paddingBottom ?? props.paddingBottom)
  const paddingLeft = asOptionalString(styleInput.paddingLeft ?? props.paddingLeft)
  const padding = asOptionalString(rawPadding)

  const variant = asVariant(styleInput.variant ?? props.variant, defaultButtonProps.variant || 'primary')
  const size = asSize(styleInput.size ?? props.size, defaultButtonProps.size || 'medium')
  const backgroundColor = asOptionalString(styleInput.backgroundColor ?? props.backgroundColor)
  const textColor = asOptionalString(styleInput.textColor ?? props.textColor)
  const hoverColor = asOptionalString(styleInput.hoverColor ?? props.hoverColor)
  const activeColor = asOptionalString(styleInput.activeColor ?? props.activeColor)
  const borderColor = asOptionalString(styleInput.borderColor ?? props.borderColor)
  const useGradient = asBoolean(styleInput.useGradient ?? props.useGradient, defaultButtonProps.useGradient ?? false)
  const gradientColors = asString(styleInput.gradientColors ?? props.gradientColors, defaultButtonProps.gradientColors || '#7f00ff, #e100ff')
  const gradientDirection = asString(styleInput.gradientDirection ?? props.gradientDirection, defaultButtonProps.gradientDirection || '135deg')
  const gradientType = asGradientType(styleInput.gradientType ?? props.gradientType, defaultButtonProps.gradientType || 'linear')
  const borderRadius = asOptionalString(styleInput.borderRadius ?? props.borderRadius)
  const borderWidth = asOptionalString(styleInput.borderWidth ?? props.borderWidth)
  const shadow = asShadow(styleInput.shadow ?? props.shadow, defaultButtonProps.shadow || 'md')
  const alignment = asAlignment(styleInput.alignment ?? styleInput.textAlign ?? props.alignment ?? props.textAlign ?? props.align, defaultButtonProps.alignment || 'left')
  const textAlign = alignment
  const fontFamily = asOptionalString(styleInput.fontFamily ?? props.fontFamily)
  const fontSize = asOptionalString(styleInput.fontSize ?? props.fontSize)
  const fontWeight = asString(styleInput.fontWeight ?? props.fontWeight, defaultButtonProps.fontWeight || '600')
  const letterSpacing = asString(styleInput.letterSpacing ?? props.letterSpacing, defaultButtonProps.letterSpacing || '0px')
  const textTransform = asTextTransform(styleInput.textTransform ?? props.textTransform, defaultButtonProps.textTransform || 'none')
  const lineHeight = asString(styleInput.lineHeight ?? props.lineHeight, defaultButtonProps.lineHeight || '1.5')
  const icon = asString(styleInput.icon ?? props.icon, defaultButtonProps.icon || '')
  const iconPosition = asString(styleInput.iconPosition ?? props.iconPosition, defaultButtonProps.iconPosition || 'left') as ButtonProps['iconPosition']
  const iconSize = asString(styleInput.iconSize ?? props.iconSize, defaultButtonProps.iconSize || '16px')
  const iconSpacing = asString(styleInput.iconSpacing ?? props.iconSpacing, defaultButtonProps.iconSpacing || '8px')
  const disabled = asBoolean(styleInput.disabled ?? props.disabled, defaultButtonProps.disabled ?? false)
  const loading = asBoolean(styleInput.loading ?? props.loading, defaultButtonProps.loading ?? false)
  const hoverEffect = asHoverEffect(styleInput.hoverEffect ?? props.hoverEffect, defaultButtonProps.hoverEffect || 'scale')
  const hoverScale = asNumber(styleInput.hoverScale ?? props.hoverScale, defaultButtonProps.hoverScale || 1.05)
  const hoverShadow = asShadow(styleInput.hoverShadow ?? props.hoverShadow, defaultButtonProps.hoverShadow || 'lg')
  const animationType = asAnimationType(styleInput.animationType ?? props.animationType, defaultButtonProps.animationType || 'none')
  const animationDuration = asString(styleInput.animationDuration ?? props.animationDuration, defaultButtonProps.animationDuration || '0.3s')

  const mergedPropsForClass = { ...props, ...styleInput }
  const className = normalizeClassName(mergedPropsForClass)
  const customClass = className
  const customId = asString(styleInput.customId ?? props.customId, defaultButtonProps.customId || '')
  const onClick = asString(styleInput.onClick ?? props.onClick, defaultButtonProps.onClick || '')
  const dataTracking = asString(styleInput.dataTracking ?? props.dataTracking, defaultButtonProps.dataTracking || '')

  const mobileSize = asSize(mobileInput.size ?? props.mobileSize, defaultButtonProps.mobileSize || 'medium')
  const mobileFullWidth = asBoolean(mobileInput.fullWidth ?? props.mobileFullWidth, defaultButtonProps.mobileFullWidth ?? false)
  const hideOnMobile = asBoolean(mobileInput.hidden ?? props.hideOnMobile, defaultButtonProps.hideOnMobile ?? false)

  const content: CanonicalButtonContent = {
    text,
    link,
    openInNewTab,
    loadingText,
    ariaLabel,
  }

  const style: CanonicalButtonStyle = {
    variant,
    size,
    primaryColor,
    backgroundColor,
    textColor,
    hoverColor,
    activeColor,
    borderColor,
    useGradient,
    gradientColors,
    gradientDirection,
    gradientType,
    borderRadius,
    borderWidth,
    shadow,
    alignment,
    textAlign,
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
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    textTransform,
    lineHeight,
    icon,
    iconPosition,
    iconSize,
    iconSpacing,
    disabled,
    loading,
    hoverEffect,
    hoverScale,
    hoverShadow,
    animationType,
    animationDuration,
    className,
    customClass,
    customId,
    onClick,
    dataTracking,
  }

  const responsive: CanonicalButtonResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: {
      size: mobileSize,
      fullWidth: mobileFullWidth,
      hidden: hideOnMobile,
    },
  }

  return {
    ...defaultButtonProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    text,
    link,
    linkUrl,
    openInNewTab,
    variant,
    size,
    primaryColor,
    backgroundColor,
    textColor,
    hoverColor,
    activeColor,
    borderColor,
    useGradient,
    gradientColors,
    gradientDirection,
    gradientType,
    borderRadius,
    borderWidth,
    shadow,
    alignment,
    textAlign,
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
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    textTransform,
    lineHeight,
    icon,
    iconPosition,
    iconSize,
    iconSpacing,
    disabled,
    loading,
    loadingText,
    hoverEffect,
    hoverScale,
    hoverShadow,
    animationType,
    animationDuration,
    className,
    customClass,
    customId,
    ariaLabel,
    onClick,
    dataTracking,
    mobileSize,
    mobileFullWidth,
    hideOnMobile,
  }
}
