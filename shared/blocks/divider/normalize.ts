import { defaultDividerProps } from './defaults'
import type { DividerProps } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

export function normalizeDivider(props: Record<string, any> = {}): DividerProps {
  return {
    ...defaultDividerProps,
    ...props,
    thickness: asString(props.thickness, defaultDividerProps.thickness || '1px'),
    color: asString(props.color, defaultDividerProps.color || '#cccccc'),
    width: asString(props.width, defaultDividerProps.width || '100%'),
    margin: asString(props.margin, defaultDividerProps.margin || '20px 0'),
    className: asString(props.className, ''),
  }
}
