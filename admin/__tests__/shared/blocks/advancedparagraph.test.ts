import { normalizeAdvancedParagraph } from '../../../../shared/blocks/advancedparagraph/normalize'
import { createAdvancedParagraphViewModel } from '../../../../shared/blocks/advancedparagraph/viewModel'
import { migrateLayoutInput } from '../../../../shared/page/migrateLayoutInput'

describe('AdvancedParagraph Canonical Normalizer & ViewModel', () => {
  it('normalizes advancedparagraph sparsely without eager style defaults', () => {
    const normalized = normalizeAdvancedParagraph({
      content: {
        text: 'Sparse paragraph text',
      },
      style: {
        color: '#123456',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.text).toBe('Sparse paragraph text')
    expect(normalized.style?.color).toBe('#123456')

    // Untouched style fields in canonical style should be undefined
    expect(normalized.style?.fontSize).toBeUndefined()
    expect(normalized.style?.fontWeight).toBeUndefined()
    expect(normalized.style?.fontFamily).toBeUndefined()
    expect(normalized.style?.lineHeight).toBeUndefined()
    expect(normalized.style?.letterSpacing).toBeUndefined()
    expect(normalized.style?.backgroundColor).toBeUndefined()
    expect(normalized.style?.margin).toBeUndefined()
    expect(normalized.style?.padding).toBeUndefined()
    expect(normalized.style?.border).toBeUndefined()
    expect(normalized.style?.borderRadius).toBeUndefined()
    expect(normalized.style?.boxShadow).toBeUndefined()
  })

  it('preserves explicitly configured content, style, and responsive properties', () => {
    const normalized = normalizeAdvancedParagraph({
      content: {
        text: '<p>Rich <strong>Text</strong> Content</p>',
        enableRichText: true,
        allowedFormats: ['bold', 'italic'],
      },
      style: {
        color: '#444444',
        fontSize: '18px',
        fontWeight: '600',
        fontFamily: 'Roboto',
        lineHeight: '1.8',
        backgroundColor: '#f5f5f5',
        margin: '12px 0',
        padding: '8px 16px',
        width: '90%',
        maxWidth: '720px',
        alignment: 'justify',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        opacity: 0.95,
        hoverEffect: 'color-change',
        hoverColor: '#0055ff',
        className: 'custom-p',
      },
      responsive: {
        fontSizeMobile: '15px',
        fontSizeTablet: '16px',
        textAlignMobile: 'left',
        textAlignTablet: 'left',
        lineHeightMobile: '1.5',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.text).toBe('<p>Rich <strong>Text</strong> Content</p>')
    expect(normalized.content?.enableRichText).toBe(true)
    expect(normalized.content?.allowedFormats).toEqual(['bold', 'italic'])

    expect(normalized.style?.color).toBe('#444444')
    expect(normalized.style?.fontSize).toBe('18px')
    expect(normalized.style?.fontWeight).toBe('600')
    expect(normalized.style?.fontFamily).toBe('Roboto')
    expect(normalized.style?.backgroundColor).toBe('#f5f5f5')
    expect(normalized.style?.alignment).toBe('justify')
    expect(normalized.style?.borderRadius).toBe('8px')
    expect(normalized.style?.border).toBe('1px solid #e0e0e0')
    expect(normalized.style?.opacity).toBe(0.95)
    expect(normalized.style?.hoverEffect).toBe('color-change')
    expect(normalized.style?.hoverColor).toBe('#0055ff')

    expect(normalized.responsive?.fontSizeMobile).toBe('15px')
    expect(normalized.responsive?.fontSizeTablet).toBe('16px')
    expect(normalized.responsive?.textAlignMobile).toBe('left')
    expect(normalized.responsive?.lineHeightMobile).toBe('1.5')
  })

  it('resolves runtime viewModel with fallback defaults', () => {
    const vm = createAdvancedParagraphViewModel({
      content: {
        text: 'ViewModel test paragraph',
      },
      style: {
        fontSize: '20px',
        alignment: 'center',
      },
    })

    expect(vm.html).toBe('ViewModel test paragraph')
    expect(vm.style.fontSize).toBe('20px')
    expect(vm.style.textAlign).toBe('center')
    expect(vm.style.fontFamily).toBe('inherit')
    expect(vm.style.lineHeight).toBe('1.6')
    expect(vm.style.color).toBe('var(--canvas-muted, #333333)')
    expect(vm.style.display).toBe('block')
    expect(vm.visible).toBe(true)
    expect(vm.responsive.textAlignMobile).toBe('left')
  })

  it('migrates legacy flat advancedparagraph props to canonical version 1', () => {
    const result = migrateLayoutInput({
      id: 'test-page',
      sections: [
        {
          id: 'sec-1',
          type: 'content',
          rows: [
            {
              id: 'row-1',
              columns: [
                {
                  id: 'col-1',
                  components: [
                    {
                      id: 'p-1',
                      type: 'advancedparagraph',
                      props: {
                        content: 'Legacy paragraph content',
                        textAlign: 'right',
                        fontSize: '17px',
                        textColor: '#1a1a1a',
                        enableRichText: false,
                        allowedFormats: ['bold'],
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

    const pBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(pBlock.props.version).toBe(1)
    expect(pBlock.props.content.text).toBe('Legacy paragraph content')
    expect(pBlock.props.content.enableRichText).toBe(false)
    expect(pBlock.props.content.allowedFormats).toEqual(['bold'])
    expect(pBlock.props.style.fontSize).toBe('17px')
    expect(pBlock.props.style.color).toBe('#1a1a1a')
    expect(pBlock.props.style.alignment).toBe('right')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'advancedparagraph_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
