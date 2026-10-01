/**
 * Helpers for simplified Client Content Mode.
 * Handles safe extraction of nested fields without "[object Object]"
 * and safe updates preserving nested properties like `visible`, `alt`, and `icon`.
 */

export function mergeFieldValue(existingValue: any, key: string, newValue: any): any {
  if (typeof existingValue === 'object' && existingValue !== null && !Array.isArray(existingValue)) {
    return { ...existingValue, [key]: newValue }
  }
  return newValue
}

export function extractFieldValue(val: any, preferKey: string = 'text'): string {
  if (val === null || val === undefined) {
    return ''
  }
  if (typeof val === 'object' && !Array.isArray(val)) {
    const extracted = val[preferKey] ?? val.text ?? val.src ?? val.label ?? val.href ?? ''
    return typeof extracted === 'string' || typeof extracted === 'number' ? String(extracted) : ''
  }
  return typeof val === 'string' || typeof val === 'number' ? String(val) : ''
}

export function updateComponentFieldSafely(comp: any, field: string, value: any): void {
  if (!comp) return
  if (!comp.props) comp.props = {}
  if (!comp.props.content) comp.props.content = {}
  const content = comp.props.content

  switch (field) {
    case 'title':
      content.title = mergeFieldValue(content.title, 'text', value)
      comp.props.title = value
      break
    case 'subtitle':
      content.subtitle = mergeFieldValue(content.subtitle, 'text', value)
      comp.props.subtitle = value
      break
    case 'description':
    case 'text':
      if (typeof content.description === 'object' && content.description !== null) {
        content.description = mergeFieldValue(content.description, 'text', value)
      } else {
        content[field] = value
      }
      comp.props[field] = value
      break
    case 'highlightText':
      content.highlightText = value
      comp.props.highlightText = value
      break
    case 'badge':
      content.badge = mergeFieldValue(content.badge, 'text', value)
      comp.props.badge = value
      break
    case 'src':
      content.image = mergeFieldValue(content.image, 'src', value)
      if (content.src !== undefined || typeof content.image !== 'object') {
        content.src = value
      }
      comp.props.src = value
      comp.props.image = value
      break
    case 'alt':
      content.image = mergeFieldValue(content.image, 'alt', value)
      comp.props.alt = value
      break
    case 'link':
    case 'buttonLink':
      content.button = mergeFieldValue(content.button, 'href', value)
      content.link = value
      comp.props.link = value
      break
    case 'buttonText':
      content.button = mergeFieldValue(content.button, 'label', value)
      content.buttonText = value
      comp.props.buttonText = value
      break
    default:
      content[field] = value
      comp.props[field] = value
      break
  }
}
