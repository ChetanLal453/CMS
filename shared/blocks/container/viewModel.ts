import { defaultContainerProps } from './defaults'
import { normalizeContainer } from './normalize'
import type { ContainerProps, ContainerViewModel } from './types'

export function createContainerViewModel(props: Record<string, any> = {}): ContainerViewModel {
  const normalized = normalizeContainer(props)
  const resolvedContent =
    typeof normalized.content === 'string' && normalized.content !== '[object Object]'
      ? normalized.content
      : typeof normalized.content?.content === 'string' && normalized.content.content !== '[object Object]'
      ? normalized.content.content
      : undefined

  return {
    ...normalized,
    children: normalized.children ?? normalized.content?.children ?? [],
    content: resolvedContent as any,
    maxWidth: normalized.style?.maxWidth ?? normalized.maxWidth ?? defaultContainerProps.maxWidth ?? '960px',
    width: normalized.style?.width ?? normalized.width ?? (normalized.position === 'absolute' || normalized.style?.position === 'absolute' ? 'auto' : '100%'),
    minHeight: normalized.style?.minHeight ?? normalized.minHeight ?? 'auto',
    padding: normalized.style?.padding ?? normalized.padding ?? defaultContainerProps.padding ?? '20px',
    margin: normalized.style?.margin ?? normalized.margin ?? defaultContainerProps.margin ?? '0 auto',
    backgroundColor:
      normalized.style?.backgroundColor ?? normalized.backgroundColor ?? defaultContainerProps.backgroundColor ?? 'transparent',
    borderRadius: normalized.style?.borderRadius ?? normalized.borderRadius ?? '0px',
    border: normalized.style?.border ?? normalized.border ?? 'none',
    borderColor: normalized.style?.borderColor ?? normalized.borderColor ?? 'transparent',
    shadow: normalized.style?.shadow ?? normalized.shadow ?? 'none',
    boxShadow: normalized.style?.boxShadow ?? normalized.boxShadow ?? 'none',
    alignment: normalized.style?.alignment ?? normalized.alignment ?? 'center',
    textAlign: normalized.style?.textAlign ?? normalized.textAlign ?? 'center',
    className: normalized.style?.className ?? normalized.className ?? '',
    position: normalized.style?.position ?? normalized.position ?? undefined,
    top: normalized.style?.top ?? normalized.top ?? undefined,
    right: normalized.style?.right ?? normalized.right ?? undefined,
    bottom: normalized.style?.bottom ?? normalized.bottom ?? undefined,
    left: normalized.style?.left ?? normalized.left ?? undefined,
    zIndex: normalized.style?.zIndex ?? normalized.zIndex ?? undefined,
    overflow: normalized.style?.overflow ?? normalized.overflow ?? undefined,
    mobilePosition: normalized.mobilePosition,
    mobileTop: normalized.mobileTop,
    mobileRight: normalized.mobileRight,
    mobileBottom: normalized.mobileBottom,
    mobileLeft: normalized.mobileLeft,
  }
}
