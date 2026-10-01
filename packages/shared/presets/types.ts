import type { PageSection } from '../page/PageRenderBundle'

export type PresetCategory =
  | 'hero'
  | 'services'
  | 'about'
  | 'cta'
  | 'testimonials'
  | 'gallery'
  | 'contact'

export interface SectionPreset {
  id: string
  version: number
  name: string
  description?: string
  category: PresetCategory
  tags?: string[]
  industries?: string[]
  thumbnail?: string
  section: PageSection
}
