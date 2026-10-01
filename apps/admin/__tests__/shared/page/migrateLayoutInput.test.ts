import { migrateLayoutInput, type MigrationResult } from '@uadmin/shared/page/migrateLayoutInput'
import { PageLayoutValidationError } from '@uadmin/shared/page/validateCanonicalLayout'

type LegacyTestComponent = {
  id: string
  type: string
  props: Record<string, unknown>
}

type LegacyTestColumn = {
  id: string
  width: number
  components: LegacyTestComponent[]
}

type LegacyTestSection = {
  id: string
  name: string
  type: string
  props?: Record<string, unknown>
  settings?: Record<string, unknown>
  content?: Record<string, unknown>
  stickyEnabled?: boolean
  stickyColumnIndex?: number
  stickyPosition?: string
  stickyOffset?: number
  columns?: LegacyTestColumn[]
  rows?: Array<{
    id?: string
    columns: Array<{
      id?: string
      width?: number
      components: LegacyTestComponent[]
    }>
  }>
}

type LegacyTestLayout = {
  id: string
  name: string
  sections: LegacyTestSection[]
}

type MigratedTestComponent = {
  id?: string
  type: string
  props: Record<string, any>
  [key: string]: any
}

type MigratedTestColumn = {
  id?: string
  width?: number
  components: MigratedTestComponent[]
  [key: string]: any
}

type MigratedTestRow = {
  id?: string
  columns: MigratedTestColumn[]
  [key: string]: any
}

type MigratedTestSection = {
  id: string
  name: string
  type: string
  props?: Record<string, any>
  settings?: Record<string, any>
  rows: MigratedTestRow[]
  columns?: MigratedTestColumn[]
  [key: string]: any
}

type MigratedTestLayout = {
  id: string
  name: string
  sections: MigratedTestSection[]
  [key: string]: any
}

function createLegacyLayout(blockType: string, blockProps: Record<string, unknown> = {}): LegacyTestLayout {
  return {
    id: 'layout-1',
    name: 'Layout',
    sections: [
      {
        id: 'section-1',
        name: 'Legacy Section',
        type: 'custom',
        columns: [
          {
            id: 'column-1',
            width: 100,
            components: [
              {
                id: 'block-1',
                type: blockType,
                props: blockProps,
              },
            ],
          },
        ],
      },
    ],
  }
}

