import { defaultSpacerProps } from './defaults'
import type { SpacerProps } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

function asBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) {
    return fallback
  }

  return Boolean(value)
}

export function normalizeSpacer(props: Record<string, any> = {}): SpacerProps {
  return {
    ...defaultSpacerProps,
    ...props,
    height: asString(props.height, defaultSpacerProps.height || '32px'),
    mobileHeight: asString(props.mobileHeight, asString(props.height, asString(props.desktopHeight, defaultSpacerProps.mobileHeight || '24px'))),
    tabletHeight: asString(props.tabletHeight, asString(props.height, asString(props.desktopHeight, defaultSpacerProps.tabletHeight || '28px'))),
    desktopHeight: asString(props.desktopHeight, asString(props.height, defaultSpacerProps.desktopHeight || '32px')),
    visibility: asBoolean(props.visibility, defaultSpacerProps.visibility ?? true),
    showInEditor: asBoolean(props.showInEditor, defaultSpacerProps.showInEditor ?? true),
    backgroundColor: asString(props.backgroundColor, defaultSpacerProps.backgroundColor || '#ffffff'),
    className: asString(props.className, defaultSpacerProps.className || ''),
  }
}
