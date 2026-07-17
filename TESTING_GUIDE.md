# Aligner Extension - Testing & Troubleshooting Guide

## Quick Testing Checklist

### 1. Installation Verification

- [ ] Extension loaded in `chrome://extensions`
- [ ] Extension icon visible in Chrome toolbar
- [ ] No errors shown on extension card
- [ ] Service worker status shows "active" (click "Inspect views: service worker")

### 2. Basic Functionality Test

**Step-by-step:**

1. Open the included `test.html` file in Chrome (or any website)
2. Click the Aligner extension icon in toolbar
3. You should see the popup with:

   - Extension toggle switch at top
   - 5 feature buttons: Rulers (⊟), Guides (⊥), Grids (⊞), Measure (⟷), Drawing (✎)
   - Settings button (⚙) at bottom

4. **Enable the extension** - Toggle the master switch ON
5. **Test each feature individually:**

### 3. Grid System Test (MOST IMPORTANT)

Grids are the primary feature users report as "not visible". Follow these exact steps:

#### Test Column Grid

1. Click Aligner icon → Toggle master switch ON
2. Click the **Grids** button (⊞ icon) - should turn green
3. **You should now see** vertical amber/orange colored columns across the page
   - Default: 12 columns
   - Color: Amber (#f59e0b)
   - Opacity: 30%
   - Margins: 24px on left/right
   - Gutters: 16px between columns

#### If you DON'T see the grid:

1. **Check popup state:**
   - Is master toggle ON? (should show checkmark)
   - Is Grids button green/highlighted?
2. **Open browser console:**

   - Right-click on page → Inspect
   - Go to Console tab
   - Look for any red error messages
   - Common errors:
     - "Cannot read property 'enabled' of undefined" → Settings not loaded
     - "shadowRoot is null" → Overlay not initialized

3. **Check Shadow DOM:**
   - Right-click on page → Inspect
   - In Elements tab, look for `<div id="aligner-overlay-root">`
   - Expand it → Should see `#shadow-root (open)`
   - Inside shadow root should be:
     - `.aligner-wrapper`
     - `#grids-container` (this is where grid appears)
4. **Try keyboard shortcut:**

   - Press `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)
   - This should toggle grids on/off

5. **Check settings:**
   - Click Aligner icon → Click "⚙ Settings" button
   - Click "Grids" in left sidebar
   - Verify settings:
     - [x] Enable Grids is checked
     - Grid Type: "Column Grid"
     - Columns: 12
     - Color: #f59e0b (amber)
     - Opacity: 0.3 (or 30%)

#### Test Baseline Grid

1. In Settings (⚙) → Grids section
2. Change "Grid Type" dropdown to "Baseline Grid"
3. Go back to the page
4. **You should see** horizontal lines across the page
   - Default: 8px spacing between lines
   - Color: Amber
   - Lines go from top to bottom of viewport

#### Test Modular Grid

1. In Settings → Grids section
2. Change "Grid Type" dropdown to "Modular Grid"
3. **You should see** BOTH column and baseline grids at the same time

### 4. Other Features Test

#### Rulers

1. Enable Rulers from popup (⊟ button)
2. **Should see:**
   - Horizontal ruler across top (20px tall by default)
   - Vertical ruler on left side (20px wide by default)
   - Tick marks every 10px
   - Blue color (#2563eb)

#### Guides

1. Enable Guides from popup (⊥ button)
2. **Currently:** Guide creation UI not yet implemented
3. Guides will be added manually later (Phase 1.5)

#### Measurement

1. Enable Measurement from popup (⟷ button)
2. **Should see:** Cursor changes to crosshair
3. Click first point on page
4. Move mouse to second point
5. Click second point
6. **Should see:** Line with measurements (width, height, diagonal)

#### Toolbar

1. Toolbar should appear automatically when extension is enabled
2. **Should see:**
   - Small floating box in top-left (default position: 20px, 20px)
   - Drag handle (⋮⋮) on left side
   - Four buttons: Rulers, Guides, Grids, Measurement
3. **Try dragging:**
   - Click and hold on drag handle (⋮⋮) or anywhere on toolbar except buttons
   - Move mouse - toolbar should follow
   - Release - toolbar stays in new position
   - Position is saved and persists across page reloads

## Common Issues & Solutions

### Issue: "Grid button is green but I see nothing"

**Diagnosis:**

- Grid is enabled in settings but not rendering

**Solutions:**

1. Check browser console for JavaScript errors
2. Reload the page (F5)
3. Disable and re-enable the extension
4. Check if grid color matches page background (change color in settings)
5. Increase grid opacity in settings to 0.8 or 1.0

### Issue: "Extension icon grayed out"

**Diagnosis:**

- Extension not injecting content script

**Solutions:**

1. Check manifest.json `matches` patterns include the current URL
2. Some pages block content scripts (e.g., chrome:// pages, chrome web store)
3. Reload the extension: chrome://extensions → Click reload icon
4. Reload the page after reloading extension

### Issue: "Settings not saving"

**Diagnosis:**

- chrome.storage.sync quota exceeded or permissions issue

**Solutions:**

1. Check manifest.json includes `"permissions": ["storage"]`
2. Open chrome://extensions → Aligner card → Details → Check "Permissions" section
3. Check browser console in service worker:
   - chrome://extensions → Aligner card → "Inspect views: service worker"
   - Look for storage-related errors

### Issue: "Toolbar not dragging"

**Diagnosis:**

- Click event triggering on buttons instead of toolbar background

**Solutions:**

1. Make sure you're clicking the drag handle (⋮⋮) on the left
2. Or click the empty space between buttons
3. Don't click directly on button text - that will trigger the button

### Issue: "Keyboard shortcuts not working"

**Diagnosis:**

- Commands not registered or page has conflicting shortcuts

**Solutions:**

1. Check chrome://extensions/shortcuts
2. Verify shortcuts are assigned:
   - Toggle Rulers: Ctrl+Shift+R
   - Toggle Guides: Ctrl+Shift+G
   - Toggle Grids: Ctrl+Shift+L
   - Toggle Measurement: Ctrl+Shift+M
3. Try changing to different key combinations if conflicts exist
4. Some websites override keyboard shortcuts (e.g., Gmail, Google Docs)

## Debugging Steps

### Step 1: Check Extension Load Status

1. Go to `chrome://extensions`
2. Find "Aligner" card
3. Check for error messages
4. If errors, click "Errors" button to see details

### Step 2: Check Service Worker

1. On Aligner card, click "Inspect views: service worker"
2. Console opens - look for errors
3. Type `chrome.storage.sync.get(null, console.log)` in console
4. Press Enter - should see settings object logged
5. Verify `settings.grids.enabled` is `true` when grid is on

### Step 3: Check Content Script

1. On the webpage, right-click → Inspect
2. Go to Console tab
3. Type `document.querySelector('#aligner-overlay-root')`
4. Press Enter - should see `<div id="aligner-overlay-root">...</div>`
5. If null, content script not injected

### Step 4: Check Shadow DOM

1. In Inspect → Elements tab
2. Find `<div id="aligner-overlay-root">`
3. Look for `#shadow-root (open)`
4. Expand shadow-root
5. Should see:
   ```html
   #shadow-root (open)
   <style>
     ...
   </style>
   <div class="aligner-wrapper">
     <div id="rulers-container"></div>
     <div id="guides-container"></div>
     <div id="grids-container">
       <div class="grid-column">...</div>
       <!-- This should exist when grid enabled -->
     </div>
     ...
   </div>
   ```

### Step 5: Manual Grid Verification

In browser console (with content script active), paste:

```javascript
// Check if overlay exists
const overlay = document.querySelector("#aligner-overlay-root");
console.log("Overlay exists:", !!overlay);

// Check shadow root
const shadow = overlay?.shadowRoot;
console.log("Shadow root exists:", !!shadow);

// Check grid container
const gridContainer = shadow?.querySelector("#grids-container");
console.log("Grid container exists:", !!gridContainer);
console.log("Grid container display:", gridContainer?.style.display);

// Check if grid has children
console.log("Grid container has children:", gridContainer?.children.length > 0);

// Log grid container contents
if (gridContainer) {
  console.log("Grid HTML:", gridContainer.innerHTML);
}
```

If any of these return `false` or `null`, there's an issue with that component.

## Test Page

Use the included `test.html` file for reliable testing:

```bash
# Open test.html in Chrome
open test.html  # Mac
start test.html  # Windows
```

This page has:

- Clean layout for easy grid visualization
- Keyboard shortcut reference
- Testing tips
- Different colored sections to verify grid overlay

## Performance Checks

### Grid Rendering Performance

Grids should render instantly (< 100ms). If slow:

1. Check number of columns - try reducing from 12 to 6
2. Check baseline spacing - increase from 8px to 16px (fewer lines)
3. Disable baseline grid, only use column grid

### Memory Usage

Check in Chrome Task Manager (Shift+Esc):

1. Find "Extension: Aligner"
2. Memory should be < 50MB
3. If higher, may be memory leak - file bug report

## Success Criteria

Extension is working correctly if:

- [x] Popup opens and shows all controls
- [x] Master toggle enables/disables all features
- [x] Grid shows amber columns when enabled (column mode)
- [x] Grid shows horizontal lines when baseline mode selected
- [x] Settings page opens and all inputs work
- [x] Changing grid settings updates display immediately
- [x] Toolbar is draggable and remembers position
- [x] Keyboard shortcuts toggle features
- [x] Rulers show tick marks along edges
- [x] No console errors in service worker or content script

## Getting Help

If issues persist:

1. Check GitHub issues for similar problems
2. Include in bug report:
   - Chrome version
   - OS (Windows/Mac/Linux)
   - Screenshot of issue
   - Browser console errors
   - Steps to reproduce
   - Settings values (from options page)

## Video Walkthrough Guide

### Recording Your Own Test

To verify it's working, record a quick video:

1. Screen record while:
   - Opening popup
   - Toggling master switch
   - Enabling grids
   - Opening settings
   - Changing grid type/columns/color
2. Grid should be clearly visible changing on screen

This helps verify everything works as expected.
