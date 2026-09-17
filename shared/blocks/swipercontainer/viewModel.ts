import { createDefaultSlide, defaultSwiperContainerProps } from './defaults'
import { normalizeSwiperContainer } from './normalize'
import type {
  SwiperContainerInput,
  SwiperContainerViewModel,
  SwiperEditorSlideView,
  SwiperModuleKey,
  SwiperRenderSlideView,
  SwiperSlideItem,
} from './types'

const PREVIEW_LABELS = ['Hero slide content', 'Testimonial card', 'Product feature', 'Case study highlight'] as const

function getPreviewLabel(slideIndex: number) {
  return PREVIEW_LABELS[slideIndex % PREVIEW_LABELS.length]
}

function getSlidesPerViewValue(slidesPerView: SwiperContainerViewModel['slidesPerView']) {
  if (slidesPerView === 'auto') {
    return 'auto'
  }

  return typeof slidesPerView === 'number' && Number.isFinite(slidesPerView) ? slidesPerView : 1
}

function createSwiperModuleKeys(
  effect: SwiperContainerViewModel['effect'],
  autoplay: boolean,
): SwiperModuleKey[] {
  const modules: SwiperModuleKey[] = ['Navigation', 'Pagination', 'Scrollbar', 'FreeMode', 'Mousewheel', 'Parallax', 'Thumbs', 'Controller', 'Zoom', 'Keyboard']

  if (autoplay) {
    modules.push('Autoplay')
  }

  switch (effect) {
    case 'fade':
      modules.push('EffectFade')
      break
    case 'cube':
      modules.push('EffectCube')
      break
    case 'coverflow':
      modules.push('EffectCoverflow')
      break
    case 'flip':
      modules.push('EffectFlip')
      break
    case 'cards':
      modules.push('EffectCards')
      break
    default:
      break
  }

  return modules
}

function createStyleTokens(
  resolvedSpaceBetween: number,
  slideWidth: string,
) {
  return {
    coverflowDesktopWidth: `calc((100% - (${resolvedSpaceBetween}px * 2)) / 3)`,
    coverflowTabletWidth: `calc((100% - (${resolvedSpaceBetween}px)) / 2)`,
    coverflowMobileWidth: '80%',
    slideInnerMargin: `0 ${resolvedSpaceBetween / 2}px`,
    slideInnerMarginTablet: `0 ${resolvedSpaceBetween / 4}px`,
    slideInnerMarginMobile: '0 5px',
    autoModeWidth: slideWidth,
    autoModeTabletWidth: '250px',
    autoModeTabletMaxWidth: '300px',
    autoModeMobileWidth: '200px',
    cardsMobileWidth: '250px',
  }
}

