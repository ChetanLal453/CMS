import { normalizeFilter } from '@uadmin/shared/blocks/filter/normalize'
import { createFilterViewModel } from '@uadmin/shared/blocks/filter/viewModel'
import { migrateLayoutInput } from '@uadmin/shared/page/migrateLayoutInput'

describe('Filter Canonical Normalizer & ViewModel', () => {
  it('normalizes filter sparsely without eager style defaults', () => {
    const normalized = normalizeFilter({
      content: {
        filterType: 'dropdown',
        filterKey: 'category',
        label: 'Category',
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.filterType).toBe('dropdown')
    expect(normalized.content?.filterKey).toBe('category')
    expect(normalized.content?.label).toBe('Category')
    expect(normalized.style?.variant).toBeUndefined()
    expect(normalized.style?.size).toBeUndefined()
    expect(normalized.style?.fullWidth).toBeUndefined()
    expect(normalized.style?.columns).toBeUndefined()
    expect(normalized.style?.sticky).toBeUndefined()
    expect(normalized.style?.className).toBeUndefined()
  })

  it('preserves explicitly configured API-dependent properties in canonical structure', () => {
    const normalized = normalizeFilter({
      content: {
        filterType: 'dropdown',
        filterKey: 'dynamicCategory',
        sourceType: 'api',
        apiEndpoint: '/api/v1/categories',
        apiMethod: 'GET',
        apiLabelField: 'name',
        apiValueField: 'slug',
      },
      style: {
        variant: 'outlined',
        size: 'lg',
        fullWidth: true,
        clearable: true,
      },
    })

    expect(normalized.version).toBe(1)
    expect(normalized.content?.filterKey).toBe('dynamicCategory')
    expect(normalized.content?.sourceType).toBe('api')
    expect(normalized.content?.apiEndpoint).toBe('/api/v1/categories')
    expect(normalized.content?.apiMethod).toBe('GET')
    expect(normalized.content?.apiLabelField).toBe('name')
    expect(normalized.content?.apiValueField).toBe('slug')
    expect(normalized.style?.variant).toBe('outlined')
    expect(normalized.style?.size).toBe('lg')
    expect(normalized.style?.fullWidth).toBe(true)
    expect(normalized.style?.clearable).toBe(true)
    expect(normalized.apiEndpoint).toBe('/api/v1/categories')
    expect(normalized.sourceType).toBe('api')
  })

  it('provides runtime defaults and fallback options in createFilterViewModel', () => {
    const vm = createFilterViewModel({
      content: {
        filterType: 'tagChips',
        filterKey: 'tags',
      },
    })

    expect(vm.resolvedFilterType).toBe('tagChips')
    expect(vm.normalizedOptions.length).toBeGreaterThan(0)
    expect(Array.isArray(vm.emptyValue)).toBe(true)
    expect(vm.label).toBe('Filter')
    expect(vm.placeholder).toBe('Select option...')
  })

  it('migrates legacy flat filter props to canonical version 1 structure non-destructively', () => {
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
                      id: 'flt-1',
                      type: 'filter',
                      props: {
                        filterType: 'multiselect',
                        filterKey: 'features',
                        label: 'Features',
                        sourceType: 'api',
                        apiEndpoint: '/api/features',
                        maxSelections: 5,
                        fullWidth: true,
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

    const comp = (result.value as any).sections[0].rows[0].columns[0].components[0]
    expect(comp.props.version).toBe(1)
    expect(comp.props.content?.filterType).toBe('multiselect')
    expect(comp.props.content?.filterKey).toBe('features')
    expect(comp.props.content?.label).toBe('Features')
    expect(comp.props.content?.sourceType).toBe('api')
    expect(comp.props.content?.apiEndpoint).toBe('/api/features')
    expect(comp.props.style?.maxSelections).toBe(5)
    expect(comp.props.style?.fullWidth).toBe(true)
    expect(comp.props.filterKey).toBe('features')
    expect(comp.props.apiEndpoint).toBe('/api/features')
  })
})
