import { normalizeImage } from '@uadmin/shared/blocks/image/normalize'
import { createImageViewModel } from '@uadmin/shared/blocks/image/viewModel'

describe('Image Canonical Normalizer & ViewModel', () => {
  it('normalizes image sparsely without eagerly injecting defaults into style overrides', () => {
    const normalized = normalizeImage({
      content: { src: '/test.png', alt: 'Test Image' },
      style: { shape: 'circle' },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.src).toBe('/test.png')
    expect(normalized.content?.alt).toBe('Test Image')
    expect(normalized.style?.shape).toBe('circle')
    expect(normalized.style?.borderRadius).toBeUndefined()
    expect(normalized.style?.padding).toBeUndefined()
    expect(normalized.style?.margin).toBeUndefined()
    expect(normalized.style?.shadow).toBeUndefined()
    expect(normalized.style?.border).toBeUndefined()
    expect(normalized.style?.overlayColor).toBeUndefined()
    expect(normalized.style?.overlayOpacity).toBeUndefined()
  })

  describe('Dependent Case 1: shape vs borderRadius', () => {
    it('uses shape preset radius when borderRadius is undefined', () => {
      const circleVm = createImageViewModel({
        content: { src: '/circle.png' },
        style: { shape: 'circle' },
      })
      expect(circleVm.resolvedBorderRadius).toBe('999px')
      expect(circleVm.frameStyle.borderRadius).toBe('999px')

      const roundedVm = createImageViewModel({
        content: { src: '/rounded.png' },
        style: { shape: 'rounded' },
      })
      expect(roundedVm.resolvedBorderRadius).toBe('24px')
      expect(roundedVm.frameStyle.borderRadius).toBe('24px')

      const squareVm = createImageViewModel({
        content: { src: '/square.png' },
        style: { shape: 'square' },
      })
      expect(squareVm.resolvedBorderRadius).toBe('0px')
      expect(squareVm.frameStyle.borderRadius).toBe('0px')
    })

    it('respects user explicit borderRadius even if shape is circle or rounded', () => {
      const customCircleVm = createImageViewModel({
        content: { src: '/custom-circle.png' },
        style: { shape: 'circle', borderRadius: '16px' },
      })
      expect(customCircleVm.resolvedBorderRadius).toBe('16px')
      expect(customCircleVm.frameStyle.borderRadius).toBe('16px')

      const customRoundedVm = createImageViewModel({
        content: { src: '/custom-rounded.png' },
        style: { shape: 'rounded', borderRadius: '8px' },
      })
      expect(customRoundedVm.resolvedBorderRadius).toBe('8px')
      expect(customRoundedVm.frameStyle.borderRadius).toBe('8px')
    })
  })

  describe('Dependent Case 2: showGradientBorder vs padding', () => {
    it('keeps padding undefined when showGradientBorder is off and padding untouched', () => {
      const vm = createImageViewModel({
        content: { src: '/image.png' },
        style: { showGradientBorder: false },
      })
      expect(vm.frameStyle.padding).toBeUndefined()
    })

    it('applies custom padding when showGradientBorder is off and padding is explicitly set', () => {
      const vm = createImageViewModel({
        content: { src: '/image.png' },
        style: { showGradientBorder: false, padding: '24px' },
      })
      expect(vm.frameStyle.padding).toBe('24px')
    })

    it('applies gradientBorderWidth as padding when showGradientBorder is enabled', () => {
      const vm = createImageViewModel({
        content: { src: '/image.png' },
        style: {
          showGradientBorder: true,
          gradientBorderColors: '#ff0000, #00ff00',
          gradientBorderWidth: '12px',
          gradientBorderType: 'conic',
        },
      })
      expect(vm.frameStyle.padding).toBe('12px')
      expect(vm.frameStyle.background).toContain('conic-gradient')
    })
  })

  describe('Dependent Case 3: showOverlay vs overlayText & overlayOpacity', () => {
    it('hides overlay completely when showOverlay is false and overlayText is empty', () => {
      const vm = createImageViewModel({
        content: { src: '/image.png' },
        style: { showOverlay: false },
      })
      expect(vm.showOverlayLayer).toBe(false)
      expect(vm.overlayStyle.display).toBe('none')
    })

    it('displays overlay when showOverlay is true', () => {
      const vm = createImageViewModel({
        content: { src: '/image.png' },
        style: { showOverlay: true, overlayColor: '#1e293b', overlayOpacity: 0.5 },
      })
      expect(vm.showOverlayLayer).toBe(true)
      expect(vm.overlayStyle.display).toBe('flex')
      expect(vm.overlayStyle.backgroundColor).toBe('#1e293b')
      expect(vm.overlayStyle.opacity).toBe(0.5)
    })

    it('enables overlay layer when overlayText is present', () => {
      const vm = createImageViewModel({
        content: { src: '/image.png' },
        style: { overlayText: 'Featured Project' },
      })
      expect(vm.showOverlayLayer).toBe(true)
      expect(vm.overlayStyle.display).toBe('flex')
      expect(vm.overlayTextStyle.color).toBe('#ffffff')
    })
  })

  describe('Dual format support', () => {
    it('produces identical view model from flat legacy and canonical nested structures', () => {
      const flatVm = createImageViewModel({
        src: '/test.png',
        alt: 'Test Alt',
        width: '80%',
        shape: 'rounded',
      })

      const canonicalVm = createImageViewModel({
        content: { src: '/test.png', alt: 'Test Alt' },
        style: { width: '80%', shape: 'rounded' },
      })

      expect(flatVm.resolvedSrc).toBe(canonicalVm.resolvedSrc)
      expect(flatVm.resolvedBorderRadius).toBe(canonicalVm.resolvedBorderRadius)
      expect(flatVm.frameStyle.width).toBe(canonicalVm.frameStyle.width)
      expect(flatVm.imageStyle.width).toBe(canonicalVm.imageStyle.width)
    })
  })
})
