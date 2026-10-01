// src/types/section-properties.ts
import { Section } from '@/types/page-editor'

// No need for ExtendedSection now since we fixed the Section interface
export type ExtendedSection = Section

export const sectionDefaultProps = {
  sticky_enabled: false,
  sticky_column_index: 0,
  sticky_position: 'top' as const,
  sticky_offset: 120,
  backgroundColor: '#ffffff',
  padding: 20,
  margin: 0,
  visible: true,
  borderColor: '#e5e7eb',
  borderWidth: 1,
  borderRadius: 8,
  shadow: 'none',
  width: '100%',
  height: 'auto'
}

export const sectionSchema = {
  type: 'object',
  properties: {
    sticky_enabled: { type: 'boolean' },
    sticky_column_index: { type: 'number', minimum: 0, maximum: 1 },
    sticky_position: { type: 'string', enum: ['top', 'center', 'bottom'] },
    sticky_offset: { type: 'number', minimum: 0, maximum: 300 },
    backgroundColor: { type: 'string', format: 'color' },
    padding: { type: 'number', minimum: 0, maximum: 100 },
    margin: { type: 'number', minimum: 0, maximum: 50 },
    visible: { type: 'boolean' },
    borderColor: { type: 'string', format: 'color' },
    borderWidth: { type: 'number', minimum: 0, maximum: 10 },
    borderRadius: { type: 'number', minimum: 0, maximum: 50 },
    shadow: { type: 'string' },
    width: { type: 'string' },
    height: { type: 'string' }
  }
}