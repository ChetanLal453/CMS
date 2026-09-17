# Priority Tasks - Page Editor Enhancement

## 🎯 Start Here: Critical Path Tasks

This document provides a prioritized, actionable task list to get the most value quickly.

---

## 🔥 Phase 1: Foundation (Week 1) - START HERE

### ✅ Task 1: Enhance Current PageBuilder Component
**Priority:** CRITICAL | **Time:** 4 hours | **Difficulty:** Medium

**Why this matters:** The PageBuilder is already integrated but needs better structure support.

**What to do:**
1. Add support for dynamic column widths
2. Improve component rendering
3. Add delete functionality for individual components
4. Add component property editing

**Files to modify:**
- `admin/src/components/PageBuilder.tsx`

**Code changes:**
```typescript
// Add to PageBuilder.tsx

// 1. Add column width control
const updateColumnWidth = (containerId: string, rowId: string, colId: string, width: number) => {
  setLayout(layout.map(c =>
    c.id === containerId ? {
      ...c,
      rows: c.rows.map(r =>
        r.id === rowId ? {
          ...r,
          columns: r.columns.map(col =>
            col.id === colId ? { ...col, width } : col
          )
        } : r
      )
    } : c
  ))
}

// 2. Add component deletion
const deleteComponent = (containerId: string, rowId: string, colId: string, compId: string) => {
  setLayout(layout.map(c =>
    c.id === containerId ? {
      ...c,
      rows: c.rows.map(r =>
        r.id === rowId ? {
          ...r,
          columns: r.columns.map(col =>
            col.id === colId ? {
              ...col,
              components: col.components.filter(comp => comp.id !== compId)
            } : col
          )
        } : r
      )
    } : c
  ))
}

// 3. Add component editing
const [editingComponent, setEditingComponent] = useState<any>(null)

const updateComponent = (containerId: string, rowId: string, colId: string, compId: string, newProps: any) => {
  setLayout(layout.map(c =>
    c.id === containerId ? {
      ...c,
      rows: c.rows.map(r =>
        r.id === rowId ? {
          ...r,
          columns: r.columns.map(col =>
            col.id === colId ? {
              ...col,
              components: col.components.map(comp =>
                comp.id === compId ? { ...comp, ...newProps } : comp
              )
            } : col
          )
        } : r
      )
    } : c
  ))
}
```

**Success criteria:**
- [ ] Can adjust column widths
- [ ] Can delete individual components
- [ ] Can edit component properties
- [ ] Changes persist on save

---

### ✅ Task 2: Add More Component Types
**Priority:** HIGH | **Time:** 3 hours | **Difficulty:** Easy

**Why this matters:** Users need more building blocks.

**What to do:**
1. Expand `availableComponents` array in PageBuilder
2. Add rendering logic for new components

**Code to add:**
```typescript
const availableComponents: Component[] = [
  // Existing
  { id: 'card', type: 'project-card', label: 'Project Card' },
  { id: 'text', type: 'text-block', label: 'Text Block' },
  { id: 'slider', type: 'slider', label: 'Slider' },
  
  // NEW - Add these
  { id: 'heading', type: 'heading', label: 'Heading' },
  { id: 'paragraph', type: 'paragraph', label: 'Paragraph' },
  { id: 'image', type: 'image', label: 'Image' },
  { id: 'button', type: 'button', label: 'Button' },
  { id: 'spacer', type: 'spacer', label: 'Spacer' },
  { id: 'divider', type: 'divider', label: 'Divider' },
  { id: 'icon', type: 'icon', label: 'Icon' },
  { id: 'video', type: 'video', label: 'Video' },
  { id: 'form', type: 'form', label: 'Form' },
  { id: 'map', type: 'map', label: 'Map' },
]
```

**Success criteria:**
- [ ] All new components appear in palette
- [ ] Can drag and drop new components
- [ ] Components display with placeholder content

---

### ✅ Task 3: Improve Visual Feedback
**Priority:** HIGH | **Time:** 2 hours | **Difficulty:** Easy

**Why this matters:** Better UX = happier users.

**What to do:**
1. Add hover effects
2. Add active/selected states
3. Add better drag indicators
4. Add loading states

**Code to add:**
```typescript
// In PageBuilder.tsx, update component rendering:

<div
  key={comp.id}
  className="
    bg-white border p-2 mb-2 rounded shadow-sm
    hover:shadow-md hover:border-blue-300
    transition-all duration-200
    cursor-pointer
    group
  "
  onClick={() => setEditingComponent(comp)}
>
  <div className="flex items-center justify-between">
    <span>{comp.label}</span>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation()
          // Edit component
        }}
        className="text-blue-600 hover:text-blue-800 text-xs"
      >
        Edit
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          // Delete component
        }}
        className="text-red-600 hover:text-red-800 text-xs"
      >
        Delete
      </button>
    </div>
  </div>
</div>
```

