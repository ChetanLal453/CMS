const sectionSchemas = {
  hero: {
    type: 'hero',
    label: 'Hero',
    defaults: {
      title: 'Build Something Strong',
      subtitle: 'Create polished landing pages with reusable CMS-driven sections.',
      image: '',
      ctaLabel: 'Get Started',
      ctaHref: '#',
      align: 'left',
      showBadge: true,
      badgeText: 'Featured',
      backgroundColor: '#f8fafc',
    },
    fields: [
      { name: 'title', type: 'text', label: 'Title', placeholder: 'Hero title' },
      { name: 'subtitle', type: 'textarea', label: 'Subtitle', placeholder: 'Hero subtitle' },
      { name: 'image', type: 'image', label: 'Image' },
      { name: 'ctaLabel', type: 'text', label: 'CTA Label', placeholder: 'Get Started' },
      { name: 'ctaHref', type: 'text', label: 'CTA Link', placeholder: '/contact' },
      {
        name: 'align',
        type: 'select',
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
        ],
      },
      { name: 'showBadge', type: 'toggle', label: 'Show Badge' },
      { name: 'badgeText', type: 'text', label: 'Badge Text', placeholder: 'Featured' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color' },
    ],
  },
  features: {
    type: 'features',
    label: 'Features',
    defaults: {
      title: 'Why Teams Choose This',
      subtitle: 'Highlight the outcomes or capabilities that matter most.',
      items: [
        { id: 'feature-1', title: 'Fast Setup', description: 'Get new pages live quickly.' },
        { id: 'feature-2', title: 'Reusable Blocks', description: 'Standardize high-quality layouts.' },
        { id: 'feature-3', title: 'Safe Editing', description: 'Give editors a stable workflow.' },
      ],
      columns: 3,
      backgroundColor: '#ffffff',
    },
    fields: [
      { name: 'title', type: 'text', label: 'Title', placeholder: 'Features title' },
      { name: 'subtitle', type: 'textarea', label: 'Subtitle', placeholder: 'Features subtitle' },
      {
        name: 'columns',
        type: 'select',
        label: 'Columns',
        options: [
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
          { value: 4, label: '4 Columns' },
        ],
      },
      { name: 'items', type: 'list-items', label: 'Feature Items' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color' },
    ],
  },
  gallery: {
    type: 'gallery',
    label: 'Gallery',
    defaults: {
      title: 'Recent Work',
      subtitle: 'Showcase images in a simple responsive gallery.',
      images: [],
      columns: 3,
      rounded: true,
      backgroundColor: '#f8fafc',
    },
    fields: [
      { name: 'title', type: 'text', label: 'Title', placeholder: 'Gallery title' },
      { name: 'subtitle', type: 'textarea', label: 'Subtitle', placeholder: 'Gallery subtitle' },
      {
        name: 'columns',
        type: 'select',
        label: 'Columns',
        options: [
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
          { value: 4, label: '4 Columns' },
        ],
      },
      { name: 'images', type: 'image-array', label: 'Images' },
      { name: 'rounded', type: 'toggle', label: 'Rounded Images' },
      { name: 'backgroundColor', type: 'color', label: 'Background Color' },
    ],
  },
}

function cloneValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)]))
  }

  return value
}

export function getSectionSchema(sectionType: string) {
  return sectionSchemas[sectionType as keyof typeof sectionSchemas] || null
}

export function isRegisteredSectionType(sectionType: string) {
  return Boolean(getSectionSchema(sectionType))
}

export function getSectionDefaults(sectionType: string) {
  const schema = getSectionSchema(sectionType)
  return schema ? cloneValue(schema.defaults || {}) : {}
}

export function sanitizeSectionProps(sectionType: string, props: any) {
  const schema = getSectionSchema(sectionType)
  if (!schema) {
    return props && typeof props === 'object' ? props : {}
  }

  const source = props && typeof props === 'object' ? props : {}
  const sanitized = { ...getSectionDefaults(sectionType) }

  for (const field of schema.fields || []) {
    const rawValue = source[field.name]

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue
    }

    switch (field.type) {
      case 'toggle':
      case 'boolean':
        sanitized[field.name] = Boolean(rawValue)
        break
      case 'number':
      case 'range': {
        const parsed = Number(rawValue)
        sanitized[field.name] = Number.isFinite(parsed) ? parsed : sanitized[field.name]
        break
      }
      case 'select':
        sanitized[field.name] = rawValue
        break
      case 'list-items':
      case 'image-array':
        sanitized[field.name] = Array.isArray(rawValue) ? rawValue : sanitized[field.name]
        break
      default:
        sanitized[field.name] = rawValue
        break
    }
  }

  return sanitized
}

export function validateSectionProps(sectionType: string, props: any) {
  const schema = getSectionSchema(sectionType)
  if (!schema) {
    return { valid: false, errors: [`Unknown section type: ${sectionType}`] }
  }

  const sanitized = sanitizeSectionProps(sectionType, props)
  const errors: string[] = []

  for (const field of schema.fields || []) {
    const value = sanitized[field.name]

    if (field.type === 'text' || field.type === 'textarea' || field.type === 'image') {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        errors.push(`${field.label || field.name} must be a string`)
      }
    }

    if ((field.type === 'list-items' || field.type === 'image-array') && !Array.isArray(value)) {
      errors.push(`${field.label || field.name} must be an array`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  }
}

export function sanitizeSectionRecord(section: any) {
  const sectionType = section?.type || 'custom'
  return {
    ...section,
    type: sectionType,
    props: sanitizeSectionProps(sectionType, section?.props),
  }
}

export function sanitizeLayoutSections(layout: any) {
  const safeLayout = layout && typeof layout === 'object' ? layout : {}
  const safeSections = Array.isArray(safeLayout.sections) ? safeLayout.sections : []

  return {
    ...safeLayout,
    sections: safeSections.map((section: any) => sanitizeSectionRecord(section)),
  }
}

export const sectionSchemaList = Object.values(sectionSchemas)
