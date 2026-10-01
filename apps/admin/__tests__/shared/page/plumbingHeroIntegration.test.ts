import { validatePageRenderBundle } from '@uadmin/shared/page/validatePageRenderBundle'
import { buildPublicPageView } from '@uadmin/shared/page/viewHelpers'
import { createButtonViewModel } from '@uadmin/shared/blocks/button/viewModel'
import { createContainerViewModel } from '@uadmin/shared/blocks/container/viewModel'
import { createFlexboxViewModel } from '@uadmin/shared/blocks/flexbox/viewModel'

describe('Plumbing / Emergency Hero Integration Test #1', () => {
  const plumbingHeroSection = {
    id: 'sec-emergency-hero',
    name: 'Emergency Hero Section',
    type: 'default',
    settings: {
      visible: true,
      backgroundColor: '#ffffff',
      padding: '70px 0',
      containerType: 'boxed' as const,
      maxWidth: 1200,
      sideSpacing: 20,
      rowVerticalAlign: 'center' as const,
    },
    props: {},
    blocks: [
      { id: 'hero-eyebrow-pill', type: 'flexbox', props: { direction: 'row', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: '#eff6ff', borderRadius: '9999px', width: 'fit-content' } },
      { id: 'hero-heading', type: 'advancedheading', props: { text: 'Fast. Reliable. 24/7 Emergency Service', level: 'h1', fontSize: '46px', fontWeight: '800', lineHeight: '1.15', color: '#0f172a' } },
      { id: 'hero-description', type: 'advancedparagraph', props: { text: 'From plumbing leaks to HVAC repairs, our certified technicians are ready to help — anytime, anywhere.', fontSize: '16px', color: '#64748b', lineHeight: '1.6' } },
      { id: 'hero-button-group', type: 'flexbox', props: { direction: 'row', gap: '14px', alignItems: 'center', stackOnMobile: true, directionMobile: 'column', mobileGap: '12px' } },
      { id: 'hero-trust-list', type: 'flexbox', props: { direction: 'row', wrap: 'wrap', gap: '18px' } },
      { id: 'hero-visual-container', type: 'container', props: { position: 'relative', width: '100%' } },
    ],
    rows: [
      {
        id: 'hero-row-main',
        columns: [
          {
            id: 'hero-col-content',
            width: 55,
            components: [
              {
                id: 'hero-eyebrow-pill',
                type: 'flexbox',
                props: {
                  direction: 'row',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '9999px',
                  width: 'fit-content',
                  children: [
                    { id: 'pill-icon', type: 'icon', props: { name: 'wrench', size: '14px', color: '#2563eb' } },
                    { id: 'pill-text', type: 'advancedparagraph', props: { text: 'PLUMBING • HEATING • COOLING', fontSize: '12px', fontWeight: '700', color: '#2563eb' } },
                  ],
                },
              },
              {
                id: 'hero-heading',
                type: 'advancedheading',
                props: {
                  text: 'Fast. Reliable. 24/7 Emergency Service',
                  level: 'h1',
                  fontSize: '46px',
                  fontWeight: '800',
                  lineHeight: '1.15',
                  color: '#0f172a',
                },
              },
              {
                id: 'hero-description',
                type: 'advancedparagraph',
                props: {
                  text: 'From plumbing leaks to HVAC repairs, our certified technicians are ready to help — anytime, anywhere.',
                  fontSize: '16px',
                  color: '#64748b',
                  lineHeight: '1.6',
                },
              },
              {
                id: 'hero-button-group',
                type: 'flexbox',
                props: {
                  direction: 'row',
                  gap: '14px',
                  alignItems: 'center',
                  stackOnMobile: true,
                  directionMobile: 'column',
                  mobileGap: '12px',
                  children: [
                    {
                      id: 'btn-call-emergency',
                      type: 'button',
                      props: {
                        text: '+91 98765 43210',
                        variant: 'primary',
                        backgroundColor: '#2563eb',
                        textColor: '#ffffff',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '15px',
                        icon: 'phone',
                        iconPosition: 'left',
                        iconSpacing: '8px',
                        action: {
                          type: 'phone',
                          phone: '+919876543210',
                        },
                      },
                    },
                    {
                      id: 'btn-request-service',
                      type: 'button',
                      props: {
                        text: 'Request Service',
                        variant: 'outline',
                        borderColor: '#2563eb',
                        textColor: '#2563eb',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '15px',
                        icon: 'calendar-check',
                        iconPosition: 'left',
                        iconSpacing: '8px',
                        action: {
                          type: 'anchor',
                          anchor: 'request-service',
                        },
                      },
                    },
                  ],
                },
              },
              {
                id: 'hero-trust-list',
                type: 'flexbox',
                props: {
                  direction: 'row',
                  wrap: 'wrap',
                  gap: '18px',
                  children: [
                    {
                      id: 'trust-1',
                      type: 'flexbox',
                      props: {
                        direction: 'row',
                        alignItems: 'center',
                        gap: '6px',
                        children: [
                          { id: 'ic-1', type: 'icon', props: { name: 'check-circle', size: '15px', color: '#16a34a' } },
                          { id: 'tx-1', type: 'advancedparagraph', props: { text: 'Licensed & Insured', fontSize: '13px', fontWeight: '600', color: '#334155' } },
                        ],
                      },
                    },
                    {
                      id: 'trust-2',
                      type: 'flexbox',
                      props: {
                        direction: 'row',
                        alignItems: 'center',
                        gap: '6px',
                        children: [
                          { id: 'ic-2', type: 'icon', props: { name: 'check-circle', size: '15px', color: '#16a34a' } },
                          { id: 'tx-2', type: 'advancedparagraph', props: { text: 'Upfront Pricing', fontSize: '13px', fontWeight: '600', color: '#334155' } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
          {
            id: 'hero-col-visual',
            width: 45,
            components: [
              {
                id: 'hero-visual-container',
                type: 'container',
                props: {
                  position: 'relative',
                  width: '100%',
                  children: [
                    {
                      id: 'hero-plumber-img',
                      type: 'image',
                      props: {
                        src: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                        alt: 'Professional Emergency Plumber',
                        width: '100%',
                        borderRadius: '24px',
                        objectFit: 'cover',
                      },
                    },
                    {
                      id: 'badge-floating-247',
                      type: 'container',
                      props: {
                        position: 'absolute',
                        top: '20px',
                        right: '-16px',
                        zIndex: 10,
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        shadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        mobilePosition: 'static',
                        children: [
                          {
                            id: 'badge-247-flex',
                            type: 'flexbox',
                            props: {
                              direction: 'row',
                              alignItems: 'center',
                              gap: '8px',
                              children: [
                                { id: 'ic-247', type: 'icon', props: { name: 'clock', size: '20px', color: '#2563eb' } },
                                { id: 'tx-247', type: 'advancedparagraph', props: { text: '24/7 Emergency Service', fontSize: '12px', fontWeight: '700', color: '#0f172a' } },
                              ],
                            },
                          },
                        ],
                      },
                    },
                    {
                      id: 'badge-floating-reviews',
                      type: 'container',
                      props: {
                        position: 'absolute',
                        bottom: '20px',
                        left: '-16px',
                        zIndex: 10,
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '12px 18px',
                        shadow: '0 14px 34px rgba(15, 23, 42, 0.12)',
                        border: '1px solid rgba(15, 23, 42, 0.06)',
                        mobilePosition: 'static',
                        children: [
                          { id: 'tx-reviews', type: 'advancedparagraph', props: { text: '⭐⭐⭐⭐⭐ 500+ Reviews', fontSize: '13px', fontWeight: '700', color: '#0f172a' } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  }

  const sampleBundle = {
    schemaVersion: 1 as const,
    mode: 'public' as const,
    success: true as const,
    page: {
      id: 101,
      slug: 'emergency-plumber',
      title: 'FixPro - 24/7 Emergency Plumbing',
      status: 'published',
      published_at: '2026-09-29T10:00:00Z',
      updated_at: '2026-09-29T10:00:00Z',
      seo: {
        title: 'Emergency Plumber',
        description: '24/7 fast reliable plumbing service',
        keywords: ['emergency plumber', 'hvac repair'],
        image: '/seo-plumber.jpg',
        imageId: null,
        canonicalUrl: 'https://fixpro.com/emergency-plumber',
        robots: 'index,follow',
      },
    },
    layout: {
      schemaVersion: 1 as const,
      id: 'layout-plumber',
      name: 'Plumbing Layout',
      sections: [plumbingHeroSection],
    },
    sections: [plumbingHeroSection],
    header: {
      id: 1,
      slug: 'main-header',
      name: 'Main Header',
      logo: '/logo.png',
      logo_dark: '/logo-dark.png',
      cta_label: 'Call Now',
      cta_link: 'tel:+919876543210',
      is_sticky: true,
      bg_color: '#ffffff',
      settings: {},
      navigation_items: [],
    },
    footer: {
      id: 1,
      slug: 'main-footer',
      name: 'Main Footer',
      copyright: '© 2026 FixPro',
      bg_color: '#0f172a',
      columns: [],
      social_links: [],
      settings: {
        logo_url: '/logo.png',
        copyright_text: '© 2026 FixPro',
        newsletter_enabled: false,
        company_address: '123 Main St',
        company_email: 'info@fixpro.com',
        company_phone: '+919876543210',
        social_style: 'circle' as const,
      },
    },
    banner: {
      id: 1,
      slug: 'main-banner',
      name: 'Main Banner',
      content: {
        title: '24/7 Service Available',
        subtitle: 'Call now',
        description: 'Immediate dispatch',
        buttonText: 'Call',
        buttonLink: 'tel:+919876543210',
      },
    },
    revisionMeta: null,
    view: {
      traceId: 'trace-plumbing-hero',
      theme: {
        accent: '#2563eb',
        accentRgb: '37, 99, 235',
        shellBackground: '#f8fafc',
        surface: '#ffffff',
        surfaceAlt: '#f8fafc',
        border: 'rgba(15, 23, 42, 0.08)',
        text: '#0f172a',
        muted: '#64748b',
        mutedText: '#64748b',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        headerBg: '#ffffff',
        footerBg: '#0f172a',
      },
      content: [plumbingHeroSection],
      structure: {
        sections: [
          {
            id: 'sec-emergency-hero',
            blockIds: [
              'hero-eyebrow-pill',
              'hero-heading',
              'hero-description',
              'hero-button-group',
              'hero-trust-list',
              'hero-visual-container',
            ],
            blockTypes: [
              'flexbox',
              'advancedheading',
              'advancedparagraph',
              'flexbox',
              'flexbox',
              'container',
            ],
          },
        ],
      },
    },
  }

  it('validates canonical Plumbing Hero bundle without any schema violation', () => {
    const validated = validatePageRenderBundle(sampleBundle)
    expect(validated.success).toBe(true)
    expect(validated.layout.sections[0].id).toBe('sec-emergency-hero')
  })

  it('builds public page view and correctly maps columns, blocks, and styling', () => {
    const pageView = buildPublicPageView(sampleBundle)
    expect(pageView.sections).toHaveLength(1)

    const section = pageView.sections[0]
    expect(section.kind).toBe('default')
    if (section.kind === 'default') {
      expect(section.rows).toHaveLength(1)
      const row = section.rows[0]
      expect(row.columns).toHaveLength(2)
      expect(row.columns[0].width).toBe(55)
      expect(row.columns[1].width).toBe(45)
    }
  })

  it('verifies Phone tel: action and Button icon in hero call button', () => {
    const callButtonProps = {
      text: '+91 98765 43210',
      icon: 'phone',
      iconPosition: 'left' as const,
      action: {
        type: 'phone' as const,
        phone: '+919876543210',
      },
    }

    const vm = createButtonViewModel(callButtonProps)
    expect(vm.hasLink).toBe(true)
    expect(vm.link).toBe('tel:+919876543210')
    expect(vm.resolvedAction?.isNativeProtocol).toBe(true)
    expect(vm.showIcon).toBe(true)
    expect(vm.iconName).toBe('phone')
  })

  it('verifies relative and absolute positioning on visual container & floating badges', () => {
    const visualContainerProps = {
      position: 'relative' as const,
      width: '100%',
    }
    const visualVm = createContainerViewModel(visualContainerProps)
    expect(visualVm.position).toBe('relative')

    const floatingBadgeProps = {
      position: 'absolute' as const,
      top: '20px',
      right: '-16px',
      zIndex: 10,
      mobilePosition: 'static',
    }
    const badgeVm = createContainerViewModel(floatingBadgeProps)
    expect(badgeVm.position).toBe('absolute')
    expect(badgeVm.top).toBe('20px')
    expect(badgeVm.right).toBe('-16px')
    expect(badgeVm.zIndex).toBe(10)
    expect(badgeVm.mobilePosition).toBe('static')
  })

  it('verifies flexbox responsive stacking for dual buttons', () => {
    const flexProps = {
      direction: 'row' as const,
      gap: '14px',
      stackOnMobile: true,
      directionMobile: 'column' as const,
      mobileGap: '12px',
    }
    const flexVm = createFlexboxViewModel(flexProps)
    expect(flexVm.direction).toBe('row')
    expect(flexVm.stackOnMobile).toBe(true)
    expect(flexVm.directionMobile).toBe('column')
    expect(flexVm.mobileGap).toBe('12px')
  })
})
