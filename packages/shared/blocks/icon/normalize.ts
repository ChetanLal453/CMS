import { defaultIconProps } from './defaults'
import type {
  CanonicalIconContent,
  CanonicalIconProps,
  CanonicalIconResponsive,
  CanonicalIconStyle,
  IconProps,
} from './types'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

export function normalizeIcon(props: Record<string, any> = {}): IconProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  const rawName = contentInput.name ?? contentInput.icon ?? props.name ?? props.icon
  const name = asStringOrUndefined(rawName)

  const content: CanonicalIconContent = {}
  if (name !== undefined) {
    content.name = name
    content.icon = name
  }

  const rawSize = styleInput.size ?? props.size
  const size = rawSize !== undefined && rawSize !== null && rawSize !== '' ? rawSize : undefined

  const rawColor = styleInput.color ?? props.color
  const color = asStringOrUndefined(rawColor)

  const rawClassName = styleInput.className ?? props.className
  const className = asStringOrUndefined(rawClassName)

  const style: CanonicalIconStyle = {}
  if (size !== undefined) style.size = size
  if (color !== undefined) style.color = color
  if (className !== undefined) style.className = className

  const responsive: CanonicalIconResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  return {
    ...defaultIconProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    name: name ?? defaultIconProps.name,
    icon: name ?? defaultIconProps.name,
    size: size ?? defaultIconProps.size,
    color: color ?? defaultIconProps.color,
    className: className ?? defaultIconProps.className,
  }
}
