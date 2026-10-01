> Historical planning document.
> 
> This file does not describe the current production database architecture anymore.
> The live CMS now uses a revision-first model centered on `page_revisions`, `current_revision_id`, and `published_revision_id`.
> See `database/phase6/REVISION_FIRST_ARCHITECTURE.md` for the current source-of-truth design.
# Comprehensive Page Editor Enhancement Plan

## Executive Summary
This document outlines a complete redesign and enhancement of the Page Editor system to create a professional, scalable, and user-friendly page builder with advanced drag-and-drop capabilities, dynamic component management, and visual editing features.

---

## 🎯 Project Goals

1. **Enhanced Drag-and-Drop System** - Multi-level DnD (sections, containers, rows, columns, components)
2. **Dynamic Component Library** - No-code component addition and customization
3. **Advanced Visual Editor** - Rich text, image uploads, inline editing
4. **Preview & Responsive Testing** - Real-time preview with device simulation
5. **Template Management** - Save and reuse custom layouts
6. **Version Control** - Track and restore page versions
7. **Performance Optimization** - Handle large pages efficiently
8. **Advanced Layout Options** - Custom styling and animations

---

## 📋 Current System Analysis

### ✅ Strengths
- Working drag-and-drop with @hello-pangea/dnd
- MySQL database with proper schema
- Section CRUD operations
- Template library
- Visual + JSON editor toggle
- Cross-page section copying

### ⚠️ Areas for Improvement
- Limited nested structure support
- No dynamic component library
- Basic visual editor
- No preview mode
- No version control
- Limited styling options
- No responsive testing
- Performance not optimized for large pages

---

## 🏗️ Architecture Overview

### New Component Structure
```
PageEditor (Main Container)
├── EditorHeader (Page selector, actions, preview toggle)
├── EditorToolbar (Save, undo, redo, settings)
├── EditorSidebar (Component library, templates, pages)
│   ├── ComponentLibrary (Draggable components)
│   ├── TemplateLibrary (Pre-built sections)
│   ├── PageSections (Other page sections)
│   └── MediaLibrary (Images, assets)
├── EditorCanvas (Main workspace)
│   ├── SectionList (Droppable sections)
│   │   └── Section (Individual section)
│   │       ├── SectionToolbar (Edit, duplicate, delete, settings)
│   │       └── SectionContent (Nested structure)
│   │           ├── Container
│   │           │   └── Row
│   │           │       └── Column
│   │           │           └── Component (Cards, text, images, etc.)
│   └── EmptyState (When no sections)
├── EditorProperties (Right panel - component settings)
│   ├── ContentEditor (Text, images, links)
│   ├── StyleEditor (Colors, spacing, typography)
│   └── AdvancedSettings (Custom CSS, animations)
└── EditorModals
    ├── VisualSectionEditor (Enhanced)
    ├── MediaUploader
    ├── TemplateManager
    └── VersionHistory
```

### Database Schema Enhancements
```sql
-- Enhanced sections table
ALTER TABLE sections ADD COLUMN version INT DEFAULT 1;
ALTER TABLE sections ADD COLUMN parent_section_id INT NULL;
ALTER TABLE sections ADD COLUMN settings JSON; -- Custom styles, animations
ALTER TABLE sections ADD COLUMN last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- New tables
CREATE TABLE section_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  version INT NOT NULL,
  content JSON,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE page_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  version INT NOT NULL,
  sections_snapshot JSON, -- Full page snapshot
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
);

CREATE TABLE components (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- card, text, image, button, etc.
  category VARCHAR(100), -- content, media, layout, etc.
  icon VARCHAR(100),
  default_props JSON,
  schema JSON, -- Defines editable properties
  preview_image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50), -- image, video, document
  mime_type VARCHAR(100),
  file_size INT,
  dimensions VARCHAR(50), -- e.g., "1920x1080"
  alt_text TEXT,
  tags JSON,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE custom_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(255),
  category VARCHAR(100),
  structure JSON, -- Full section structure
  is_public BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Implementation Phases

### Phase 1: Enhanced Drag-and-Drop System (Week 1-2)

#### 1.1 Multi-Level Drag-and-Drop
**Files to Create/Modify:**
- `admin/src/components/PageEditor/DragDropProvider.tsx` (NEW)
- `admin/src/components/PageEditor/DroppableSection.tsx` (NEW)
- `admin/src/components/PageEditor/DraggableComponent.tsx` (NEW)
- `admin/src/components/PageEditor/DropZone.tsx` (NEW)

**Features:**
- Section-level reordering (existing, enhance)
- Container drag-and-drop within sections
- Row drag-and-drop within containers
- Column resizing and reordering
- Component drag-and-drop within columns
- Visual drop indicators
- Nested droppable zones
- Drag preview with ghost element

**Implementation Details:**
```typescript
// DragDropProvider.tsx
interface DragItem {
  type: 'section' | 'container' | 'row' | 'column' | 'component' | 'template';
  id: string;
  data: any;
  sourceContext?: {
    sectionId?: string;
    containerId?: string;
    rowId?: string;
    columnId?: string;
  };
}

