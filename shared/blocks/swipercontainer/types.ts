import type { CSSProperties } from 'react'

export type SwiperDirection = 'horizontal' | 'vertical'
export type SwiperArrowStyle = 'rounded' | 'square' | 'minimal'
export type SwiperArrowPosition = 'sides' | 'bottom' | 'top-right'
export type SwiperPaginationType = 'bullets' | 'fraction' | 'progressbar' | 'lines' | 'numbered'
export type SwiperEffect = 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'cards'
export type SwiperHoverEffectType = 'none' | 'zoom' | 'lift' | 'dim' | 'brighten' | 'glow'
export type SwiperBackgroundType = 'color' | 'image' | 'gradient'
export type SwiperModuleKey =
  | 'Navigation'
  | 'Pagination'
  | 'Autoplay'
  | 'Scrollbar'
  | 'EffectFade'
  | 'EffectCube'
  | 'EffectCoverflow'
  | 'EffectFlip'
  | 'EffectCards'
  | 'FreeMode'
  | 'Mousewheel'
  | 'Parallax'
  | 'Thumbs'
  | 'Controller'
  | 'Zoom'
  | 'Keyboard'

export interface SwiperSlideItem {
  id: string
  components: Array<Record<string, any>>
  bgType?: SwiperBackgroundType
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
  backgroundColor?: string
}

export interface SwiperEditorSlideView extends SwiperSlideItem {
  resolvedBgType: SwiperBackgroundType
  resolvedBgColor: string
  resolvedMinHeight: string
  resolvedPadding: string
  hasComponents: boolean
  previewLabel: string
  previewBackgroundStyle: Record<string, string>
  editorCardStyle: Record<string, string>
}

export interface SwiperRenderSlideView extends SwiperSlideItem {
  resolvedBgType: SwiperBackgroundType
  resolvedPadding: string
  resolvedMinHeight: string
  surfaceStyle: CSSProperties
  overlayStyle: CSSProperties
  hoverStyle: CSSProperties
}

export interface SwiperRenderStyleTokens {
  coverflowDesktopWidth: string
  coverflowTabletWidth: string
  coverflowMobileWidth: string
  slideInnerMargin: string
  slideInnerMarginTablet: string
  slideInnerMarginMobile: string
  autoModeWidth: string
  autoModeTabletWidth: string
  autoModeTabletMaxWidth: string
  autoModeMobileWidth: string
  cardsMobileWidth: string
}

export interface SwiperRenderConfig {
  slidesPerViewValue: number | 'auto'
  resolvedEffect: SwiperEffect
  resolvedLoop: boolean
  resolvedCenteredSlides: boolean
  resolvedSpaceBetween: number
  shouldEnableLoop: boolean
  resolvedPaginationType: 'bullets' | 'fraction' | 'progressbar'
  isAutoMode: boolean
  dataArrowStyle: SwiperArrowStyle
  dataArrowPosition: SwiperArrowPosition
  dataDotsType: SwiperPaginationType
  dataHoverEffectType: SwiperHoverEffectType
  dataHoverIntensity: number
  moduleKeys: SwiperModuleKey[]
  styleTokens: SwiperRenderStyleTokens
  swiperConfig: Record<string, any>
}

export interface SwiperContainerProps {
  slidesPerView: number | 'auto'
  slidesPerGroup: number
  spaceBetween: number
  direction: SwiperDirection
  centeredSlides: boolean
  autoplay: boolean
  autoplayDelay: number
  loop: boolean
  speed: number
  draggable: boolean
  grabCursor: boolean
  freeMode: boolean
  mousewheel: boolean
  keyboard: boolean
  navigation: boolean
  arrowStyle: SwiperArrowStyle
  arrowPosition: SwiperArrowPosition
  pagination: boolean
  paginationType: SwiperPaginationType
  paginationDynamic: boolean
  paginationClickable: boolean
  effect: SwiperEffect
  effectFadeCrossFade: boolean
  effectCubeShadow: boolean
  effectCubeSlideShadows: boolean
  effectCoverflowRotate: number
  effectCoverflowDepth: number
  effectCoverflowStretch: number
  effectCoverflowModifier: number
  effectFlipSlideShadows: boolean
  effectCardsPerSlideOffset: number
  effectCardsRotate: boolean
  hoverEffects: boolean
  hoverEffectType: SwiperHoverEffectType
  hoverIntensity: number
  scrollbar: boolean
  scrollbarDraggable: boolean
  backgroundColor: string
  padding: string
  borderRadius: string
  parallax: boolean
  parallaxBackground: string
  height: string
  width: string
  slideWidth: string
  slideMinHeight: string
  slides: SwiperSlideItem[]
  [key: string]: any
}

export type SwiperContainerInput = Partial<SwiperContainerProps> & Record<string, any>
export type SwiperContainerViewModel = SwiperContainerProps & {
  editorSlides: SwiperEditorSlideView[]
  renderSlides: SwiperRenderSlideView[]
  renderConfig: SwiperRenderConfig
}
