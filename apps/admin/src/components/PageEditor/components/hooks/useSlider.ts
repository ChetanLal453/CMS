import { useState, useEffect, useCallback, useRef } from 'react'
import { SliderSettings, SliderSlide } from '../types/slider'

interface UseSliderReturn {
  currentSlide: number
  isPlaying: boolean
  isTransitioning: boolean
  loadedSlides: number[]
  focused: boolean
  reducedMotion: boolean
  visibleSlides: any[]
  totalSlides: number
  progress: number
  canGoNext: boolean
  canGoPrev: boolean
  nextSlide: () => void
  prevSlide: () => void
  goToSlide: (index: number) => void
  play: () => void
  pause: () => void
  stop: () => void
  addSlide: (slide: any) => void
  removeSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  updateSlide: (index: number, updates: any) => void
  updateSettings: (newSettings: Partial<SliderSettings>) => void
}

export const useSlider = (settings: SliderSettings): UseSliderReturn => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loadedSlides, setLoadedSlides] = useState<number[]>([])
  const [focused, setFocused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  const visibleSlides = settings.slides.filter(slide => slide.visibility !== false)
  const totalSlides = visibleSlides.length
  const progress = totalSlides > 0 ? (currentSlide + 1) / totalSlides : 0
  const canGoNext = currentSlide < totalSlides - 1
  const canGoPrev = currentSlide > 0

  // Handle autoplay
  useEffect(() => {
    if (settings.animation.autoplay && isPlaying && !isTransitioning) {
      autoplayRef.current = setTimeout(() => {
        if (canGoNext) {
          nextSlide()
        } else if (settings.animation.loop) {
          goToSlide(0)
        }
      }, settings.animation.autoplayDelay)
    }

    return () => {
      if (autoplayRef.current) {
        clearTimeout(autoplayRef.current)
      }
    }
  }, [settings.animation.autoplay, settings.animation.autoplayDelay, settings.animation.loop, isPlaying, isTransitioning, currentSlide, canGoNext])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const nextSlide = useCallback(() => {
    if (canGoNext) {
      setIsTransitioning(true)
      setCurrentSlide(prev => prev + 1)
      setTimeout(() => setIsTransitioning(false), settings.animation.transitionDuration)
    } else if (settings.animation.loop) {
      setIsTransitioning(true)
      setCurrentSlide(0)
      setTimeout(() => setIsTransitioning(false), settings.animation.transitionDuration)
    }
  }, [canGoNext, settings.animation.loop, settings.animation.transitionDuration])

  const prevSlide = useCallback(() => {
    if (canGoPrev) {
      setIsTransitioning(true)
      setCurrentSlide(prev => prev - 1)
      setTimeout(() => setIsTransitioning(false), settings.animation.transitionDuration)
    } else if (settings.animation.loop) {
      setIsTransitioning(true)
      setCurrentSlide(totalSlides - 1)
      setTimeout(() => setIsTransitioning(false), settings.animation.transitionDuration)
    }
  }, [canGoPrev, settings.animation.loop, settings.animation.transitionDuration, totalSlides])

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setIsTransitioning(true)
      setCurrentSlide(index)
      setTimeout(() => setIsTransitioning(false), settings.animation.transitionDuration)
    }
  }, [totalSlides, settings.animation.transitionDuration])

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentSlide(0)
  }, [])

  const addSlide = useCallback((slide: SliderSlide) => {
    // This would typically update the settings through a callback
    // For now, we'll just log it
    console.log('Adding slide:', slide)
  }, [])

  const removeSlide = useCallback((index: number) => {
    // This would typically update the settings through a callback
    console.log('Removing slide at index:', index)
  }, [])

  const duplicateSlide = useCallback((index: number) => {
    // This would typically update the settings through a callback
    console.log('Duplicating slide at index:', index)
  }, [])

  const updateSlide = useCallback((index: number, updates: Partial<SliderSlide>) => {
    // This would typically update the settings through a callback
    console.log('Updating slide at index:', index, 'with:', updates)
  }, [])

  const updateSettings = useCallback((newSettings: Partial<SliderSettings>) => {
    // This would typically update the settings through a callback
    console.log('Updating settings:', newSettings)
  }, [])

  return {
    currentSlide,
    isPlaying,
    isTransitioning,
    loadedSlides,
    focused,
    reducedMotion,
    visibleSlides,
    totalSlides,
    progress,
    canGoNext,
    canGoPrev,
    nextSlide,
    prevSlide,
    goToSlide,
    play,
    pause,
    stop,
    addSlide,
    removeSlide,
    duplicateSlide,
    updateSlide,
    updateSettings
  }
}
