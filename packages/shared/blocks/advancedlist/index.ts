import { defaultAdvancedListProps } from './defaults'
import { normalizeAdvancedList } from './normalize'
import { createAdvancedListViewModel } from './viewModel'

export type {
  AdvancedList,
  AdvancedListAlignment,
  AdvancedListColumns,
  AdvancedListDisplayStyle,
  AdvancedListIconPosition,
  AdvancedListIconType,
  AdvancedListInput,
  AdvancedListItem,
  AdvancedListKind,
  AdvancedListResolvedItem,
  AdvancedListStyleGroup,
  AdvancedListViewModel,
  LegacyAdvancedListProps,
} from './types'

export { createAdvancedListViewModel } from './viewModel'
export { defaultAdvancedListProps } from './defaults'
export { normalizeAdvancedList } from './normalize'

export const advancedListContract = {
  defaultProps: defaultAdvancedListProps,
  schema: {
    categories: [
      { id: 'content', label: '📋 Content', expanded: true },
      { id: 'layout', label: '📐 Layout', expanded: true },
      { id: 'display-style', label: '🎨 Display Style', expanded: true },
      { id: 'box-settings', label: '📦 Box Settings', expanded: false },
      { id: 'icons', label: '🎯 Icons', expanded: false },
      { id: 'typography', label: '🔤 Typography', expanded: false },
      { id: 'colors', label: '🎨 Colors', expanded: false },
    ],
    properties: {
      items: { type: 'list-items', label: 'List Items', default: defaultAdvancedListProps.items, category: 'content' },
      listType: {
        type: 'select',
        label: 'List Type',
        default: defaultAdvancedListProps.listType,
        options: [
          { value: 'icon', label: 'Icon List' },
          { value: 'numbered', label: 'Numbered List' },
          { value: 'bullet', label: 'Bullet List' },
          { value: 'custom', label: 'Custom List' },
        ],
        category: 'layout',
      },
      displayStyle: {
        type: 'select',
        label: 'Display Style',
        default: defaultAdvancedListProps.style.displayStyle,
        options: [
          { value: 'plain', label: 'Plain (No Box)' },
          { value: 'boxed', label: 'Boxed Items' },
          { value: 'bordered', label: 'Bordered Items' },
          { value: 'full-box', label: 'Full List Box' },
        ],
        category: 'display-style',
      },
      columns: {
        type: 'select',
        label: 'Columns',
        default: defaultAdvancedListProps.style.columns,
        options: [
          { value: 1, label: '1 Column' },
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
          { value: 4, label: '4 Columns' },
        ],
        category: 'layout',
      },
      itemSpacing: { type: 'text', label: 'Item Spacing', default: defaultAdvancedListProps.style.itemSpacing, category: 'layout' },
      gap: { type: 'text', label: 'Column Gap', default: defaultAdvancedListProps.style.gap, category: 'layout' },
      padding: { type: 'text', label: 'List Padding', default: defaultAdvancedListProps.style.padding, category: 'layout' },
      margin: { type: 'text', label: 'Margin', default: defaultAdvancedListProps.style.margin, category: 'layout' },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: defaultAdvancedListProps.style.alignment,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
        category: 'layout',
      },
      defaultIcon: { type: 'text', label: 'Default Icon', default: defaultAdvancedListProps.style.defaultIcon, category: 'icons' },
      iconSize: { type: 'text', label: 'Icon Size', default: defaultAdvancedListProps.style.iconSize, category: 'icons' },
      iconPosition: {
        type: 'select',
        label: 'Icon Position',
        default: defaultAdvancedListProps.style.iconPosition,
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
          { value: 'top', label: 'Top' },
        ],
        category: 'icons',
      },
      autoNumbering: { type: 'toggle', label: 'Auto Numbering', default: defaultAdvancedListProps.style.autoNumbering, category: 'icons' },
      titleFontSize: { type: 'text', label: 'Title Font Size', default: defaultAdvancedListProps.style.titleFontSize, category: 'typography' },
      titleFontWeight: { type: 'text', label: 'Title Font Weight', default: defaultAdvancedListProps.style.titleFontWeight, category: 'typography' },
      descriptionFontSize: { type: 'text', label: 'Description Font Size', default: defaultAdvancedListProps.style.descriptionFontSize, category: 'typography' },
      fontFamily: { type: 'text', label: 'Font Family', default: defaultAdvancedListProps.style.fontFamily, category: 'typography' },
      lineHeight: { type: 'text', label: 'Line Height', default: defaultAdvancedListProps.style.lineHeight, category: 'typography' },
      titleColor: { type: 'color', label: 'Title Color', default: defaultAdvancedListProps.style.titleColor, category: 'colors' },
      descriptionColor: { type: 'color', label: 'Description Color', default: defaultAdvancedListProps.style.descriptionColor, category: 'colors' },
      iconColor: { type: 'color', label: 'Icon Color', default: defaultAdvancedListProps.style.iconColor, category: 'colors' },
      backgroundColor: { type: 'color', label: 'Background Color', default: defaultAdvancedListProps.style.backgroundColor, category: 'colors' },
      border: { type: 'text', label: 'Border', default: defaultAdvancedListProps.style.border, category: 'colors' },
      borderRadius: { type: 'text', label: 'Border Radius', default: defaultAdvancedListProps.style.borderRadius, category: 'colors' },
      itemBackground: { type: 'color', label: 'Item Background', default: defaultAdvancedListProps.style.itemBackground, category: 'colors' },
      itemPadding: { type: 'text', label: 'Item Padding', default: defaultAdvancedListProps.style.itemPadding, category: 'box-settings' },
      boxShadow: { type: 'text', label: 'Box Shadow', default: defaultAdvancedListProps.style.boxShadow, category: 'box-settings' },
      boxHoverShadow: { type: 'text', label: 'Box Hover Shadow', default: defaultAdvancedListProps.style.boxHoverShadow, category: 'box-settings' },
      boxBorderWidth: { type: 'text', label: 'Box Border Width', default: defaultAdvancedListProps.style.boxBorderWidth, category: 'box-settings' },
      boxBorderColor: { type: 'color', label: 'Box Border Color', default: defaultAdvancedListProps.style.boxBorderColor, category: 'box-settings' },
      fullBoxShadow: { type: 'text', label: 'Full Box Shadow', default: defaultAdvancedListProps.style.fullBoxShadow, category: 'box-settings' },
      fullBoxPadding: { type: 'text', label: 'Full Box Padding', default: defaultAdvancedListProps.style.fullBoxPadding, category: 'box-settings' },
      fullBoxBackground: { type: 'color', label: 'Full Box Background', default: defaultAdvancedListProps.style.fullBoxBackground, category: 'box-settings' },
      fullBoxBorder: { type: 'text', label: 'Full Box Border', default: defaultAdvancedListProps.style.fullBoxBorder, category: 'box-settings' },
      fullBoxBorderRadius: { type: 'text', label: 'Full Box Border Radius', default: defaultAdvancedListProps.style.fullBoxBorderRadius, category: 'box-settings' },
    },
  },
  normalize: normalizeAdvancedList,
  createViewModel: createAdvancedListViewModel,
}
