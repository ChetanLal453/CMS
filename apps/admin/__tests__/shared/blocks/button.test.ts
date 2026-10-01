import { normalizeButton } from '@uadmin/shared/blocks/button/normalize'
import { createButtonViewModel } from '@uadmin/shared/blocks/button/viewModel'

describe('Button Canonical Normalizer & ViewModel', () => {
  it('normalizes button without eagerly injecting defaults into style overrides', () => {
    const normalized = normalizeButton({
      content: { text: 'Test Button' },
      style: { variant: 'secondary', size: 'small' },
    })

    expect(normalized.style?.variant).toBe('secondary')
    expect(normalized.style?.size).toBe('small')
    expect(normalized.style?.backgroundColor).toBeUndefined()
    expect(normalized.style?.fontSize).toBeUndefined()
    expect(normalized.style?.paddingTop).toBeUndefined()
    expect(normalized.style?.borderColor).toBeUndefined()
  })

  it('computes secondary variant colors correctly when backgroundColor is undefined', () => {
    const vm = createButtonViewModel({
      style: { variant: 'secondary' },
    })

    expect(vm.buttonStyle.backgroundColor).toBe('#475569')
    expect(vm.buttonStyle.borderColor).toBe('#475569')
    expect(vm.buttonStyle.color).toBe('#FFFFFF')
  })

  it('computes danger and success variant colors correctly', () => {
    const dangerVm = createButtonViewModel({
      style: { variant: 'danger' },
    })
    expect(dangerVm.buttonStyle.backgroundColor).toBe('#dc2626')

    const successVm = createButtonViewModel({
      style: { variant: 'success' },
    })
    expect(successVm.buttonStyle.backgroundColor).toBe('#16a34a')
  })

  it('computes small and large size presets correctly when dimensions are undefined', () => {
    const smallVm = createButtonViewModel({
      style: { size: 'small' },
    })
    expect(smallVm.buttonStyle.fontSize).toBe('14px')
    expect(smallVm.buttonStyle.paddingTop).toBe('10px')
    expect(smallVm.buttonStyle.paddingRight).toBe('18px')

    const largeVm = createButtonViewModel({
      style: { size: 'large' },
    })
    expect(largeVm.buttonStyle.fontSize).toBe('18px')
    expect(largeVm.buttonStyle.paddingTop).toBe('18px')
    expect(largeVm.buttonStyle.paddingRight).toBe('36px')
  })

  it('respects explicit user style overrides over variant and size defaults', () => {
    const vm = createButtonViewModel({
      style: {
        variant: 'secondary',
        size: 'small',
        backgroundColor: '#FF0055',
        fontSize: '22px',
        paddingTop: '30px',
      },
    })
    expect(vm.buttonStyle.backgroundColor).toBe('#FF0055')
    expect(vm.buttonStyle.fontSize).toBe('22px')
    expect(vm.buttonStyle.paddingTop).toBe('30px')
  })

  it('computes warning variant color (#f59e0b) even if default primary color #7C6DFA is present', () => {
    const vm = createButtonViewModel({
      style: {
        variant: 'warning',
        backgroundColor: '#7C6DFA',
      },
    })
    expect(vm.buttonStyle.backgroundColor).toBe('#f59e0b')
    expect(vm.buttonStyle.color).toBe('#111827')
    expect(vm.buttonStyle.borderColor).toBe('#f59e0b')
  })

  it('computes large size preset dimensions even if legacy medium defaults (16px / 14px) are present', () => {
    const vm = createButtonViewModel({
      style: {
        size: 'large',
        fontSize: '16px',
        paddingTop: '14px',
        paddingRight: '28px',
      },
    })
    expect(vm.buttonStyle.fontSize).toBe('18px')
    expect(vm.buttonStyle.paddingTop).toBe('18px')
    expect(vm.buttonStyle.paddingRight).toBe('36px')
  })
})
