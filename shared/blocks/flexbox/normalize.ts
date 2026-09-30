import { defaultFlexboxProps } from './defaults'
import type {
  CanonicalFlexboxContent,
  CanonicalFlexboxProps,
  CanonicalFlexboxResponsive,
  CanonicalFlexboxStyle,
  FlexboxInput,
  FlexboxProps,
} from './types'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return Boolean(value)
}

export function normalizeFlexbox(input: FlexboxInput = {}): FlexboxProps {
  const contentInput = input.content && typeof input.content === 'object' ? input.content : {}
  const styleInput = input.style && typeof input.style === 'object' ? input.style : {}
  const responsiveInput = input.responsive && typeof input.responsive === 'object' ? input.responsive : {}

  const rawChildren =
    Array.isArray(input.children) && input.children.length > 0
      ? input.children
      : Array.isArray(contentInput.children) && contentInput.children.length > 0
        ? contentInput.children
        : Array.isArray(input.children)
          ? input.children
          : Array.isArray(contentInput.children)
            ? contentInput.children
            : []

  const preset = asStringOrUndefined(contentInput.preset ?? input.preset)

  // Presets fallbacks for presentation
  let presetDefaults: Partial<FlexboxProps> = {}
  if (preset === 'navbar') {
    presetDefaults = { direction: 'row', justifyContent: 'space-between', alignItems: 'center', wrap: 'wrap' }
  } else if (preset === 'center-hero') {
    presetDefaults = { direction: 'column', justifyContent: 'center', alignItems: 'center' }
  } else if (preset === 'button-group') {
    presetDefaults = { direction: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '12px', wrap: 'wrap' }
  } else if (preset === 'feature-row') {
    presetDefaults = { direction: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: '16px' }
  }

  const content: CanonicalFlexboxContent = {}
  if (rawChildren !== undefined) content.children = rawChildren
  if (preset !== undefined) content.preset = preset

  const direction = asStringOrUndefined(styleInput.direction ?? input.direction)
  const justifyContent = asStringOrUndefined(styleInput.justifyContent ?? input.justifyContent)
  const alignItems = asStringOrUndefined(styleInput.alignItems ?? input.alignItems)
  const alignContent = asStringOrUndefined(styleInput.alignContent ?? input.alignContent)
  const wrap = asStringOrUndefined(styleInput.wrap ?? input.wrap)
  const gap = asStringOrUndefined(styleInput.gap ?? input.gap)
  const rowGap = asStringOrUndefined(styleInput.rowGap ?? input.rowGap)
  const columnGap = asStringOrUndefined(styleInput.columnGap ?? input.columnGap)
  const padding = asStringOrUndefined(styleInput.padding ?? input.padding)
  const minHeight = asStringOrUndefined(styleInput.minHeight ?? input.minHeight)
  const backgroundColor = asStringOrUndefined(styleInput.backgroundColor ?? input.backgroundColor)
  const borderRadius = asStringOrUndefined(styleInput.borderRadius ?? input.borderRadius)
  const border = asStringOrUndefined(styleInput.border ?? input.border)
  const shadow = asStringOrUndefined(styleInput.shadow ?? input.shadow)
  const width = asStringOrUndefined(styleInput.width ?? input.width)
  const maxWidth = asStringOrUndefined(styleInput.maxWidth ?? input.maxWidth)
  const className = asStringOrUndefined(styleInput.className ?? input.className)

  const style: CanonicalFlexboxStyle = {}
  if (direction !== undefined) style.direction = direction
  if (justifyContent !== undefined) style.justifyContent = justifyContent
  if (alignItems !== undefined) style.alignItems = alignItems
  if (alignContent !== undefined) style.alignContent = alignContent
  if (wrap !== undefined) style.wrap = wrap
  if (gap !== undefined) style.gap = gap
  if (rowGap !== undefined) style.rowGap = rowGap
  if (columnGap !== undefined) style.columnGap = columnGap
  if (padding !== undefined) style.padding = padding
  if (minHeight !== undefined) style.minHeight = minHeight
  if (backgroundColor !== undefined) style.backgroundColor = backgroundColor
  if (borderRadius !== undefined) style.borderRadius = borderRadius
  if (border !== undefined) style.border = border
  if (shadow !== undefined) style.shadow = shadow
  if (width !== undefined) style.width = width
  if (maxWidth !== undefined) style.maxWidth = maxWidth
  if (className !== undefined) style.className = className

  const stackOnMobile = asBooleanOrUndefined(responsiveInput.stackOnMobile ?? input.stackOnMobile)
  const directionMobile = asStringOrUndefined(responsiveInput.directionMobile ?? input.directionMobile)
  const mobileGap = asStringOrUndefined(responsiveInput.mobileGap ?? input.mobileGap)

  const responsive: CanonicalFlexboxResponsive = {
    ...(stackOnMobile !== undefined ? { stackOnMobile } : {}),
    ...(directionMobile !== undefined ? { directionMobile } : {}),
    ...(mobileGap !== undefined ? { mobileGap } : {}),
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  return {
    ...defaultFlexboxProps,
    ...presetDefaults,
    ...input,
    version: 1,
    content,
    style,
    responsive,
    children: rawChildren ?? defaultFlexboxProps.children,
    direction: direction ?? presetDefaults.direction ?? defaultFlexboxProps.direction,
    justifyContent: justifyContent ?? presetDefaults.justifyContent ?? defaultFlexboxProps.justifyContent,
    alignItems: alignItems ?? presetDefaults.alignItems ?? defaultFlexboxProps.alignItems,
    alignContent: alignContent ?? presetDefaults.alignContent ?? defaultFlexboxProps.alignContent,
    wrap: wrap ?? presetDefaults.wrap ?? defaultFlexboxProps.wrap,
    gap: gap ?? presetDefaults.gap ?? defaultFlexboxProps.gap,
    rowGap: rowGap ?? presetDefaults.rowGap ?? gap ?? defaultFlexboxProps.rowGap,
    columnGap: columnGap ?? presetDefaults.columnGap ?? gap ?? defaultFlexboxProps.columnGap,
    padding: padding ?? presetDefaults.padding ?? defaultFlexboxProps.padding,
    minHeight: minHeight ?? presetDefaults.minHeight ?? defaultFlexboxProps.minHeight,
    backgroundColor: backgroundColor ?? presetDefaults.backgroundColor ?? defaultFlexboxProps.backgroundColor,
    borderRadius: borderRadius ?? presetDefaults.borderRadius ?? defaultFlexboxProps.borderRadius,
    border: border ?? presetDefaults.border ?? defaultFlexboxProps.border,
    shadow: shadow ?? presetDefaults.shadow ?? defaultFlexboxProps.shadow,
    width: width ?? presetDefaults.width ?? defaultFlexboxProps.width,
    maxWidth: maxWidth ?? presetDefaults.maxWidth ?? defaultFlexboxProps.maxWidth,
    preset: preset ?? defaultFlexboxProps.preset,
    className: className ?? '',
    stackOnMobile: stackOnMobile ?? defaultFlexboxProps.stackOnMobile,
    directionMobile: directionMobile ?? defaultFlexboxProps.directionMobile,
    mobileGap: mobileGap ?? defaultFlexboxProps.mobileGap,
  }
}
