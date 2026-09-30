import type { SectionPreset } from '../types'

export const emergencyServiceHeroPreset: SectionPreset = {
  id: 'hero-emergency-service',
  version: 1,
  name: 'Emergency Service Hero',
  description: 'Two-column emergency-service hero with phone CTA, trust strip, and floating 24/7 stat card.',
  category: 'hero',
  tags: ['split', 'phone', 'emergency', 'local-service', 'floating-card'],
  industries: ['plumbing', 'hvac', 'electrical', 'locksmith'],
  thumbnail: '/presets/hero-emergency-service.webp',
  section: {
    id: 'sec-emergency-hero',
    name: 'Emergency Hero Section',
    type: 'custom',
    settings: {
      visible: true,
      backgroundColor: '#ffffff',
      padding: '70px 0',
      containerType: 'boxed',
      maxWidth: 1200,
      sideSpacing: 20,
      rowVerticalAlign: 'center',
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
                    { id: 'pill-text', type: 'advancedparagraph', props: { text: 'EMERGENCY DISPATCH • 24/7 AVAILABLE', fontSize: '12px', fontWeight: '700', color: '#2563eb' } },
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
                        text: 'Call (800) 555-0199',
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
                          phone: '+18005550199',
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
                        alt: 'Professional Emergency Service Technician',
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
                        width: 'auto',
                        maxWidth: 'max-content',
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
                        width: 'auto',
                        maxWidth: 'max-content',
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
  },
}
