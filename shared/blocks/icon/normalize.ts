import { defaultIconProps } from './defaults'
import type { IconProps } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

export function normalizeIcon(props: Record<string, any> = {}): IconProps {
  const name = asString(props.name ?? props.icon, defaultIconProps.name || 'star')

  return {
    ...defaultIconProps,
    ...props,
    name,
    icon: name,
    size: props.size ?? defaultIconProps.size ?? '24px',
    color: asString(props.color, defaultIconProps.color || '#000000'),
    className: asString(props.className, defaultIconProps.className || ''),
  }
}