describe('migrateLayoutInput', () => {
  let infoSpy: jest.SpyInstance

  beforeEach(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})
  })

  afterEach(() => {
    infoSpy.mockRestore()
  })

  it.each([
    ['richtext', 'advancedparagraph'],
    ['advancedImage', 'image'],
    ['advancedCard', 'advancedcard'],
  ])('migrates block alias %s -> %s and logs it', (before: string, after: string) => {
    const result = migrateLayoutInput<MigratedTestLayout>(createLegacyLayout(before, { text: 'Hello world' }))
    const component = result.value.sections[0].rows[0].columns[0].components[0]

    expect(component.type).toBe(after)
    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'auto_migration',
          migration: 'block_type_alias',
          before,
          after,
        }),
      ]),
    )
    expect(infoSpy).toHaveBeenCalledWith(
      'auto_migration',
      expect.objectContaining({
        migration: 'block_type_alias',
        before,
        after,
      }),
    )
  })

  it('recovers block identifiers accidentally stored in type fields', () => {
    const result = migrateLayoutInput<MigratedTestLayout>(createLegacyLayout('advancedparagraph-1777898919186-tt7g31vr7', { text: 'Hello world' }))
    const component = result.value.sections[0].rows[0].columns[0].components[0]

    expect(component.type).toBe('advancedparagraph')
    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          migration: 'block_type_alias',
          before: 'advancedparagraph-1777898919186-tt7g31vr7',
          after: 'advancedparagraph',
        }),
      ]),
    )
  })

  it.each([
    ['home_banner', 'hero'],
    ['choose', 'features'],
  ])('migrates section alias %s -> %s and logs it', (before: string, after: string) => {
    const layout = createLegacyLayout('advancedparagraph', { text: 'Hello world' })
    layout.sections[0].type = before
    layout.sections[0].props = { title: 'Title', subtitle: 'Subtitle' }

    const result = migrateLayoutInput<MigratedTestLayout>(layout)

    expect(result.value.sections[0].type).toBe(after)
    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          migration: 'section_type_alias',
          before,
          after,
        }),
      ]),
    )
  })

  it('migrates image -> src deterministically and logs it', () => {
    const result = migrateLayoutInput<MigratedTestLayout>(createLegacyLayout('advancedImage', { image: '/hero.png', alt: 'Hero' }))
    const props = result.value.sections[0].rows[0].columns[0].components[0].props

    expect(props).toMatchObject({
      src: '/hero.png',
      alt: 'Hero',
    })
    expect(props.image).toBeUndefined()
    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          migration: 'image_prop_rename',
        }),
      ]),
    )
  })

  it('migrates content -> props for deterministic section content', () => {
    const layout = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Hero',
          type: 'home_banner',
          content: {
            title: 'Hero title',
            subtitle: 'Hero subtitle',
          },
          columns: [
            {
              id: 'column-1',
              width: 100,
              components: [],
            },
          ],
        },
      ],
    }

    const result = migrateLayoutInput<MigratedTestLayout>(layout)

    expect(result.value.sections[0].props).toEqual({
      title: 'Hero title',
      subtitle: 'Hero subtitle',
    })
    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          migration: 'section_content_to_props',
        }),
      ]),
    )
  })

  it('migrates section.columns -> rows and logs it', () => {
    const result = migrateLayoutInput<MigratedTestLayout>(createLegacyLayout('advancedparagraph', { text: 'Hello world' }))

    expect(result.value.sections[0].rows).toHaveLength(1)
    expect(result.value.sections[0].rows[0].columns).toHaveLength(1)
    expect(result.value.sections[0].columns).toBeUndefined()
    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          migration: 'section_columns_to_rows',
        }),
      ]),
    )
  })

  it('migrates sticky fields into settings and logs it', () => {
    const layout = createLegacyLayout('advancedparagraph', { text: 'Hello world' })
    layout.sections[0].stickyEnabled = true
    layout.sections[0].stickyColumnIndex = 0
    layout.sections[0].stickyPosition = 'top'
    layout.sections[0].stickyOffset = 24

    const result = migrateLayoutInput<MigratedTestLayout>(layout)
    const settings = result.value.sections[0].settings

    expect(settings).toMatchObject({
      sticky_enabled: true,
      sticky_column_index: 0,
      sticky_position: 'top',
      sticky_offset: 24,
    })
    expect(result.migrations.filter((entry) => entry.migration === 'section_sticky_field_move')).toHaveLength(4)
  })

  it('rejects unknown block types', () => {
    expect(() => migrateLayoutInput(createLegacyLayout('mystery-block', {}))).toThrow(PageLayoutValidationError)

    try {
      migrateLayoutInput(createLegacyLayout('mystery-block', {}))
    } catch (error) {
      expect(error).toBeInstanceOf(PageLayoutValidationError)
      expect((error as PageLayoutValidationError).code).toBe('INVALID_LAYOUT')
      expect((error as PageLayoutValidationError).issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'layout.sections[0].rows[0].columns[0].components[0].type',
          }),
        ]),
      )
    }
  })

  it('rejects malformed layout objects', () => {
    expect(() => migrateLayoutInput(null)).toThrow(PageLayoutValidationError)

    try {
      migrateLayoutInput(null)
    } catch (error) {
      expect((error as PageLayoutValidationError).code).toBe('INVALID_LAYOUT')
      expect((error as PageLayoutValidationError).issues[0].path).toBe('layout')
    }
  })

  it('rejects sections with no explicit structure', () => {
    const layout = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Broken',
          type: 'custom',
          props: {},
        },
      ],
    }

    expect(() => migrateLayoutInput(layout)).toThrow(PageLayoutValidationError)
  })

  it('rejects ambiguous image/src conflicts', () => {
    const layout = createLegacyLayout('advancedImage', {
      image: '/legacy.png',
      src: '/new.png',
    })

    expect(() => migrateLayoutInput(layout)).toThrow(PageLayoutValidationError)
  })

  it('rejects ambiguous sticky conflicts', () => {
    const layout = createLegacyLayout('advancedparagraph', { text: 'Hello world' })
    layout.sections[0].stickyEnabled = true
    layout.sections[0].settings = {
      sticky_enabled: false,
    }

    expect(() => migrateLayoutInput(layout)).toThrow(PageLayoutValidationError)
  })

  it('does not silently migrate valid canonical input', () => {
    const layout = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Canonical',
          type: 'custom',
          props: {},
          settings: {},
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
                      type: 'advancedparagraph',
                      props: {
                        version: 1,
                        content: {
                          text: 'Canonical paragraph',
                        },
                        style: {
                          color: '#111111',
                        },
                        responsive: {},
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

    const result = migrateLayoutInput<MigratedTestLayout>(layout)

    expect(result.value).toEqual(layout)
    expect(result.migrations).toHaveLength(0)
    expect(infoSpy).not.toHaveBeenCalled()
  })

  it('migrates legacy flat button props to canonical format and retains flat fields', () => {
    const layout = createLegacyLayout('button', {
      text: 'Click Here',
      link: '/contact',
      openInNewTab: true,
      variant: 'secondary',
      size: 'large',
      backgroundColor: '#123456',
      mobileSize: 'small',
      mobileFullWidth: true,
      hideOnMobile: false,
    })

    const result = migrateLayoutInput<MigratedTestLayout>(layout)
    const component = result.value.sections[0].rows[0].columns[0].components[0]

    expect(component.props.version).toBe(1)
    expect(component.props.content).toEqual({
      text: 'Click Here',
      link: '/contact',
      openInNewTab: true,
      loadingText: undefined,
      ariaLabel: undefined,
    })
    expect(component.props.style).toMatchObject({
      variant: 'secondary',
      size: 'large',
      backgroundColor: '#123456',
    })
    expect(component.props.responsive).toEqual({
      desktop: {},
      tablet: {},
      mobile: {
        size: 'small',
        fullWidth: true,
        hidden: false,
      },
    })
    expect(component.props.text).toBe('Click Here')
    expect(component.props.link).toBe('/contact')
    expect(component.props.variant).toBe('secondary')

    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'auto_migration',
          migration: 'button_legacy_to_canonical',
          blockOrSectionType: 'button',
        }),
      ]),
    )
  })

  it('does not re-migrate canonical button that already has content and style', () => {
    const canonicalProps = {
      version: 1,
      content: { text: 'Canonical Button', link: '#' },
      style: { variant: 'primary', size: 'medium' },
      responsive: { desktop: {}, tablet: {}, mobile: { size: 'medium', fullWidth: false, hidden: false } },
    }
    const layout = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Section',
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
                      id: 'comp-1',
                      type: 'button',
                      props: canonicalProps,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    const result = migrateLayoutInput<MigratedTestLayout>(layout)
    const buttonMigrations = result.migrations.filter((m) => m.migration === 'button_legacy_to_canonical')
    expect(buttonMigrations).toHaveLength(0)
  })

  it('cleans up dumped default backgroundColor, fontSize, and padding on legacy unversioned buttons with non-default variant/size', () => {
    const layout = createLegacyLayout('button', {
      text: 'Secondary Action',
      link: '/secondary',
      variant: 'secondary',
      size: 'small',
      backgroundColor: '#7C6DFA', // dumped default primary color
      fontSize: '16px', // dumped default medium font size
      paddingTop: '14px', // dumped default medium padding
      paddingRight: '28px',
      paddingBottom: '14px',
      paddingLeft: '28px',
    })

    const result = migrateLayoutInput<MigratedTestLayout>(layout)
    const component = result.value.sections[0].rows[0].columns[0].components[0]

    expect(component.props.version).toBe(1)
    expect(component.props.style.variant).toBe('secondary')
    expect(component.props.style.size).toBe('small')
    // Defaults stripped so variant and size natural presets take effect:
    expect(component.props.style.backgroundColor).toBeUndefined()
    expect(component.props.style.fontSize).toBeUndefined()
    expect(component.props.style.paddingTop).toBeUndefined()
    expect(component.props.backgroundColor).toBeUndefined()
    expect(component.props.fontSize).toBeUndefined()
    expect(component.props.paddingTop).toBeUndefined()
  })

  it('preserves explicit #7C6DFA on version 1 buttons (does not strip customized buttons)', () => {
    const layout = {
      id: 'layout-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Section',
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
                      id: 'comp-1',
                      type: 'button',
                      props: {
                        version: 1,
                        content: { text: 'Custom Purple Secondary', link: '#' },
                        style: { variant: 'secondary', size: 'medium', backgroundColor: '#7C6DFA' },
                        responsive: { desktop: {}, tablet: {}, mobile: { size: 'medium', fullWidth: false, hidden: false } },
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

    const result = migrateLayoutInput<MigratedTestLayout>(layout)
    const component = result.value.sections[0].rows[0].columns[0].components[0]
    expect(component.props.style.backgroundColor).toBe('#7C6DFA')
    expect(result.migrations.filter((m) => m.migration === 'button_legacy_to_canonical')).toHaveLength(0)
  })

  it('migrates legacy flat image to canonical format non-destructively', () => {
    const layout = {
      id: 'layout-img-1',
      name: 'Layout',
      sections: [
        {
          id: 'section-1',
          name: 'Section',
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
                      id: 'comp-1',
                      type: 'image',
                      props: {
                        src: '/legacy-banner.jpg',
                        alt: 'Legacy Banner',
                        width: '100%',
                        shape: 'circle',
                        borderRadius: '0px',
                        padding: '0px',
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

    const result = migrateLayoutInput<MigratedTestLayout>(layout)
    const component = result.value.sections[0].rows[0].columns[0].components[0]

    expect(component.props.version).toBe(1)
    expect(component.props.content).toBeDefined()
    expect(component.props.content.src).toBe('/legacy-banner.jpg')
    expect(component.props.content.alt).toBe('Legacy Banner')
    expect(component.props.style).toBeDefined()
    expect(component.props.style.shape).toBe('circle')
    // Legacy default '0px' stripped on circle so shape preset takes effect:
    expect(component.props.style.borderRadius).toBeUndefined()
    expect(component.props.style.padding).toBeUndefined()
    // Non-destructive: flat fields still preserved on props
    expect(component.props.src).toBe('/legacy-banner.jpg')
    expect(component.props.alt).toBe('Legacy Banner')

    expect(result.migrations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'auto_migration',
          migration: 'image_legacy_to_canonical',
        }),
      ]),
    )
  })
})

