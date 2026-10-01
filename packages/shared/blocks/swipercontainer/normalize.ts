import { defaultSwiperContainerProps } from './defaults'
import type {
  CanonicalSwiperContainerContent,
  CanonicalSwiperContainerProps,
  CanonicalSwiperContainerResponsive,
  CanonicalSwiperContainerStyle,
  SwiperArrowPosition,
  SwiperArrowStyle,
  SwiperContainerInput,
  SwiperContainerProps,
  SwiperDirection,
  SwiperEffect,
  SwiperHoverEffectType,
  SwiperPaginationType,
  SwiperSlideItem,
} from './types'

function asStringOrUndefined(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined
  const str = String(value).trim()
  return str.length > 0 ? str : undefined
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined
  return Boolean(value)
}

function asNumberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : undefined
}

export function cloneSlide(slide: any, index: number): SwiperSlideItem {
  return {
    id: String(slide?.id || `slide-${index + 1}`),
    components: Array.isArray(slide?.components) ? slide.components : [],
    ...(slide?.bgType !== undefined ? { bgType: slide.bgType } : {}),
    ...(slide?.bgColor !== undefined ? { bgColor: slide.bgColor } : {}),
    ...(slide?.bgImage !== undefined ? { bgImage: slide.bgImage } : {}),
    ...(slide?.bgGradient !== undefined ? { bgGradient: slide.bgGradient } : {}),
    ...(slide?.bgOverlay !== undefined ? { bgOverlay: Boolean(slide.bgOverlay) } : {}),
    ...(slide?.bgOverlayColor !== undefined ? { bgOverlayColor: slide.bgOverlayColor } : {}),
    ...(slide?.bgOverlayOpacity !== undefined ? { bgOverlayOpacity: Number(slide.bgOverlayOpacity) } : {}),
    ...(slide?.padding !== undefined ? { padding: slide.padding } : {}),
    ...(slide?.minHeight !== undefined ? { minHeight: slide.minHeight } : {}),
    ...(slide?.title !== undefined ? { title: slide.title } : {}),
    ...(slide?.subtitle !== undefined ? { subtitle: slide.subtitle } : {}),
    ...(slide?.backgroundColor !== undefined ? { backgroundColor: slide.backgroundColor } : {}),
  }
}

