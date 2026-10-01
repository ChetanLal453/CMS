import { normalizeSwiperContainer } from '@uadmin/shared/blocks/swipercontainer/normalize'
import { createSwiperContainerViewModel } from '@uadmin/shared/blocks/swipercontainer/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('SwiperContainer Canonical Normalizer & ViewModel', () => {
  it('normalizes swipercontainer sparsely without eager style defaults', () => {
    const normalized = normalizeSwiperContainer({
      content: {
        loop: true,
        autoplay: true,
        speed: 500,
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.loop).toBe(true)
    expect(normalized.content?.autoplay).toBe(true)
    expect(normalized.content?.speed).toBe(500)
    expect(normalized.style?.slidesPerView).toBeUndefined()
    expect(normalized.style?.spaceBetween).toBeUndefined()
    expect(normalized.style?.height).toBeUndefined()
    expect(normalized.style?.backgroundColor).toBeUndefined()
    expect(normalized.style?.borderRadius).toBeUndefined()
    expect(normalized.style?.effect).toBeUndefined()
    expect(normalized.style?.className).toBeUndefined()
  })

  it('preserves explicitly configured slides and style properties', () => {
    const customSlides = [
      {
        id: 'slide-alpha',
        bgType: 'color' as const,
        bgColor: '#112233',
        padding: '24px',
        components: [{ id: 'comp-1', type: 'heading', props: { text: 'Hello' } }],
      },
      {
        id: 'slide-beta',
        bgType: 'image' as const,
        bgImage: '/images/hero.jpg',
        components: [],
      },
    ]

    const normalized = normalizeSwiperContainer({
      content: {
        slides: customSlides,
        direction: 'vertical',
      },
      style: {
        slidesPerView: 2,
        spaceBetween: 20,
        effect: 'fade',
        borderRadius: '12px',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.slides).toHaveLength(2)
    expect(normalized.content?.slides?.[0].id).toBe('slide-alpha')
    expect(normalized.content?.slides?.[0].bgColor).toBe('#112233')
    expect(normalized.content?.slides?.[1].bgImage).toBe('/images/hero.jpg')
    expect(normalized.content?.direction).toBe('vertical')
    expect(normalized.style?.slidesPerView).toBe(2)
    expect(normalized.style?.spaceBetween).toBe(20)
    expect(normalized.style?.effect).toBe('fade')
    expect(normalized.style?.borderRadius).toBe('12px')
  })

  it('resolves runtime viewModel with editorSlides, renderSlides, and renderConfig', () => {
    const vm = createSwiperContainerViewModel({
      content: {
        loop: true,
        slides: [
          {
            id: 'slide-1',
            bgType: 'color',
            bgColor: '#ff0000',
            components: [],
          },
        ],
      },
      style: {
        slidesPerView: 'auto',
        effect: 'cards',
      },
    })

    expect(vm.renderConfig.slidesPerViewValue).toBe('auto')
    expect(vm.renderConfig.resolvedEffect).toBe('cards')
    expect(vm.renderConfig.isAutoMode).toBe(true)
    expect(vm.editorSlides).toHaveLength(1)
    expect(vm.editorSlides[0].resolvedBgColor).toBe('#ff0000')
    expect(vm.renderSlides).toHaveLength(1)
    expect(vm.renderSlides[0].surfaceStyle).toBeDefined()
  })

  it('migrates legacy swipercontainer props and recursively migrates nested slide components', () => {
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
                      id: 'swiper-1',
                      type: 'swipercontainer',
                      props: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                        loop: true,
                        speed: 400,
                        slides: [
                          {
                            id: 'slide-a',
                            components: [
                              {
                                id: 'btn-nested',
                                type: 'button',
                                props: {
                                  text: 'Click Here',
                                  variant: 'primary',
                                  linkUrl: '/nested',
                                },
                              },
                            ],
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
      ],
    })

    const swiperComp = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(swiperComp.props.version).toBe(1)
    expect(swiperComp.props.content?.loop).toBe(true)
    expect(swiperComp.props.content?.speed).toBe(400)
    expect(swiperComp.props.style?.slidesPerView).toBe(3)
    expect(swiperComp.props.style?.spaceBetween).toBe(24)

    // Verify slide components were recursively migrated
    const nestedBtn = swiperComp.props.content?.slides?.[0]?.components?.[0]
    expect(nestedBtn).toBeDefined()
    expect(nestedBtn.props.version).toBe(1)
    expect(nestedBtn.props.content?.text).toBe('Click Here')
    expect(nestedBtn.props.content?.link).toBe('/nested')
    expect(nestedBtn.props.style?.variant).toBe('primary')
  })
})
