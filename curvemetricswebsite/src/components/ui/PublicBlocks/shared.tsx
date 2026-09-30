'use client'

import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as Fa6Icons from 'react-icons/fa6'

export type RenderComponentFn = (component: any) => React.ReactNode

export type PublicBlockProps = {
  renderComponent?: RenderComponentFn
  children?: React.ReactNode
  [key: string]: any
}

export function isRenderableComponent(value: unknown): value is { type: string; id?: string | number; props?: Record<string, any> } {
  return Boolean(value && typeof value === 'object' && typeof (value as any).type === 'string')
}

export function toNumber(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value || ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function collectNodes(value: unknown, renderComponent?: RenderComponentFn, keyPrefix = 'node'): React.ReactNode[] {
  if (value === null || value === undefined || value === false) {
    return []
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectNodes(item, renderComponent, `${keyPrefix}-${index}`))
  }

  if (React.isValidElement(value)) {
    return [value]
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [<React.Fragment key={keyPrefix}>{value}</React.Fragment>]
  }

  if (isRenderableComponent(value)) {
    if (renderComponent) {
      return [<React.Fragment key={String(value.id || keyPrefix)}>{renderComponent(value)}</React.Fragment>]
    }

    return []
  }

  if (typeof value === 'object') {
    const record = value as Record<string, any>

    if (Array.isArray(record.components)) {
      return collectNodes(record.components, renderComponent, `${keyPrefix}-components`)
    }

    if (Array.isArray(record.children) && record.children.length > 0) {
      return collectNodes(record.children, renderComponent, `${keyPrefix}-children`)
    }

    if (record.content && typeof record.content === 'object' && Array.isArray(record.content.children) && record.content.children.length > 0) {
      return collectNodes(record.content.children, renderComponent, `${keyPrefix}-content-children`)
    }

    if (Array.isArray(record.children)) {
      return collectNodes(record.children, renderComponent, `${keyPrefix}-children`)
    }

    if (typeof record.content === 'string' && record.content.trim()) {
      return [<div key={keyPrefix} dangerouslySetInnerHTML={{ __html: record.content }} />]
    }
  }

  return []
}

export function getNestedContent(props: PublicBlockProps, renderComponent?: RenderComponentFn) {
  const source =
    (Array.isArray(props.children) && props.children.length > 0 ? props.children : undefined) ??
    (Array.isArray(props.content?.children) && props.content.children.length > 0 ? props.content.children : undefined) ??
    (Array.isArray((props as any).__sharedViewModel?.children) && (props as any).__sharedViewModel.children.length > 0 ? (props as any).__sharedViewModel.children : undefined) ??
    (Array.isArray(props.components) && props.components.length > 0 ? props.components : undefined) ??
    props.children ??
    props.content?.children ??
    props.components ??
    props.items ??
    props.slots ??
    []
  return collectNodes(source, renderComponent, 'nested')
}

export function normalizeIconName(iconName: string) {
  return iconName
    .replace(/^fa6?-?/i, '')
    .replace(/^fas?-?/i, '')
    .replace(/^far?-?/i, '')
    .replace(/^fal?-?/i, '')
    .replace(/^fab?-?/i, '')
    .replace(/^fad?-?/i, '')
}

export function resolveIconComponent(iconName?: string) {
  const raw = String(iconName || '').trim()
  const cleaned = normalizeIconName(raw)
  const pascal = cleaned
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')

  const candidates = Array.from(
    new Set([
      raw,
      cleaned,
      pascal,
      `Fa${pascal}`,
      `Fa${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`,
      cleaned.toLowerCase(),
      pascal.toLowerCase(),
    ]),
  )

  for (const candidate of candidates) {
    const faName = candidate.startsWith('Fa') ? candidate : `Fa${candidate}`

    if ((Fa6Icons as any)[faName]) {
      return (Fa6Icons as any)[faName] as React.ComponentType<{ size?: string | number; color?: string }>
    }

    if ((FaIcons as any)[faName]) {
      return (FaIcons as any)[faName] as React.ComponentType<{ size?: string | number; color?: string }>
    }
  }

  return FaIcons.FaStar
}

export function resolveVideoSource(src: string, autoplay?: boolean, muted?: boolean, loop?: boolean, controls = true) {
  const trimmed = String(src || '').trim()
  if (!trimmed) {
    return ''
  }

  const getYouTubeId = (urlString: string): string | null => {
    const shortMatch = urlString.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/)
    if (shortMatch?.[1]) return shortMatch[1]

    const embedMatch = urlString.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/)
    if (embedMatch?.[1]) return embedMatch[1]

    const shortsMatch = urlString.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/)
    if (shortsMatch?.[1]) return shortsMatch[1]

    try {
      const parsed = new URL(urlString)
      return parsed.searchParams.get('v')
    } catch {
      return null
    }
  }

  const getVimeoId = (urlString: string): string | null => {
    const match = urlString.match(/vimeo\.com\/(?:video\/)?(\d{5,})/)
    return match?.[1] || null
  }

  const buildUrl = (urlString: string, params: Record<string, string>) => {
    try {
      const parsed = new URL(urlString)
      Object.entries(params).forEach(([key, value]) => {
        if (!value) {
          parsed.searchParams.delete(key)
          return
        }
        parsed.searchParams.set(key, value)
      })
      return parsed.toString()
    } catch {
      return urlString
    }
  }

  const lower = trimmed.toLowerCase()
  const isYoutube = lower.includes('youtube.com') || lower.includes('youtu.be')
  const isVimeo = lower.includes('vimeo.com')

  if (isYoutube) {
    const id = getYouTubeId(trimmed)
    if (id) {
      return buildUrl(`https://www.youtube.com/embed/${id}`, {
        autoplay: autoplay ? '1' : '0',
        mute: muted ? '1' : '0',
        controls: controls ? '1' : '0',
        loop: loop ? '1' : '0',
        playlist: loop ? id : '',
        rel: '0',
        modestbranding: '1',
      })
    }
  }

  if (isVimeo) {
    const id = getVimeoId(trimmed)
    if (id) {
      return buildUrl(`https://player.vimeo.com/video/${id}`, {
        autoplay: autoplay ? '1' : '0',
        muted: muted ? '1' : '0',
        controls: controls ? '1' : '0',
        loop: loop ? '1' : '0',
        title: '0',
        byline: '0',
        portrait: '0',
      })
    }
  }

  return trimmed
}
