import { defaultSpacerProps } from './defaults'
import type {
  CanonicalSpacerContent,
  CanonicalSpacerResponsive,
  CanonicalSpacerStyle,
  SpacerProps,
} from './types'

function asString(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === null) {
    return fallback
  }
  return Boolean(value)
}

export function normalizeSpacer(props: Record<string, any> = {}): SpacerProps {
  const styleInput = props.style && typeof props.style === 'object' ? props.style : {}
  const responsiveInput = props.responsive && typeof props.responsive === 'object' ? props.responsive : {}
  const desktopInput = responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {}
  const tabletInput = responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {}
  const mobileInput = responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {}

  // Base height default is 32px
  const height = asString(
    styleInput.height ?? props.height ?? desktopInput.height ?? props.desktopHeight,
    defaultSpacerProps.height || '32px',
  )

  // Responsive heights remain undefined if not explicitly provided (no eager cascade in normalize!)
  const desktopHeight = asOptionalString(desktopInput.height ?? props.desktopHeight)
  const tabletHeight = asOptionalString(tabletInput.height ?? props.tabletHeight)
  const mobileHeight = asOptionalString(mobileInput.height ?? props.mobileHeight)

  const visibility = props.visibility !== undefined ? asBoolean(props.visibility, true) : undefined
  const showInEditor = props.showInEditor !== undefined ? asBoolean(props.showInEditor, true) : undefined
  const backgroundColor = asOptionalString(styleInput.backgroundColor ?? props.backgroundColor)
  const className = asOptionalString(styleInput.className ?? props.className)

  const content: CanonicalSpacerContent = {}

  const style: CanonicalSpacerStyle = {
    height,
  }
  if (backgroundColor !== undefined) style.backgroundColor = backgroundColor
  if (showInEditor !== undefined) style.showInEditor = showInEditor
  if (className !== undefined) style.className = className

  const responsive: CanonicalSpacerResponsive = {}
  if (desktopHeight !== undefined) responsive.desktop = { height: desktopHeight }
  if (tabletHeight !== undefined) responsive.tablet = { height: tabletHeight }
  if (mobileHeight !== undefined) responsive.mobile = { height: mobileHeight }

  return {
    ...defaultSpacerProps,
    ...props,
    version: 1,
    content,
    style,
    responsive,
    height,
    mobileHeight,
    tabletHeight,
    desktopHeight,
    visibility: visibility ?? true,
    showInEditor: showInEditor ?? true,
    backgroundColor: backgroundColor ?? defaultSpacerProps.backgroundColor,
    className: className ?? '',
  }
}
