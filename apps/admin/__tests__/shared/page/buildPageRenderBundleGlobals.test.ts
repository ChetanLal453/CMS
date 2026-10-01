import { buildPageRenderBundle } from '@uadmin/shared/page/buildPageRenderBundle'
import {
  normalizeBannerToCanonical,
  normalizeFooterToCanonical,
  normalizeHeaderToCanonical,
} from '@uadmin/shared/page/globalContent'

function createSource(overrides: Record<string, unknown> = {}) {
  return {
    mode: 'public',
    page: {
      id: 1,
      slug: 'home',
      title: 'Home',
      name: 'Home',
      seo: {
        title: 'Home',
        description: 'Home page',
        keywords: [],
        image: '',
        imageId: null,
        canonicalUrl: '',
        robots: 'index,follow',
      },
      status: 'published',
      published_revision_id: 1,
    },
    published_layout: {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Hero',
          type: 'custom',
          props: {},
          settings: {},
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  width: 100,
                  components: [
                    {
                      id: 'heading-1',
                      type: 'advancedheading',
                      props: {
                        text: 'Hello world',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    header: null,
    footer: null,
    banner: null,
    ...overrides,
  }
}

describe('buildPageRenderBundle globals', () => {
  it('accepts canonical header, footer, and banner globals', () => {
    const bundle = buildPageRenderBundle(
      createSource({
        header: normalizeHeaderToCanonical({
          name: 'Global Header',
          slug: 'global-header',
          navigation_items: [{ label: 'Home', href: '/', children: [{ label: '', href: '', children: [] }] }],
        }),
        footer: normalizeFooterToCanonical({
          name: 'Global Footer',
          slug: 'global-footer',
          columns: [{ heading: '', links: [{ href: '/contact', label: '' }] }],
          social_links: [{}],
          settings: {
            company_email: 'hello@example.com',
          },
        }),
        banner: normalizeBannerToCanonical({
          name: 'Spring Banner',
          slug: 'spring-banner',
          content: {
            title: 'Spring Sale',
            subtitle: '',
            description: '',
            buttonText: 'Learn more',
            buttonLink: '/sale',
          },
        }),
      }) as any,
    )

    expect(bundle.header).toEqual({
      id: null,
      slug: 'global-header',
      name: 'Global Header',
      logo: '',
      logo_dark: '',
      cta_label: '',
      cta_link: '',
      navigation_items: [
        {
          id: 'nav-item-1',
          label: 'Home',
          href: '/',
          open_new_tab: false,
          children: [
            {
              id: 'nav-item-1-child-1',
              label: '',
              href: '',
              open_new_tab: false,
              children: [],
            },
          ],
        },
      ],
      is_sticky: true,
      bg_color: '',
      settings: {},
    })

    expect(bundle.footer).toEqual({
      id: null,
      slug: 'global-footer',
      name: 'Global Footer',
      columns: [
        {
          id: 'footer-column-1',
          heading: '',
          links: [
            {
              id: 'footer-link-1-1',
              href: '/contact',
              label: '',
            },
          ],
        },
      ],
      social_links: [
        {
          id: 'social-link-1',
          url: '',
          platform: '',
        },
      ],
      copyright: '',
      bg_color: '',
      settings: {
        logo_url: '',
        copyright_text: '',
        newsletter_enabled: true,
        company_address: '',
        company_email: 'hello@example.com',
        company_phone: '',
        social_style: 'text',
      },
    })

    expect(bundle.banner).toEqual({
      id: null,
      slug: 'spring-banner',
      name: 'Spring Banner',
      content: {
        title: 'Spring Sale',
        subtitle: '',
        description: '',
        buttonText: 'Learn more',
        buttonLink: '/sale',
      },
    })
  })

  it('does not translate legacy snake_case banner aliases at the canonical boundary', () => {
    const banner = normalizeBannerToCanonical({
      name: 'Spring Banner',
      slug: 'spring-banner',
      content: {
        button_text: 'Learn more',
        button_link: '/sale',
      },
    })

    expect(banner?.content.buttonText).toBe('')
    expect(banner?.content.buttonLink).toBe('')
    expect(banner?.content).not.toHaveProperty('button_text')
    expect(banner?.content).not.toHaveProperty('button_link')
  })

  it('does not translate legacy navigation or name aliases at the canonical boundary', () => {
    const header = normalizeHeaderToCanonical({
      slug: 'global-header',
      navigation_items: [{ label: 'Home', url: '/', children: [] }],
    })

    const footer = normalizeFooterToCanonical({
      slug: 'global-footer',
      columns: [],
      social_links: [],
      settings: {},
    })

    expect(header).toEqual({
      id: null,
      slug: 'global-header',
      name: '',
      logo: '',
      logo_dark: '',
      cta_label: '',
      cta_link: '',
      navigation_items: [
        {
          id: 'nav-item-1',
          label: 'Home',
          href: '',
          open_new_tab: false,
          children: [],
        },
      ],
      is_sticky: true,
      bg_color: '',
      settings: {},
    })

    expect(footer?.name).toBe('')
  })
})
