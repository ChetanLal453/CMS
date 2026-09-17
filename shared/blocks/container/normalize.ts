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
    padding: asString(props.padding, defaultContainerProps.padding || '20px'),
    margin: asString(props.margin, defaultContainerProps.margin || '0 auto'),
    backgroundColor: asString(props.backgroundColor, defaultContainerProps.backgroundColor || 'transparent'),
    className: asString(props.className, ''),
  }
}
