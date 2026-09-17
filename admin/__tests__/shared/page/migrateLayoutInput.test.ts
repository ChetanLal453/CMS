import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'
import { PageLayoutValidationError } from '../../../../shared/page/validateCanonicalLayout'

function createLegacyLayout(blockType: string, blockProps: Record<string, unknown> = {}) {
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
  ])('migrates block alias %s -> %s and logs it', (before, after) => {
    const result = migrateLayoutInput(createLegacyLayout(before, { text: 'Hello world' }))
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
    const result = migrateLayoutInput(createLegacyLayout('advancedparagraph-1777898919186-tt7g31vr7', { text: 'Hello world' }))
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
  ])('migrates section alias %s -> %s and logs it', (before, after) => {
    const layout = createLegacyLayout('advancedparagraph', { text: 'Hello world' })
    layout.sections[0].type = before
    layout.sections[0].props = { title: 'Title', subtitle: 'Subtitle' }

    const result = migrateLayoutInput(layout)

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
    const result = migrateLayoutInput(createLegacyLayout('advancedImage', { image: '/hero.png', alt: 'Hero' }))
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

    const result = migrateLayoutInput(layout)

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
    const result = migrateLayoutInput(createLegacyLayout('advancedparagraph', { text: 'Hello world' }))

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

    const result = migrateLayoutInput(layout)
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
                        text: 'Canonical paragraph',
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

    const result = migrateLayoutInput(layout)

    expect(result.value).toEqual(layout)
    expect(result.migrations).toHaveLength(0)
    expect(infoSpy).not.toHaveBeenCalled()
  })
})
