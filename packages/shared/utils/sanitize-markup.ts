const BLOCKED_HTML_TAGS = new Set([
  'applet',
  'base',
  'button',
  'embed',
  'form',
  'frame',
  'frameset',
  'iframe',
  'input',
  'link',
  'math',
  'meta',
  'object',
  'script',
  'select',
  'style',
  'svg',
  'textarea',
])

const ALLOWED_HTML_TAGS = new Set([
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'font',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
  'ul',
])

const SAFE_CSS_PROPERTIES = new Set([
  'background-color',
  'color',
  'font-style',
  'font-weight',
  'text-align',
  'text-decoration',
])

const BLOCKED_SVG_TAGS = new Set(['foreignobject', 'script', 'style'])
const ALLOWED_SVG_TAGS = new Set([
  'circle',
  'defs',
  'ellipse',
  'g',
  'line',
  'lineargradient',
  'path',
  'polygon',
  'polyline',
  'radialgradient',
  'rect',
  'stop',
  'svg',
  'symbol',
  'title',
  'use',
])

const SAFE_URL_PROTOCOL = /^(https?:|mailto:|tel:|\/|#)/i
const EXPLICIT_PROTOCOL = /^[a-zA-Z][a-zA-Z\d+\-.]*:/
const UNSAFE_STYLE_VALUE = /(expression\s*\(|javascript:|vbscript:|data:|@import|url\s*\()/i

function isSafeUrl(value: string) {
  const normalized = value.trim()
  if (!normalized) {
    return false
  }

  return SAFE_URL_PROTOCOL.test(normalized) || !EXPLICIT_PROTOCOL.test(normalized)
}

function sanitizeInlineStyle(value: string) {
  const safeDeclarations = value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex === -1) {
        return null
      }

      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const propertyValue = declaration.slice(separatorIndex + 1).trim()

      if (!SAFE_CSS_PROPERTIES.has(property) || !propertyValue || UNSAFE_STYLE_VALUE.test(propertyValue)) {
        return null
      }

      return `${property}: ${propertyValue}`
    })
    .filter((declaration): declaration is string => Boolean(declaration))

  return safeDeclarations.join('; ')
}

function unwrapChildren(node: Element, doc: Document) {
  const fragment = doc.createDocumentFragment()
  Array.from(node.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeHtmlNode(child, doc)
    if (sanitizedChild) {
      fragment.appendChild(sanitizedChild)
    }
  })
  return fragment
}

function sanitizeHtmlNode(node: ChildNode, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent || '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as Element
  const tagName = element.tagName.toLowerCase()

  if (BLOCKED_HTML_TAGS.has(tagName)) {
    return null
  }

  if (!ALLOWED_HTML_TAGS.has(tagName)) {
    return unwrapChildren(element, doc)
  }

  const cleanElement = doc.createElement(tagName)

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value

    if (!value || name.startsWith('on')) {
      return
    }

    if (name === 'href') {
      if (tagName === 'a' && isSafeUrl(value)) {
        cleanElement.setAttribute('href', value.trim())
      }
      return
    }

    if (name === 'target') {
      if (tagName === 'a' && ['_blank', '_self', '_parent', '_top'].includes(value)) {
        cleanElement.setAttribute('target', value)
        if (value === '_blank') {
          cleanElement.setAttribute('rel', 'noopener noreferrer')
        }
      }
      return
    }

    if (name === 'style') {
      const sanitizedStyle = sanitizeInlineStyle(value)
      if (sanitizedStyle) {
        cleanElement.setAttribute('style', sanitizedStyle)
      }
      return
    }

    if (tagName === 'font' && name === 'color') {
      cleanElement.setAttribute('color', value.trim())
    }
  })

  Array.from(element.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeHtmlNode(child, doc)
    if (sanitizedChild) {
      cleanElement.appendChild(sanitizedChild)
    }
  })

  return cleanElement
}

function sanitizeSvgNode(node: ChildNode, doc: XMLDocument): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(node.textContent || '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as Element
  const tagName = element.tagName.toLowerCase()

  if (BLOCKED_SVG_TAGS.has(tagName) || !ALLOWED_SVG_TAGS.has(tagName)) {
    return null
  }

  const cleanElement = doc.createElementNS('http://www.w3.org/2000/svg', tagName)

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name
    const lowerName = name.toLowerCase()
    const value = attribute.value.trim()

    if (!value || lowerName.startsWith('on')) {
      return
    }

    if ((lowerName === 'href' || lowerName === 'xlink:href') && !value.startsWith('#')) {
      return
    }

    if (/^(fill|stroke|d|cx|cy|r|x|y|x1|x2|y1|y2|width|height|viewBox|points|xmlns|preserveAspectRatio|transform|stroke-width|stroke-linecap|stroke-linejoin|stroke-miterlimit|opacity|fill-rule|clip-rule|role|aria-hidden|focusable|offset|stop-color|stop-opacity|gradientUnits|gradientTransform|id)$/i.test(name)) {
      cleanElement.setAttribute(name, value)
    }
  })

  Array.from(element.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeSvgNode(child, doc)
    if (sanitizedChild) {
      cleanElement.appendChild(sanitizedChild)
    }
  })

  return cleanElement
}

function fallbackSanitizeHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
}

export function sanitizeHtml(input: string) {
  if (!input) {
    return ''
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return fallbackSanitizeHtml(input)
  }

  const parser = new DOMParser()
  const dirtyDocument = parser.parseFromString(`<div>${input}</div>`, 'text/html')
  const cleanDocument = document.implementation.createHTMLDocument('')
  const sourceRoot = dirtyDocument.body.firstElementChild

  if (!sourceRoot) {
    return ''
  }

  const cleanRoot = cleanDocument.createElement('div')
  Array.from(sourceRoot.childNodes).forEach((child) => {
    const sanitizedChild = sanitizeHtmlNode(child, cleanDocument)
    if (sanitizedChild) {
      cleanRoot.appendChild(sanitizedChild)
    }
  })

  return cleanRoot.innerHTML
}

export function sanitizeSvgMarkup(input: string) {
  if (!input) {
    return ''
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return ''
  }

  const parser = new DOMParser()
  const dirtyDocument = parser.parseFromString(input, 'image/svg+xml')
  const root = dirtyDocument.documentElement

  if (!root || root.tagName.toLowerCase() !== 'svg') {
    return ''
  }

  const cleanDocument = document.implementation.createDocument('http://www.w3.org/2000/svg', 'svg', null)
  const cleanRoot = sanitizeSvgNode(root, cleanDocument)

  if (!cleanRoot || !(cleanRoot instanceof Element)) {
    return ''
  }

  cleanDocument.replaceChild(cleanRoot, cleanDocument.documentElement)
  return new XMLSerializer().serializeToString(cleanRoot)
}
