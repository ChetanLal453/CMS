import { normalizeAdvancedHeading } from '@uadmin/shared/blocks/advancedheading/normalize'
import { createAdvancedHeadingViewModel } from '@uadmin/shared/blocks/advancedheading/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('AdvancedHeading Canonical Normalizer & ViewModel', () => {
  it('normalizes advancedheading sparsely without eager style defaults', () => {
    const normalized = normalizeAdvancedHeading({
      content: {
        text: 'Hello World',
        level: 'h3',
      },
      style: {
        color: '#ff0000',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.text).toBe('Hello World')
    expect(normalized.content?.level).toBe('h3')
    expect(normalized.style?.color).toBe('#ff0000')

    // Untouched style fields in canonical style should be undefined
    expect(normalized.style?.fontSize).toBeUndefined()
    expect(normalized.style?.fontFamily).toBeUndefined()
    expect(normalized.style?.fontWeight).toBeUndefined()
    expect(normalized.style?.lineHeight).toBeUndefined()
    expect(normalized.style?.letterSpacing).toBeUndefined()
    expect(normalized.style?.hoverColor).toBeUndefined()
    expect(normalized.style?.maxWidth).toBeUndefined()
    expect(normalized.style?.margin).toBeUndefined()
    expect(normalized.style?.padding).toBeUndefined()
  })

  it('preserves explicitly configured properties in content, style and responsive', () => {
    const normalized = normalizeAdvancedHeading({
      content: {
        text: 'Custom Title',
        level: 'h1',
        highlightText: 'Title',
        highlightColor: '#00ff00',
        seoEnabled: false,
        seoMaxLength: 80,
      },
      style: {
        usePresetStyles: false,
        fontFamily: 'Inter',
        fontSize: '32px',
        fontWeight: '800',
        lineHeight: '1.4',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        textDecoration: 'underline',
        fontStyle: 'italic',
        color: '#333333',
        hoverColor: '#666666',
        alignment: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '10px',
        className: 'custom-heading',
        customId: 'heading-1',
        htmlTag: 'h1',
        ariaLevel: 1,
        ariaLabel: 'Main Heading',
        role: 'heading',
        visible: true,
      },
      responsive: {
        fontSizeMobile: '24px',
        fontSizeTablet: '28px',
        textAlignMobile: 'left',
        textAlignTablet: 'center',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.text).toBe('Custom Title')
    expect(normalized.content?.level).toBe('h1')
    expect(normalized.content?.highlightText).toBe('Title')
    expect(normalized.content?.highlightColor).toBe('#00ff00')
    expect(normalized.content?.seoEnabled).toBe(false)
    expect(normalized.content?.seoMaxLength).toBe(80)

    expect(normalized.style?.usePresetStyles).toBe(false)
    expect(normalized.style?.fontFamily).toBe('Inter')
    expect(normalized.style?.fontSize).toBe('32px')
    expect(normalized.style?.fontWeight).toBe('800')
    expect(normalized.style?.lineHeight).toBe('1.4')
    expect(normalized.style?.textTransform).toBe('uppercase')
    expect(normalized.style?.alignment).toBe('center')
    expect(normalized.style?.maxWidth).toBe('800px')

    expect(normalized.responsive?.fontSizeMobile).toBe('24px')
    expect(normalized.responsive?.fontSizeTablet).toBe('28px')
    expect(normalized.responsive?.textAlignMobile).toBe('left')
    expect(normalized.responsive?.textAlignTablet).toBe('center')
  })

  it('resolves runtime viewModel with presets and fallbacks', () => {
    const vm = createAdvancedHeadingViewModel({
      content: {
        text: 'Highlighted Heading',
        level: 'h2',
        highlightText: 'Highlighted',
        highlightColor: '#123456',
      },
      style: {
        alignment: 'center',
      },
    })

    expect(vm.text).toBe('Highlighted Heading')
    expect(vm.plainText).toBe('Highlighted Heading')
    expect(vm.html).toContain('<span style="color:#123456">Highlighted</span>')
    expect(vm.tag).toBe('h2')
    expect(vm.style.textAlign).toBe('center')
    expect(vm.style.display).toBe('block')
    expect(vm.style.width).toBe('100%')
    expect(vm.responsive.mobileAlign).toBe('center')
  })

  it('migrates legacy flat advancedheading props to canonical version 1', () => {
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
                      id: 'head-1',
                      type: 'advancedheading',
                      props: {
                        text: 'Old Heading',
                        level: 'h1',
                        textAlign: 'center',
                        fontSize: '40px',
                        color: '#222222',
                        highlightText: 'Old',
                        highlightColor: '#abcdef',
                        enableSeoChecks: false,
                        seoMaxLength: 70,
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

    const headBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(headBlock.props.version).toBe(1)
    expect(headBlock.props.content.text).toBe('Old Heading')
    expect(headBlock.props.content.level).toBe('h1')
    expect(headBlock.props.content.highlightText).toBe('Old')
    expect(headBlock.props.content.highlightColor).toBe('#abcdef')
    expect(headBlock.props.content.seoEnabled).toBe(false)
    expect(headBlock.props.content.seoMaxLength).toBe(70)
    expect(headBlock.props.style.fontSize).toBe('40px')
    expect(headBlock.props.style.color).toBe('#222222')
    expect(headBlock.props.style.alignment).toBe('center')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'advancedheading_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