function createSwiperConfig(input: SwiperContainerViewModel, slidesCount: number) {
  const slidesPerViewValue = getSlidesPerViewValue(input.slidesPerView)
  const resolvedEffect = input.effect
  const resolvedLoop = Boolean(input.loop)
  const resolvedCenteredSlides = Boolean(input.centeredSlides)
  const resolvedSpaceBetween = typeof input.spaceBetween === 'number' ? input.spaceBetween : Number(input.spaceBetween) || 0
  const shouldLoop = shouldEnableSwiperContainerLoop(
    {
      loop: resolvedLoop,
      effect: resolvedEffect,
      centeredSlides: resolvedCenteredSlides,
      slidesPerView: slidesPerViewValue,
    },
    slidesCount,
  )

  const swiperConfig: Record<string, any> = {
    direction: input.direction,
    slidesPerView: slidesPerViewValue,
    slidesPerGroup: input.slidesPerGroup,
    spaceBetween: resolvedSpaceBetween,
    speed: input.speed,
    grabCursor: input.grabCursor,
    allowTouchMove: input.draggable,
    mousewheel: input.mousewheel,
    freeMode: input.freeMode,
    loop: shouldLoop,
    keyboard: input.keyboard ? { enabled: true, onlyInViewport: true } : false,
    observer: true,
    observeParents: true,
    watchOverflow: true,
    watchSlidesProgress: true,
    centeredSlides: resolvedCenteredSlides || resolvedEffect === 'coverflow',
    slideToClickedSlide: true,
    resistance: true,
    resistanceRatio: 0.5,
  }

  if (resolvedEffect !== 'slide') {
    swiperConfig.effect = resolvedEffect

    if (resolvedEffect === 'fade' || resolvedEffect === 'cube' || resolvedEffect === 'flip') {
      swiperConfig.slidesPerView = 1
      swiperConfig.spaceBetween = 0
      swiperConfig.centeredSlides = false

      if (resolvedEffect === 'fade') {
        swiperConfig.fadeEffect = { crossFade: input.effectFadeCrossFade }
      }

      if (resolvedEffect === 'cube') {
        swiperConfig.cubeEffect = {
          shadow: input.effectCubeShadow,
          shadowScale: 0.94,
          slideShadows: input.effectCubeSlideShadows,
          shadowOffset: 20,
          shadowOpacity: 0.6,
        }
      }

      if (resolvedEffect === 'flip') {
        swiperConfig.flipEffect = {
          slideShadows: input.effectFlipSlideShadows,
          limitRotation: true,
          rotate: 30,
        }
      }
    }

    if (resolvedEffect === 'coverflow') {
      swiperConfig.coverflowEffect = {
        rotate: input.effectCoverflowRotate,
        stretch: input.effectCoverflowStretch,
        depth: input.effectCoverflowDepth,
        modifier: input.effectCoverflowModifier,
        slideShadows: true,
      }
      swiperConfig.slidesPerView = typeof slidesPerViewValue === 'number' ? Math.min(slidesPerViewValue, 3) : 3
      swiperConfig.centeredSlides = true
      swiperConfig.spaceBetween = resolvedSpaceBetween
    }

    if (resolvedEffect === 'cards') {
      swiperConfig.cardsEffect = {
        perSlideOffset: input.effectCardsPerSlideOffset,
        rotate: input.effectCardsRotate,
        slideShadows: true,
        opacity: 1,
      }
      swiperConfig.slidesPerView = 'auto'
      swiperConfig.centeredSlides = true
      swiperConfig.spaceBetween = resolvedSpaceBetween
    }
  }

  if (input.autoplay && shouldLoop) {
    swiperConfig.autoplay = {
      delay: input.autoplayDelay,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      stopOnLastSlide: false,
    }
  }

  return {
    slidesPerViewValue,
    resolvedEffect,
    resolvedLoop,
    resolvedCenteredSlides,
    resolvedSpaceBetween,
    shouldEnableLoop: shouldLoop,
    resolvedPaginationType: input.paginationType === 'lines' || input.paginationType === 'numbered' ? 'bullets' : input.paginationType,
    isAutoMode: slidesPerViewValue === 'auto',
    dataArrowStyle: input.arrowStyle,
    dataArrowPosition: input.arrowPosition,
    dataDotsType: input.paginationType,
    dataHoverEffectType: input.hoverEffectType,
    dataHoverIntensity: input.hoverIntensity,
    moduleKeys: createSwiperModuleKeys(resolvedEffect, input.autoplay),
    styleTokens: createStyleTokens(resolvedSpaceBetween, input.slideWidth || '300px'),
    swiperConfig,
  }
}

function createHoverStyle(hoverEffectType: SwiperContainerViewModel['hoverEffectType'], hoverIntensity: number) {
  if (hoverEffectType === 'none') {
    return {}
  }

  const normalizedIntensity = Math.min(1.2, Math.max(1, Number(hoverIntensity) || 1.06))
  const lift = Math.max(2, Math.round((normalizedIntensity - 1) * 70))
  const shadow = `0 ${Math.max(10, lift * 2)}px ${Math.max(25, lift * 4)}px rgba(0, 0, 0, 0.15)`

  switch (hoverEffectType) {
    case 'lift':
      return {
        transform: `translateY(-${lift}px)`,
        boxShadow: shadow,
      }
    case 'zoom':
      return {
        transform: `scale(${normalizedIntensity})`,
      }
    case 'glow':
      return {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        boxShadow: `0 0 30px rgba(59, 130, 246, 0.3), ${shadow}`,
      }
    case 'brighten':
      return {
        filter: `brightness(${Math.min(1.35, 1 + (normalizedIntensity - 1) * 2.5)})`,
      }
    case 'dim':
      return {
        opacity: Math.max(0.65, 1 - (normalizedIntensity - 1) * 1.5),
      }
    default:
      return {}
  }
}

export function shouldEnableSwiperContainerLoop(
  input: Pick<SwiperContainerViewModel, 'loop' | 'effect' | 'centeredSlides' | 'slidesPerView'>,
  slidesCount: number,
) {
  if (!input.loop) {
    return false
  }

  const effect = String(input.effect || 'slide')
  const slidesPerViewValue = getSlidesPerViewValue(input.slidesPerView)

  if (effect === 'fade' || effect === 'flip' || effect === 'creative') {
    return slidesCount >= 3
  }

  if (effect === 'cube' || effect === 'coverflow' || effect === 'cards') {
    return slidesCount >= 4
  }

  if (effect === 'slide') {
    const spv = typeof slidesPerViewValue === 'number' ? slidesPerViewValue : 1
    return input.centeredSlides ? slidesCount >= spv + 2 : slidesCount >= spv + 1
  }

  return false
}

