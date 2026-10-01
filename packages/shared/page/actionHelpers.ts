export type ActionType = 'url' | 'page' | 'anchor' | 'phone' | 'email' | 'dynamicRecord' | 'file'

export type GenericActionPayload = {
  type?: ActionType
  url?: string
  pageSlug?: string
  anchor?: string
  phone?: string
  email?: string
  openInNewTab?: boolean
  dynamicRecord?: {
    collectionSlug: string
    recordSlug?: string
    recordId?: string | number
  }
  fileUrl?: string
  [key: string]: any
}

export type ResolvedAction = {
  href: string
  isExternal: boolean
  isNativeProtocol: boolean // true for tel: and mailto:
  target: '_blank' | '_self'
  rel?: string
}

export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return ''
  const trimmed = String(phone).trim()
  return trimmed.replace(/[^\d+]/g, '')
}

export function resolveActionHref(
  action?: GenericActionPayload | string | null,
  openInNewTabFallback = false
): ResolvedAction {
  if (!action) {
    return { href: '', isExternal: false, isNativeProtocol: false, target: '_self' }
  }

  // String handling (legacy link string, tel:, mailto:, url, anchor)
  if (typeof action === 'string') {
    const raw = action.trim()
    if (!raw) {
      return { href: '', isExternal: false, isNativeProtocol: false, target: '_self' }
    }

    if (/^tel:/i.test(raw)) {
      return {
        href: raw,
        isExternal: false,
        isNativeProtocol: true,
        target: '_self',
      }
    }

    if (/^mailto:/i.test(raw)) {
      return {
        href: raw,
        isExternal: false,
        isNativeProtocol: true,
        target: '_self',
      }
    }

    if (/^https?:\/\//i.test(raw)) {
      return {
        href: raw,
        isExternal: true,
        isNativeProtocol: false,
        target: openInNewTabFallback ? '_blank' : '_self',
        rel: openInNewTabFallback ? 'noopener noreferrer' : undefined,
      }
    }

    if (raw.startsWith('#')) {
      return {
        href: raw,
        isExternal: false,
        isNativeProtocol: false,
        target: '_self',
      }
    }

    return {
      href: raw.startsWith('/') ? raw : `/${raw}`,
      isExternal: false,
      isNativeProtocol: false,
      target: openInNewTabFallback ? '_blank' : '_self',
      rel: openInNewTabFallback ? 'noopener noreferrer' : undefined,
    }
  }

  // Object handling
  if (typeof action === 'object') {
    const openInNewTab = Boolean(action.openInNewTab ?? openInNewTabFallback)
    const type: ActionType = action.type || (
      action.phone ? 'phone' :
      action.email ? 'email' :
      action.anchor ? 'anchor' :
      action.pageSlug ? 'page' :
      action.dynamicRecord ? 'dynamicRecord' :
      action.fileUrl ? 'file' :
      'url'
    )

    switch (type) {
      case 'phone': {
        const val = action.phone || action.url || ''
        const clean = cleanPhoneNumber(val.replace(/^tel:/i, ''))
        return {
          href: clean ? `tel:${clean}` : (val.startsWith('tel:') ? val : `tel:${val}`),
          isExternal: false,
          isNativeProtocol: true,
          target: '_self',
        }
      }
      case 'email': {
        const val = action.email || action.url || ''
        const clean = val.replace(/^mailto:/i, '').trim()
        return {
          href: clean ? `mailto:${clean}` : '',
          isExternal: false,
          isNativeProtocol: true,
          target: '_self',
        }
      }
      case 'anchor': {
        const val = (action.anchor || action.url || '').trim()
        return {
          href: val.startsWith('#') ? val : `#${val}`,
          isExternal: false,
          isNativeProtocol: false,
          target: '_self',
        }
      }
      case 'page': {
        const val = (action.pageSlug || action.url || '').trim()
        return {
          href: val.startsWith('/') ? val : `/${val}`,
          isExternal: false,
          isNativeProtocol: false,
          target: openInNewTab ? '_blank' : '_self',
          rel: openInNewTab ? 'noopener noreferrer' : undefined,
        }
      }
      case 'dynamicRecord': {
        const col = action.dynamicRecord?.collectionSlug || ''
        const rec = action.dynamicRecord?.recordSlug || action.dynamicRecord?.recordId || ''
        const href = col && rec ? `/${col}/${rec}` : '/'
        return {
          href,
          isExternal: false,
          isNativeProtocol: false,
          target: openInNewTab ? '_blank' : '_self',
          rel: openInNewTab ? 'noopener noreferrer' : undefined,
        }
      }
      case 'file': {
        const val = (action.fileUrl || action.url || '').trim()
        return {
          href: val,
          isExternal: true,
          isNativeProtocol: false,
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      }
      case 'url':
      default: {
        return resolveActionHref(action.url || '', openInNewTab)
      }
    }
  }

  return { href: '', isExternal: false, isNativeProtocol: false, target: '_self' }
}