interface DropZone {
  type: 'section' | 'container' | 'row' | 'column';
  id: string;
  accepts: string[]; // What types can be dropped here
  index: number;
}
```

#### 1.2 Smart Drop Zones
- Auto-create containers when dropping sections
- Auto-create rows when dropping into containers
- Auto-create columns when dropping into rows
- Prevent invalid drops (e.g., section into column)
- Show valid drop zones on drag start

---

### Phase 2: Dynamic Component Library (Week 2-3)

#### 2.1 Component Registry System
**Files to Create:**
- `admin/src/components/PageEditor/ComponentLibrary/index.tsx` (NEW)
- `admin/src/components/PageEditor/ComponentLibrary/ComponentCard.tsx` (NEW)
- `admin/src/components/PageEditor/ComponentLibrary/ComponentCategories.tsx` (NEW)
- `admin/src/lib/componentRegistry.ts` (NEW)
- `admin/src/types/components.ts` (NEW)

**Component Types to Support:**
1. **Content Components**
   - Heading (H1-H6)
   - Paragraph
   - Rich Text Block
   - Quote Block
   - List (Ordered/Unordered)

2. **Media Components**
   - Image
   - Image Gallery
   - Video (YouTube, Vimeo, Upload)
   - Icon
   - Divider

3. **Interactive Components**
   - Button (Primary, Secondary, Link)
   - Form (Contact, Newsletter)
   - Accordion
   - Tabs
   - Modal Trigger

4. **Layout Components**
   - Spacer
   - Container
   - Grid
   - Flex Box
   - Card

5. **Advanced Components**
   - Slider/Carousel
   - Testimonial
   - Pricing Table
   - Counter/Stats
   - Timeline
   - Map
   - Social Media Feed

**Component Schema Example:**
```typescript
interface ComponentDefinition {
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

// Example: Button Component
const ButtonComponent: ComponentDefinition = {
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
    openInNewTab: false,
  },
  schema: {
    properties: {
      text: { type: 'text', label: 'Button Text', default: 'Click Me' },
      variant: { 
        type: 'select', 
        label: 'Style', 
        default: 'primary',
        options: ['primary', 'secondary', 'outline', 'ghost']
      },
      size: {
        type: 'select',
        label: 'Size',
        default: 'medium',
        options: ['small', 'medium', 'large']
      },
      link: { type: 'text', label: 'Link URL', default: '#' },
      openInNewTab: { type: 'toggle', label: 'Open in New Tab', default: false },
    }
  },
  render: (props) => <Button {...props} />
};
```

#### 2.2 Component Property Editor
**Files to Create:**
- `admin/src/components/PageEditor/PropertyPanel/index.tsx` (NEW)
- `admin/src/components/PageEditor/PropertyPanel/PropertyField.tsx` (NEW)
- `admin/src/components/PageEditor/PropertyPanel/StyleEditor.tsx` (NEW)

**Features:**
- Dynamic form generation based on component schema
- Real-time preview updates
- Validation
- Conditional fields
- Grouped properties (Content, Style, Advanced)

---

### Phase 3: Advanced Visual Editor (Week 3-4)

#### 3.1 Rich Text Editor Integration
**Dependencies to Add:**
```json
{
  "@tiptap/react": "^2.1.13",
  "@tiptap/starter-kit": "^2.1.13",
  "@tiptap/extension-link": "^2.1.13",
  "@tiptap/extension-image": "^2.1.13",
  "@tiptap/extension-color": "^2.1.13",
  "@tiptap/extension-text-align": "^2.1.13"
}
```

**Files to Create:**
- `admin/src/components/PageEditor/RichTextEditor/index.tsx` (NEW)
- `admin/src/components/PageEditor/RichTextEditor/Toolbar.tsx` (NEW)
- `admin/src/components/PageEditor/RichTextEditor/extensions.ts` (NEW)

**Features:**
- Bold, italic, underline, strikethrough
- Headings (H1-H6)
- Lists (ordered, unordered)
- Links
- Images
- Text alignment
- Text color and background
- Code blocks
- Tables
- Undo/Redo

#### 3.2 Inline Editing
**Files to Create:**
- `admin/src/components/PageEditor/InlineEditor/index.tsx` (NEW)
- `admin/src/components/PageEditor/InlineEditor/EditableText.tsx` (NEW)
- `admin/src/components/PageEditor/InlineEditor/EditableImage.tsx` (NEW)

**Features:**
- Click to edit text directly on canvas
- Double-click to edit images
- Hover toolbar for quick actions
- Auto-save on blur
- Keyboard shortcuts (Ctrl+B, Ctrl+I, etc.)

#### 3.3 Media Library & Upload
**Files to Create:**
- `admin/src/components/PageEditor/MediaLibrary/index.tsx` (NEW)
- `admin/src/components/PageEditor/MediaLibrary/MediaGrid.tsx` (NEW)
- `admin/src/components/PageEditor/MediaLibrary/MediaUploader.tsx` (NEW)
- `admin/src/components/PageEditor/MediaLibrary/MediaDetails.tsx` (NEW)
- `admin/src/pages/api/media/upload.js` (NEW)
- `admin/src/pages/api/media/list.js` (NEW)
- `admin/src/pages/api/media/delete.js` (NEW)

**Features:**
- Drag-and-drop file upload
- Multiple file upload
- Image preview and cropping
- File organization (folders, tags)
- Search and filter
- Image optimization
- CDN integration ready

---

### Phase 4: Preview & Responsive Testing (Week 4-5)

#### 4.1 Live Preview Mode
**Files to Create:**
- `admin/src/components/PageEditor/PreviewMode/index.tsx` (NEW)
- `admin/src/components/PageEditor/PreviewMode/DeviceFrame.tsx` (NEW)
- `admin/src/components/PageEditor/PreviewMode/PreviewToolbar.tsx` (NEW)

**Features:**
- Toggle between edit and preview mode
- Device simulation (Desktop, Tablet, Mobile)
- Custom viewport sizes
- Orientation toggle (Portrait/Landscape)
- Zoom controls
- Screenshot capture
- Share preview link

#### 4.2 Responsive Design Tools
**Files to Create:**
- `admin/src/components/PageEditor/ResponsiveControls/index.tsx` (NEW)
- `admin/src/components/PageEditor/ResponsiveControls/BreakpointEditor.tsx` (NEW)

**Features:**
- Breakpoint-specific styling
- Hide/show components per device
- Responsive spacing controls
- Mobile-first design toggle
- Visual breakpoint indicators

---

### Phase 5: Template Management (Week 5-6)

#### 5.1 Template Creation & Management
**Files to Create:**
- `admin/src/components/PageEditor/TemplateManager/index.tsx` (NEW)
- `admin/src/components/PageEditor/TemplateManager/TemplateCard.tsx` (NEW)
- `admin/src/components/PageEditor/TemplateManager/TemplateEditor.tsx` (NEW)
- `admin/src/pages/api/templates/create.js` (NEW)
- `admin/src/pages/api/templates/update.js` (NEW)
- `admin/src/pages/api/templates/delete.js` (NEW)

**Features:**
- Save current section as template
- Save entire page as template
- Template categories
- Template preview
- Template search and filter
- Public/private templates
- Template marketplace (future)

#### 5.2 Pre-built Template Library
**Templates to Include:**
1. **Hero Sections** (10+ variants)
2. **Feature Sections** (8+ variants)
3. **Testimonial Sections** (6+ variants)
4. **CTA Sections** (8+ variants)
5. **Footer Sections** (5+ variants)
6. **Pricing Tables** (4+ variants)
7. **Team Sections** (4+ variants)
8. **Blog Layouts** (6+ variants)

---

### Phase 6: Version Control (Week 6)

#### 6.1 Version History System
**Files to Create:**
- `admin/src/components/PageEditor/VersionHistory/index.tsx` (NEW)
- `admin/src/components/PageEditor/VersionHistory/VersionTimeline.tsx` (NEW)
- `admin/src/components/PageEditor/VersionHistory/VersionCompare.tsx` (NEW)
- `admin/src/pages/api/versions/save.js` (NEW)
- `admin/src/pages/api/versions/list.js` (NEW)
- `admin/src/pages/api/versions/restore.js` (NEW)

**Features:**
- Auto-save versions on major changes
- Manual version snapshots
- Version timeline view
- Version comparison (diff view)
- Restore to previous version
- Version notes/comments
- Version branching (future)

---

### Phase 7: Performance Optimization (Week 7)

#### 7.1 Performance Enhancements
**Files to Modify:**
- `admin/src/components/PageBuilder.tsx`
- `admin/src/app/admin/PageEditor/page.js`
- `admin/src/components/VisualSectionEditor.tsx`

**Optimizations:**
1. **React Performance**
   - Implement React.memo for components
   - Use useMemo for expensive calculations
   - Use useCallback for event handlers
   - Virtualize long lists (react-window)
   - Lazy load components
   - Code splitting

2. **Data Management**
   - Implement debouncing for auto-save
   - Optimize API calls (batch updates)
   - Use React Query for caching
   - Implement optimistic updates
   - Reduce re-renders

3. **Asset Optimization**
   - Image lazy loading
   - Image compression
   - WebP format support
   - CDN integration
   - Asset preloading

**Dependencies to Add:**
```json
{
  "@tanstack/react-query": "^5.0.0",
  "react-window": "^1.8.10",
  "lodash.debounce": "^4.0.8"
}
```

---

### Phase 8: Advanced Layout Options (Week 8)

#### 8.1 Advanced Styling System
**Files to Create:**
- `admin/src/components/PageEditor/StylePanel/index.tsx` (NEW)
- `admin/src/components/PageEditor/StylePanel/SpacingControl.tsx` (NEW)
- `admin/src/components/PageEditor/StylePanel/ColorPicker.tsx` (NEW)
- `admin/src/components/PageEditor/StylePanel/TypographyControl.tsx` (NEW)
- `admin/src/components/PageEditor/StylePanel/BackgroundControl.tsx` (NEW)
- `admin/src/components/PageEditor/StylePanel/BorderControl.tsx` (NEW)
- `admin/src/components/PageEditor/StylePanel/AnimationControl.tsx` (NEW)

**Features:**
1. **Spacing Controls**
   - Margin (top, right, bottom, left)
   - Padding (top, right, bottom, left)
   - Visual spacing editor
   - Preset spacing values

2. **Typography Controls**
   - Font family
   - Font size
   - Font weight
   - Line height
   - Letter spacing
   - Text transform

3. **Color Controls**
   - Color picker
   - Gradient builder
   - Opacity control
   - Color presets
   - Brand colors

4. **Background Controls**
   - Solid color
   - Gradient
   - Image
   - Video
   - Pattern
   - Overlay

5. **Border Controls**
   - Border width
   - Border style
   - Border color
   - Border radius
   - Individual corners

6. **Animation Controls**
   - Entrance animations
   - Scroll animations
   - Hover effects
   - Transition timing
   - Animation presets

#### 8.2 Custom CSS Support
**Files to Create:**
- `admin/src/components/PageEditor/CustomCSS/index.tsx` (NEW)
- `admin/src/components/PageEditor/CustomCSS/CSSEditor.tsx` (NEW)

**Features:**
- CSS code editor with syntax highlighting
- CSS validation
- Scoped styles per component
- CSS class management
- Import external stylesheets

---

## 🔧 API Endpoints to Create/Modify

### New API Endpoints

```javascript
// Component Management
POST   /api/components/create
GET    /api/components/list
PUT    /api/components/update
DELETE /api/components/delete

