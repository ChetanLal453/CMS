# Quick Start Testing Guide

## 🚀 How to Test the Enhanced PageBuilder

### Step 1: Start the Development Server

```bash
cd admin
npm run dev
```

The app should start at `http://localhost:3000`

### Step 2: Navigate to Page Editor

Open your browser and go to:
```
http://localhost:3000/admin/PageEditor
```

### Step 3: Test Basic Functionality

#### Test 1: Add a Container
1. Click the **"+ Container"** button
2. ✅ You should see a new empty container with options to add rows

#### Test 2: Add Rows with Different Column Counts
1. Click **"+ 1 Column"** - should create a row with 1 column
2. Click **"+ 2 Columns"** - should create a row with 2 columns
3. Click **"+ 3 Columns"** - should create a row with 3 columns
4. ✅ Each row should display with the correct number of columns

#### Test 3: Drag Components
1. From the left sidebar, drag a **"Heading"** component
2. Drop it into any column
3. ✅ The component should appear in the column
4. Try dragging different components (Button, Image, Paragraph, etc.)

#### Test 4: Edit Component Properties
1. Click on any component you added
2. ✅ A property panel should open on the right side
3. Try editing the properties:
   - For **Heading**: Change text and level (H1-H6)
   - For **Button**: Change text, link, and style
   - For **Image**: Change URL and alt text
   - For **Paragraph**: Change text content
4. ✅ Changes should update immediately

#### Test 5: Delete Components
1. Hover over a component
2. ✅ Edit and Delete buttons should appear
3. Click the **🗑️** button
4. ✅ Component should be removed

#### Test 6: Delete Rows and Containers
1. Click **"Delete Row"** on any row
2. ✅ Confirm dialog should appear
3. Confirm deletion
4. ✅ Row should be removed
5. Try deleting a container with the **🗑️ Delete** button

#### Test 7: Visual Feedback
1. Drag a component from the palette
2. ✅ Drop zones should highlight in blue when hovering
3. Click on a component
4. ✅ Selected component should have blue border and ring
5. Hover over components
6. ✅ Should show shadow and edit/delete buttons

#### Test 8: Save Layout
1. Build a simple layout with a few components
2. Click **"💾 Save Layout"**
3. ✅ Check browser console for save confirmation
4. ✅ No errors should appear

### Step 4: Test in Modal Mode (VisualSectionEditor)

1. Go back to the main Page Editor
2. Click **"Edit"** on any section
3. ✅ Visual Section Editor modal should open
4. Switch to **"Visual"** mode
5. ✅ PageBuilder should load in modal
6. Test adding components in modal mode
7. Click **"Save Changes"**
8. ✅ Modal should close and changes should persist

---

## 🐛 Common Issues & Solutions

### Issue 1: Components Not Dragging
**Solution:** Make sure you're dragging from the left sidebar palette, not from within the workspace.

### Issue 2: Property Panel Not Opening
**Solution:** Click directly on the component card (not the edit button). The entire card is clickable.

### Issue 3: Changes Not Saving
**Solution:** Check browser console for errors. Make sure the API endpoint `/api/save-layout` exists or the parent component's `onSave` is working.

### Issue 4: TypeScript Errors
**Solution:** Run `npm run build` to check for TypeScript errors. Fix any type mismatches.

### Issue 5: Styling Issues
**Solution:** Make sure Tailwind CSS is properly configured and running.

---

## ✅ Success Criteria

After testing, you should be able to:
- [x] Add containers, rows, and columns
- [x] Drag 12 different component types
- [x] Edit component properties in real-time
- [x] Delete components, rows, and containers
- [x] See visual feedback (hover, selection, drag-over)
- [x] Save layouts
- [x] Use in both standalone and modal modes

---

## 📸 Expected Behavior

### Empty State
```
┌─────────────────────────────────────┐
│  No containers yet                  │
│  Click "Add Container" to get       │
│  started                            │
└─────────────────────────────────────┘
```

### Container with Rows
```
┌─────────────────────────────────────┐
│ Container: container-123456         │
│ [+1 Col] [+2 Cols] [+3 Cols] [🗑️]  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Row: row-123456    [Delete Row] │ │
│ │ ┌──────────┐ ┌──────────┐      │ │
│ │ │ Column 1 │ │ Column 2 │      │ │
│ │ │          │ │          │      │ │
│ │ └──────────┘ └──────────┘      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Component with Properties
```
┌─────────────────┐ ┌──────────────────┐
│ Workspace       │ │ Properties       │
│                 │ │                  │
│ ┌─────────────┐ │ │ Component Type   │
│ │ Heading     │ │ │ heading          │
│ │ heading     │ │ │                  │
│ │ [✏️] [🗑️]   │ │ │ Label            │
│ └─────────────┘ │ │ [Heading____]    │
│                 │ │                  │
│                 │ │ Heading Text     │
│                 │ │ [My Heading_]    │
│                 │ │                  │
│                 │ │ Heading Level    │
│                 │ │ [H2 ▼]          │
└─────────────────┘ └──────────────────┘
```

---

## 🎯 Next Steps After Testing

1. **If everything works:**
   - Mark Task 2 as complete in TODO_PHASE1_IMPLEMENTATION.md
   - Move to Task 3: Update VisualSectionEditor Integration
   - Consider adding more component types

2. **If issues found:**
   - Document issues in TODO_PHASE1_IMPLEMENTATION.md
   - Fix critical bugs first
   - Re-test after fixes

3. **Performance testing:**
   - Try adding 10+ containers
   - Add 50+ components
   - Check for lag or slowness
   - Monitor browser console for warnings

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Review the code changes in PageBuilder.tsx
3. Compare with the original implementation
4. Check that all dependencies are installed
5. Verify Tailwind CSS is working

---

**Happy Testing! 🎉**
