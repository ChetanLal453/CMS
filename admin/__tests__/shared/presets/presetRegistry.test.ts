import {
  getPresets,
  getPresetsByCategory,
  getPresetById,
  instantiateSectionPreset,
} from '../../../../shared/presets/registry'
import { validatePageRenderBundle } from '../../../../shared/page/validatePageRenderBundle'

describe('Section Preset Registry & Instantiation Engine', () => {
  it('retrieves the registered Emergency Service Hero preset', () => {
    const allPresets = getPresets()
    expect(allPresets.length).toBeGreaterThanOrEqual(1)

    const heroPresets = getPresetsByCategory('hero')
    expect(heroPresets.length).toBe(1)
    expect(heroPresets[0].id).toBe('hero-emergency-service')
    expect(heroPresets[0].category).toBe('hero')
    expect(heroPresets[0].name).toBe('Emergency Service Hero')

    const specific = getPresetById('hero-emergency-service')
    expect(specific).toBeDefined()
    expect(specific?.id).toBe('hero-emergency-service')
  })

  it('instantiates preset with fresh IDs and maintains no shared IDs on multiple insertions', () => {
    const preset = getPresetById('hero-emergency-service')!
    expect(preset).toBeDefined()

    const instance1 = instantiateSectionPreset(preset)
    const instance2 = instantiateSectionPreset(preset)

    // Verify sections have different IDs
    expect(instance1.id).not.toBe(instance2.id)
    expect(instance1.id).not.toBe(preset.section.id)

    // Verify containers have different IDs
    expect(instance1.container?.id).not.toBe(instance2.container?.id)

    // Collect all component IDs from instance 1
    const ids1 = new Set<string>()
    instance1.rows.forEach((row) => {
      ids1.add(String(row.id))
      row.columns.forEach((col) => {
        ids1.add(String(col.id))
        col.components.forEach((comp) => ids1.add(String(comp.id)))
      })
    })

    // Collect all component IDs from instance 2
    const ids2 = new Set<string>()
    instance2.rows.forEach((row) => {
      ids2.add(String(row.id))
      row.columns.forEach((col) => {
        ids2.add(String(col.id))
        col.components.forEach((comp) => ids2.add(String(comp.id)))
      })
    })

    // Confirm ZERO ID overlap between the two instances
    ids1.forEach((id) => {
      expect(ids2.has(id)).toBe(false)
    })

    // Verify children have fresh IDs as well
    const colContent1 = instance1.rows[0].columns[0]
    const buttonGroup1 = colContent1.components.find((c) => c.props?.children?.length > 0)
    expect(buttonGroup1).toBeDefined()

    const colContent2 = instance2.rows[0].columns[0]
    const buttonGroup2 = colContent2.components.find((c) => c.props?.children?.length > 0)
    expect(buttonGroup2).toBeDefined()

    const childId1 = buttonGroup1?.props.children[0].id
    const childId2 = buttonGroup2?.props.children[0].id
    expect(childId1).toBeDefined()
    expect(childId2).toBeDefined()
    expect(childId1).not.toBe(childId2)
  })

  it('instantiated preset passes PageRenderBundle validation', () => {
    const preset = getPresetById('hero-emergency-service')!
    const instantiated = instantiateSectionPreset(preset)

    const bundle = {
      schemaVersion: 1 as const,
      mode: 'public' as const,
      success: true as const,
      page: {
        id: 101,
        slug: 'emergency',
        title: 'Emergency Service',
        status: 'published',
        published_at: '2026-09-29T10:00:00Z',
        updated_at: '2026-09-29T10:00:00Z',
        seo: {
          title: 'Emergency Service',
          description: 'Fast 24/7 service',
          keywords: ['emergency'],
          image: '/seo.jpg',
          imageId: null,
          canonicalUrl: 'https://fixpro.com/emergency',
          robots: 'index,follow',
        },
      },
      layout: {
        schemaVersion: 1 as const,
        id: 'layout-preset',
        name: 'Preset Layout',
        sections: [instantiated],
      },
      sections: [instantiated],
      header: null,
      footer: null,
      banner: null,
      revisionMeta: null,
      view: {
        traceId: 'trace-preset-test',
        theme: {
          accent: '#2563eb',
          accentRgb: '37, 99, 235',
          shellBackground: '#f8fafc',
          surface: '#ffffff',
          surfaceAlt: '#f8fafc',
          border: 'rgba(15, 23, 42, 0.08)',
          text: '#0f172a',
          muted: '#64748b',
          mutedText: '#64748b',
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        content: [instantiated],
        structure: {
          sections: [
            {
              id: instantiated.id,
              blockIds: instantiated.blocks.map((b) => b.id),
              blockTypes: instantiated.blocks.map((b) => b.type),
            },
          ],
        },
      },
    }

    const validated = validatePageRenderBundle(bundle)
    expect(validated.success).toBe(true)
    expect(validated.layout.sections[0].id).toBe(instantiated.id)
  })
})