// Media Library
POST   /api/media/upload
GET    /api/media/list
GET    /api/media/:id
PUT    /api/media/update
DELETE /api/media/delete

// Template Management
POST   /api/templates/create
GET    /api/templates/list
GET    /api/templates/:id
PUT    /api/templates/update
DELETE /api/templates/delete

// Version Control
POST   /api/versions/save
GET    /api/versions/list
GET    /api/versions/:id
POST   /api/versions/restore

// Page Operations
POST   /api/pages/duplicate
POST   /api/pages/export
POST   /api/pages/import

// Section Operations (Enhanced)
PUT    /api/sections/bulk-update
POST   /api/sections/duplicate
PUT    /api/sections/move
```

### Modified API Endpoints

```javascript
// Enhanced with version control and settings
PUT /api/update-section.js
- Add version tracking
- Add settings field support
- Add validation

// Enhanced with nested structure support
POST /api/create-section.js
- Support nested components
- Support custom settings
- Auto-generate IDs for nested items
```

---

## 📱 User Interface Improvements

### 1. Modern UI Design
- Clean, minimal interface
- Dark mode support
- Customizable theme
- Keyboard shortcuts
- Context menus
- Tooltips and help text

### 2. Improved UX
- Undo/Redo functionality
- Auto-save with indicators
- Loading states
- Error handling
- Success notifications
- Confirmation dialogs
- Drag handles and visual feedback
- Breadcrumb navigation

### 3. Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance

---

## 🧪 Testing Strategy

### Unit Tests
- Component rendering
- Drag-and-drop logic
- Data transformations
- API calls

### Integration Tests
- Full page editing workflow
- Template creation and usage
- Media upload and management
- Version control

### E2E Tests
- Complete user journeys
- Cross-browser testing
- Performance testing
- Responsive design testing

**Testing Tools:**
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "jest": "^29.0.0",
  "cypress": "^13.0.0"
}
```