function createEditorSlideView(
  slide: SwiperSlideItem,
  slideIndex: number,
  slideMinHeight: string,
): SwiperEditorSlideView {
  const resolvedBgType = slide.bgType || (slide.bgImage ? 'image' : slide.bgGradient ? 'gradient' : 'color')
  const resolvedBgColor = slide.bgColor || slide.backgroundColor || '#1a1d28'
  const hasComponents = (slide.components?.length || 0) > 0
  const resolvedMinHeight = hasComponents ? slide.minHeight || slideMinHeight || '120px' : '120px'
  const resolvedPadding = slide.padding || '12px'
  const previewLabel = String(slide.title || '').trim() || getPreviewLabel(slideIndex)
  const normalizedBg = String(resolvedBgColor).trim().toLowerCase()
  const previewFriendlyBg = ['#1a1d28', '#fff', '#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0', 'white', 'transparent'].includes(
    normalizedBg,
  )

  const previewBackgroundStyle: Record<string, string> = (() => {
    if (resolvedBgType === 'image' && slide.bgImage) {
      return { backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }

    if (resolvedBgType === 'gradient' && slide.bgGradient) {
      return { backgroundImage: slide.bgGradient }
    }

    return { backgroundColor: resolvedBgColor }
  })()

  const editorCardStyle: Record<string, string> = {
    minHeight: resolvedMinHeight,
    padding: resolvedPadding,
    ...previewBackgroundStyle,
  }

  if (!slide.bgImage && !slide.bgGradient && previewFriendlyBg) {
    editorCardStyle.backgroundImage = createDefaultSlide(`slide-${slideIndex + 1}`, slideIndex).bgGradient || ''
    editorCardStyle.backgroundColor = 'transparent'
    if (String(resolvedPadding).trim() === '20px' || String(resolvedPadding).trim() === '20px 20px') {
      editorCardStyle.padding = '12px'
    }
  }

  return {
    ...slide,
    resolvedBgType,
    resolvedBgColor,
    resolvedMinHeight,
    resolvedPadding,
    hasComponents,
    previewLabel,
    previewBackgroundStyle,
    editorCardStyle,
  }
}

function createRenderSlideView(
  slide: SwiperSlideItem,
  slideMinHeight: string,
  hoverEffectType: SwiperContainerViewModel['hoverEffectType'],
  hoverIntensity: number,
): SwiperRenderSlideView {
  const resolvedBgType = slide.bgType || (slide.bgImage ? 'image' : slide.bgGradient ? 'gradient' : 'color')
  const resolvedPadding = slide.padding || '12px'
  const resolvedMinHeight = slide.minHeight || slideMinHeight || '120px'
  const surfaceStyle: Record<string, string> = (() => {
    if (resolvedBgType === 'image' && slide.bgImage) {
      return {
        backgroundImage: `url(${slide.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }

    if (resolvedBgType === 'gradient' && slide.bgGradient) {
      return {
        backgroundImage: slide.bgGradient,
      }
    }

    return {
      backgroundColor: slide.bgColor || slide.backgroundColor || 'transparent',
    }
  })()

  return {
    ...slide,
    resolvedBgType,
    resolvedPadding,
    resolvedMinHeight,
    surfaceStyle,
    overlayStyle: {
      position: 'absolute',
      inset: 0,
      backgroundColor: slide.bgOverlayColor || '#000000',
      opacity: typeof slide.bgOverlayOpacity === 'number' ? slide.bgOverlayOpacity : 0.4,
      pointerEvents: 'none',
    },
    hoverStyle: createHoverStyle(hoverEffectType, hoverIntensity),
  }
}

export function createSwiperContainerViewModel(input: SwiperContainerInput = {}): SwiperContainerViewModel {
  const normalized = normalizeSwiperContainer(input)

  return {
    ...normalized,
    editorSlides: normalized.slides.map((slide, index) => createEditorSlideView(slide, index, normalized.slideMinHeight || defaultSwiperContainerProps.slideMinHeight)),
    renderSlides: normalized.slides.map((slide) =>
      createRenderSlideView(slide, normalized.slideMinHeight || defaultSwiperContainerProps.slideMinHeight, normalized.hoverEffectType, normalized.hoverIntensity),
    ),
    renderConfig: createSwiperConfig(normalized as SwiperContainerViewModel, normalized.slides.length),
  }
}
