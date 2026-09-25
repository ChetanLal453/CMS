import { defaultContainerProps } from './defaults'
import type {
  CanonicalContainerContent,
  CanonicalContainerResponsive,
  CanonicalContainerStyle,
  ContainerProps,
} from './types'
import { asString } from '../../utils/merge'

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

export function normalizeContainer(props: Record<string, any> = {}): ContainerProps {
  const contentInput = props.content && typeof props.content === 'object' ? props.content : {}
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}

  const contentText = asOptionalString(contentInput.content ?? props.content)

  const maxWidth = asOptionalString(styleInput.maxWidth ?? props.maxWidth)
  const width = asOptionalString(styleInput.width ?? props.width)
  const minHeight = asOptionalString(styleInput.minHeight ?? props.minHeight)
  const padding = asOptionalString(styleInput.padding ?? props.padding)
  const margin = asOptionalString(styleInput.margin ?? props.margin)
  const backgroundColor = asOptionalString(styleInput.backgroundColor ?? props.backgroundColor)
  const borderRadius = asOptionalString(styleInput.borderRadius ?? props.borderRadius)
  const border = asOptionalString(styleInput.border ?? props.border)
  const borderColor = asOptionalString(styleInput.borderColor ?? props.borderColor)
  const shadow = asOptionalString(styleInput.shadow ?? props.shadow ?? styleInput.boxShadow ?? props.boxShadow)
  const boxShadow = asOptionalString(styleInput.boxShadow ?? props.boxShadow ?? styleInput.shadow ?? props.shadow)
  const alignment = asOptionalString(styleInput.alignment ?? props.alignment ?? styleInput.textAlign ?? props.textAlign)
  const textAlign = asOptionalString(styleInput.textAlign ?? props.textAlign ?? styleInput.alignment ?? props.alignment)
  const className = asOptionalString(styleInput.className ?? props.className)

  // Sparse content object
  const content: CanonicalContainerContent = {}
  if (contentText !== undefined) content.content = contentText

  // Sparse style object — only explicitly defined properties are kept!
  const style: CanonicalContainerStyle = {}
  if (maxWidth !== undefined) style.maxWidth = maxWidth
  if (width !== undefined) style.width = width
  if (minHeight !== undefined) style.minHeight = minHeight
  if (padding !== undefined) style.padding = padding
  if (margin !== undefined) style.margin = margin
  if (backgroundColor !== undefined) style.backgroundColor = backgroundColor
  if (borderRadius !== undefined) style.borderRadius = borderRadius
  if (border !== undefined) style.border = border
  if (borderColor !== undefined) style.borderColor = borderColor
  if (shadow !== undefined) style.shadow = shadow
  if (boxShadow !== undefined) style.boxShadow = boxShadow
  if (alignment !== undefined) style.alignment = alignment
  if (textAlign !== undefined) style.textAlign = textAlign
  if (className !== undefined) style.className = className

  const responsive: CanonicalContainerResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  return {
    ...defaultContainerProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    maxWidth,
    width,
    minHeight,
    padding,
    margin,
    backgroundColor,
    borderRadius,
    border,
    borderColor,
    shadow,
    boxShadow,
    alignment,
    textAlign,
    className,
  }
}
