# Page Editor Implementation Roadmap

## 🎯 Quick Start Guide

This roadmap breaks down the comprehensive plan into actionable tasks. Each phase includes specific files to create/modify, code examples, and testing checkpoints.

---

## 📦 Phase 1: Enhanced Drag-and-Drop System (Week 1-2)

### Task 1.1: Set Up Enhanced DnD Structure
**Priority:** HIGH | **Estimated Time:** 2 days

#### Files to Create:
```
admin/src/components/PageEditor/
├── DragDropProvider.tsx
├── DroppableSection.tsx
├── DraggableComponent.tsx
├── DropZone.tsx
└── types.ts
```

#### Implementation Steps:

**Step 1: Create types.ts**
```typescript
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
```

**Step 2: Create DragDropProvider.tsx**
```typescript
// admin/src/components/PageEditor/DragDropProvider.tsx
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { DragItem, Section } from './types';

interface DragDropProviderProps {
  children: ReactNode;
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onAddFromTemplate?: (templateId: string, index: number) => void;
}

export const DragDropProvider = ({
  children,
  sections,
  onSectionsChange,
  onAddFromTemplate,
}: DragDropProviderProps) => {
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Handle section reordering
    if (source.droppableId === 'sections' && destination.droppableId === 'sections') {
      const newSections = Array.from(sections);
      const [moved] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, moved);
      
      // Update order property
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        order: index,
      }));
      
      onSectionsChange(updatedSections);
      return;
    }

    // Handle adding from templates
    if (source.droppableId === 'templates' && destination.droppableId === 'sections') {
      const templateId = draggableId.replace('template-', '');
      onAddFromTemplate?.(templateId, destination.index);
      return;
    }

    // Handle nested component drops
    if (destination.droppableId.startsWith('column-')) {
      handleComponentDrop(source, destination, draggableId);
      return;
    }
  };

  const handleComponentDrop = (source: any, destination: any, draggableId: string) => {
    // Parse destination ID: "column-{sectionId}-{containerId}-{rowId}-{columnId}"
    const parts = destination.droppableId.split('-');
    if (parts.length !== 5) return;

    const [, sectionId, containerId, rowId, columnId] = parts;

    const newSections = sections.map(section => {
      if (section.id.toString() !== sectionId) return section;

      // Deep clone to avoid mutation
      const updatedSection = JSON.parse(JSON.stringify(section));
      
      // Navigate to the target column
      const container = updatedSection.containers?.find((c: any) => c.id === containerId);
      if (!container) return section;

      const row = container.rows.find((r: any) => r.id === rowId);
      if (!row) return section;

      const column = row.columns.find((c: any) => c.id === columnId);
      if (!column) return section;

      // Add component to column
      const newComponent = {
        id: `${draggableId}-${Date.now()}`,
        type: draggableId,
        label: draggableId,
        props: {},
      };

      column.components.splice(destination.index, 0, newComponent);

      return updatedSection;
    });

    onSectionsChange(newSections);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      {children}
    </DragDropContext>
  );
};
```

