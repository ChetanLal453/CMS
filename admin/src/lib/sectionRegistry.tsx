import React, { memo } from 'react'
import HomeBanner from '@/app/components/sections/HomeBanner'
import Choose from '@/app/components/sections/Choose'
import Slider from '@/app/components/sections/Slider'
import { getSectionSchema, sanitizeSectionProps } from './sectionSchemas'

const UnknownSection: React.FC<{ sectionType?: string }> = ({ sectionType }) => (
  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
    <div className="text-lg font-semibold">Unsupported section type</div>
    <div className="mt-2 text-sm">The section type "{sectionType || 'unknown'}" is not registered for public rendering.</div>
  </div>
)

const EditableText: React.FC<{
  as?: 'div' | 'h2' | 'h3' | 'p'
  value: string
  editable?: boolean
  className?: string
  placeholder?: string
  onCommit?: (value: string) => void
}> = ({ as = 'div', value, editable = false, className, placeholder, onCommit }) => {
  const Tag = as

  return (
    <Tag
      className={className}
      contentEditable={editable}
      suppressContentEditableWarning={true}
      onBlur={(event: React.FocusEvent<HTMLElement>) => {
        if (!editable) {
          return
        }

        const nextValue = event.currentTarget.textContent?.trim() || ''
        if (nextValue !== value) {
          onCommit?.(nextValue)
        }
      }}>
      {value || placeholder || ''}
    </Tag>
  )
}

type RegisteredSectionRendererProps = {
  editable?: boolean
  onPropsChange?: (updates: Record<string, any>) => void
} & Record<string, any>

