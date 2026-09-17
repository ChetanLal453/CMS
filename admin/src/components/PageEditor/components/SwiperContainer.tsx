'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { LayoutComponent } from '@/types/page-editor'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { componentRegistry } from '@/lib/componentRegistry'

import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'
import {
  Navigation,
  Pagination,
  Autoplay,
  Mousewheel,
  Scrollbar,
  FreeMode,
  Keyboard,
  Controller,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
} from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/free-mode'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-flip'
import 'swiper/css/effect-cards'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SwiperContainerProps {
  id?: string
  component?: LayoutComponent
  slides?: any[]
  onUpdate?: (newProps: Record<string, any>) => void
  onComponentSelect?: (component: LayoutComponent, context: any) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  deleteComponent?: (componentId: string, context?: any) => void
  sectionId?: string
  containerId?: string
  rowId?: string
  colId?: string
  isEditing?: boolean
  [key: string]: any
}

interface SlideType {
  id: string
  components: LayoutComponent[]
  bgType?: 'color' | 'image' | 'gradient'
  bgColor?: string
  bgImage?: string
  bgGradient?: string
  bgOverlay?: boolean
  bgOverlayColor?: string
  bgOverlayOpacity?: number
  padding?: string
  minHeight?: string
  title?: string
  subtitle?: string
  backgroundColor?: string // legacy
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const PREVIEW_GRADIENTS = [
  'linear-gradient(135deg, #1a1628, #22263a)',
  'linear-gradient(135deg, #0f1a14, #1a2820)',
  'linear-gradient(135deg, #1a1210, #2a1c1a)',
] as const

const PREVIEW_LABELS = [
  'Hero slide content',
  'Testimonial card',
  'Product feature',
  'Case study highlight',
] as const

const getPreviewGradient = (slideIndex: number) =>
  PREVIEW_GRADIENTS[slideIndex % PREVIEW_GRADIENTS.length]

const getPreviewLabel = (slideIndex: number) =>
  PREVIEW_LABELS[slideIndex % PREVIEW_LABELS.length]

const createDefaultSlide = (id: string, slideIndex = 0): SlideType => ({
  id,
  components: [],
  bgType: 'gradient',
  bgGradient: getPreviewGradient(slideIndex),
  padding: '12px',
  minHeight: '120px',
  title: '',
  subtitle: '',
})

export const swiperContainerDefaultProps = {
  slidesPerView: 3,
  slidesPerGroup: 1,
  spaceBetween: 12,
  direction: 'horizontal' as const,
  centeredSlides: false,
  autoplay: false,
  autoplayDelay: 3000,
  loop: true,
  speed: 500,
  draggable: true,
  grabCursor: true,
  freeMode: false,
  mousewheel: false,
  keyboard: true,
  navigation: true,
  arrowStyle: 'rounded' as const,
  arrowPosition: 'sides' as const,
  pagination: true,
  paginationType: 'bullets' as const,
  paginationDynamic: false,
  paginationClickable: true,
  effect: 'slide' as const,
  effectFadeCrossFade: true,
  effectCubeShadow: true,
  effectCubeSlideShadows: true,
  effectCoverflowRotate: 30,
  effectCoverflowDepth: 100,
  effectCoverflowStretch: 0,
  effectCoverflowModifier: 1,
  effectFlipSlideShadows: true,
  effectCardsPerSlideOffset: 8,
  effectCardsRotate: true,
  hoverEffects: true,
  hoverEffectType: 'none' as const,
  hoverIntensity: 1.06,
  scrollbar: false,
  scrollbarDraggable: true,
  backgroundColor: 'transparent',
  padding: '0px',
  borderRadius: '0px',
  height: 'auto',
  width: '100%',
  slideMinHeight: '120px',
  slides: [
    createDefaultSlide('slide-1', 0),
    createDefaultSlide('slide-2', 1),
    createDefaultSlide('slide-3', 2),
    createDefaultSlide('slide-4', 3),
    createDefaultSlide('slide-5', 4),
  ],
}

export const swiperContainerSchema = {
  properties: {
    direction: {
      type: 'select' as const,
      label: 'Direction',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
      ],
      category: 'Layout',
    },
    slidesPerView: {
      type: 'select' as const,
      label: 'Slides Per View',
      default: 3,
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
        { value: 5, label: '5' },
        { value: 'auto', label: 'Auto' },
      ],
      category: 'Layout',
    },
    slidesPerGroup: {
      type: 'select' as const,
      label: 'Slides Per Group',
      default: 1,
      options: [
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' },
      ],
      category: 'Layout',
    },
    spaceBetween: {
      type: 'number' as const,
      label: 'Space Between (px)',
      default: 12,
      min: 0,
      max: 80,
      category: 'Layout',
    },
    centeredSlides: {
      type: 'toggle' as const,
      label: 'Centered Slides',
      default: false,
      category: 'Layout',
    },
    slideMinHeight: {
      type: 'text' as const,
      label: 'Slide Height',
      default: '120px',
      category: 'Layout',
    },
    autoplay: {
      type: 'toggle' as const,
      label: 'Auto Play',
      default: false,
      category: 'Behavior',
    },
    autoplayDelay: {
      type: 'number' as const,
      label: 'Auto Play Delay (ms)',
      default: 3000,
      min: 1000,
      max: 10000,
      step: 500,
      category: 'Behavior',
    },
    loop: {
      type: 'toggle' as const,
      label: 'Infinite Loop',
      default: true,
      category: 'Behavior',
    },
    speed: {
      type: 'number' as const,
      label: 'Transition Speed (ms)',
      default: 500,
      min: 100,
      max: 2000,
      category: 'Behavior',
    },
    draggable: {
      type: 'toggle' as const,
      label: 'Draggable',
      default: true,
      category: 'Behavior',
    },
    grabCursor: {
      type: 'toggle' as const,
      label: 'Grab Cursor',
      default: true,
      category: 'Behavior',
    },
    freeMode: {
      type: 'toggle' as const,
      label: 'Free Mode',
      default: false,
      category: 'Behavior',
    },
    mousewheel: {
      type: 'toggle' as const,
      label: 'Mousewheel Control',
      default: false,
      category: 'Behavior',
    },
    keyboard: {
      type: 'toggle' as const,
      label: 'Keyboard Control',
      default: true,
      category: 'Behavior',
    },
    navigation: {
      type: 'toggle' as const,
      label: 'Navigation Arrows',
      default: true,
      category: 'Navigation',
    },
    arrowStyle: {
      type: 'select' as const,
      label: 'Arrow Style',
      default: 'rounded',
      options: [
        { value: 'rounded', label: 'Rounded' },
        { value: 'square', label: 'Square' },
        { value: 'minimal', label: 'Minimal' },
      ],
      category: 'Navigation',
    },
    arrowPosition: {
      type: 'select' as const,
      label: 'Arrow Position',
      default: 'sides',
      options: [
        { value: 'sides', label: 'Sides' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'top-right', label: 'Top Right' },
      ],
      category: 'Navigation',
    },
    pagination: {
      type: 'toggle' as const,
      label: 'Pagination Dots',
      default: true,
      category: 'Navigation',
    },
    paginationType: {
      type: 'select' as const,
      label: 'Pagination Type',
      default: 'bullets',
      options: [
        { value: 'bullets', label: 'Bullets' },
        { value: 'fraction', label: 'Fraction' },
        { value: 'progressbar', label: 'Progress Bar' },
        { value: 'lines', label: 'Lines' },
        { value: 'numbered', label: 'Numbered' },
      ],
      category: 'Navigation',
    },
    paginationDynamic: {
      type: 'toggle' as const,
      label: 'Dynamic Bullets',
      default: false,
      category: 'Navigation',
    },
    paginationClickable: {
      type: 'toggle' as const,
      label: 'Clickable Pagination',
      default: true,
      category: 'Navigation',
    },
    scrollbar: {
      type: 'toggle' as const,
      label: 'Scrollbar',
      default: false,
      category: 'Navigation',
    },
    effect: {
      type: 'select' as const,
      label: 'Transition Effect',
      default: 'slide',
      options: [
        { value: 'slide', label: 'Slide' },
        { value: 'fade', label: 'Fade' },
        { value: 'cube', label: 'Cube' },
        { value: 'coverflow', label: 'Coverflow' },
        { value: 'flip', label: 'Flip' },
        { value: 'cards', label: 'Cards' },
      ],
      category: 'Effects',
    },
    effectFadeCrossFade: {
      type: 'toggle' as const,
      label: 'Fade Cross-Fade',
      default: true,
      category: 'Effects',
    },
    effectCubeShadow: {
      type: 'toggle' as const,
      label: 'Cube Shadow',
      default: true,
      category: 'Effects',
    },
    effectCubeSlideShadows: {
      type: 'toggle' as const,
      label: 'Cube Slide Shadows',
      default: true,
      category: 'Effects',
    },
    effectCoverflowRotate: {
      type: 'number' as const,
      label: 'Coverflow Rotate',
      default: 30,
      min: 0,
      max: 90,
      category: 'Effects',
    },
    effectCoverflowDepth: {
      type: 'number' as const,
      label: 'Coverflow Depth',
      default: 100,
      min: 0,
      max: 400,
      category: 'Effects',
    },
    effectCoverflowStretch: {
      type: 'number' as const,
      label: 'Coverflow Stretch',
      default: 0,
      min: -200,
      max: 200,
      category: 'Effects',
    },
    effectCoverflowModifier: {
      type: 'number' as const,
      label: 'Coverflow Modifier',
      default: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
      category: 'Effects',
    },
    effectFlipSlideShadows: {
      type: 'toggle' as const,
      label: 'Flip Slide Shadows',
      default: true,
      category: 'Effects',
    },
    effectCardsPerSlideOffset: {
      type: 'number' as const,
      label: 'Cards Offset',
      default: 8,
      min: 0,
      max: 32,
      category: 'Effects',
    },
    effectCardsRotate: {
      type: 'toggle' as const,
      label: 'Cards Rotate',
      default: true,
      category: 'Effects',
    },
    hoverEffects: {
      type: 'toggle' as const,
      label: 'Slide Hover Effects',
      default: true,
      category: 'Effects',
    },
    hoverEffectType: {
      type: 'select' as const,
      label: 'Hover Type',
      default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'zoom', label: 'Zoom' },
        { value: 'lift', label: 'Lift' },
        { value: 'dim', label: 'Dim' },
        { value: 'brighten', label: 'Brighten' },
        { value: 'glow', label: 'Border Glow' },
      ],
      category: 'Effects',
    },
    hoverIntensity: {
      type: 'number' as const,
      label: 'Hover Intensity',
      default: 1.06,
      min: 1,
      max: 1.2,
      step: 0.01,
      category: 'Effects',
    },
    backgroundColor: {
      type: 'color' as const,
      label: 'Background Color',
      default: 'transparent',
      category: 'Style',
    },
    borderRadius: {
      type: 'text' as const,
      label: 'Border Radius',
      default: '0px',
      category: 'Style',
    },
    width: {
      type: 'text' as const,
      label: 'Width',
      default: '100%',
      category: 'Style',
    },
  },
}

