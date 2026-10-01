'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'

// ✅ Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper'

// ✅ CORRECT: Import modules for Swiper 12 - Use this syntax:
import {
  Navigation,
  Pagination,
  Autoplay,
  Scrollbar,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
  FreeMode,
  Mousewheel,
  Parallax,
  Thumbs,
  Controller,
  Zoom,
  Keyboard,
} from 'swiper/modules'
import type { SwiperModule } from 'swiper/types'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { SwiperContainerViewModel, SwiperModuleKey, SwiperRenderSlideView } from '@uadmin/shared/blocks/swipercontainer'
import { reportCmsBoundaryViolation } from '../../../lib/cmsBoundary'

// Define types
interface SwiperContainerProps {
  id?: string
  className?: string
  renderComponent?: (component: Record<string, any>) => React.ReactNode
  __sharedViewModel?: SwiperContainerViewModel
  [key: string]: any
}

const SWIPER_MODULE_MAP: Record<SwiperModuleKey, SwiperModule> = {
  Navigation,
  Pagination,
  Autoplay,
  Scrollbar,
  EffectFade,
  EffectCube,
  EffectCoverflow,
  EffectFlip,
  EffectCards,
  FreeMode,
  Mousewheel,
  Parallax,
  Thumbs,
  Controller,
  Zoom,
  Keyboard,
}

const SlideComponent: React.FC<{
  slide: SwiperRenderSlideView
  renderComponent?: (component: Record<string, any>) => React.ReactNode
  isHovered?: boolean
}> = ({ slide, renderComponent, isHovered = false }) => {
  return (
    <div 
      className="swiper-slide-inner"
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box' as const,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        opacity: 1,
        transform: 'scale(1)',
        overflow: 'hidden',
        minHeight: slide.resolvedMinHeight,
        padding: slide.resolvedPadding,
        borderRadius: 'inherit',
        ...slide.surfaceStyle,
        ...(isHovered ? slide.hoverStyle : {}),
      }}
    >
      {slide.bgOverlay ? (
        <div aria-hidden="true" style={slide.overlayStyle} />
      ) : null}

      {slide.components && slide.components.length > 0 ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
        }}>
          {slide.components.map((component: Record<string, any>, index: number) => (
            <div key={component?.id || index} style={{ 
              width: '100%',
              height: '100%',
            }}>
              {renderComponent?.(component) ?? null}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', flex: 1 }} />
      )}
    </div>
  )
}

