import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'
import { normalizeLayoutToCanonical } from '../../../../shared/page/layout'
import { validateCanonicalLayout, PageLayoutValidationError } from '../../../../shared/page/validateCanonicalLayout'

function createMigratedCanonicalLayout() {
  const input = {
    id: 'layout-1',
    name: 'Layout',
    sections: [
      {
        id: 'section-1',
        name: 'Hero',
        type: 'home_banner',
        content: {
          title: 'Build',
          subtitle: 'Fast',
        },
        stickyEnabled: true,
        stickyColumnIndex: 0,
        columns: [
          {
            id: 'column-1',
            width: 100,
            components: [
              {
                id: 'block-1',
                type: 'richtext',
                props: {
                  text: 'Hello world',
                },
              },
              {
                id: 'block-2',
                type: 'advancedImage',
                props: {
                  image: '/hero.png',
                  alt: 'Hero',
                },
              },
            ],
          },
        ],
      },
    ],
  }

  const migrated = migrateLayoutInput(input).value
  return normalizeLayoutToCanonical(migrated, { id: 'page-1', slug: 'home', name: 'Home' })
}

describe('validateCanonicalLayout', () => {
  it('accepts valid migrated canonical layout', () => {
    const canonical = createMigratedCanonicalLayout()
    const validated = validateCanonicalLayout(canonical, {
      pageId: 'page-1',
      slug: 'home',
      name: 'Home',
      mode: 'preview',
    })

    expect(validated).toEqual(canonical)
    expect(validated.sections[0].type).toBe('hero')
    expect(validated.sections[0].rows[0].columns[0].components[0].type).toBe('advancedparagraph')
    expect(validated.sections[0].rows[0].columns[0].components[1].type).toBe('image')
  })

  it('rejects malformed layout with non-array sections', () => {
    expect(() =>
      validateCanonicalLayout(
        {
          schemaVersion: 1,
          id: 'layout-1',
          name: 'Broken',
          sections: {} as unknown as [],
        },
        { pageId: 'page-1', slug: 'broken' },
      ),
    ).toThrow(PageLayoutValidationError)
  })

  it('rejects canonical layout with unknown block type', () => {
    const canonical = createMigratedCanonicalLayout()
    canonical.sections[0].rows[0].columns[0].components[0].type = 'mystery'
    canonical.sections[0].blocks[0].type = 'mystery'

    expect(() => validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'home' })).toThrow(PageLayoutValidationError)

    try {
      validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'home' })
    } catch (error) {
      expect((error as PageLayoutValidationError).code).toBe('INVALID_LAYOUT')
      expect((error as PageLayoutValidationError).issues.length).toBeGreaterThan(0)
    }
  })

  it('rejects missing required structure instead of silently fixing it', () => {
    const canonical = createMigratedCanonicalLayout()
    canonical.sections[0].rows = [] as any
    canonical.sections[0].blocks = [] as any

    expect(() => validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'home' })).toThrow(PageLayoutValidationError)
  })

  it('rejects row/block structure drift so blocks do not disappear silently', () => {
    const canonical = createMigratedCanonicalLayout()
    canonical.sections[0].blocks = canonical.sections[0].blocks.slice(0, 1)

    expect(() => validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'home' })).toThrow(PageLayoutValidationError)
  })

  it('integration: migrate -> normalize -> validate passes for safe legacy input', () => {
    const input = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Gallery',
          type: 'choose',
          props: {
            title: 'Features',
            subtitle: 'Deterministic migration',
          },
          columns: [
            {
              id: 'column-1',
              width: 100,
              components: [
                {
                  id: 'block-1',
                  type: 'advancedImage',
                  props: {
                    image: '/feature.png',
                  },
                },
              ],
            },
          ],
        },
      ],
    }

    const migrated = migrateLayoutInput(input)
    const canonical = normalizeLayoutToCanonical(migrated.value, { id: 'page-1', slug: 'features', name: 'Features' })
    const validated = validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'features' })

    expect(migrated.migrations.length).toBeGreaterThan(0)
    expect(validated.sections[0].type).toBe('features')
    expect(validated.sections[0].rows[0].columns[0].components[0].type).toBe('image')
  })

  it('prefers live container.rows over stale section.rows when normalizing editor layouts', () => {
    const input = {
      id: 'layout-grid-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Grid Section',
          type: 'custom',
          props: {},
          settings: {},
          rows: [
            {
              id: 'stale-row-1',
              columns: [
                {
                  id: 'stale-column-1',
                  width: 100,
                  components: [
                    {
                      id: 'stale-block-1',
                      type: 'advancedparagraph',
                      props: {
                        text: 'Old paragraph',
                      },
                    },
                  ],
                },
              ],
            },
          ],
          container: {
            id: 'container-1',
            rows: [
              {
                id: 'live-row-1',
                columns: [
                  {
                    id: 'live-column-1',
                    width: 100,
                    components: [
                      {
                        id: 'grid-1',
                        type: 'NewGrid',
                        props: {
                          rows: 1,
                          columns: 1,
                          cells: [
                            [
                              {
                                component: {
                                  id: 'card-1',
                                  type: 'advancedCard',
                                  props: {
                                    title: 'Elegant Modern Design',
                                    content: 'Beautiful and customizable card',
                                  },
                                },
                              },
                            ],
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    }

    const canonical = normalizeLayoutToCanonical(input, { id: 'page-1', slug: 'home', name: 'Home' })
    const validated = validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'home' })

    expect(validated.sections[0].rows[0].id).toBe('live-row-1')
    expect(validated.sections[0].rows[0].columns[0].components[0].type).toBe('newgrid')
    expect(validated.sections[0].rows[0].columns[0].components[0].props.cells[0][0].component.type).toBe('advancedCard')
    expect(validated.sections[0].rows[0].columns[0].components[0].props.cells[0][0].component.props.title).toBe('Elegant Modern Design')
  })

  it('accepts filter blocks with legacy boolean visibility conditions after normalization', () => {
    const input = {
      id: 'layout-filter-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Filters',
          type: 'custom',
          props: {},
          settings: {},
          container: {
            id: 'container-1',
            rows: [
              {
                id: 'row-1',
                columns: [
                  {
                    id: 'column-1',
                    width: 100,
                    components: [
                      {
                        id: 'filter-1',
                        type: 'filter',
                        props: {
                          label: 'Filter',
                          visibleWhen: true,
                          disabledWhen: false,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    }

    const canonical = normalizeLayoutToCanonical(input, { id: 'page-1', slug: 'home', name: 'Home' })
    const validated = validateCanonicalLayout(canonical, { pageId: 'page-1', slug: 'home' })

    expect(validated.sections[0].rows[0].columns[0].components[0].props.visibleWhen).toBe('')
    expect(validated.sections[0].rows[0].columns[0].components[0].props.disabledWhen).toBe('')
  })

  it('integration: invalid legacy input fails instead of guessing', () => {
    const input = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Broken',
          type: 'custom',
          props: {},
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'column-1',
                  width: 100,
                  components: [
                    {
                      id: 'block-1',
                      type: 'advancedImage',
                      props: {
                        image: '/legacy.png',
                        src: '/conflict.png',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    expect(() => migrateLayoutInput(input)).toThrow(PageLayoutValidationError)
  })
})