**Step 3: Create DroppableSection.tsx**
```typescript
// admin/src/components/PageEditor/DroppableSection.tsx
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Section } from './types';

interface DroppableSectionProps {
  section: Section;
  index: number;
  onEdit: (section: Section) => void;
  onDuplicate: (section: Section) => void;
  onDelete: (id: number) => void;
  onToggleEnabled: (section: Section) => void;
}

export const DroppableSection = ({
  section,
  index,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleEnabled,
}: DroppableSectionProps) => {
  return (
    <Draggable draggableId={section.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            border rounded-lg mb-4 transition-all
            ${section.enabled ? 'bg-white' : 'bg-gray-100 opacity-60'}
            ${snapshot.isDragging ? 'shadow-2xl scale-105' : 'shadow-sm'}
          `}
        >
          {/* Section Header */}
          <div
            {...provided.dragHandleProps}
            className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg cursor-move hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              <span className="font-semibold text-gray-700">{section.section_type}</span>
              <span className="text-xs text-gray-500">#{section.id}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onToggleEnabled(section)}
                className={`px-3 py-1 rounded text-sm ${
                  section.enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {section.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                onClick={() => onEdit(section)}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDuplicate(section)}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
              >
                Duplicate
              </button>
              <button
                onClick={() => onDelete(section.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Section Content */}
          <div className="p-4">
            {section.containers && section.containers.length > 0 ? (
              <div className="space-y-4">
                {section.containers.map(container => (
                  <ContainerView key={container.id} container={container} sectionId={section.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No content yet. Click Edit to add content.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Helper component to display container structure
const ContainerView = ({ container, sectionId }: any) => (
  <div className="border border-gray-200 rounded p-3 bg-gray-50">
    <div className="text-xs text-gray-500 mb-2">Container: {container.id}</div>
    {container.rows.map((row: any) => (
      <div key={row.id} className="flex gap-2 mb-2">
        {row.columns.map((column: any) => (
          <Droppable
            key={column.id}
            droppableId={`column-${sectionId}-${container.id}-${row.id}-${column.id}`}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  flex-1 border-2 border-dashed rounded p-2 min-h-[80px]
                  ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}
                `}
              >
                {column.components.map((comp: any) => (
                  <div key={comp.id} className="bg-white border p-2 mb-2 rounded shadow-sm text-sm">
                    {comp.label}
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    ))}
  </div>
);
```

**Testing Checkpoint 1.1:**
- [ ] Sections can be reordered via drag-and-drop
- [ ] Visual feedback during drag (shadow, scale)
- [ ] Section toolbar buttons work (edit, duplicate, delete, toggle)
- [ ] Containers and rows display correctly
- [ ] Drop zones are visible and functional

---

### Task 1.2: Integrate Enhanced DnD into PageEditor
**Priority:** HIGH | **Estimated Time:** 1 day

#### Modify: `admin/src/app/admin/PageEditor/page.js`

**Changes to make:**
1. Import new components
2. Replace existing drag-drop implementation
3. Add container/row/column management
4. Update state management

```javascript
// Add these imports at the top
import { DragDropProvider } from '@/components/PageEditor/DragDropProvider';
import { DroppableSection } from '@/components/PageEditor/DroppableSection';
import { Droppable } from '@hello-pangea/dnd';

// Replace the DragDropContext wrapper with DragDropProvider
// Update the sections rendering to use DroppableSection
```

**Testing Checkpoint 1.2:**
- [ ] Page editor loads without errors
- [ ] All existing functionality still works
- [ ] New drag-drop features are functional
- [ ] No console errors

---

## 📦 Phase 2: Dynamic Component Library (Week 2-3)

### Task 2.1: Create Component Registry
**Priority:** HIGH | **Estimated Time:** 3 days

#### Files to Create:
```
admin/src/lib/
├── componentRegistry.ts
└── components/
    ├── Button.tsx
    ├── Heading.tsx
    ├── Paragraph.tsx
    ├── Image.tsx
    ├── Card.tsx
    └── index.ts
```

**Step 1: Create componentRegistry.ts**
```typescript
// admin/src/lib/componentRegistry.ts
import { ComponentDefinition } from '@/types/components';
import * as Components from './components';

export const componentRegistry: Record<string, ComponentDefinition> = {
  button: {
    id: 'button',
    name: 'Button',
    type: 'button',
    category: 'interactive',
    icon: 'FaMousePointer',
    description: 'Clickable button with customizable styles',
    defaultProps: {
      text: 'Click Me',
      variant: 'primary',
      size: 'medium',
      link: '#',
    },
    schema: {
      properties: {
        text: { type: 'text', label: 'Button Text', default: 'Click Me' },
        variant: {
          type: 'select',
          label: 'Style',
          default: 'primary',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'outline', label: 'Outline' },
          ],
        },
        size: {
          type: 'select',
          label: 'Size',
          default: 'medium',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ],
        },
        link: { type: 'text', label: 'Link URL', default: '#' },
      },
    },
    render: Components.Button,
  },
  
  heading: {
    id: 'heading',
    name: 'Heading',
    type: 'heading',
    category: 'content',
    icon: 'FaHeading',
    description: 'Heading text (H1-H6)',
    defaultProps: {
      text: 'Heading Text',
      level: 'h2',
      align: 'left',
    },
    schema: {
      properties: {
        text: { type: 'text', label: 'Heading Text', default: 'Heading Text' },
        level: {
          type: 'select',
          label: 'Level',
          default: 'h2',
          options: [
            { value: 'h1', label: 'H1' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
            { value: 'h5', label: 'H5' },
            { value: 'h6', label: 'H6' },
          ],
        },
        align: {
          type: 'select',
          label: 'Alignment',
          default: 'left',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
        },
      },
    },
    render: Components.Heading,
  },

  paragraph: {
    id: 'paragraph',
    name: 'Paragraph',
    type: 'paragraph',
    category: 'content',
    icon: 'FaParagraph',
    description: 'Text paragraph',
    defaultProps: {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      align: 'left',
    },
    schema: {
      properties: {
        text: { type: 'textarea', label: 'Text', default: 'Lorem ipsum...' },
        align: {
          type: 'select',
          label: 'Alignment',
          default: 'left',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' },
          ],
        },
      },
    },
    render: Components.Paragraph,
  },

  image: {
    id: 'image',
    name: 'Image',
    type: 'image',
    category: 'media',
    icon: 'FaImage',
    description: 'Image with alt text',
    defaultProps: {
      src: '/placeholder.jpg',
      alt: 'Image description',
      width: '100%',
    },
    schema: {
      properties: {
        src: { type: 'image', label: 'Image', default: '/placeholder.jpg' },
        alt: { type: 'text', label: 'Alt Text', default: 'Image description' },
        width: { type: 'text', label: 'Width', default: '100%' },
      },
    },
    render: Components.Image,
  },
};

