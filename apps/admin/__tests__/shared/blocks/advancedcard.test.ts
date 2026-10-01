import { normalizeAdvancedCard, sanitizeAdvancedCardForStorage } from '@uadmin/shared/blocks/advancedcard/normalize'
import { createAdvancedCardView } from '@uadmin/shared/blocks/advancedcard/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('AdvancedCard Canonical Normalizer & ViewModel', () => {
  it('normalizes advancedcard with version: 1, structured content and layout', () => {
    const normalized = normalizeAdvancedCard({
      content: {
        title: {
          text: 'Super Card',
          visible: true,
        },
        image: {
          src: '/assets/super.jpg',
          alt: 'Super',
          visible: true,
        },
      },
      layout: {
        textAlignment: 'center',
        padding: 24,
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.type).toBe('advancedCard')
    expect(normalized.schemaVersion).toBe(2)
    expect(normalized.content.title.text).toBe('Super Card')
    expect(normalized.content.image.src).toBe('/assets/super.jpg')
    expect(normalized.layout.textAlignment).toBe('center')
    expect(normalized.layout.padding).toBe(24)
  })

  it('handles canonical shorthand string content properly', () => {
    const normalized = normalizeAdvancedCard({
      content: {
        title: 'Shorthand Title',
        subtitle: 'Shorthand Subtitle',
        description: 'Shorthand Desc',
        image: '/assets/shorthand.png',
        badge: 'Trending',
        button: 'Click Me',
      } as any,
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content.title.text).toBe('Shorthand Title')
    expect(normalized.content.subtitle.text).toBe('Shorthand Subtitle')
    expect(normalized.content.description.text).toBe('Shorthand Desc')
    expect(normalized.content.image.src).toBe('/assets/shorthand.png')
    expect(normalized.content.badge.text).toBe('Trending')
    expect(normalized.content.button.label).toBe('Click Me')
  })

  it('preserves explicitly configured variant, layout and responsive properties', () => {
    const normalized = normalizeAdvancedCard({
      variant: 'blog',
      content: {
        title: { text: 'Blog Post Title', visible: true },
        subtitle: { text: 'By Author', visible: true },
        description: { text: 'Blog post preview text...', visible: true },
      },
      layout: {
        imagePosition: 'top',
        textAlignment: 'left',
        buttonAlignment: 'right',
        padding: 32,
      },
      responsive: {
        hideOnMobile: false,
        hideOnTablet: false,
        layoutOverrides: {
          mobile: { padding: 16 },
        },
        mobileStyles: {},
        tabletStyles: {},
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.variant).toBe('blog')
    expect(normalized.content.title.text).toBe('Blog Post Title')
    expect(normalized.layout.imagePosition).toBe('top')
    expect(normalized.layout.buttonAlignment).toBe('right')
    expect(normalized.responsive.layoutOverrides.mobile?.padding).toBe(16)
  })

  it('creates runtime viewModel with createAdvancedCardView', () => {
    const card = normalizeAdvancedCard({
      content: {
        title: { text: 'View Title', visible: true },
        button: { label: 'Explore', href: '/explore', icon: 'FaCompass', visible: true },
      },
      layout: {
        textAlignment: 'center',
        buttonAlignment: 'center',
      },
    })

    const vm = createAdvancedCardView(card, {}, '')
    expect(vm.title).toBe('View Title')
    expect(vm.buttonText).toBe('Explore')
    expect(vm.buttonLink).toBe('/explore')
    expect(vm.textAlignment).toBe('center')
    expect(vm.buttonAlignment).toBe('center')
  })

  it('sanitizes advancedcard for storage without exploding eager defaults', () => {
    const sanitized = sanitizeAdvancedCardForStorage({
      content: {
        title: { text: 'Custom Heading', visible: true },
      },
      layout: {
        padding: 40,
      },
    })

    expect(sanitized.version).toBe(1)
    expect(sanitized.type).toBe('advancedCard')
    expect(sanitized.schemaVersion).toBe(2)
    // Only changed content/layout should be in sanitized output, not all unchanged defaults
    expect((sanitized.content as any)?.title?.text).toBe('Custom Heading')
    expect((sanitized.layout as any)?.padding).toBe(40)
  })

  it('migrates legacy flat advancedcard props to canonical version 1', () => {
    const result = migrateLayoutInput({
      id: 'test-page',
      sections: [
        {
          id: 'sec-1',
          type: 'features',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  components: [
                    {
                      id: 'card-1',
                      type: 'advancedcard',
                      props: {
                        title: 'Legacy Card Title',
                        subtitle: 'Legacy Card Subtitle',
                        description: 'Legacy Description',
                        image: '/uploads/legacy.jpg',
                        showImage: true,
                        textAlignment: 'center',
                        buttonText: 'Action',
                        buttonLink: '/action',
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

    const cardBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(cardBlock.props.version).toBe(1)
    expect(cardBlock.props.content.title).toBe('Legacy Card Title')
    expect(cardBlock.props.content.subtitle).toBe('Legacy Card Subtitle')
    expect(cardBlock.props.content.image).toBe('/uploads/legacy.jpg')
    expect(cardBlock.props.content.buttonText).toBe('Action')
    expect(cardBlock.props.style.textAlignment).toBe('center')
    expect(cardBlock.props.style.backgroundColor).toBe('#ffffff')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'advancedcard_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
