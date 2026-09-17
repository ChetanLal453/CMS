import { defaultAdvancedAccordionProps } from './defaults'
import { normalizeAdvancedAccordion } from './normalize'
import { createAdvancedAccordionViewModel } from './viewModel'

export type {
  AdvancedAccordion,
  AdvancedAccordionAnimation,
  AdvancedAccordionBehavior,
  AdvancedAccordionIconPosition,
  AdvancedAccordionInput,
  AdvancedAccordionItem,
  AdvancedAccordionStyleGroup,
  AdvancedAccordionInteractionGroup,
  AdvancedAccordionViewModel,
  LegacyAdvancedAccordionProps,
} from './types'

export { defaultAdvancedAccordionProps } from './defaults'
export { normalizeAdvancedAccordion } from './normalize'
export { createAdvancedAccordionViewModel } from './viewModel'

export const advancedAccordionContract = {
  defaultProps: defaultAdvancedAccordionProps,
  schema: {
    title: 'Advanced Accordion',
    categories: [
      { id: 'content', label: 'Content', expanded: true },
      { id: 'behavior', label: 'Behavior', expanded: true },
      { id: 'layout', label: 'Layout', expanded: false },
      { id: 'typography', label: 'Typography', expanded: false },
      { id: 'colors', label: 'Colors', expanded: false },
      { id: 'icons-animation', label: 'Icons & Animation', expanded: false },
    ],
    properties: {
      items: {
        type: 'accordion-items',
        label: 'Accordion Items',
        default: defaultAdvancedAccordionProps.items,
        description: 'Manage accordion sections with titles and content',
        category: 'content',
      },
      behavior: {
        type: 'select',
        label: 'Behavior',
        default: defaultAdvancedAccordionProps.interaction.behavior,
        options: [
          { value: 'single', label: 'Single (only one open)' },
          { value: 'multiple', label: 'Multiple (multiple can open)' },
        ],
        category: 'behavior',
      },
      allowAllClosed: {
        type: 'toggle',
        label: 'Allow All Closed',
        default: defaultAdvancedAccordionProps.interaction.allowAllClosed,
        description: 'Allow closing all accordion items',
        category: 'behavior',
      },
      itemSpacing: { type: 'text', label: 'Item Spacing', default: defaultAdvancedAccordionProps.style.itemSpacing, category: 'layout' },
      padding: { type: 'text', label: 'Padding', default: defaultAdvancedAccordionProps.style.padding, category: 'layout' },
      margin: { type: 'text', label: 'Margin', default: defaultAdvancedAccordionProps.style.margin, category: 'layout' },
      titleFontSize: { type: 'text', label: 'Title Font Size', default: defaultAdvancedAccordionProps.style.titleFontSize, category: 'typography' },
      titleFontWeight: {
        type: 'select',
        label: 'Title Font Weight',
        default: defaultAdvancedAccordionProps.style.titleFontWeight,
        options: [
          { value: '400', label: 'Normal' },
          { value: '500', label: 'Medium' },
          { value: '600', label: 'Semi Bold' },
          { value: '700', label: 'Bold' },
          { value: '800', label: 'Extra Bold' },
        ],
        category: 'typography',
      },
      contentFontSize: { type: 'text', label: 'Content Font Size', default: defaultAdvancedAccordionProps.style.contentFontSize, category: 'typography' },
      fontFamily: {
        type: 'select',
        label: 'Font Family',
        default: defaultAdvancedAccordionProps.style.fontFamily,
        options: [
          { value: 'system-ui, sans-serif', label: 'System Default' },
          { value: 'Inter, sans-serif', label: 'Inter' },
          { value: 'Roboto, sans-serif', label: 'Roboto' },
          { value: 'Georgia, serif', label: 'Georgia' },
          { value: 'Monaco, monospace', label: 'Monospace' },
        ],
        category: 'typography',
      },
      lineHeight: { type: 'text', label: 'Line Height', default: defaultAdvancedAccordionProps.style.lineHeight, category: 'typography' },
      titleColor: { type: 'color', label: 'Title Color', default: defaultAdvancedAccordionProps.style.titleColor, category: 'colors' },
      titleBackground: { type: 'color', label: 'Title Background', default: defaultAdvancedAccordionProps.style.titleBackground, category: 'colors' },
      contentColor: { type: 'color', label: 'Content Color', default: defaultAdvancedAccordionProps.style.contentColor, category: 'colors' },
      contentBackground: { type: 'color', label: 'Content Background', default: defaultAdvancedAccordionProps.style.contentBackground, category: 'colors' },
      border: { type: 'text', label: 'Border', default: defaultAdvancedAccordionProps.style.border, category: 'colors' },
      borderRadius: { type: 'text', label: 'Border Radius', default: defaultAdvancedAccordionProps.style.borderRadius, category: 'colors' },
      activeTitleColor: { type: 'color', label: 'Active Title Color', default: defaultAdvancedAccordionProps.style.activeTitleColor, category: 'colors' },
      activeTitleBackground: { type: 'color', label: 'Active Title Background', default: defaultAdvancedAccordionProps.style.activeTitleBackground, category: 'colors' },
      iconPosition: {
        type: 'select',
        label: 'Icon Position',
        default: defaultAdvancedAccordionProps.interaction.iconPosition,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
        ],
        category: 'icons-animation',
      },
      icon: { type: 'text', label: 'Closed Icon', default: defaultAdvancedAccordionProps.interaction.icon, category: 'icons-animation' },
      activeIcon: { type: 'text', label: 'Open Icon', default: defaultAdvancedAccordionProps.interaction.activeIcon, category: 'icons-animation' },
      animation: {
        type: 'select',
        label: 'Animation',
        default: defaultAdvancedAccordionProps.interaction.animation,
        options: [
          { value: 'slide', label: 'Slide' },
          { value: 'fade', label: 'Fade' },
          { value: 'none', label: 'None' },
        ],
        category: 'icons-animation',
      },
      animationDuration: {
        type: 'number',
        label: 'Animation Duration (ms)',
        default: defaultAdvancedAccordionProps.interaction.animationDuration,
        min: 0,
        max: 1000,
        step: 50,
        category: 'icons-animation',
      },
    },
  },
  normalize: normalizeAdvancedAccordion,
  createViewModel: createAdvancedAccordionViewModel,
}