---

## 📚 Documentation

### Developer Documentation
1. **Architecture Guide**
   - System overview
   - Component structure
   - Data flow
   - API reference

2. **Component Development Guide**
   - Creating custom components
   - Component schema
   - Styling guidelines
   - Best practices

3. **API Documentation**
   - Endpoint reference
   - Request/response formats
   - Authentication
   - Error codes

### User Documentation
1. **Getting Started Guide**
2. **Page Editor Tutorial**
3. **Component Library Reference**
4. **Template Creation Guide**
5. **Best Practices**
6. **FAQ**

---

## 📊 Success Metrics

### Performance Metrics
- Page load time < 2s
- Time to interactive < 3s
- First contentful paint < 1s
- Drag-and-drop latency < 100ms

### User Experience Metrics
- Time to create a page < 10 minutes
- User satisfaction score > 4.5/5
- Feature adoption rate > 70%
- Error rate < 1%

### Technical Metrics
- Code coverage > 80%
- Bundle size < 500KB (gzipped)
- API response time < 200ms
- Database query time < 50ms

---

## 🗓️ Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | Week 1-2 | Enhanced drag-and-drop system |
| Phase 2 | Week 2-3 | Dynamic component library |
| Phase 3 | Week 3-4 | Advanced visual editor |
| Phase 4 | Week 4-5 | Preview & responsive testing |
| Phase 5 | Week 5-6 | Template management |
| Phase 6 | Week 6 | Version control |
| Phase 7 | Week 7 | Performance optimization |
| Phase 8 | Week 8 | Advanced layout options |

**Total Duration: 8 weeks**

---

## 🎯 Next Steps

1. **Review and approve this plan**
2. **Set up development environment**
3. **Create project board with tasks**
4. **Begin Phase 1 implementation**
5. **Schedule weekly progress reviews**

---

## 📝 Notes

- This plan is flexible and can be adjusted based on priorities
- Each phase can be developed independently
- Features can be released incrementally
- Regular testing and feedback loops are essential
- Documentation should be updated continuously

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Review
