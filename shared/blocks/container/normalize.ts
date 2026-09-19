import { defaultContainerProps } from './defaults'
import type { ContainerProps } from './types'

function asString(value: unknown, fallback: string) {
  const normalized = String(value ?? '').trim()
  return normalized || fallback
}

export function normalizeContainer(props: Record<string, any> = {}): ContainerProps {
  return {
    ...defaultContainerProps,
    ...props,
    maxWidth: asString(props.maxWidth, defaultContainerProps.maxWidth || '960px'),
    width: asString(props.width, '100%'),
    minHeight: asString(props.minHeight, 'auto'),
    padding: asString(props.padding, defaultContainerProps.padding || '20px'),
    margin: asString(props.margin, defaultContainerProps.margin || '0 auto'),
    backgroundColor: asString(props.backgroundColor, defaultContainerProps.backgroundColor || 'transparent'),
    borderRadius: asString(props.borderRadius, '0px'),
    border: asString(props.border, 'none'),
    borderColor: asString(props.borderColor, 'transparent'),
    shadow: asString(props.shadow ?? props.boxShadow, 'none'),
    boxShadow: asString(props.boxShadow ?? props.shadow, 'none'),
    alignment: asString(props.alignment ?? props.textAlign, 'center'),
    textAlign: asString(props.textAlign ?? props.alignment, 'center'),
    className: asString(props.className, ''),
  }
}
