import type { PresetCategory, SectionPreset } from './types'
import { emergencyServiceHeroPreset } from './hero/emergencyService'
import { instantiateSectionPreset } from './instantiate'

const presets: SectionPreset[] = [
  emergencyServiceHeroPreset,
]

export function getPresets(): SectionPreset[] {
  return [...presets]
}

export function getPresetsByCategory(category: PresetCategory): SectionPreset[] {
  return presets.filter((preset) => preset.category === category)
}

export function getPresetById(id: string): SectionPreset | undefined {
  return presets.find((preset) => preset.id === id)
}

export { instantiateSectionPreset }
export type { SectionPreset, PresetCategory } from './types'
