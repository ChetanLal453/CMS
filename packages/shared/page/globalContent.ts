import type {
  JsonObject,
  PageBanner,
  PageFooter,
  PageFooterColumn,
  PageFooterLink,
  PageHeader,
  PageNavigationItem,
  PageSocialLink,
} from './PageRenderBundle'

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeIdentifier(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

function normalizeOptionalIdentifier(value: unknown, fallback: string) {
  return typeof value === 'string' || typeof value === 'number' ? value : fallback
}

function normalizeString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function normalizeFooterSocialStyle(value: unknown): PageFooter['settings']['social_style'] {
  return value === 'icon' || value === 'circle' ? value : 'text'
}

function normalizeNavigationItems(items: unknown, path = 'nav-item'): PageNavigationItem[] {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item, index) => {
    const safeItem = isObject(item) ? item : {}
    const itemPath = `${path}-${index + 1}`

    return {
      id: normalizeOptionalIdentifier(safeItem.id, itemPath),
      href: normalizeString(safeItem.href),
      open_new_tab: normalizeBoolean(safeItem.open_new_tab, false),
      label: normalizeString(safeItem.label),
      children: normalizeNavigationItems(safeItem.children, `${itemPath}-child`),
    }
  })
}

function normalizeFooterLinks(links: unknown, columnIndex: number): PageFooterLink[] {
  if (!Array.isArray(links)) {
    return []
  }

  return links.map((link, linkIndex) => {
    const safeLink = isObject(link) ? link : {}
    return {
      id: normalizeOptionalIdentifier(safeLink.id, `footer-link-${columnIndex + 1}-${linkIndex + 1}`),
      href: normalizeString(safeLink.href),
      label: normalizeString(safeLink.label),
    }
  })
}

function normalizeFooterColumns(columns: unknown): PageFooterColumn[] {
  if (!Array.isArray(columns)) {
    return []
  }

  return columns.map((column, index) => {
    const safeColumn = isObject(column) ? column : {}
    return {
      id: normalizeOptionalIdentifier(safeColumn.id, `footer-column-${index + 1}`),
      heading: normalizeString(safeColumn.heading),
      links: normalizeFooterLinks(safeColumn.links, index),
    }
  })
}

function normalizeSocialLinks(links: unknown): PageSocialLink[] {
  if (!Array.isArray(links)) {
    return []
  }

  return links.map((link, index) => {
    const safeLink = isObject(link) ? link : {}
    return {
      id: normalizeOptionalIdentifier(safeLink.id, `social-link-${index + 1}`),
      url: normalizeString(safeLink.url),
      platform: normalizeString(safeLink.platform),
    }
  })
}

export function normalizeHeaderToCanonical(header: Record<string, unknown> | null | undefined): PageHeader | null {
  if (!header) {
    return null
  }

  const settings = isObject(header.settings) ? (header.settings as JsonObject) : {}

  return {
    id: normalizeIdentifier(header.id),
    slug: normalizeString(header.slug),
    name: normalizeString(header.name),
    logo: normalizeString(header.logo),
    logo_dark: normalizeString(header.logo_dark),
    cta_label: normalizeString(header.cta_label),
    cta_link: normalizeString(header.cta_link),
    navigation_items: normalizeNavigationItems(header.navigation_items),
    is_sticky: normalizeBoolean(header.is_sticky, true),
    bg_color: normalizeString(header.bg_color),
    settings,
  }
}

export function normalizeFooterToCanonical(footer: Record<string, unknown> | null | undefined): PageFooter | null {
  if (!footer) {
    return null
  }

  const settings = isObject(footer.settings) ? footer.settings : {}

  return {
    id: normalizeIdentifier(footer.id),
    slug: normalizeString(footer.slug),
    name: normalizeString(footer.name),
    columns: normalizeFooterColumns(footer.columns),
    social_links: normalizeSocialLinks(footer.social_links),
    copyright: normalizeString(footer.copyright),
    bg_color: normalizeString(footer.bg_color),
    settings: {
      ...settings,
      logo_url: normalizeString(settings.logo_url),
      copyright_text: normalizeString(settings.copyright_text),
      newsletter_enabled: normalizeBoolean(settings.newsletter_enabled, true),
      company_address: normalizeString(settings.company_address),
      company_email: normalizeString(settings.company_email),
      company_phone: normalizeString(settings.company_phone),
      social_style: normalizeFooterSocialStyle(settings.social_style),
    },
  }
}

export function normalizeBannerToCanonical(banner: Record<string, unknown> | null | undefined): PageBanner | null {
  if (!banner) {
    return null
  }

  const content = isObject(banner.content) ? banner.content : {}
  const { button_text: _legacyButtonText, button_link: _legacyButtonLink, ...restContent } = content

  return {
    id: normalizeIdentifier(banner.id),
    slug: normalizeString(banner.slug),
    name: normalizeString(banner.name),
    content: {
      ...restContent,
      title: normalizeString(content.title),
      subtitle: normalizeString(content.subtitle),
      description: normalizeString(content.description),
      buttonText: normalizeString(content.buttonText),
      buttonLink: normalizeString(content.buttonLink),
    },
  }
}
