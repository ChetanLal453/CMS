export interface SliderSlide {
  id?: string
  title?: string
  subtitle?: string
  content?: string
  caption?: string
  image?: string
  video?: string
  mediaType?: 'image' | 'video'
  imageAlignment?: 'center' | 'left' | 'right' | 'top' | 'bottom'
  backgroundColor?: string
  textColor?: string
  layout?: string
  visibility?: boolean
  shadowIntensity?: number
  link?: {
    url?: string
    openInNewTab?: boolean
  }
  ctaButtons?: SlideCTA[]
}

export interface SlideCTA {
  label?: string
  link?: string
  openInNewTab?: boolean
}

export interface SliderNavigation {
  showArrows: boolean
  arrowStyle: string
  arrowColor: string
  arrowBackgroundColor: string
  arrowSize: string
  customArrowLeft?: string
  customArrowRight?: string
  showDots: boolean
  dotStyle: string
  dotColor: string
  dotActiveColor: string
  dotSize: string
  paginationType: string
  paginationPosition: string
  keyboardNavigation: boolean
  swipeGestures: boolean
  dragScroll: boolean
}

export interface SliderAnimation {
  transitionEffect: string
  transitionDuration: number
  transitionEasing: string
  customEasing?: string
  autoplay: boolean
  autoplayDelay: number
  pauseOnHover: boolean
  pauseOnFocus: boolean
  loop: boolean
  reverse: boolean
  autoHeight: boolean
  adaptiveHeight: boolean
  centerMode: boolean
  variableWidth: boolean
  fadeBackgroundOnTransition: boolean
}

export interface SliderAccessibility {
  ariaLabel: string
  ariaLive: string
  role: string
  screenReaderInstructions: string
  focusable: boolean
  reducedMotion: boolean
  highContrast: boolean
}

export interface SliderPerformance {
  lazyLoad: boolean
  preloadSlides: number
  virtualize: boolean
  gpuAcceleration: boolean
  imageOptimization: boolean
  debounceResize: boolean
  throttleScroll: boolean
}

export interface SliderTheme {
  preset: string
  customTheme?: any
  globalCSS: string
}

export interface SliderResponsive {
  breakpoints: {
    mobile: { min: number; max: number; slidesToShow: number; slidesToScroll: number }
    tablet: { min: number; max: number; slidesToShow: number; slidesToScroll: number }
    desktop: { min: number; max: number; slidesToShow: number; slidesToScroll: number }
  }
  responsiveSettings: {
    mobile: any
    tablet: any
    desktop: any
  }
}

export interface SliderSettings {
  slides: SliderSlide[]
  navigation: SliderNavigation
  animation: SliderAnimation
  accessibility: SliderAccessibility
  performance: SliderPerformance
  theme: SliderTheme
  responsive: SliderResponsive
  width: string
  height: string
  maxWidth: string
  maxHeight: string
  margin: string
  padding: string
  backgroundColor: string
  backgroundImage?: string
  backgroundGradient?: string
  border: string
  borderRadius: string
  boxShadow: string
  customClass: string
  customId: string
  customCSS: string
  dataSource: string
  apiEndpoint?: string
  cmsCollection?: string
  dynamicData?: any
  slideCount: number
  groupedProperties: boolean
  undoRedoSupport: boolean
  inlineEditing: boolean
  versionControl: boolean
  onSlideChange?: (index: number) => void
  onSlideClick?: (index: number) => void
  onAutoplayStart?: () => void
  onAutoplayStop?: () => void
}
