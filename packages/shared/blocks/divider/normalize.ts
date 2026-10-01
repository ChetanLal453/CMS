import { defaultDividerProps } from './defaults'
import type {
  CanonicalDividerContent,
  CanonicalDividerProps,
  CanonicalDividerResponsive,
  CanonicalDividerStyle,
  DividerProps,
} from './types'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

export function normalizeDivider(props: Record<string, any> = {}): DividerProps {
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  const rawThickness = styleInput.thickness ?? props.thickness
  const thickness = asStringOrUndefined(rawThickness)

  const rawColor = styleInput.color ?? props.color
  const color = asStringOrUndefined(rawColor)

  const rawWidth = styleInput.width ?? props.width
  const width = asStringOrUndefined(rawWidth)

  const rawMargin = styleInput.margin ?? props.margin
  const margin = asStringOrUndefined(rawMargin)

  const rawClassName = styleInput.className ?? props.className
  const className = asStringOrUndefined(rawClassName)

  const style: CanonicalDividerStyle = {}
  if (thickness !== undefined) style.thickness = thickness
  if (color !== undefined) style.color = color
  if (width !== undefined) style.width = width
  if (margin !== undefined) style.margin = margin
  if (className !== undefined) style.className = className

  const responsive: CanonicalDividerResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  const content: CanonicalDividerContent = {}

  return {
    ...defaultDividerProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    thickness: thickness ?? defaultDividerProps.thickness,
    color: color ?? defaultDividerProps.color,
    width: width ?? defaultDividerProps.width,
    margin: margin ?? defaultDividerProps.margin,
    className: className ?? '',
  }
}