export function normalizeSwiperContainer(input: SwiperContainerInput = {}): SwiperContainerProps {
  const contentInput = input.content && typeof input.content === 'object' ? input.content : {}
  const styleInput = input.style && typeof input.style === 'object' ? input.style : {}
  const responsiveInput = input.responsive && typeof input.responsive === 'object' ? input.responsive : {}

  const rawSlides = Array.isArray(contentInput.slides)
    ? contentInput.slides
    : Array.isArray(input.slides)
      ? input.slides
      : undefined

  const normalizedSlides = rawSlides !== undefined
    ? rawSlides.map((slide, index) => cloneSlide(slide, index))
    : undefined

  const autoplay = asBooleanOrUndefined(contentInput.autoplay ?? input.autoplay)
  const autoplayDelay = asNumberOrUndefined(contentInput.autoplayDelay ?? input.autoplayDelay)
  const loop = asBooleanOrUndefined(contentInput.loop ?? input.loop)
  const speed = asNumberOrUndefined(contentInput.speed ?? input.speed)
  const direction = asStringOrUndefined(contentInput.direction ?? input.direction) as SwiperDirection | undefined
  const draggable = asBooleanOrUndefined(contentInput.draggable ?? input.draggable)
  const grabCursor = asBooleanOrUndefined(contentInput.grabCursor ?? input.grabCursor)
  const freeMode = asBooleanOrUndefined(contentInput.freeMode ?? input.freeMode)
  const mousewheel = asBooleanOrUndefined(contentInput.mousewheel ?? input.mousewheel)
  const keyboard = asBooleanOrUndefined(contentInput.keyboard ?? input.keyboard)
  const navigation = asBooleanOrUndefined(contentInput.navigation ?? input.navigation)
  const pagination = asBooleanOrUndefined(contentInput.pagination ?? input.pagination)
  const scrollbar = asBooleanOrUndefined(contentInput.scrollbar ?? input.scrollbar)
  const scrollbarDraggable = asBooleanOrUndefined(contentInput.scrollbarDraggable ?? input.scrollbarDraggable)
  const parallax = asBooleanOrUndefined(contentInput.parallax ?? input.parallax)
  const parallaxBackground = asStringOrUndefined(contentInput.parallaxBackground ?? input.parallaxBackground)

  const content: CanonicalSwiperContainerContent = {}
  if (normalizedSlides !== undefined) content.slides = normalizedSlides
  if (autoplay !== undefined) content.autoplay = autoplay
  if (autoplayDelay !== undefined) content.autoplayDelay = autoplayDelay
  if (loop !== undefined) content.loop = loop
  if (speed !== undefined) content.speed = speed
  if (direction !== undefined) content.direction = direction
  if (draggable !== undefined) content.draggable = draggable
  if (grabCursor !== undefined) content.grabCursor = grabCursor
  if (freeMode !== undefined) content.freeMode = freeMode
  if (mousewheel !== undefined) content.mousewheel = mousewheel
  if (keyboard !== undefined) content.keyboard = keyboard
  if (navigation !== undefined) content.navigation = navigation
  if (pagination !== undefined) content.pagination = pagination
  if (scrollbar !== undefined) content.scrollbar = scrollbar
  if (scrollbarDraggable !== undefined) content.scrollbarDraggable = scrollbarDraggable
  if (parallax !== undefined) content.parallax = parallax
  if (parallaxBackground !== undefined) content.parallaxBackground = parallaxBackground

  const rawSlidesPerView = styleInput.slidesPerView ?? input.slidesPerView
  const slidesPerView = rawSlidesPerView === 'auto' ? 'auto' : asNumberOrUndefined(rawSlidesPerView)
  const slidesPerGroup = asNumberOrUndefined(styleInput.slidesPerGroup ?? input.slidesPerGroup)
  const spaceBetween = asNumberOrUndefined(styleInput.spaceBetween ?? input.spaceBetween)
  const centeredSlides = asBooleanOrUndefined(styleInput.centeredSlides ?? input.centeredSlides)
  const height = asStringOrUndefined(styleInput.height ?? input.height)
  const width = asStringOrUndefined(styleInput.width ?? input.width)
  const slideWidth = asStringOrUndefined(styleInput.slideWidth ?? input.slideWidth)
  const slideMinHeight = asStringOrUndefined(styleInput.slideMinHeight ?? input.slideMinHeight)
  const backgroundColor = asStringOrUndefined(styleInput.backgroundColor ?? input.backgroundColor)
  const padding = asStringOrUndefined(styleInput.padding ?? input.padding)
  const borderRadius = asStringOrUndefined(styleInput.borderRadius ?? input.borderRadius)
  const arrowStyle = asStringOrUndefined(styleInput.arrowStyle ?? input.arrowStyle) as SwiperArrowStyle | undefined
  const arrowPosition = asStringOrUndefined(styleInput.arrowPosition ?? input.arrowPosition) as SwiperArrowPosition | undefined
  const paginationType = asStringOrUndefined(styleInput.paginationType ?? input.paginationType) as SwiperPaginationType | undefined
  const paginationDynamic = asBooleanOrUndefined(styleInput.paginationDynamic ?? input.paginationDynamic)
  const paginationClickable = asBooleanOrUndefined(styleInput.paginationClickable ?? input.paginationClickable)
  const effect = asStringOrUndefined(styleInput.effect ?? input.effect) as SwiperEffect | undefined
  const effectFadeCrossFade = asBooleanOrUndefined(styleInput.effectFadeCrossFade ?? input.effectFadeCrossFade)
  const effectCubeShadow = asBooleanOrUndefined(styleInput.effectCubeShadow ?? input.effectCubeShadow)
  const effectCubeSlideShadows = asBooleanOrUndefined(styleInput.effectCubeSlideShadows ?? input.effectCubeSlideShadows)
  const effectCoverflowRotate = asNumberOrUndefined(styleInput.effectCoverflowRotate ?? input.effectCoverflowRotate)
  const effectCoverflowDepth = asNumberOrUndefined(styleInput.effectCoverflowDepth ?? input.effectCoverflowDepth)
  const effectCoverflowStretch = asNumberOrUndefined(styleInput.effectCoverflowStretch ?? input.effectCoverflowStretch)
  const effectCoverflowModifier = asNumberOrUndefined(styleInput.effectCoverflowModifier ?? input.effectCoverflowModifier)
  const effectFlipSlideShadows = asBooleanOrUndefined(styleInput.effectFlipSlideShadows ?? input.effectFlipSlideShadows)
  const effectCardsPerSlideOffset = asNumberOrUndefined(styleInput.effectCardsPerSlideOffset ?? input.effectCardsPerSlideOffset)
  const effectCardsRotate = asBooleanOrUndefined(styleInput.effectCardsRotate ?? input.effectCardsRotate)
  const hoverEffects = asBooleanOrUndefined(styleInput.hoverEffects ?? input.hoverEffects)
  const hoverEffectType = asStringOrUndefined(styleInput.hoverEffectType ?? input.hoverEffectType) as SwiperHoverEffectType | undefined
  const hoverIntensity = asNumberOrUndefined(styleInput.hoverIntensity ?? input.hoverIntensity)
  const className = asStringOrUndefined(styleInput.className ?? input.className)

  const style: CanonicalSwiperContainerStyle = {}
  if (slidesPerView !== undefined) style.slidesPerView = slidesPerView
  if (slidesPerGroup !== undefined) style.slidesPerGroup = slidesPerGroup
  if (spaceBetween !== undefined) style.spaceBetween = spaceBetween
  if (centeredSlides !== undefined) style.centeredSlides = centeredSlides
  if (height !== undefined) style.height = height
  if (width !== undefined) style.width = width
  if (slideWidth !== undefined) style.slideWidth = slideWidth
  if (slideMinHeight !== undefined) style.slideMinHeight = slideMinHeight
  if (backgroundColor !== undefined) style.backgroundColor = backgroundColor
  if (padding !== undefined) style.padding = padding
  if (borderRadius !== undefined) style.borderRadius = borderRadius
  if (arrowStyle !== undefined) style.arrowStyle = arrowStyle
  if (arrowPosition !== undefined) style.arrowPosition = arrowPosition
  if (paginationType !== undefined) style.paginationType = paginationType
  if (paginationDynamic !== undefined) style.paginationDynamic = paginationDynamic
  if (paginationClickable !== undefined) style.paginationClickable = paginationClickable
  if (effect !== undefined) style.effect = effect
  if (effectFadeCrossFade !== undefined) style.effectFadeCrossFade = effectFadeCrossFade
  if (effectCubeShadow !== undefined) style.effectCubeShadow = effectCubeShadow
  if (effectCubeSlideShadows !== undefined) style.effectCubeSlideShadows = effectCubeSlideShadows
  if (effectCoverflowRotate !== undefined) style.effectCoverflowRotate = effectCoverflowRotate
  if (effectCoverflowDepth !== undefined) style.effectCoverflowDepth = effectCoverflowDepth
  if (effectCoverflowStretch !== undefined) style.effectCoverflowStretch = effectCoverflowStretch
  if (effectCoverflowModifier !== undefined) style.effectCoverflowModifier = effectCoverflowModifier
  if (effectFlipSlideShadows !== undefined) style.effectFlipSlideShadows = effectFlipSlideShadows
  if (effectCardsPerSlideOffset !== undefined) style.effectCardsPerSlideOffset = effectCardsPerSlideOffset
  if (effectCardsRotate !== undefined) style.effectCardsRotate = effectCardsRotate
  if (hoverEffects !== undefined) style.hoverEffects = hoverEffects
  if (hoverEffectType !== undefined) style.hoverEffectType = hoverEffectType
  if (hoverIntensity !== undefined) style.hoverIntensity = hoverIntensity
  if (className !== undefined) style.className = className

  const responsive: CanonicalSwiperContainerResponsive = {
    desktop: responsiveInput.desktop && typeof responsiveInput.desktop === 'object' ? responsiveInput.desktop : {},
    tablet: responsiveInput.tablet && typeof responsiveInput.tablet === 'object' ? responsiveInput.tablet : {},
    mobile: responsiveInput.mobile && typeof responsiveInput.mobile === 'object' ? responsiveInput.mobile : {},
  }

  const fallbackSlides = defaultSwiperContainerProps.slides.map((slide, index) => cloneSlide(slide, index))

  return {
    ...defaultSwiperContainerProps,
    ...input,
    version: 1,
    content,
    style,
    responsive,
    slides: normalizedSlides ?? fallbackSlides,
    slidesPerView: slidesPerView ?? defaultSwiperContainerProps.slidesPerView,
    slidesPerGroup: slidesPerGroup ?? defaultSwiperContainerProps.slidesPerGroup,
    spaceBetween: spaceBetween ?? defaultSwiperContainerProps.spaceBetween,
    direction: direction ?? defaultSwiperContainerProps.direction,
    centeredSlides: centeredSlides ?? defaultSwiperContainerProps.centeredSlides,
    autoplay: autoplay ?? defaultSwiperContainerProps.autoplay,
    autoplayDelay: autoplayDelay ?? defaultSwiperContainerProps.autoplayDelay,
    loop: loop ?? defaultSwiperContainerProps.loop,
    speed: speed ?? defaultSwiperContainerProps.speed,
    draggable: draggable ?? defaultSwiperContainerProps.draggable,
    grabCursor: grabCursor ?? defaultSwiperContainerProps.grabCursor,
    freeMode: freeMode ?? defaultSwiperContainerProps.freeMode,
    mousewheel: mousewheel ?? defaultSwiperContainerProps.mousewheel,
    keyboard: keyboard ?? defaultSwiperContainerProps.keyboard,
    navigation: navigation ?? defaultSwiperContainerProps.navigation,
    arrowStyle: arrowStyle ?? defaultSwiperContainerProps.arrowStyle,
    arrowPosition: arrowPosition ?? defaultSwiperContainerProps.arrowPosition,
    pagination: pagination ?? defaultSwiperContainerProps.pagination,
    paginationType: paginationType ?? defaultSwiperContainerProps.paginationType,
    paginationDynamic: paginationDynamic ?? defaultSwiperContainerProps.paginationDynamic,
    paginationClickable: paginationClickable ?? defaultSwiperContainerProps.paginationClickable,
    effect: effect ?? defaultSwiperContainerProps.effect,
    effectFadeCrossFade: effectFadeCrossFade ?? defaultSwiperContainerProps.effectFadeCrossFade,
    effectCubeShadow: effectCubeShadow ?? defaultSwiperContainerProps.effectCubeShadow,
    effectCubeSlideShadows: effectCubeSlideShadows ?? defaultSwiperContainerProps.effectCubeSlideShadows,
    effectCoverflowRotate: effectCoverflowRotate ?? defaultSwiperContainerProps.effectCoverflowRotate,
    effectCoverflowDepth: effectCoverflowDepth ?? defaultSwiperContainerProps.effectCoverflowDepth,
    effectCoverflowStretch: effectCoverflowStretch ?? defaultSwiperContainerProps.effectCoverflowStretch,
    effectCoverflowModifier: effectCoverflowModifier ?? defaultSwiperContainerProps.effectCoverflowModifier,
    effectFlipSlideShadows: effectFlipSlideShadows ?? defaultSwiperContainerProps.effectFlipSlideShadows,
    effectCardsPerSlideOffset: effectCardsPerSlideOffset ?? defaultSwiperContainerProps.effectCardsPerSlideOffset,
    effectCardsRotate: effectCardsRotate ?? defaultSwiperContainerProps.effectCardsRotate,
    hoverEffects: hoverEffects ?? defaultSwiperContainerProps.hoverEffects,
    hoverEffectType: hoverEffectType ?? defaultSwiperContainerProps.hoverEffectType,
    hoverIntensity: hoverIntensity ?? defaultSwiperContainerProps.hoverIntensity,
    scrollbar: scrollbar ?? defaultSwiperContainerProps.scrollbar,
    scrollbarDraggable: scrollbarDraggable ?? defaultSwiperContainerProps.scrollbarDraggable,
    backgroundColor: backgroundColor ?? defaultSwiperContainerProps.backgroundColor,
    padding: padding ?? defaultSwiperContainerProps.padding,
    borderRadius: borderRadius ?? defaultSwiperContainerProps.borderRadius,
    parallax: parallax ?? defaultSwiperContainerProps.parallax,
    parallaxBackground: parallaxBackground ?? defaultSwiperContainerProps.parallaxBackground,
    height: height ?? defaultSwiperContainerProps.height,
    width: width ?? defaultSwiperContainerProps.width,
    slideWidth: slideWidth ?? defaultSwiperContainerProps.slideWidth,
    slideMinHeight: slideMinHeight ?? defaultSwiperContainerProps.slideMinHeight,
  }
}