export const getComponent = (id: string): ComponentDefinition | undefined => {
  return componentRegistry[id];
};

export const getComponentsByCategory = (category: string): ComponentDefinition[] => {
  return Object.values(componentRegistry).filter(comp => comp.category === category);
};

export const getAllComponents = (): ComponentDefinition[] => {
  return Object.values(componentRegistry);
};
```

**Step 2: Create Component Implementations**
```typescript
// admin/src/lib/components/Button.tsx
export const Button = ({ text, variant, size, link }: any) => {
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  return (
    <a
      href={link}
      className={`
        inline-block rounded font-medium transition-colors
        ${sizeClasses[size] || sizeClasses.medium}
        ${variantClasses[variant] || variantClasses.primary}
      `}
    >
      {text}
    </a>
  );
};

// admin/src/lib/components/Heading.tsx
export const Heading = ({ text, level, align }: any) => {
  const Tag = level || 'h2';
  const alignClass = `text-${align || 'left'}`;

  return <Tag className={alignClass}>{text}</Tag>;
};

// admin/src/lib/components/Paragraph.tsx
export const Paragraph = ({ text, align }: any) => {
  const alignClass = `text-${align || 'left'}`;
  return <p className={alignClass}>{text}</p>;
};

// admin/src/lib/components/Image.tsx
export const Image = ({ src, alt, width }: any) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ width: width || '100%' }}
      className="rounded"
    />
  );
};

// admin/src/lib/components/index.ts
export { Button } from './Button';
export { Heading } from './Heading';
export { Paragraph } from './Paragraph';
export { Image } from './Image';
```

**Testing Checkpoint 2.1:**
- [ ] Component registry loads without errors
- [ ] All components render correctly
- [ ] Component schemas are valid
- [ ] Default props work as expected

---

### Task 2.2: Create Component Library UI
**Priority:** HIGH | **Estimated Time:** 2 days

#### Files to Create:
```
admin/src/components/PageEditor/ComponentLibrary/
├── index.tsx
├── ComponentCard.tsx
└── ComponentCategories.tsx
```

**Implementation in next message due to length...**

---

## 🎯 Quick Win Tasks (Can be done in parallel)

### Quick Win 1: Add Undo/Redo (1 day)
- Install `use-undo` package
- Implement undo/redo for section changes
- Add keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### Quick Win 2: Add Auto-Save (1 day)
- Implement debounced auto-save
- Add save indicator in UI
- Show last saved timestamp

### Quick Win 3: Improve Visual Feedback (1 day)
- Add loading spinners
- Add success/error toasts
- Improve drag preview

### Quick Win 4: Add Keyboard Shortcuts (1 day)
- Ctrl+S: Save
- Ctrl+Z: Undo
- Ctrl+Y: Redo
- Delete: Delete selected section
- Ctrl+D: Duplicate selected section

---

## 📋 Daily Checklist Template

```markdown
### Day X - [Date]

**Goals:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Completed:**
- [x] Completed task 1
- [x] Completed task 2

**Blockers:**
- Issue with X, need to investigate Y

**Tomorrow:**
- Continue with Task 3
- Start Task 4

**Notes:**
- Important discovery about Z
```

---

## 🚀 Getting Started

1. **Review the comprehensive plan** (`COMPREHENSIVE_PAGE_EDITOR_PLAN.md`)
2. **Start with Phase 1, Task 1.1**
3. **Test after each task**
4. **Commit changes frequently**
5. **Update this roadmap as you progress**

---

**Next Steps:** Would you like me to continue with the detailed implementation for Phase 2 (Component Library UI) and beyond?
