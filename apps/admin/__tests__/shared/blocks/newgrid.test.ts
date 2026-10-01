import { normalizeNewGrid } from '@uadmin/shared/blocks/newgrid/normalize'
import { createNewGridViewModel } from '@uadmin/shared/blocks/newgrid/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('NewGrid Canonical Normalizer & ViewModel', () => {
  it('normalizes newgrid with version: 1, structured content, layout, and style', () => {
    const normalized = normalizeNewGrid({
      content: {
        cells: [[{ component: null }, { component: null }]],
        components: [null, null],
      },
      layout: {
        columns: 2,
        rows: 1,
        gap: 16,
        padding: 20,
      },
      style: {
        backgroundColor: '#f8fafc',
        borderRadius: 8,
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.type).toBe('newgrid')
    expect(normalized.schemaVersion).toBe(1)
    expect(normalized.content!.cells).toHaveLength(1)
    expect(normalized.content?.cells?.[0]).toHaveLength(2)
    expect(normalized.content!.components).toHaveLength(2)
    expect(normalized.cells).toHaveLength(1)
    expect(normalized.components).toHaveLength(2)
    expect(normalized.layout.columns).toBe(2)
    expect(normalized.layout.rows).toBe(1)
    expect(normalized.layout.gap).toBe(16)
    expect(normalized.style.backgroundColor).toBe('#f8fafc')
    expect(normalized.style.borderRadius).toBe(8)
  })

  it('normalizes legacy flat newgrid props gracefully', () => {
    const normalized = normalizeNewGrid({
      columns: 3,
      rows: 2,
      gap: 24,
      backgroundColor: '#1e293b',
      draggable: false,
    } as any)

    expect(normalized.version).toBe(1)
    expect(normalized.layout.columns).toBe(3)
    expect(normalized.layout.rows).toBe(2)
    expect(normalized.layout.gap).toBe(24)
    expect(normalized.style.backgroundColor).toBe('#1e293b')
    expect(normalized.behavior.draggable).toBe(false)
    expect(normalized.content!.cells).toHaveLength(2)
    expect(normalized.content?.cells?.[0]).toHaveLength(3)
  })

  it('creates view model from canonical input', () => {
    const vm = createNewGridViewModel({
      content: {
        cells: [[{ component: { type: 'icon', props: { name: 'star' } } }, { component: null }]],
        components: [{ type: 'icon', props: { name: 'star' } }, null],
      },
      layout: {
        columns: 2,
        rows: 1,
        gap: 12,
        padding: 16,
      },
      style: {
        backgroundColor: '#ffffff',
      },
    })

    expect(vm.columns).toBe(2)
    expect(vm.rows).toBe(1)
    expect(vm.gap).toBe(12)
    expect(vm.padding).toBe(16)
    expect(vm.containerStyle.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))')
    expect(vm.cells).toHaveLength(1)
    expect(vm.components).toHaveLength(2)
  })

  it('migrates legacy flat newgrid props to canonical version 1 and recursively migrates child components', () => {
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
                      id: 'grid-1',
                      type: 'newgrid',
                      props: {
                        columns: 2,
                        rows: 1,
                        gap: 18,
                        padding: 12,
                        backgroundColor: '#f1f5f9',
                        components: [
                          {
                            id: 'btn-child',
                            type: 'button',
                            props: {
                              label: 'Grid Child Button',
                              href: '/click',
                            },
                          },
                          null,
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

    const gridBlock = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(gridBlock.props.version).toBe(1)
    expect(gridBlock.props.layout.columns).toBe(2)
    expect(gridBlock.props.layout.rows).toBe(1)
    expect(gridBlock.props.layout.gap).toBe(18)
    expect(gridBlock.props.layout.padding).toBe(12)
    expect(gridBlock.props.style.backgroundColor).toBe('#f1f5f9')
    expect(gridBlock.props.content.components).toHaveLength(2)

    // Verify nested child block inside grid components was recursively migrated
    const nestedChild = gridBlock.props.content.components[0]
    expect(nestedChild.type).toBe('button')
    expect(nestedChild.props.version).toBe(1)
    expect(nestedChild.props.content.text).toBe('Grid Child Button')

    const migrationEntry = result.migrations.find(
      (m: any) => m.migration === 'newgrid_legacy_to_canonical',
    )
    expect(migrationEntry).toBeDefined()
  })
})
