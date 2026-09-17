import { createDefaultSlide, defaultSwiperContainerProps } from './defaults'
import type { SwiperContainerInput, SwiperContainerProps, SwiperSlideItem } from './types'

function cloneSlide(slide: SwiperSlideItem, index: number): SwiperSlideItem {
  return {
    ...slide,
    id: String(slide?.id || `slide-${index + 1}`),
    components: Array.isArray(slide?.components) ? slide.components : [],
    bgType: slide?.bgType || 'gradient',
    bgGradient: slide?.bgGradient || createDefaultSlide(`slide-${index + 1}`, index).bgGradient,
    bgOverlayColor: slide?.bgOverlayColor || '#000',
    bgOverlayOpacity: typeof slide?.bgOverlayOpacity === 'number' ? slide.bgOverlayOpacity : 0.4,
    padding: slide?.padding || '12px',
    minHeight: slide?.minHeight || '120px',
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
  }
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeSwiperContainer(input: SwiperContainerInput = {}): SwiperContainerProps {
  const merged: SwiperContainerProps = {
    ...defaultSwiperContainerProps,
    ...input,
  }

  const slides = Array.isArray(input.slides) && input.slides.length
    ? input.slides.map((slide, index) => cloneSlide(slide as SwiperSlideItem, index))
    : defaultSwiperContainerProps.slides.map((slide, index) => cloneSlide(slide, index))

  return {
    ...merged,
    slidesPerView:
      input.slidesPerView === 'auto'
        ? 'auto'
        : asNumber(input.slidesPerView, defaultSwiperContainerProps.slidesPerView as number),
    slidesPerGroup: asNumber(input.slidesPerGroup, defaultSwiperContainerProps.slidesPerGroup),
    spaceBetween: asNumber(input.spaceBetween, defaultSwiperContainerProps.spaceBetween),
    autoplayDelay: asNumber(input.autoplayDelay, defaultSwiperContainerProps.autoplayDelay),
    speed: asNumber(input.speed, defaultSwiperContainerProps.speed),
    effectCoverflowRotate: asNumber(input.effectCoverflowRotate, defaultSwiperContainerProps.effectCoverflowRotate),
    effectCoverflowDepth: asNumber(input.effectCoverflowDepth, defaultSwiperContainerProps.effectCoverflowDepth),
    effectCoverflowStretch: asNumber(input.effectCoverflowStretch, defaultSwiperContainerProps.effectCoverflowStretch),
    effectCoverflowModifier: asNumber(input.effectCoverflowModifier, defaultSwiperContainerProps.effectCoverflowModifier),
    effectCardsPerSlideOffset: asNumber(input.effectCardsPerSlideOffset, defaultSwiperContainerProps.effectCardsPerSlideOffset),
    hoverIntensity: asNumber(input.hoverIntensity, defaultSwiperContainerProps.hoverIntensity),
    slides,
  }
}