// ─── ComponentPreview ──────────────────────────────────────────────────────────

const ComponentPreview: React.FC<{
  component: LayoutComponent
  context: any
  onComponentSelect?: (component: LayoutComponent, context: any) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
}> = ({ component, context, onComponentSelect, onComponentUpdate }) => {
  const componentDef = useMemo(
    () => componentRegistry.getComponent(component.type),
    [component.type]
  )

  if (!componentDef?.render) {
    return (
      <div className="sc-unknown">
        <span>📦</span>
        <span>{component.type}</span>
      </div>
    )
  }

  const rendered = componentDef.render({
    ...component.props,
    component,
    onUpdate: (p: Record<string, any>) => onComponentUpdate?.(component.id, p),
    onComponentSelect,
    onComponentUpdate,
    sectionId: context.sectionId,
    containerId: context.containerId,
    rowId: context.rowId,
    colId: context.colId,
  })

  return (
    <div
      className="sc-comp"
      onClick={(e) => {
        e.stopPropagation()
        onComponentSelect?.(component, context)
      }}
    >
      {rendered}
    </div>
  )
}

// ─── Slide ─────────────────────────────────────────────────────────────────────

const Slide: React.FC<{
  slide: SlideType
  slideIndex: number
  swiperId: string
  sectionId: string
  containerId: string
  totalSlides: number
  onDeleteSlide: (index: number) => void
  onComponentSelect?: (component: LayoutComponent, context: any) => void
  onComponentUpdate?: (componentId: string, props: Record<string, any>) => void
  onSlideUpdate: (slideIndex: number, updatedSlide: SlideType) => void
  isEditing: boolean
  slideMinHeight: string
  isClone?: boolean
}> = ({
  slide,
  slideIndex,
  swiperId,
  sectionId,
  containerId,
  totalSlides,
  onDeleteSlide,
  onComponentSelect,
  onComponentUpdate,
  onSlideUpdate,
  isEditing,
  slideMinHeight,
  isClone = false,
}) => {
  const dropId = `swiper-${swiperId}-slide-${slideIndex}${isClone ? '-clone' : ''}`
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: {
      type: 'swiper-slide',
      swiperId,
      slideIndex,
      sectionId,
      containerId,
      rowId: `slide-${slideIndex}`,
      colId: 'swiper-content',
      isClone,
      accepts: [
        'text','button','image','card','grid','NewGrid','advancedImage',
        'advancedCard','advancedheading','advancedparagraph','advancedbutton',
        'richtext','video','icon','divider','advancedaccordion','tabs',
        'advancedlist','swipercontainer','flexbox','container','spacer',
      ],
    },
  })

  // ── Resolve background ──────────────────────────────────────────────────────
  const bgType = slide.bgType || (slide.bgImage ? 'image' : slide.bgGradient ? 'gradient' : 'color')
  const bgColor = slide.bgColor || slide.backgroundColor || '#1a1d28'
  const hasComps = (slide.components?.length || 0) > 0
  const minH = hasComps ? (slide.minHeight || slideMinHeight || '120px') : '120px'
  const pad = slide.padding || '12px'
  const previewLabel = (slide.title || '').trim() || getPreviewLabel(slideIndex)
  const normalizedBg = String(bgColor).trim().toLowerCase()
  const previewFriendlyBg = [
    '#1a1d28',
    '#fff',
    '#ffffff',
    '#f0f0f0',
    '#e0e0e0',
    '#d0d0d0',
    '#c0c0c0',
    '#b0b0b0',
    'white',
    'transparent',
  ].includes(normalizedBg)

  const bgStyle: React.CSSProperties = (() => {
    if (bgType === 'image' && slide.bgImage)
      return { backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    if (bgType === 'gradient' && slide.bgGradient)
      return { backgroundImage: slide.bgGradient }
    return { backgroundColor: bgColor }
  })()

  const cardStyle: React.CSSProperties = { minHeight: minH, padding: pad, ...bgStyle }
  if (!slide.bgImage && !slide.bgGradient && previewFriendlyBg) {
    cardStyle.backgroundImage = getPreviewGradient(slideIndex)
    cardStyle.backgroundColor = 'transparent'
    if (String(pad).trim() === '20px' || String(pad).trim() === '20px 20px') {
      cardStyle.padding = '12px'
    }
  }

  const deleteChild = (ci: number) => {
    onSlideUpdate(slideIndex, {
      ...slide,
      components: slide.components?.filter((_, i) => i !== ci) || [],
    })
  }

  const editChild = (child: LayoutComponent, ci: number) => {
    onComponentSelect?.(child, {
      sectionId,
      containerId: containerId || swiperId,
      rowId: `slide-${slideIndex}`,
      colId: `component-${ci}`,
      slideIndex,
      source: 'swiper-slide',
    })
  }

  return (
    <div
      ref={setNodeRef}
      className="sc-slide-root"
      style={{ minHeight: minH }}
      data-slide-index={slideIndex}
    >
      <div
        className={[
          'sc-card',
          isOver    ? 'sc-card--over'  : '',
          isClone   ? 'sc-card--clone' : '',
        ].join(' ')}
        style={cardStyle}
      >
        {/* Overlay */}
        {slide.bgOverlay && (
          <div className="sc-overlay" style={{
            backgroundColor: slide.bgOverlayColor || '#000',
            opacity: typeof slide.bgOverlayOpacity === 'number' ? slide.bgOverlayOpacity : 0.4,
          }} />
        )}

        {/* Drop pulse ring */}
        {isOver && <div className="sc-drop-ring" />}

        {/* ── Editor top micro-bar ─────────────────────────────────────────── */}
        {isEditing && (
          <div className="sc-bar">
            {(hasComps || slide.title || slide.subtitle) && (
              <span className="sc-bar-num">
                {slideIndex + 1}
                <span className="sc-bar-of">/{totalSlides}</span>
              </span>
            )}
            {isClone && <span className="sc-chip sc-chip--y">Clone</span>}
            {isOver  && <span className="sc-chip sc-chip--p">Drop</span>}
            <button
              className="sc-del"
              onClick={(e) => { e.stopPropagation(); onDeleteSlide(slideIndex) }}
              title="Delete slide"
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}

        {/* Quick title/subtitle */}
        {hasComps && (slide.title || slide.subtitle) && (
          <div className="sc-quickcontent">
            {slide.title    && <p className="sc-qt">{slide.title}</p>}
            {slide.subtitle && <p className="sc-qs">{slide.subtitle}</p>}
          </div>
        )}

        {/* ── Content area ─────────────────────────────────────────────────── */}
        <div className={`sc-body ${isEditing && hasComps ? 'sc-body--editing' : ''}`}>
          {hasComps ? (
            <div className="sc-comps">
              {slide.components.map((child: LayoutComponent, ci: number) => {
                const ctx = {
                  sectionId,
                  containerId: containerId || swiperId,
                  rowId: `slide-${slideIndex}`,
                  colId: `component-${ci}`,
                  slideIndex,
                  source: 'swiper-slide',
                }
                return (
                  <div key={child.id || `c-${ci}`} className="sc-child">
                    {isEditing && (
                      <div className="sc-child-bar">
                        <span className="sc-child-type">
                          {child.type.replace('advanced', '')}
                        </span>
                        <div className="sc-child-actions">
                          <button className="sc-cbtn" onClick={(e) => { e.stopPropagation(); editChild(child, ci) }}>Edit</button>
                          <button className="sc-cbtn sc-cbtn--del" onClick={(e) => { e.stopPropagation(); deleteChild(ci) }}>×</button>
                        </div>
                      </div>
                    )}
                    <ComponentPreview
                      component={child}
                      context={ctx}
                      onComponentSelect={onComponentSelect}
                      onComponentUpdate={onComponentUpdate}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={`sc-empty-preview ${isOver ? 'sc-empty-preview--over' : ''}`}>
              <div className="sc-preview-num">{String(slideIndex + 1).padStart(2, '0')}</div>
              <div className="sc-preview-label">{previewLabel}</div>
              {isEditing && (
                <div className="sc-drop-hint">
                  {(slide.subtitle || '').trim() || 'Drop components here'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SwiperContainer ──────────────────────────────────────────────────────────

const SwiperContainer: React.FC<SwiperContainerProps> = ({
  id,
  component: propComponent,
  slides: propSlides = [],
  onUpdate,
  onComponentSelect,
  onComponentUpdate,
  deleteComponent,
  sectionId = '',
  containerId = '',
  isEditing = true,
  ...props
}) => {
  const cp = { ...swiperContainerDefaultProps, ...(props as any) }
  const cid = id || propComponent?.id || `swiper-${Date.now()}`

  const getSlides = (): SlideType[] => {
    if (propComponent?.props?.slides?.length) return propComponent.props.slides
    if (propSlides?.length) return propSlides
    return cp.slides
  }

  const [slides, setSlides]               = useState<SlideType[]>(getSlides)
  const [swiper, setSwiper]               = useState<SwiperType | null>(null)
  const [activeIdx, setActiveIdx]         = useState(0)
  const timerRef                          = useRef<NodeJS.Timeout>()
  const containerRef                      = useRef<HTMLDivElement>(null)

  useEffect(() => { setSlides(getSlides()) }, [propComponent, propSlides])
  useEffect(() => {
    if (activeIdx >= slides.length) setActiveIdx(Math.max(0, slides.length - 1))
  }, [slides.length])
  useEffect(() => () => clearTimeout(timerRef.current), [])

  useEffect(() => {
    if (!containerRef.current || !swiper) return
    let rafId: number
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!swiper.destroyed) {
          swiper.update()
        }
      })
    })
    ro.observe(containerRef.current)
    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [swiper])

  const spv: number | 'auto' = (() => {
    const v = cp.slidesPerView
    if (v === 'auto') return 'auto'
    const n = parseInt(String(v)); return isNaN(n) ? 1 : n
  })()

  const spvNum = typeof spv === 'number' ? spv : 1

  const loopOk = useMemo(() => {
    if (!cp.loop) return false
    const n = slides.length
    return cp.centeredSlides ? n >= spvNum + 2 : n >= spvNum + 1
  }, [cp.loop, cp.centeredSlides, slides.length, spvNum])
  const canLoop = Boolean(cp.loop) && loopOk
  const canAutoplay = Boolean(cp.autoplay) && slides.length > 1

  const push = (newProps: Record<string, any>) => {
    if (newProps.slides) setSlides(newProps.slides)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onUpdate?.(newProps), 300)
  }

  const addSlide = () => {
    const s = createDefaultSlide(
      `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      slides.length
    )
    s.minHeight = cp.slideMinHeight || '120px'
    const next = [...slides, s]
    push({ slides: next })
    setTimeout(() => swiper?.slideTo(next.length - 1), 100)
  }

  const delSlide = (i: number) => {
    if (slides.length <= 1) return
    push({ slides: slides.filter((_, idx) => idx !== i) })
  }

  const updateSlide = (i: number, updated: SlideType) => {
    const arr = [...slides]; arr[i] = updated; push({ slides: arr })
  }

  // ── Swiper config ─────────────────────────────────────────────────────────
  const swiperCfg = useMemo(() => {
    const effectName = String(cp.effect || 'slide')
    const singleSlideEffects = ['cube', 'flip', 'cards']
    const forceSingleSlide = singleSlideEffects.includes(effectName)
    const paginationType = cp.paginationType === 'lines' || cp.paginationType === 'numbered'
      ? 'bullets'
      : cp.paginationType

    const cfg: any = {
      modules: [
        Navigation,
        Pagination,
        Autoplay,
        Mousewheel,
        Scrollbar,
        FreeMode,
        Keyboard,
        Controller,
        EffectFade,
        EffectCube,
        EffectCoverflow,
        EffectFlip,
        EffectCards,
      ],
      direction: cp.direction,
      slidesPerView: forceSingleSlide ? 1 : spv,
      slidesPerGroup: parseInt(String(cp.slidesPerGroup)) || 1,
      spaceBetween: parseFloat(String(cp.spaceBetween)) || 12,
      speed: parseFloat(String(cp.speed)) || 500,
      grabCursor: !isEditing && Boolean(cp.grabCursor),
      allowTouchMove: !isEditing && Boolean(cp.draggable),
      mousewheel: !isEditing && Boolean(cp.mousewheel),
      freeMode: Boolean(cp.freeMode),
      loop: canLoop,
      centeredSlides: Boolean(cp.centeredSlides),
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
      effect: effectName,
      breakpointsBase: 'container',
      breakpoints: !forceSingleSlide && spv !== 'auto'
        ? {
            0: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            600: {
              slidesPerView: Math.min(2, spvNum),
              spaceBetween: 12,
            },
            900: {
              slidesPerView: spvNum,
              spaceBetween: parseFloat(String(cp.spaceBetween)) || 12,
            },
          }
        : undefined,
    }

    if (effectName === 'fade') {
      cfg.fadeEffect = { crossFade: Boolean(cp.effectFadeCrossFade) }
    }
    if (effectName === 'cube') {
      cfg.cubeEffect = {
        shadow: Boolean(cp.effectCubeShadow),
        slideShadows: Boolean(cp.effectCubeSlideShadows),
      }
    }
    if (effectName === 'coverflow') {
      cfg.coverflowEffect = {
        rotate: parseFloat(String(cp.effectCoverflowRotate)) || 30,
        depth: parseFloat(String(cp.effectCoverflowDepth)) || 100,
        stretch: parseFloat(String(cp.effectCoverflowStretch)) || 0,
        modifier: parseFloat(String(cp.effectCoverflowModifier)) || 1,
        slideShadows: true,
      }
    }
    if (effectName === 'flip') {
      cfg.flipEffect = { slideShadows: Boolean(cp.effectFlipSlideShadows) }
    }
    if (effectName === 'cards') {
      cfg.cardsEffect = {
        perSlideOffset: parseFloat(String(cp.effectCardsPerSlideOffset)) || 8,
        rotate: Boolean(cp.effectCardsRotate),
      }
    }

    if (cp.navigation) {
      cfg.navigation = {
        nextEl: `.sc-nav-next-${cid}`,
        prevEl: `.sc-nav-prev-${cid}`,
        disabledClass: 'sc-nav-disabled',
      }
    }

    if (cp.pagination) {
      cfg.pagination = {
        el: `.sc-pg-${cid}`,
        clickable: Boolean(cp.paginationClickable),
        type: paginationType as any,
        dynamicBullets: Boolean(cp.paginationDynamic && cp.paginationType === 'bullets'),
      }

      if (cp.paginationType === 'numbered') {
        cfg.pagination.renderBullet = (index: number, className: string) =>
          `<span class="${className}"><span>${index + 1}</span></span>`
      }
    }

    if (canAutoplay) {
      cfg.autoplay = {
        delay: parseFloat(String(cp.autoplayDelay)) || 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }
    }

    if (!isEditing && cp.keyboard) cfg.keyboard = { enabled: true, onlyInViewport: true }

    if (cp.scrollbar && !isEditing) {
      cfg.scrollbar = { el: `.sc-sb-${cid}`, draggable: true }
    }

    return cfg
  }, [cp, spv, canLoop, canAutoplay, isEditing, cid])

  const hoverIntensity = Math.min(1.2, Math.max(1, parseFloat(String(cp.hoverIntensity)) || 1.06))
  const hoverLiftPx = Math.max(2, Math.round((hoverIntensity - 1) * 70))
  const hoverBrightness = Math.min(1.35, 1 + (hoverIntensity - 1) * 2.5)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="sc-wrap"
      data-swiper-id={cid}
      data-section-id={sectionId}
      data-ready-for-drop={isEditing ? 'true' : 'false'}
      data-arrow-style={cp.arrowStyle || 'rounded'}
      data-arrow-position={cp.arrowPosition || 'sides'}
      data-dots-type={cp.paginationType || 'bullets'}
      data-hover-enabled={!isEditing && cp.hoverEffects ? 'true' : 'false'}
      data-hover-type={cp.hoverEffectType || 'none'}
      style={{
        backgroundColor: cp.backgroundColor,
        borderRadius: cp.borderRadius,
        width: cp.width || '100%',
        ['--sc-hover-intensity' as any]: String(hoverIntensity),
        ['--sc-hover-lift' as any]: `${hoverLiftPx}px`,
        ['--sc-hover-brightness' as any]: String(hoverBrightness),
      }}
    >
      {/* Toolbar */}
      {isEditing && (
        <div className="sc-toolbar">
          <div className="sc-toolbar-info">
            <span className="sc-toolbar-tag">Swiper</span>
            <span className="sc-toolbar-meta">
              {slides.length} slides · {spvNum} per view
            </span>
          </div>
          <button className="sc-add-btn" onClick={addSlide}>
            <Plus size={12} />
            Add Slide
          </button>
        </div>
      )}

      {/* Swiper + nav */}
      {slides.length > 0 ? (
        <div className="sc-swiper-wrap">
          <Swiper
            {...swiperCfg}
            onSwiper={(s) => { setSwiper(s); setActiveIdx(s.activeIndex || 0) }}
            onSlideChange={(s) => setActiveIdx(s.activeIndex)}
            className={`sc-swiper ${spv === 'auto' ? 'sc-swiper--auto' : ''}`}
          >
            {slides.map((slide, i) => (
              <SwiperSlide key={slide.id} className="sc-swiper-slide">
                <Slide
                  slide={slide}
                  slideIndex={i}
                  swiperId={cid}
                  sectionId={sectionId}
                  containerId={containerId || cid}
                  totalSlides={slides.length}
                  onDeleteSlide={delSlide}
                  onComponentSelect={onComponentSelect}
                  onComponentUpdate={onComponentUpdate}
                  onSlideUpdate={updateSlide}
                  isEditing={isEditing}
                  slideMinHeight={cp.slideMinHeight}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom arrows */}
          {cp.navigation && (
            <>
              <button className={`sc-nav sc-nav-prev sc-nav-prev-${cid}`}>
                <ChevronLeft size={15} strokeWidth={2} />
              </button>
              <button className={`sc-nav sc-nav-next sc-nav-next-${cid}`}>
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      ) : (
        /* Zero slides */
        <div className="sc-zero">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="sc-zero-icon">
            <rect x="2" y="7" width="20" height="13" rx="2"/>
            <path d="M16 7V5a2 2 0 00-4 0v2"/>
          </svg>
          <p className="sc-zero-title">No Slides</p>
          <p className="sc-zero-sub">Add slides to build the carousel</p>
          <button className="sc-add-btn" onClick={addSlide}>
            <Plus size={13} /> Create First Slide
          </button>
        </div>
      )}

      {/* Pagination */}
      {cp.pagination && (
        <div className={`sc-pg sc-pg-${cid}`} />
      )}

      {/* Scrollbar — preview only */}
      {cp.scrollbar && !isEditing && (
        <div className={`sc-sb sc-sb-${cid}`} />
      )}

      {/* ── Global styles ── */}
      <style jsx global>{`

        /* ── Tokens ── */
        .sc-wrap {
          --sc-bg:        #0d0f14;
          --sc-surface:   #13161e;
          --sc-surface2:  #1a1d28;
          --sc-surface3:  #22263a;
          --sc-border:    rgba(255,255,255,0.07);
          --sc-border2:   rgba(255,255,255,0.13);
          --sc-accent:    #7c6dfa;
          --sc-accent2:   #a594ff;
          --sc-accentbg:  rgba(124,109,250,0.12);
          --sc-green:     #3ecf8e;
          --sc-red:       #f87171;
          --sc-yellow:    #fbbf24;
          --sc-text:      #e8eaf0;
          --sc-text2:     #8b90a8;
          --sc-text3:     #5a5f7a;
          font-family: 'DM Sans', system-ui, sans-serif;
          position: relative;
          background-image: radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* ── Toolbar ── */
        .sc-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px 8px;
        }
        .sc-toolbar-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sc-toolbar-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--sc-text3);
        }
        .sc-toolbar-meta {
          font-size: 11px;
          color: var(--sc-text3);
          font-family: 'DM Mono', monospace;
        }
        .sc-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 13px;
          border-radius: 20px;
          border: 1px solid rgba(124,109,250,0.3);
          background: rgba(124,109,250,0.1);
          color: var(--sc-accent2);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .sc-add-btn:hover { background: rgba(124,109,250,0.18); }

        /* ── Swiper outer ── */
        .sc-swiper-wrap {
          position: relative;
          width: 100%;
          box-sizing: border-box;
          transition: padding 0.2s ease;
        }
        .sc-wrap[data-arrow-position='sides'] .sc-swiper-wrap {
          padding: 0 40px;
        }
        .sc-wrap[data-arrow-position='sides'] .sc-toolbar {
          padding: 12px 40px 8px;
        }
        .sc-swiper {
          overflow: hidden !important;
          padding: 8px 0 16px !important;
        }
        .sc-swiper--auto .sc-swiper-slide {
          width: 280px !important;
        }
        .sc-swiper-slide {
          height: 380px !important;
          max-height: 380px !important;
          display: flex !important;
          align-items: stretch !important;
          box-sizing: border-box !important;
          transition: opacity 0.25s;
        }

        /* Non-visible slides: subtle dim */
        .sc-swiper-slide:not(.swiper-slide-visible) {
          opacity: 0.4;
        }
        .sc-swiper-slide:hover { opacity: 1 !important; }

        /* ── Slide root ── */
        .sc-slide-root {
          width: 100%;
          height: 100% !important;
          min-height: 0 !important;
          max-height: 380px !important;
          display: flex !important;
        }

        /* ── Card — THE single visible box ── */
        .sc-card {
          position: relative;
          width: 100%;
          height: 100% !important;
          min-height: 0 !important;
          max-height: 380px !important;
          border-radius: 12px;
          border: 1px solid var(--sc-border2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: border-color 0.2s;
          background: var(--sc-surface2);
        }
        .sc-card--over {
          border-color: rgba(124,109,250,0.5) !important;
          box-shadow: 0 0 0 2px rgba(124,109,250,0.1);
        }
        .sc-card--clone {
          border-style: dashed;
          border-color: rgba(251,191,36,0.35);
        }
        .sc-wrap[data-hover-enabled='true'] .sc-card {
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            filter 0.22s ease,
            opacity 0.22s ease,
            border-color 0.22s ease;
          transform-origin: center;
          will-change: transform, opacity, filter;
        }
        .sc-wrap[data-hover-enabled='true'][data-hover-type='zoom'] .sc-swiper-slide:hover .sc-card {
          transform: scale(var(--sc-hover-intensity));
          z-index: 3;
        }
        .sc-wrap[data-hover-enabled='true'][data-hover-type='lift'] .sc-swiper-slide:hover .sc-card {
          transform: translateY(calc(var(--sc-hover-lift) * -1));
          box-shadow: 0 10px 24px rgba(0,0,0,0.28);
          z-index: 3;
        }
        .sc-wrap[data-hover-enabled='true'][data-hover-type='dim'] .sc-swiper-slide:hover .sc-card {
          opacity: 0.65;
        }
        .sc-wrap[data-hover-enabled='true'][data-hover-type='brighten'] .sc-swiper-slide:hover .sc-card {
          filter: brightness(var(--sc-hover-brightness));
          border-color: rgba(124,109,250,0.42);
        }
        .sc-wrap[data-hover-enabled='true'][data-hover-type='glow'] .sc-swiper-slide:hover .sc-card {
          border-color: rgba(124,109,250,0.5);
          box-shadow: 0 0 16px rgba(124,109,250,0.35);
        }

        /* Drop ring */
        .sc-drop-ring {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          border: 1.5px solid var(--sc-accent);
          pointer-events: none;
          z-index: 30;
          animation: sc-pulse 1.2s ease-in-out infinite;
        }
        @keyframes sc-pulse {
          0%,100% { opacity:.6 } 50% { opacity:.2 }
        }

        /* Overlay */
        .sc-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Micro bar ── */
        /*
          Replaces the heavy "CONTENT Slide 7 | trash" bar.
          Now: just a translucent 28px strip at top-right corner.
          Slide number + delete. Nothing else.
        */
        .sc-bar {
          position: absolute;
          top: 8px;
          right: 8px;
          left: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          z-index: 10;
          pointer-events: none;
          justify-content: flex-end;
        }
        .sc-bar > * { pointer-events: auto; }
        .sc-bar-num {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Mono', monospace;
          background: rgba(13,15,20,0.5);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .sc-bar-of {
          color: rgba(255,255,255,0.15);
          font-weight: 400;
        }
        .sc-chip {
          font-size: 9px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 20px;
          letter-spacing: 0.04em;
        }
        .sc-chip--y { background: rgba(251,191,36,0.15); color: var(--sc-yellow); }
        .sc-chip--p { background: var(--sc-accentbg); color: var(--sc-accent2); }
        .sc-del {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid rgba(248,113,113,0.2);
          background: rgba(248,113,113,0.08);
          color: rgba(248,113,113,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          padding: 0;
        }
        .sc-del:hover {
          background: rgba(248,113,113,0.18);
          color: var(--sc-red);
        }

        /* ── Quick content ── */
        .sc-quickcontent {
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
          padding-top: 30px; /* make room for floating sc-bar */
        }
        .sc-qt { font-size: 12px; font-weight: 600; color: var(--sc-text); margin: 0 0 2px; }
        .sc-qs { font-size: 10.5px; color: var(--sc-text3); font-family: 'DM Mono', monospace; margin: 0; }

        /* ── Body ── */
        .sc-body {
          flex: 1;
          position: relative;
          z-index: 2;
          min-height: 0;
          overflow: hidden;          /* no inner scroll — slide clips naturally */
          display: flex;
          flex-direction: column;
        }
        .sc-body--editing {
          padding-top: 34px;
        }
        /* Only show scroll if components make it taller */
        .sc-body:has(.sc-comps) {
          overflow-y: auto;
        }
        .sc-body::-webkit-scrollbar { width: 3px; }
        .sc-body::-webkit-scrollbar-track { background: transparent; }
        .sc-body::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
        }

        /* ── Components ── */
        .sc-comps { display: flex; flex-direction: column; gap: 10px; }

        .sc-child {
          border-radius: 6px;
          border: 1px solid transparent;
          transition: border-color 0.15s;
        }
        .sc-child:hover { border-color: rgba(124,109,250,0.25); }

        .sc-child-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 7px 3px;
          border-bottom: 1px dashed rgba(255,255,255,0.05);
          margin-bottom: 3px;
        }
        .sc-child-type {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--sc-text3);
        }
        .sc-child-actions { display: flex; gap: 3px; }
        .sc-cbtn {
          font-size: 9.5px;
          padding: 1px 6px;
          border-radius: 5px;
          border: 1px solid rgba(124,109,250,0.2);
          background: rgba(124,109,250,0.07);
          color: var(--sc-accent2);
          cursor: pointer;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .sc-cbtn--del {
          border-color: rgba(248,113,113,0.2);
          background: rgba(248,113,113,0.07);
          color: var(--sc-red);
        }

        .sc-comp { width: 100%; overflow: hidden; }

        /* ── Empty state — Symmetrical & Centered ── */
        .sc-empty-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          min-height: 100%;
          gap: 8px;
          padding: 20px;
          text-align: center;
          transition: transform 0.2s;
        }
        .sc-empty-preview--over {
          transform: scale(1.02);
        }
        .sc-preview-num {
          font-size: 38px;
          font-weight: 700;
          opacity: 0.18;
          color: #ffffff;
          line-height: 1;
          font-family: 'DM Mono', monospace;
        }
        .sc-preview-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--sc-text);
          margin: 0;
        }
        .sc-drop-hint {
          font-size: 11px;
          color: var(--sc-accent2);
          background: rgba(124, 109, 250, 0.1);
          border: 1px dashed rgba(124, 109, 250, 0.35);
          border-radius: 999px;
          padding: 4px 14px;
          margin-top: 6px;
        }

        /* ── Card inside Swiper Slide: Symmetrical & Balanced ── */
        .sc-comps {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow-y: auto;
        }
        .sc-comps::-webkit-scrollbar { width: 4px; }
        .sc-comps::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
        }
        .sc-comps .sc-child {
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .sc-comps .advanced-card {
          height: 100% !important;
          max-height: 100% !important;
          padding: 12px 14px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          border-radius: 10px !important;
        }
        .sc-comps .advanced-card > div[style*="display: flex"] {
          gap: 10px !important;
          height: 100% !important;
        }
        .sc-comps .advanced-card div[style*="height: 200px"],
        .sc-comps .advanced-card div[style*="height:200px"] {
          height: 110px !important;
          min-height: 110px !important;
          max-height: 110px !important;
          border-radius: 8px !important;
          flex-shrink: 0 !important;
        }
        .sc-comps .advanced-card img {
          max-height: 110px !important;
          object-fit: cover !important;
          border-radius: 8px !important;
        }
        .sc-comps .advanced-card div[style*="flex: 1"] {
          gap: 0px !important;
          overflow: visible !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
        }
        .sc-comps .advanced-card h2,
        .sc-comps .advanced-card h3,
        .sc-comps .advanced-card [style*="font-size: 24px"],
        .sc-comps .advanced-card .advanced-card-title {
          font-size: 15px !important;
          line-height: 1.35 !important;
          font-weight: 700 !important;
          margin: 0 0 6px 0 !important;
          overflow: visible !important;
          text-overflow: unset !important;
          white-space: normal !important;
          flex-shrink: 0 !important;
          display: block !important;
        }
        .sc-comps .advanced-card h4,
        .sc-comps .advanced-card [style*="font-size: 16px"],
        .sc-comps .advanced-card .advanced-card-subtitle {
          font-size: 12px !important;
          line-height: 1.4 !important;
          font-weight: 500 !important;
          color: #6b7280 !important;
          margin: 0 0 6px 0 !important;
          overflow: visible !important;
          text-overflow: unset !important;
          white-space: normal !important;
          flex-shrink: 0 !important;
          display: block !important;
        }
        .sc-comps .advanced-card p,
        .sc-comps .advanced-card .advanced-card-description {
          font-size: 11.5px !important;
          line-height: 1.4 !important;
          color: #4b5563 !important;
          margin: 0 0 8px 0 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }
        .sc-comps .advanced-card button,
        .sc-comps .advanced-card a.inline-flex {
          padding: 5px 14px !important;
          font-size: 12px !important;
          line-height: 1.3 !important;
          align-self: flex-start !important;
          border-radius: 6px !important;
          flex-shrink: 0 !important;
          margin-top: auto !important;
        }
        .sc-comps .advanced-heading {
          margin-bottom: 8px !important;
          line-height: 1.35 !important;
        }

        /* ── Unknown component ── */
        .sc-unknown {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px;
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 6px;
          font-size: 10px;
          color: var(--sc-text3);
        }

        /* ── Custom nav arrows — variants + positions ── */
        .sc-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(22, 26, 38, 0.9);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e8eaf0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
        }
        .sc-nav:hover:not(.sc-nav-disabled) {
          background: var(--sc-accent);
          border-color: var(--sc-accent);
          color: #ffffff;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 16px rgba(124, 109, 250, 0.4);
        }
        .sc-nav-prev { left: 2px; }
        .sc-nav-next { right: 2px; }
        .sc-nav-disabled { opacity: 0.2; pointer-events: none; cursor: default; }
        .sc-wrap[data-arrow-style='square'] .sc-nav {
          border-radius: 6px;
          width: 32px;
          height: 32px;
        }
        .sc-wrap[data-arrow-style='minimal'] .sc-nav {
          background: transparent;
          border: none;
          box-shadow: none;
          width: 26px;
          height: 26px;
          color: var(--sc-text3);
        }
        .sc-wrap[data-arrow-style='minimal'] .sc-nav:hover {
          color: var(--sc-accent2);
          background: transparent;
        }
        .sc-wrap[data-arrow-position='bottom'] .sc-swiper-wrap {
          padding-bottom: 44px;
        }
        .sc-wrap[data-arrow-position='bottom'] .sc-nav {
          top: auto;
          bottom: 6px;
          transform: none;
        }
        .sc-wrap[data-arrow-position='bottom'] .sc-nav-prev {
          left: calc(50% - 40px);
          right: auto;
        }
        .sc-wrap[data-arrow-position='bottom'] .sc-nav-next {
          left: calc(50% + 8px);
          right: auto;
        }
        .sc-wrap[data-arrow-position='top-right'] .sc-swiper-wrap {
          padding-top: 44px;
        }
        .sc-wrap[data-arrow-position='top-right'] .sc-nav {
          top: 6px;
          transform: none;
        }
        .sc-wrap[data-arrow-position='top-right'] .sc-nav-next {
          right: 6px;
          left: auto;
        }
        .sc-wrap[data-arrow-position='top-right'] .sc-nav-prev {
          right: 44px;
          left: auto;
        }

        /* ── Pagination ── */
        .sc-pg {
          display: flex;
          justify-content: center;
          gap: 5px;
          margin-top: 10px;
          height: 16px;
          align-items: center;
        }
        .sc-pg .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--sc-surface3);
          opacity: 1;
          transition: width 0.2s, border-radius 0.2s, background 0.2s;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .sc-pg .swiper-pagination-bullet-active {
          background: var(--sc-accent);
          width: 16px;
          border-radius: 3px;
        }
        .sc-wrap[data-dots-type='lines'] .sc-pg .swiper-pagination-bullet {
          width: 20px;
          height: 3px;
          border-radius: 2px;
        }
        .sc-wrap[data-dots-type='lines'] .sc-pg .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 2px;
        }
        .sc-wrap[data-dots-type='numbered'] .sc-pg .swiper-pagination-bullet {
          width: 16px;
          height: 16px;
          border-radius: 999px;
          border: 1px solid var(--sc-border);
          background: transparent;
          color: var(--sc-text3);
        }
        .sc-wrap[data-dots-type='numbered'] .sc-pg .swiper-pagination-bullet span {
          font-size: 8px;
          line-height: 1;
          font-family: 'DM Mono', monospace;
        }
        .sc-wrap[data-dots-type='numbered'] .sc-pg .swiper-pagination-bullet-active {
          width: 16px;
          background: var(--sc-accentbg);
          border: 1px solid rgba(124,109,250,0.45);
          color: var(--sc-accent2);
          border-radius: 999px;
        }
        .sc-pg .swiper-pagination-fraction {
          font-size: 11px;
          color: var(--sc-text2);
          font-family: 'DM Mono', monospace;
        }
        .sc-pg.swiper-pagination-progressbar {
          width: 100%;
          height: 3px;
          background: var(--sc-surface3);
          border-radius: 2px;
          margin-top: 10px;
        }
        .sc-pg .swiper-pagination-progressbar-fill {
          background: var(--sc-accent);
          border-radius: 2px;
        }

        /* ── Scrollbar ── */
        .sc-sb {
          margin-top: 6px;
          height: 3px;
          background: var(--sc-surface3);
          border-radius: 2px;
        }
        .sc-sb .swiper-scrollbar-drag {
          background: var(--sc-accent);
          border-radius: 2px;
        }

        /* ── Zero state ── */
        .sc-zero {
          min-height: 220px;
          border: 1.5px dashed rgba(255,255,255,0.07);
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 32px;
          text-align: center;
        }
        .sc-zero-icon { color: rgba(255,255,255,0.15); margin-bottom: 2px; }
        .sc-zero-title { font-size: 14px; font-weight: 600; color: var(--sc-text2); margin: 0; }
        .sc-zero-sub { font-size: 12px; color: var(--sc-text3); margin: 0 0 6px; }

        /* ── Slide typography ── */
        .sc-body h1 { font-size: 28px; font-weight: 700; color: #e8eaf0; line-height: 1.2; margin: 0 0 6px; }
        .sc-body h2 { font-size: 20px; font-weight: 700; color: #e8eaf0; line-height: 1.25; margin: 0 0 5px; }
        .sc-body h3 { font-size: 15px; font-weight: 600; color: #8b90a8; line-height: 1.35; margin: 0 0 4px; }
        .sc-body p  { font-size: 13px; line-height: 1.7; color: #8b90a8; margin: 0 0 8px; }
        .sc-body p.lead  { font-size: 14px; color: #e8eaf0; }
        .sc-body p.small { font-size: 11px; color: #5a5f7a; font-style: italic; }

        /* Hide Swiper's built-in nav (we use custom) */
        .sc-swiper .swiper-button-next,
        .sc-swiper .swiper-button-prev { display: none !important; }
      `}</style>
    </div>
  )
}

;(SwiperContainer as any).schema = swiperContainerSchema
export default SwiperContainer
