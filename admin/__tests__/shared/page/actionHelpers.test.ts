import { resolveActionHref, cleanPhoneNumber } from '../../../../shared/page/actionHelpers'
import { normalizeContainer } from '../../../../shared/blocks/container/normalize'
import { createContainerViewModel } from '../../../../shared/blocks/container/viewModel'
import { createButtonViewModel } from '../../../../shared/blocks/button/viewModel'

describe('Generic Action Helpers & Primitive Hardening', () => {
  describe('cleanPhoneNumber', () => {
    it('strips non-digits except leading plus', () => {
      expect(cleanPhoneNumber('+91 98765-43210')).toBe('+919876543210')
      expect(cleanPhoneNumber('(555) 123-4567')).toBe('5551234567')
    })
  })

  describe('resolveActionHref', () => {
    it('resolves phone action correctly with native protocol and _self target', () => {
      const res = resolveActionHref({
        type: 'phone',
        phone: '+91 98765 43210',
      })
      expect(res.href).toBe('tel:+919876543210')
      expect(res.isNativeProtocol).toBe(true)
      expect(res.target).toBe('_self')
    })

    it('resolves legacy tel: string as native protocol', () => {
      const res = resolveActionHref('tel:+1234567890')
      expect(res.href).toBe('tel:+1234567890')
      expect(res.isNativeProtocol).toBe(true)
      expect(res.target).toBe('_self')
    })

    it('resolves email action with mailto: prefix', () => {
      const res = resolveActionHref({
        type: 'email',
        email: 'emergency@fixpro.com',
      })
      expect(res.href).toBe('mailto:emergency@fixpro.com')
      expect(res.isNativeProtocol).toBe(true)
    })

    it('resolves anchor action with # prefix', () => {
      const res = resolveActionHref({
        type: 'anchor',
        anchor: 'request-quote',
      })
      expect(res.href).toBe('#request-quote')
      expect(res.isNativeProtocol).toBe(false)
      expect(res.target).toBe('_self')
    })

    it('resolves internal page with leading slash', () => {
      const res = resolveActionHref({
        type: 'page',
        pageSlug: 'services/hvac',
      })
      expect(res.href).toBe('/services/hvac')
      expect(res.isExternal).toBe(false)
    })

    it('resolves external url with https protocol and new tab', () => {
      const res = resolveActionHref({
        type: 'url',
        url: 'https://google.com',
        openInNewTab: true,
      })
      expect(res.href).toBe('https://google.com')
      expect(res.isExternal).toBe(true)
      expect(res.target).toBe('_blank')
    })
  })

  describe('Container positioning pass-through', () => {
    it('preserves position, offsets, and zIndex in normalize and viewModel', () => {
      const input = {
        style: {
          position: 'absolute',
          top: '24px',
          right: '-16px',
          zIndex: 10,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
        },
      }

      const normalized = normalizeContainer(input)
      expect(normalized.style?.position).toBe('absolute')
      expect(normalized.style?.top).toBe('24px')
      expect(normalized.style?.right).toBe('-16px')

      const viewModel = createContainerViewModel(input)
      expect(viewModel.position).toBe('absolute')
      expect(viewModel.top).toBe('24px')
      expect(viewModel.right).toBe('-16px')
      expect(viewModel.zIndex).toBe(10)
      expect(viewModel.overflow).toBe('hidden')
    })
  })

  describe('Button integration with action resolver', () => {
    it('resolves phone action with icon and tel: protocol', () => {
      const vm = createButtonViewModel({
        text: 'Call (800) 555-0199',
        icon: 'phone',
        action: {
          type: 'phone',
          phone: '+18005550199',
        },
      })

      expect(vm.link).toBe('tel:+18005550199')
      expect(vm.hasLink).toBe(true)
      expect(vm.target).toBe('_self')
      expect(vm.showIcon).toBe(true)
      expect(vm.iconName).toBe('phone')
      expect(vm.resolvedAction?.isNativeProtocol).toBe(true)
    })

    it('resolves email action with mailto: protocol', () => {
      const vm = createButtonViewModel({
        text: 'Contact Us',
        icon: 'mail',
        action: {
          type: 'email',
          email: 'support@example.com',
        },
      })

      expect(vm.link).toBe('mailto:support@example.com')
      expect(vm.hasLink).toBe(true)
      expect(vm.target).toBe('_self')
      expect(vm.resolvedAction?.isNativeProtocol).toBe(true)
    })

    it('resolves anchor action with hash prefix', () => {
      const vm = createButtonViewModel({
        text: 'View Services',
        action: {
          type: 'anchor',
          anchor: 'request-service',
        },
      })

      expect(vm.link).toBe('#request-service')
      expect(vm.hasLink).toBe(true)
      expect(vm.target).toBe('_self')
    })

    it('resolves internal page URL with leading slash', () => {
      const vm = createButtonViewModel({
        text: 'About Company',
        action: {
          type: 'page',
          pageSlug: 'about-us',
        },
      })

      expect(vm.link).toBe('/about-us')
      expect(vm.hasLink).toBe(true)
      expect(vm.target).toBe('_self')
      expect(vm.resolvedAction?.isExternal).toBe(false)
    })

    it('resolves external URL with new tab and security rel', () => {
      const vm = createButtonViewModel({
        text: 'External Partner',
        action: {
          type: 'url',
          url: 'https://google.com',
          openInNewTab: true,
        },
      })

      expect(vm.link).toBe('https://google.com')
      expect(vm.hasLink).toBe(true)
      expect(vm.target).toBe('_blank')
      expect(vm.rel).toBe('noopener noreferrer')
      expect(vm.resolvedAction?.isExternal).toBe(true)
    })

    it('resolves legacy raw string link for backward compatibility', () => {
      const vm = createButtonViewModel({
        text: 'Legacy Link',
        link: 'https://example.com/legacy',
        openInNewTab: true,
      })

      expect(vm.link).toBe('https://example.com/legacy')
      expect(vm.hasLink).toBe(true)
      expect(vm.target).toBe('_blank')
    })
  })
})