const SwiperContainerInner: React.FC<{
  normalizedProps: SwiperContainerProps
  renderComponent?: (component: Record<string, any>) => React.ReactNode
}> = ({ normalizedProps, renderComponent }) => {

  const {
    renderSlides,
    hoverEffects,
    autoplay,
    navigation,
    pagination,
    paginationType,
    paginationDynamic,
    paginationClickable,
    scrollbar,
    scrollbarDraggable,
    parallax,
    parallaxBackground,
    backgroundColor,
    padding,
    borderRadius,
    height,
    slideMinHeight,
    id,
    className,
    renderConfig,
  } = normalizedProps as SwiperContainerProps
  const instanceIdRef = useRef(
    String(id || `swiper-${Math.random().toString(36).slice(2, 8)}`),
  )
  const instanceId = instanceIdRef.current
  const resolvedSlides = renderSlides
  const resolvedEffect = renderConfig.resolvedEffect
  const resolvedCenteredSlides = renderConfig.resolvedCenteredSlides
  const resolvedSpaceBetween = renderConfig.resolvedSpaceBetween
  const styleTokens = renderConfig.styleTokens
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredSlideIndex, setHoveredSlideIndex] = useState<number | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const swiperContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const swiperModules = useMemo(() => renderConfig.moduleKeys.map((moduleKey: SwiperModuleKey) => SWIPER_MODULE_MAP[moduleKey]), [renderConfig.moduleKeys])

  const slidesPerViewValue = renderConfig.slidesPerViewValue
  const shouldEnableLoop = renderConfig.shouldEnableLoop
  const swiperConfig = useMemo(() => {
    const config = { ...renderConfig.swiperConfig }

    if (navigation) {
      config.navigation = {
        nextEl: `.swiper-button-next-custom-${instanceId}`,
        prevEl: `.swiper-button-prev-custom-${instanceId}`,
        disabledClass: 'swiper-button-disabled',
      }
    }

    if (pagination) {
      config.pagination = {
        el: `.swiper-pagination-custom-${instanceId}`,
        clickable: Boolean(paginationClickable),
        type: renderConfig.resolvedPaginationType,
        dynamicBullets: Boolean(paginationDynamic && paginationType === 'bullets'),
      }

      if (paginationType === 'numbered') {
        config.pagination.renderBullet = (index: number, className: string) =>
          `<span class="${className}"><span>${index + 1}</span></span>`
      }
    }

    if (scrollbar) {
      config.scrollbar = {
        el: `.swiper-scrollbar-custom-${instanceId}`,
        draggable: Boolean(scrollbarDraggable),
        hide: false,
        snapOnRelease: true,
      }
    }

    if (parallax) {
      config.parallax = true
    }

    return config
  }, [instanceId, navigation, pagination, paginationClickable, paginationDynamic, paginationType, parallax, renderConfig, scrollbar, scrollbarDraggable])
  
  // ✅ FIXED: Handle Swiper initialization for Swiper 12
  const handleSwiperInit = (swiper: SwiperType) => {
    setSwiperInstance(swiper)
    
    // Initialize autoplay if enabled
    if (autoplay && swiper.autoplay && shouldEnableLoop) {
      swiper.autoplay.start()
    }
  }
  
  const goNext = () => {
    if (swiperInstance) {
      try {
        swiperInstance.slideNext()
      } catch (err) {
        console.warn('Go next failed:', err)
      }
    }
  }
  
  const goPrev = () => {
    if (swiperInstance) {
      try {
        swiperInstance.slidePrev()
      } catch (err) {
        console.warn('Go prev failed:', err)
      }
    }
  }
  
  const handleSlideHover = (index: number) => {
    if (hoverEffects) {
      setHoveredSlideIndex(index)
    }
  }
  
  const handleSlideLeave = () => {
    if (hoverEffects) {
      setHoveredSlideIndex(null)
    }
  }
  
  const containerStyle: React.CSSProperties = {
    backgroundColor,
    padding,
    borderRadius,
    width: '100%',
    maxWidth: '100%',
    position: 'relative',
    overflow: 'visible', // ✅ Changed from 'hidden' to 'visible'
    boxSizing: 'border-box',
    ...(height && height !== 'auto' ? { height } : {}),
  }
  
  if (!resolvedSlides.length) {
    return null
  }
  
  const isAutoMode = renderConfig.isAutoMode

  if (!isMounted) {
    return (
      <div
        ref={swiperContainerRef}
        style={containerStyle}
        className={`swiper-container swiper-fixed ${isAutoMode ? 'auto-mode' : 'fixed-mode'} ${resolvedEffect}-effect ${className}`}
        id={id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-slides-per-view={slidesPerViewValue}
        data-centered={resolvedCenteredSlides}
        data-effect={resolvedEffect}
        data-space-between={resolvedSpaceBetween}
        data-hover-effects={hoverEffects}
        data-hover-effect-type={renderConfig.dataHoverEffectType}
        data-arrow-style={renderConfig.dataArrowStyle}
        data-arrow-position={renderConfig.dataArrowPosition}
        data-dots-type={renderConfig.dataDotsType}
        data-hover-intensity={renderConfig.dataHoverIntensity}>
        {parallax && parallaxBackground && (
          <div
            className="swiper-parallax"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              backgroundImage: `url(${parallaxBackground})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: borderRadius,
            }}
          />
        )}

        <div className="relative z-10 w-full h-full" style={{ overflow: 'visible' }}>
          <div
            className="d-flex gap-3 overflow-auto"
            style={{
              minHeight: slideMinHeight,
              paddingBottom: '8px',
            }}>
            {resolvedSlides.map((slide: SwiperRenderSlideView, index: number) => (
              <div
                key={`${slide.id}-${index}`}
                style={{
                  flex: '0 0 auto',
                  width: styleTokens.autoModeWidth,
                  minHeight: slideMinHeight,
                }}>
                <SlideComponent
                  slide={slide}
                  renderComponent={renderComponent}
                  isHovered={hoveredSlideIndex === index && hoverEffects}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div
      ref={swiperContainerRef}
      style={containerStyle}
      className={`swiper-container swiper-fixed ${isAutoMode ? 'auto-mode' : 'fixed-mode'} ${resolvedEffect}-effect ${className}`}
      id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-slides-per-view={slidesPerViewValue}
      data-centered={resolvedCenteredSlides}
      data-effect={resolvedEffect}
      data-space-between={resolvedSpaceBetween}
      data-hover-effects={hoverEffects}
      data-hover-effect-type={renderConfig.dataHoverEffectType}
      data-arrow-style={renderConfig.dataArrowStyle}
      data-arrow-position={renderConfig.dataArrowPosition}
      data-dots-type={renderConfig.dataDotsType}
      data-hover-intensity={renderConfig.dataHoverIntensity}
    >
      {parallax && parallaxBackground && (
        <div 
          className="swiper-parallax"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${parallaxBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: borderRadius,
          }}
        />
      )}
      
      <div className="relative z-10 w-full h-full" style={{ overflow: 'visible' }}> {/* ✅ Changed to visible */}
        {/* ✅ FIXED: Pass modules prop to Swiper */}
        <Swiper
          modules={swiperModules}
          {...swiperConfig}
          onSwiper={handleSwiperInit}
          className="swiper-main"
          style={{
            width: '100%',
            height: '100%',
            minHeight: slideMinHeight,
            overflow: 'visible', // ✅ Changed from 'hidden' to 'visible'
          }}
        >
          {resolvedSlides.map((slide: SwiperRenderSlideView, index: number) => (
            <SwiperSlide 
              key={`${slide.id}-${index}`}
              style={{
                height: 'auto',
                display: 'flex',
                alignItems: 'stretch',
                overflow: 'visible', // ✅ Added overflow visible
              }}
              onMouseEnter={() => handleSlideHover(index)}
              onMouseLeave={handleSlideLeave}
            >
              <div style={{ 
                height: '100%',
                minHeight: slideMinHeight,
                display: 'flex',
                alignItems: 'stretch',
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'visible', // ✅ Added overflow visible
              }}>
                <SlideComponent
                  slide={slide}
                  renderComponent={renderComponent}
                  isHovered={hoveredSlideIndex === index && hoverEffects}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {navigation && resolvedSlides.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className={`swiper-button-prev-custom swiper-button-prev-custom-${instanceId}`}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 50,
                transition: 'all 0.3s',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                opacity: isHovered ? 1 : 0.7,
              }}
              disabled={!shouldEnableLoop && swiperInstance?.isBeginning}
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} color="#374151" />
            </button>
            <button
              onClick={goNext}
              className={`swiper-button-next-custom swiper-button-next-custom-${instanceId}`}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 50,
                transition: 'all 0.3s',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                opacity: isHovered ? 1 : 0.7,
              }}
              disabled={!shouldEnableLoop && swiperInstance?.isEnd}
              aria-label="Next slide"
            >
              <ChevronRight size={20} color="#374151" />
            </button>
          </>
        )}
        
        {pagination && resolvedSlides.length > 1 && (
          <div className={`swiper-pagination-custom swiper-pagination-custom-${instanceId}`} style={{
            position: 'absolute',
            bottom: '10px',
            left: '0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            zIndex: 40,
          }} />
        )}

        {scrollbar && resolvedSlides.length > 1 ? <div className={`swiper-scrollbar-custom swiper-scrollbar-custom-${instanceId}`} /> : null}
      </div>
      
      {/* ✅ FIXED: CSS for all effects - Including hover effects */}
      <style jsx global>{`
        /* Global Swiper fixes for Swiper 12 */
        .swiper-fixed {
          --swiper-navigation-color: #3b82f6;
          --swiper-pagination-color: #3b82f6;
          --swiper-pagination-bullet-size: 8px;
          --swiper-pagination-bullet-inactive-color: #d1d5db;
          --swiper-pagination-bullet-inactive-opacity: 0.7;
        }
        
        /* Main container */
        .swiper-fixed .swiper {
          width: 100%;
          height: 100%;
          overflow: visible !important; /* ✅ Changed to visible */
        }

        .swiper-button-prev-custom,
        .swiper-button-next-custom {
          position: absolute;
        }

        .swiper-fixed[data-arrow-style="square"] .swiper-button-prev-custom,
        .swiper-fixed[data-arrow-style="square"] .swiper-button-next-custom {
          border-radius: 10px !important;
        }

        .swiper-fixed[data-arrow-style="minimal"] .swiper-button-prev-custom,
        .swiper-fixed[data-arrow-style="minimal"] .swiper-button-next-custom {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .swiper-fixed[data-arrow-position="bottom"] .swiper-button-prev-custom,
        .swiper-fixed[data-arrow-position="bottom"] .swiper-button-next-custom {
          top: auto !important;
          bottom: 10px !important;
          transform: none !important;
        }

        .swiper-fixed[data-arrow-position="bottom"] .swiper-button-prev-custom {
          left: calc(50% - 48px) !important;
        }

        .swiper-fixed[data-arrow-position="bottom"] .swiper-button-next-custom {
          right: calc(50% - 48px) !important;
        }

        .swiper-fixed[data-arrow-position="top-right"] .swiper-button-prev-custom,
        .swiper-fixed[data-arrow-position="top-right"] .swiper-button-next-custom {
          top: 10px !important;
          bottom: auto !important;
          transform: none !important;
        }

        .swiper-fixed[data-arrow-position="top-right"] .swiper-button-prev-custom {
          left: auto !important;
          right: 58px !important;
        }

        .swiper-fixed[data-arrow-position="top-right"] .swiper-button-next-custom {
          left: auto !important;
          right: 10px !important;
        }
        
        /* Wrapper - let Swiper handle layout */
        .swiper-fixed .swiper-wrapper {
          display: flex !important;
          width: 100% !important;
          box-sizing: border-box !important;
          overflow: visible !important; /* ✅ Added overflow visible */
        }
        
        /* Base slide styling */
        .swiper-fixed .swiper-slide {
          height: auto !important;
          display: flex !important;
          align-items: stretch !important;
          justify-content: center !important;
          box-sizing: border-box !important;
          opacity: 1 !important;
          visibility: visible !important;
          flex-shrink: 0 !important;
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      opacity 0.5s ease,
                      box-shadow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          overflow: visible !important; /* ✅ Added overflow visible */
        }
        
        /* ===== HOVER EFFECTS CSS ===== */
        /* Hover effects only apply when enabled */
        .swiper-fixed[data-hover-effects="true"][data-hover-effect-type="lift"] .swiper-slide:hover {
          transform: translateY(-8px) !important;
          z-index: 9999 !important; /* ✅ Increased z-index */
        }
        
        .swiper-fixed[data-hover-effects="true"][data-hover-effect-type="zoom"] .swiper-slide:hover {
          transform: scale(1.03) !important;
          z-index: 9999 !important; /* ✅ Increased z-index */
        }
        
        .swiper-fixed[data-hover-effects="true"][data-hover-effect-type="glow"] .swiper-slide:hover {
          z-index: 9999 !important; /* ✅ Increased z-index */
        }
        
        .swiper-fixed[data-hover-effects="true"][data-hover-effect-type="brighten"] .swiper-slide:hover {
          filter: brightness(1.15) !important;
          z-index: 9999 !important;
        }

        .swiper-fixed[data-hover-effects="true"][data-hover-effect-type="dim"] .swiper-slide:hover {
          opacity: 0.75 !important;
          z-index: 9999 !important; /* ✅ Increased z-index */
        }
        
        /* Disabled hover effects */
        .swiper-fixed[data-hover-effects="false"] .swiper-slide:hover,
        .swiper-fixed[data-hover-effect-type="none"] .swiper-slide:hover {
          transform: none !important;
          z-index: auto !important;
        }
        
        /* ✅ FIX 2: Fade effect - Ensure slides are visible */
        .swiper-fixed.fade-effect .swiper-slide {
          opacity: 1 !important;
        }
        
        .swiper-fixed.fade-effect .swiper-slide-active {
          opacity: 1 !important;
          z-index: 2 !important;
        }
        
        .swiper-fixed.fade-effect .swiper-slide-prev,
        .swiper-fixed.fade-effect .swiper-slide-next {
          opacity: 0.7 !important;
          z-index: 1 !important;
        }
        
        /* ✅ FIX 3: Cube effect - Fix transparency */
        .swiper-fixed.cube-effect .swiper-slide {
          opacity: 1 !important;
          background-color: transparent !important;
          backface-visibility: hidden !important;
        }
        
        .swiper-fixed.cube-effect .swiper-slide .swiper-slide-inner {
          background-color: transparent !important;
        }
        
        /* ✅ FIX 4: Coverflow effect - Add spacing */
        .swiper-fixed.coverflow-effect .swiper-slide {
          width: ${styleTokens.coverflowDesktopWidth} !important;
          transition: transform 0.5s ease !important;
        }
        
        .swiper-fixed.coverflow-effect .swiper-slide .swiper-slide-inner {
          margin: ${styleTokens.slideInnerMargin} !important;
          transition: all 0.5s ease !important;
        }
        
        /* ✅ FIX 6: Cards effect - Fix transparency */
        .swiper-fixed.cards-effect .swiper-slide {
          opacity: 1 !important;
          background-color: transparent !important;
        }
        
        .swiper-fixed.cards-effect .swiper-slide .swiper-slide-inner {
          background-color: transparent !important;
          opacity: 1 !important;
        }
        
        .swiper-fixed.cards-effect .swiper-slide-active {
          z-index: 10 !important;
        }
        
        /* Slide inner container - Now transparent */
        .swiper-slide-inner {
          width: 100% !important;
          box-sizing: border-box !important;
          margin: ${styleTokens.slideInnerMargin} !important;
          opacity: 1 !important;
          overflow: visible !important; /* ✅ Added overflow visible */
        }
        
        /* First and last slide margin adjustment */
        .swiper-slide:first-child .swiper-slide-inner {
          margin-left: 0 !important;
        }
        
        .swiper-slide:last-child .swiper-slide-inner {
          margin-right: 0 !important;
        }
        
        /* Effect-specific margin removal */
        .swiper-fixed.fade-effect .swiper-slide-inner,
        .swiper-fixed.cube-effect .swiper-slide-inner,
        .swiper-fixed.flip-effect .swiper-slide-inner {
          margin: 0 !important;
        }

        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(209, 213, 219, 0.7);
          opacity: 1;
          transition: all 0.25s ease;
        }

        .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 24px;
          border-radius: 999px;
          background: #3b82f6;
        }

        .swiper-fixed[data-dots-type="lines"] .swiper-pagination-custom .swiper-pagination-bullet {
          width: 20px;
          height: 3px;
          border-radius: 2px;
        }

        .swiper-fixed[data-dots-type="lines"] .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 20px;
        }

        .swiper-fixed[data-dots-type="numbered"] .swiper-pagination-custom .swiper-pagination-bullet {
          width: 18px;
          height: 18px;
          border: 1px solid rgba(209, 213, 219, 0.35);
          background: transparent;
          color: #9ca3af;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .swiper-fixed[data-dots-type="numbered"] .swiper-pagination-custom .swiper-pagination-bullet span {
          font-size: 9px;
          line-height: 1;
        }

        .swiper-fixed[data-dots-type="numbered"] .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 18px;
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.45);
          color: #2563eb;
        }

        .swiper-pagination-custom .swiper-pagination-fraction {
          color: #6b7280;
          font-size: 12px;
        }

        .swiper-pagination-custom.swiper-pagination-progressbar {
          height: 4px;
          border-radius: 999px;
          background: rgba(209, 213, 219, 0.3);
          overflow: hidden;
        }

        .swiper-pagination-custom .swiper-pagination-progressbar-fill {
          background: #3b82f6;
        }

        .swiper-scrollbar-custom {
          position: relative;
          margin-top: 12px;
          height: 4px;
          border-radius: 999px;
          background: rgba(209, 213, 219, 0.25);
        }

        .swiper-scrollbar-custom .swiper-scrollbar-drag {
          background: #3b82f6;
          border-radius: 999px;
        }
        
        /* Auto mode fixes */
        .swiper-fixed.auto-mode .swiper-slide {
          width: auto !important;
        }
        
        .swiper-fixed.auto-mode .swiper-slide .swiper-slide-inner {
          width: ${styleTokens.autoModeWidth} !important;
          min-width: 200px !important;
          max-width: 400px !important;
        }
        
        /* Responsive fixes */
        @media (max-width: 768px) {
          .swiper-slide-inner {
            margin: ${styleTokens.slideInnerMarginTablet} !important;
          }
          
          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            width: 36px !important;
            height: 36px !important;
            opacity: 0.9 !important;
          }
          
          /* Mobile adjustments for auto mode */
          .swiper-fixed.auto-mode .swiper-slide .swiper-slide-inner {
            width: ${styleTokens.autoModeTabletWidth} !important;
            max-width: ${styleTokens.autoModeTabletMaxWidth} !important;
          }
          
          /* Mobile adjustments for effects */
          .swiper-fixed.coverflow-effect .swiper-slide {
            width: ${styleTokens.coverflowTabletWidth} !important;
          }
        }
        
        @media (max-width: 480px) {
          .swiper-slide-inner {
            margin: ${styleTokens.slideInnerMarginMobile} !important;
          }
          
          .swiper-fixed.auto-mode .swiper-slide .swiper-slide-inner {
            width: ${styleTokens.autoModeMobileWidth} !important;
          }
          
          /* On mobile, adjust effects */
          .swiper-fixed.cards-effect .swiper-slide {
            width: ${styleTokens.cardsMobileWidth} !important;
          }
          
          .swiper-fixed.coverflow-effect .swiper-slide {
            width: ${styleTokens.coverflowMobileWidth} !important;
          }
        }
      `}</style>
    </div>
  )
}

const SwiperContainer: React.FC<SwiperContainerProps> = (inputProps) => {
  const normalizedProps = (inputProps.__sharedViewModel ?? null) as SwiperContainerProps | null

  if (!normalizedProps) {
    return reportCmsBoundaryViolation('swipercontainer', 'Missing required shared view model.')
  }

  return (
    <SwiperContainerInner
      normalizedProps={normalizedProps}
      renderComponent={inputProps.renderComponent}
    />
  )
}

export default SwiperContainer
