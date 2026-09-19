// Types for the Comprehensive Page Editor
import type { GlobalTheme } from '../../../shared/theme'
export type { GlobalTheme }

export interface DragItem {
  type: 'section' | 'container' | 'row' | 'column' | 'component' | 'template' | 'grid-cell' | 'grid' | 'carousel';
  id: string;
  data: any;
  sourceContext?: {
    sectionId?: string;
    containerId?: string;
    rowId?: string;
    columnId?: string;
  };
}

// In your page-editor.ts file, update the DropZone interface:

export interface DropZone {
  type: 'section' | 'container' | 'row' | 'column' | 'component' | 'grid-cell' | 'grid' | 'carousel' | 'template';
  id: string;
  accepts: ('section' | 'container' | 'row' | 'column' | 'component' | 'template' | 'grid-cell' | 'grid' | 'carousel')[];
  index?: number;
}

export interface Component {
  id: string;
  type: string;
  label: string;
  props?: Record<string, any>;
}

export interface LayoutComponent extends Component {
  id: string;
  width?: number;
  height?: number;
}

// Carousel-specific types
export interface Slide {
  id: string;
  components: LayoutComponent[]; // Direct components in slide - no internal layout
  visible?: boolean;
}

export interface Column {
  id: string;
  width?: number;
  components: LayoutComponent[];
}

export interface Row {
  id: string;
  columns: Column[];
}

export interface Container {
  id: string;
  rows: Row[];
}

// In your page-editor.ts file, update the Section interface:

export interface Section {
  id: string;
  name: string;
  type: string;
  props?: Record<string, any>;
  container: Container;
  settings?: {
    backgroundColor?: string;
    padding?: string | number;
    margin?: string | number;
    borderWidth?: number;
    borderColor?: string;
    borderRadius?: string | number;
    shadow?: string;
    visible?: boolean;
    customCSS?: string;
    
    // ✅ ADD THESE STICKY SETTINGS
    sticky_enabled?: boolean;
    sticky_column_index?: number;
    sticky_position?: 'top' | 'center' | 'bottom';
    sticky_offset?: number;
    rowVerticalAlign?: 'top' | 'center' | 'bottom';
    
    // Other style properties...
    opacity?: number;
    width?: string;
    height?: string;
  };
  content?: string;
}

export interface SectionFieldSchema {
  name: string;
  type:
    | 'text'
    | 'textarea'
    | 'image'
    | 'toggle'
    | 'boolean'
    | 'select'
    | 'number'
    | 'range'
    | 'list-items'
    | 'image-array'
    | 'option-list';
  label: string;
  placeholder?: string;
  options?: Array<string | number | { value: string | number; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

export interface SectionSchemaDefinition {
  type: string;
  label: string;
  defaults?: Record<string, any>;
  fields: SectionFieldSchema[];
}

export interface PageLayout {
  id: string;
  name: string;
  sections: Section[];
  components?: LayoutComponent[]; // For grid components registered at layout level
  theme?: GlobalTheme;
  presets?: Record<string, any>;
  settings?: {
    title?: string;
    description?: string;
    customCSS?: string;
  };
}

export interface Page {
  id: string;        // UUID
  name: string;      // page title
  slug?: string;
  sections: Section[]; // array of sections
  active: boolean;   // visibility in dropdown
  disabled: boolean; // whether the page is disabled
  header_slug?: string | null;
  footer_slug?: string | null;
  banner_slug?: string | null;
}

// Property types definition
export type PropertyType = 
  | 'number' 
  | 'text' 
  | 'textarea' 
  | 'image' 
  | 'color' 
  | 'select' 
  | 'richtext' 
  | 'toggle' 
  | 'list-items'
  | 'image-array' 
  | 'slide-array' 
  | 'card-array' 
  | 'range'
  | 'accordion-items'
  | 'carousel-slides';

// Allow numbers, strings, or objects in options
export type OptionValue = string | number | { value: string | number; label: string };

// Base property configuration
export interface BasePropertyConfig {
  type: PropertyType;
  label: string;
  default?: any;
  placeholder?: string;
  options?: OptionValue[];
  min?: number;
  max?: number;
  step?: number;
  category?: string;
  description?: string;
  validation?: any;
  dependsOn?: string | string[];
  showIf?: (props: Record<string, any>) => boolean;
  visibleWhen?: (props: Record<string, any>) => boolean;
  disabledWhen?: (props: Record<string, any>) => boolean;
}

// For the fields array in ComponentDefinition
export interface FieldPropertyConfig extends BasePropertyConfig {
  name: string;
}

// For the properties object in ComponentDefinition
export interface ObjectPropertyConfig extends BasePropertyConfig {
  [key: string]: any; // Allow additional properties
}

export interface ComponentDefinition {
  id: string;
  name: string;
  type: string;
  category: 'content' | 'media' | 'interactive' | 'layout' | 'advanced';
  icon: string;
  description: string;
  supportsChildren?: boolean;
  defaultProps: Record<string, any>;
  schema: {
    title?: string;
    fields?: FieldPropertyConfig[];
    properties?: {
      [key: string]: ObjectPropertyConfig;
    };
  };
  render: (props: any) => JSX.Element;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileType: 'image' | 'video' | 'document';
  mimeType: string;
  fileSize: number;
  dimensions?: string; // e.g., "1920x1080"
  altText?: string;
  tags?: string[];
  uploadedBy: string;
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: string;
  structure: Section | PageLayout;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface Version {
  id: string;
  entityId: string; // section or page id
  entityType: 'section' | 'page';
  version: number;
  content: any;
  settings?: any;
  createdAt: Date;
  createdBy: string;
  notes?: string;
}

export interface PageEditorProps {
  initialLayout?: PageLayout;
  onSave?: (layout: PageLayout) => void;
  onCancel?: () => void;
  isModal?: boolean;
  showSaveButton?: boolean;
  pageId?: string;
}

export interface EditorState {
  layout: PageLayout;
  selectedSectionId?: string;
  selectedComponent?: {
    sectionId: string;
    containerId: string;
    rowId: string;
    colId: string;
    compId: string;
    component: LayoutComponent;
  };
  isPreviewMode: boolean;
  currentDevice: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
}

// Additional missing types that might be needed
export interface GridCell {
  id: string;
  row: number;
  col: number;
  components: LayoutComponent[];
}

export interface Grid {
  id: string;
  rows: number;
  cols: number;
  cells: GridCell[];
}

export interface Carousel {
  id: string;
  slides: Slide[];
  settings?: {
    autoplay?: boolean;
    interval?: number;
    indicators?: boolean;
    controls?: boolean;
  };
}

// Context types for drag and drop
export interface DragDropContextType {
  isDragging: boolean;
  draggedItem: DragItem | null;
  validDropZones: DropZone[];
  setDraggedItem: (item: DragItem | null) => void;
  setValidDropZones: (zones: DropZone[]) => void;
}

// Event types
export interface DragStartEvent {
  active: {
    id: string;
    data: {
      current: DragItem;
    };
  };
}

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current: DragItem;
    };
  };
  over: {
    id: string;
    data: {
      current: DropZone;
    };
  } | null;
}

// Component Props types
export interface DraggableComponentProps {
  component: LayoutComponent;
  sectionId: string;
  containerId: string;
  rowId: string;
  columnId: string;
  onEdit?: (component: LayoutComponent) => void;
  onDelete?: (componentId: string) => void;
  onDuplicate?: (component: LayoutComponent) => void;
}

export interface DroppableSectionProps {
  section: Section;
  onSectionUpdate: (section: Section) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionDuplicate: (section: Section) => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