**Success criteria:**
- [ ] Hover effects work smoothly
- [ ] Selected component is highlighted
- [ ] Drag indicators are clear
- [ ] Loading states show during saves

---

### ✅ Task 4: Add Component Property Panel
**Priority:** HIGH | **Time:** 4 hours | **Difficulty:** Medium

**Why this matters:** Users need to customize components.

**What to do:**
1. Create a right sidebar for properties
2. Show properties when component is selected
3. Allow editing of text, colors, sizes, etc.

**Files to create:**
- `admin/src/components/PageEditor/PropertyPanel.tsx`

**Code:**
```typescript
// admin/src/components/PageEditor/PropertyPanel.tsx
import { useState } from 'react'

interface PropertyPanelProps {
  component: any
  onUpdate: (props: any) => void
  onClose: () => void
}

export const PropertyPanel = ({ component, onUpdate, onClose }: PropertyPanelProps) => {
  const [props, setProps] = useState(component)

  const handleChange = (key: string, value: any) => {
    const updated = { ...props, [key]: value }
    setProps(updated)
    onUpdate(updated)
  }

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Properties</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Component Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Component Type
          </label>
          <div className="text-sm text-gray-500">{component.type}</div>
        </div>

        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={props.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Dynamic properties based on component type */}
        {component.type === 'text-block' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Alignment
              </label>
              <select
                value={props.align || 'left'}
                onChange={(e) => handleChange('align', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </>
        )}

        {component.type === 'button' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={props.text || 'Click Me'}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <input
                type="text"
                value={props.link || '#'}
                onChange={(e) => handleChange('link', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Style
              </label>
              <select
                value={props.variant || 'primary'}
                onChange={(e) => handleChange('variant', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          </>
        )}

        {component.type === 'image' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                value={props.src || ''}
                onChange={(e) => handleChange('src', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => handleChange('alt', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

**Success criteria:**
- [ ] Property panel opens when component is selected
- [ ] Can edit component properties
- [ ] Changes reflect immediately
- [ ] Panel closes properly

---

## 🚀 Phase 2: Enhanced Features (Week 2)

### ✅ Task 5: Add Undo/Redo
**Priority:** MEDIUM | **Time:** 3 hours | **Difficulty:** Medium

**Install dependency:**
```bash
npm install use-undo
```

**Implementation:**
```typescript
import { useUndo } from 'use-undo'

// Replace useState with useUndo
const [layoutState, { set: setLayout, undo, redo, canUndo, canRedo }] = useUndo(initialLayout)
const layout = layoutState.present

// Add buttons
<div className="flex gap-2">
  <button
    onClick={undo}
    disabled={!canUndo}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    ↶ Undo
  </button>
  <button
    onClick={redo}
    disabled={!canRedo}
    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
  >
    ↷ Redo
  </button>
</div>

// Add keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (e.key === 'z<create_file>
<path>admin/src/components/PageEditor/types.ts</path>
<content>
// admin/src/components/PageEditor/types.ts
export type DragItemType = 'section' | 'container' | 'row' | 'column' | 'component' | 'template';

export interface DragItem {
  type: DragItemType;
  id: string;
  data: any;
  sourceContext?: {
    sectionId?: string;
    containerId?: string;
    rowId?: string;
    columnId?: string;
  };
}

export interface DropZoneConfig {
  type: DragItemType;
  id: string;
  accepts: DragItemType[];
  index: number;
  parentId?: string;
}

export interface Component {
  id: string;
  type: string;
  label: string;
  props?: Record<string, any>;
}

export interface Column {
  id: string;
  width?: number; // 1-12 for grid system
  components: Component[];
}

export interface Row {
  id: string;
  columns: Column[];
  settings?: {
    gap?: number;
    alignment?: 'start' | 'center' | 'end';
  };
}

export interface Container {
  id: string;
  rows: Row[];
  settings?: {
    maxWidth?: string;
    padding?: string;
    background?: string;
  };
}

export interface Section {
  id: number;
  page_id: number;
  section_type: string;
  content: any;
  order: number;
  enabled: number;
  containers?: Container[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  type: string;
  category: 'content' | 'media' | 'interactive' | 'layout' | 'advanced';
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  schema: {
    properties: {
      [key: string]: {
        type: 'text' | 'textarea' | 'richtext' | 'image' | 'color' | 'number' | 'select' | 'toggle';
        label: string;
        default: any;
        options?: any[];
        validation?: any;
      };
    };
  };
  render: (props: any) => JSX.Element;
}
