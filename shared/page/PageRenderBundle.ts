import type { PageRenderBundleSchemaVersion } from './schemaVersion'
import type { SeoContract } from './seo'

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = Record<string, any>

export type ContentIdentifier = string | number

export type PageRenderMode = 'public' | 'preview'

export type PageBlock = {
  id: ContentIdentifier
  type: string
  label?: string | null
  props: JsonObject
}

export type PageColumn = {
  id: ContentIdentifier
  width?: number
  components: PageBlock[]
}

export type PageRow = {
  id: ContentIdentifier
  columns: PageColumn[]
}

export type PageSectionSettings = {
  backgroundColor?: string
  padding?: string | number
  margin?: string | number
  borderWidth?: number
  borderColor?: string
  borderRadius?: string | number
  shadow?: string
  visible?: boolean
  customCSS?: string
  sticky_enabled?: boolean
  sticky_column_index?: number
  sticky_position?: 'top' | 'center' | 'bottom'
  sticky_offset?: number
  rowVerticalAlign?: 'top' | 'center' | 'bottom'
  containerType?: 'boxed' | 'full-width' | 'fluid'
  maxWidth?: number
  sideSpacing?: number
  opacity?: number
  width?: string
  height?: string
}

export type PageSection = {
  id: ContentIdentifier
  name: string
  type: string
  content?: string
  props: JsonObject
  settings: PageSectionSettings
  blocks: PageBlock[]
  rows: PageRow[]
  columns?: PageColumn[]
  container?: {
    id: ContentIdentifier
    rows: PageRow[]
  }
}

export type PageLayout = {
  schemaVersion: PageRenderBundleSchemaVersion
  id: string
  name: string
  sections: PageSection[]
}

export type PageRecord = {
  id: ContentIdentifier | null
  slug: string
  title?: string
  name?: string
  status?: string | null
  seo: SeoContract
  header_slug?: string | null
  footer_slug?: string | null
  banner_slug?: string | null
  header_id?: ContentIdentifier | null
  footer_id?: ContentIdentifier | null
  banner_id?: ContentIdentifier | null
  published_at?: string | null
  updated_at?: string | null
  current_revision_id?: ContentIdentifier | null
  published_revision_id?: ContentIdentifier | null
}

export type PageRevisionMeta = {
  id?: ContentIdentifier | null
  page_id?: ContentIdentifier | null
  revision_number?: number | null
  revision_type?: string | null
  created_by?: string | null
  created_at?: string | null
}

export type PageNavigationItem = {
  id?: ContentIdentifier
  href: string
  open_new_tab: boolean
  label: string
  children: PageNavigationItem[]
}

export type PageHeaderSettings = JsonObject

export type PageHeader = {
  id: ContentIdentifier | null
  slug: string
  name: string
  logo: string
  logo_dark: string
  cta_label: string
  cta_link: string
  navigation_items: PageNavigationItem[]
  is_sticky: boolean
  bg_color: string
  settings: PageHeaderSettings
}

export type PageFooterLink = {
  id?: ContentIdentifier | null
  href: string
  label: string
}

export type PageFooterColumn = {
  id?: ContentIdentifier | null
  heading: string
  links: PageFooterLink[]
}

export type PageSocialLink = {
  id?: ContentIdentifier | null
  url: string
  platform: string
}

export type PageFooter = {
  id: ContentIdentifier | null
  slug: string
  name: string
  columns: PageFooterColumn[]
  social_links: PageSocialLink[]
  copyright: string
  bg_color: string
  settings: {
    logo_url: string
    copyright_text: string
    newsletter_enabled: boolean
    company_address: string
    company_email: string
    company_phone: string
    social_style: 'text' | 'icon' | 'circle'
    [key: string]: unknown
  }
}

export type PageBanner = {
  id: ContentIdentifier | null
  slug: string
  name: string
  content: {
    title: string
    subtitle: string
    description: string
    buttonText: string
    buttonLink: string
    [key: string]: unknown
  }
}

export type BasePageRenderBundle = {
  success: true
  schemaVersion: PageRenderBundleSchemaVersion
  mode: PageRenderMode
  page: PageRecord
  layout: PageLayout
  sections: PageSection[]
  header?: PageHeader | null
  footer?: PageFooter | null
  banner?: PageBanner | null
  view: {
    traceId: string
    theme: {
      accent: string
      accentRgb: string
      shellBackground: string
      surface: string
      surfaceAlt: string
      border: string
      text: string
      muted: string
      shadow: string
    }
    header?: PageHeader | null
    footer?: PageFooter | null
    banner?: PageBanner | null
    content: PageSection[]
    structure: {
      sections: Array<{
        id: ContentIdentifier
        blockIds: ContentIdentifier[]
        blockTypes: string[]
      }>
    }
  }
  diagnostics?: {
    traceId: string
    unknownBlocks: Array<{
      type: string
      sectionId?: ContentIdentifier
      blockId?: ContentIdentifier
    }>
  }
}

export type PublicPageRenderBundle = BasePageRenderBundle & {
  mode: 'public'
}

export type PreviewPageRenderBundle = BasePageRenderBundle & {
  mode: 'preview'
  revision?: PageRevisionMeta | null
  draft_revision?: PageRevisionMeta | null
  published_revision?: PageRevisionMeta | null
  has_published_revision?: boolean
}

export type PageRenderBundle = PublicPageRenderBundle | PreviewPageRenderBundle