const HeroSection: React.FC<RegisteredSectionRendererProps> = memo(({ editable = false, onPropsChange, ...rawProps }) => {
  const props = sanitizeSectionProps('hero', rawProps)
  const centered = props.align === 'center'

  return (
    <section className={`rounded-[28px] px-8 py-12 md:px-12 ${centered ? 'text-center' : 'text-left'}`} style={{ backgroundColor: props.backgroundColor }}>
      {props.showBadge ? (
        <div className="mb-4 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          <EditableText value={props.badgeText} editable={editable} onCommit={(badgeText) => onPropsChange?.({ badgeText })} />
        </div>
      ) : null}
      <div className={`grid gap-8 ${props.image ? 'md:grid-cols-[1.2fr_0.8fr]' : ''} ${centered ? 'items-center' : 'items-start'}`}>
        <div>
          <EditableText as="h2" value={props.title} editable={editable} className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl" placeholder="Hero title" onCommit={(title) => onPropsChange?.({ title })} />
          <EditableText as="p" value={props.subtitle} editable={editable} className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg" placeholder="Hero subtitle" onCommit={(subtitle) => onPropsChange?.({ subtitle })} />
          {(props.ctaLabel || props.ctaHref) ? (
            <div className={`${centered ? 'justify-center' : 'justify-start'} mt-6 flex`}>
              <a href={props.ctaHref || '#'} className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
                {props.ctaLabel || 'Learn More'}
              </a>
            </div>
          ) : null}
        </div>
        {props.image ? (
          <div className={`${centered ? 'mx-auto' : ''} overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm`}>
            <img src={props.image} alt={props.title || 'Hero image'} className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  )
})

const FeaturesSection: React.FC<RegisteredSectionRendererProps> = memo(({ editable = false, onPropsChange, ...rawProps }) => {
  const props = sanitizeSectionProps('features', rawProps)
  const items = Array.isArray(props.items) ? props.items : []
  const columnCount = Math.max(2, Math.min(Number(props.columns || 3), 4))

  return (
    <section className="rounded-[28px] px-8 py-12 md:px-12" style={{ backgroundColor: props.backgroundColor }}>
      <div className="mb-8">
        <EditableText as="h2" value={props.title} editable={editable} className="text-3xl font-semibold tracking-tight text-slate-900" placeholder="Features title" onCommit={(title) => onPropsChange?.({ title })} />
        <EditableText as="p" value={props.subtitle} editable={editable} className="mt-3 max-w-2xl text-base leading-7 text-slate-600" placeholder="Features subtitle" onCommit={(subtitle) => onPropsChange?.({ subtitle })} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {items.length ? (
          items.map((item: any, index: number) => (
            <article key={item?.id || `feature-${index + 1}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{String(index + 1).padStart(2, '0')}</div>
              <EditableText as="h3" value={item?.title || `Feature ${index + 1}`} editable={editable} className="mt-4 text-xl font-semibold text-slate-900" onCommit={(title) => {
                const nextItems = items.map((entry: any, itemIndex: number) => (itemIndex === index ? { ...entry, title } : entry))
                onPropsChange?.({ items: nextItems })
              }} />
              <EditableText as="p" value={item?.description || 'Add a short description for this feature.'} editable={editable} className="mt-3 text-sm leading-6 text-slate-600" onCommit={(description) => {
                const nextItems = items.map((entry: any, itemIndex: number) => (itemIndex === index ? { ...entry, description } : entry))
                onPropsChange?.({ items: nextItems })
              }} />
            </article>
          ))
        ) : (
          <UnknownSection sectionType="features-empty" />
        )}
      </div>
    </section>
  )
})

const GallerySection: React.FC<RegisteredSectionRendererProps> = memo(({ editable = false, onPropsChange, ...rawProps }) => {
  const props = sanitizeSectionProps('gallery', rawProps)
  const images = Array.isArray(props.images) ? props.images : []
  const columnCount = Math.max(2, Math.min(Number(props.columns || 3), 4))
  const borderRadius = props.rounded ? '24px' : '0px'

  return (
    <section className="rounded-[28px] px-8 py-12 md:px-12" style={{ backgroundColor: props.backgroundColor }}>
      <div className="mb-8">
        <EditableText as="h2" value={props.title} editable={editable} className="text-3xl font-semibold tracking-tight text-slate-900" placeholder="Gallery title" onCommit={(title) => onPropsChange?.({ title })} />
        <EditableText as="p" value={props.subtitle} editable={editable} className="mt-3 max-w-2xl text-base leading-7 text-slate-600" placeholder="Gallery subtitle" onCommit={(subtitle) => onPropsChange?.({ subtitle })} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {images.length ? images.map((image: any, index: number) => {
          const imageUrl = typeof image === 'string' ? image : image?.url || image?.src || ''
          return (
            <div key={`${imageUrl}-${index}`} className="overflow-hidden border border-slate-200 bg-white shadow-sm" style={{ borderRadius }}>
              {imageUrl ? <img src={imageUrl} alt={`Gallery item ${index + 1}`} className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center text-sm text-slate-500">Missing image</div>}
            </div>
          )
        }) : <UnknownSection sectionType="gallery-empty" />}
      </div>
    </section>
  )
})

export const sectionRegistry: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  features: FeaturesSection,
  gallery: GallerySection,
  home_banner: HomeBanner,
  choose: Choose,
  slider: Slider,
}

export function getSectionComponent(sectionType?: string | null) {
  if (!sectionType) {
    return null
  }

  return sectionRegistry[sectionType] || null
}

export function renderRegisteredSection(
  section: { id?: string; type?: string; props?: Record<string, any> },
  options: { editable?: boolean; onPropsChange?: (updates: Record<string, any>) => void } = {},
) {
  const schema = getSectionSchema(section?.type || '')
  const Component = getSectionComponent(section?.type)

  if (!Component) {
    console.error(`Missing section renderer for type: ${section?.type || 'unknown'}`)
    return <UnknownSection sectionType={section?.type} />
  }

  const safeProps = schema ? sanitizeSectionProps(section.type, section.props) : (section?.props || {})

  return <Component {...safeProps} editable={options.editable} onPropsChange={options.onPropsChange} content={safeProps} />
}
