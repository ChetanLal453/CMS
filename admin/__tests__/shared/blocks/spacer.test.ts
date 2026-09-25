import { normalizeSpacer } from '../../../../shared/blocks/spacer/normalize'
import { createSpacerViewModel } from '../../../../shared/blocks/spacer/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('Spacer Canonical Normalizer & ViewModel', () => {
  it('normalizes spacer sparsely with undefined mobileHeight and tabletHeight when omitted', () => {
    const normalized = normalizeSpacer({
      style: { height: '48px' },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.style?.height).toBe('48px')
    expect(normalized.responsive?.mobile?.height).toBeUndefined()
    expect(normalized.responsive?.tablet?.height).toBeUndefined()
    expect(normalized.mobileHeight).toBeUndefined()
    expect(normalized.tabletHeight).toBeUndefined()
  })

  describe('Responsive Fallback Cascade in ViewModel', () => {
    it('cascades desktop height to tablet and mobile when neither is explicitly set', () => {
      const vm = createSpacerViewModel({
        style: { height: '60px' },
      })

      expect(vm.resolvedDesktopHeight).toBe('60px')
      expect(vm.resolvedTabletHeight).toBe('60px')
      expect(vm.resolvedMobileHeight).toBe('60px')
    })

    it('cascades tablet height to mobile when mobile is omitted but tablet is set', () => {
      const vm = createSpacerViewModel({
        style: { height: '80px' },
        responsive: {
          tablet: { height: '44px' },
        },
      })

      expect(vm.resolvedDesktopHeight).toBe('80px')
      expect(vm.resolvedTabletHeight).toBe('44px')
      expect(vm.resolvedMobileHeight).toBe('44px') // cascades from tablet
    })

    it('respects all explicit responsive heights when specified', () => {
      const vm = createSpacerViewModel({
        style: { height: '100px' },
        responsive: {
          desktop: { height: '100px' },
          tablet: { height: '64px' },
          mobile: { height: '32px' },
        },
      })

      expect(vm.resolvedDesktopHeight).toBe('100px')
      expect(vm.resolvedTabletHeight).toBe('64px')
      expect(vm.resolvedMobileHeight).toBe('32px')
    })
  })

  it('migrates legacy flat spacer props to canonical version 1 structure non-destructively', () => {
    const result = migrateLayoutInput({
      id: 'test-page',
      sections: [
        {
          id: 'sec-1',
          type: 'hero',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  components: [
                    {
                      id: 'sp-1',
                      type: 'spacer',
                      props: {
                        height: '50px',
                        mobileHeight: '20px',
                        backgroundColor: '#ffffff',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    const comp = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(comp.props.version).toBe(1)
    expect(comp.props.style?.height).toBe('50px')
    expect(comp.props.responsive?.mobile?.height).toBe('20px')
    expect(comp.props.height).toBe('50px')
    expect(comp.props.mobileHeight).toBe('20px')
  })
})
