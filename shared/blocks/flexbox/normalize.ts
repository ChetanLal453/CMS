import { defaultFlexboxProps } from './defaults'
import type { FlexboxProps } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

export function normalizeFlexbox(props: Record<string, any> = {}): FlexboxProps {
  const gap = asString(props.gap, defaultFlexboxProps.gap || '16px')
  const rowGap = props.rowGap !== undefined && props.rowGap !== null && props.rowGap !== '' ? asString(props.rowGap, gap) : gap
  const columnGap = props.columnGap !== undefined && props.columnGap !== null && props.columnGap !== '' ? asString(props.columnGap, gap) : gap

  return {
    ...defaultFlexboxProps,
    ...props,
    direction: asString(props.direction, defaultFlexboxProps.direction || 'row'),
    justifyContent: asString(props.justifyContent, defaultFlexboxProps.justifyContent || 'flex-start'),
    alignItems: asString(props.alignItems, defaultFlexboxProps.alignItems || 'stretch'),
    alignContent: asString(props.alignContent, defaultFlexboxProps.alignContent || 'stretch'),
    gap,
    rowGap,
    columnGap,
    wrap: asString(props.wrap, defaultFlexboxProps.wrap || 'nowrap'),
    padding: asString(props.padding, defaultFlexboxProps.padding || '16px'),
    minHeight: asString(props.minHeight, defaultFlexboxProps.minHeight || 'auto'),
    backgroundColor: asString(props.backgroundColor, defaultFlexboxProps.backgroundColor || '#ffffff'),
    className: asString(props.className, ''),
    children: Array.isArray(props.children) ? props.children : defaultFlexboxProps.children,
  }
}
