import { SliderSlide } from '../types/slider'

export const createDefaultSlide = (): SliderSlide => ({
  id: `slide-${Date.now()}`,
  title: 'New Slide',
  subtitle: '',
  content: 'Slide content goes here',
  caption: '',
  image: '',
  video: '',
  mediaType: 'image',
  imageAlignment: 'center',
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  layout: 'full-width',
  visibility: true,
  shadowIntensity: 3,
  link: {
    url: '',
    openInNewTab: false
  },
  ctaButtons: []
})

export const getAnimationKeyframes = (effect: string): string => {
  switch (effect) {
    case 'fade':
      return `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `
    case 'slide':
      return `
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `
    case 'zoom':
      return `
        @keyframes zoomIn {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
      `
    case 'cube':
      return `
        @keyframes cubeRotate {
          0% { transform: rotateY(0deg) translateZ(0); }
          25% { transform: rotateY(90deg) translateZ(50px); }
          50% { transform: rotateY(180deg) translateZ(0); }
          75% { transform: rotateY(270deg) translateZ(-50px); }
          100% { transform: rotateY(360deg) translateZ(0); }
        }
      `
    default:
      return `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `
  }
}

export const getTextAnimationKeyframes = (effect: string): string => {
  switch (effect) {
    case 'fadeIn':
      return `
        @keyframes textFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
    case 'slideUp':
      return `
        @keyframes textSlideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `
    case 'typewriter':
      return `
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
      `
    default:
      return `
        @keyframes textFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `
  }
}
