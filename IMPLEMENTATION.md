# Aligner - Implementation Guide

**Last Updated:** December 13, 2025

## Phase 1: MVP ✅ [COMPLETE]

### Completed Features

- [x] Project structure and manifest.json
- [x] Service worker with state management
- [x] Shadow DOM overlay system
- [x] Rulers with tick marks and measurements
- [x] Guides system with snap and lock
- [x] Measurement tools (point-to-point)
- [x] Floating toolbar
- [x] Popup UI with master toggle
- [x] Options page with all settings
- [x] Keyboard shortcuts (Ctrl+Shift+L/R/G/M)
- [x] Storage with debouncing (300ms)
- [x] Error handling throughout

## Phase 2: Enhanced Features ✅ [COMPLETE]

### Completed Features

- [x] Grid System (Column, Baseline, Modular)
- [x] Drawing Tools (Line, Rectangle, Circle, Arrow, Text)
- [x] Arrow Styles (Simple, Double, Block, Curved, Triangle)
- [x] Text Tool with Typography Controls
- [x] Shape Selection System
- [x] Shape Dragging
- [x] Shape Resizing
- [x] Delete Shapes (Delete/Backspace keys)
- [x] Baseline Thickness Control (1-5px)
- [x] Full Drawing Controls in Popup

### Testing Checklist for Phase 1

#### Installation & Setup

- [ ] Load unpacked extension in Chrome
- [ ] Verify all files load without errors
- [ ] Check service worker console for initialization
- [ ] Verify icon appears in toolbar
- [ ] Create actual icon files (replace placeholder)

#### Core Functionality

- [ ] Master toggle in popup works
- [ ] Extension overlay appears when enabled
- [ ] Extension overlay disappears when disabled
- [ ] Shadow DOM isolates styles correctly
- [ ] No conflicts with page CSS
- [ ] Overlay doesn't block page interactions

#### Rulers Feature

- [ ] Rulers appear when toggled on
- [ ] Horizontal ruler at top with tick marks
- [ ] Vertical ruler at left with tick marks
- [ ] Tick marks show correct pixel positions
- [ ] Rulers respect color settings
- [ ] Rulers respect opacity settings
- [ ] Rulers respect thickness settings
- [ ] Tick density setting works

#### Guides Feature

- [ ] Guides can be added (basic version)
- [ ] Guides respect color settings
- [ ] Guides respect opacity settings
- [ ] Snap to pixel works
- [ ] Lock/unlock functionality works
- [ ] Clear all guides works

#### Measurement Tools

- [ ] Click and drag creates measurement line
- [ ] Distance calculation is accurate
- [ ] Label displays correct pixel value
- [ ] Measurement disappears on mouse up
- [ ] Works correctly across different zoom levels
- [ ] Snap setting works

#### Toolbar

- [ ] Toolbar appears when extension is on
- [ ] Toolbar is draggable (to be implemented)
- [ ] Feature buttons toggle correctly
- [ ] Active state visual feedback works
- [ ] Toolbar doesn't interfere with page

#### Popup

- [ ] Master toggle updates correctly
- [ ] Feature buttons show active state
- [ ] Settings button opens options page
- [ ] Popup UI is responsive
- [ ] Changes sync with content script

#### Options Page

- [ ] All sections accessible via nav
- [ ] Settings load correctly
- [ ] Changes save automatically
- [ ] Save status indicator works
- [ ] Reset to defaults works
- [ ] All controls function properly
- [ ] Color pickers update values
- [ ] Range sliders show percentages
- [ ] Number inputs validate correctly

#### Keyboard Shortcuts

- [ ] Ctrl+Shift+L toggles extension
- [ ] Ctrl+Shift+R toggles rulers
- [ ] Ctrl+Shift+G toggles grids (placeholder)
- [ ] Ctrl+Shift+M toggles measurement
- [ ] Mac shortcuts use Cmd instead of Ctrl

#### Cross-Site Testing

- [ ] Works on http:// sites
- [ ] Works on https:// sites
- [ ] Works on complex web apps (Gmail, Twitter, etc.)
- [ ] Works on static sites
- [ ] No console errors on any site

#### Error Handling

- [ ] chrome.runtime.lastError checked everywhere
- [ ] Try-catch blocks on async operations
- [ ] Failed storage operations don't break UI
- [ ] Invalid settings handled gracefully
- [ ] Missing settings fall back to defaults

## Phase 2: Enhanced Features (Next Steps)

### Grid System Implementation

**Priority**: High  
**Complexity**: Medium

#### Requirements

1. Three grid types:

   - Column grid (12-column default)
   - Baseline grid (for vertical rhythm)
   - Modular grid (combined)

2. Controls:
   - Grid type selector
   - Column count
   - Spacing/gutter/margins
   - Color and opacity
   - Per-breakpoint presets

#### Implementation Steps

1. Create `GridsFeature` class in content.js
2. Implement column grid rendering with CSS Grid
3. Add baseline grid with SVG pattern
4. Create modular grid combining both
5. Add responsive breakpoint support
6. Test across different viewport sizes

#### Files to Modify

- `content/content.js` - Add GridsFeature class
- Already have UI in options.html
- Already have settings in service-worker.js

### Drawing Tools Implementation

**Priority**: Medium  
**Complexity**: Medium-High

#### Requirements

1. Drawing modes:

   - Line tool
   - Rectangle tool
   - Circle tool

2. Features:
   - Color, opacity, stroke width
   - Lock/unlock drawings
   - Clear all drawings
   - Persist drawings per page

#### Implementation Steps

1. Create `DrawingFeature` class
2. Implement SVG-based drawing layer
3. Add mouse event handlers for each tool
4. Implement shape rendering
5. Add local storage persistence
6. Create clear/lock controls

#### Files to Modify

- `content/content.js` - Add DrawingFeature class
- Already have UI in options and popup

### Presets System Implementation

**Priority**: Medium  
**Complexity**: Low-Medium

#### Requirements

1. Save current configuration as preset
2. Load preset by name
3. Per-domain presets
4. Export/import JSON
5. Profile templates (Designer/Developer/Review)

#### Implementation Steps

1. Add preset UI to options page
2. Implement save/load in service worker (already started)
3. Add domain detection
4. Create export/import functionality
5. Add predefined profile templates
6. Test storage quota limits

#### Files to Modify

- `service-worker.js` - Already has handlers, expand
- `options/options.html` - Add presets section
- `options/options.js` - Add preset management UI
- `popup/popup.html` - Add quick preset selector

## Phase 3: Advanced Features (Future)

### Responsive Overlay Mode

**Complexity**: Medium

Features:

- Breakpoint markers
- Simulated viewport boundaries
- Responsive grid adjustments
- No DOM mutation

### Inspect-Lite Tools

**Complexity**: Medium-High

Features:

- Hover box model overlay
- Spacing to siblings
- Typography info display
- Color info display

## Phase 4: Optional Advanced Features

### True Device Emulation

**Complexity**: High  
**Requires**: Debugger permission

Features:

- Chrome DevTools Protocol integration
- Change viewport, DPR, UA
- Full device emulation

### Accessibility Helpers

**Complexity**: Medium

Features:

- Contrast ratio checker
- Text size warnings
- Focus order visualization
- ARIA attribute display

## Performance Optimization Tasks

### Current Needs

1. **Event Throttling**

   - Throttle mouse move events in measurement tool
   - Debounce resize events for rulers
   - Use requestAnimationFrame for all drawing

2. **Lazy Loading**

   - Don't initialize features until enabled
   - Defer heavy calculations
   - Only render visible elements

3. **Memory Management**

   - Clean up event listeners on disable
   - Remove DOM elements when features off
   - Clear measurement artifacts

4. **Rendering Optimization**
   - Use CSS transforms for positioning
   - Minimize reflows and repaints
   - Batch DOM updates

### Implementation

- Add throttle/debounce utility functions
- Wrap all drawing in requestAnimationFrame
- Implement proper cleanup methods
- Add performance markers for debugging

## Known Issues & TODOs

### High Priority

1. **Icons**: Replace placeholder with actual icons
2. **Toolbar Dragging**: Implement drag-to-reposition
3. **Guide Creation**: Add drag-from-ruler to create guides
4. **Measurement Mode**: Add proper mode activation/deactivation
5. **Grid Rendering**: Implement actual grid display (placeholder now)

### Medium Priority

1. **Tooltip System**: Add hover tooltips to toolbar buttons
2. **Onboarding**: First-time user tips
3. **Guide Persistence**: Save guides per page
4. **Better Measurement**: Add rectangle measurement, angle measurement

### Low Priority

1. **Toolbar Docking**: Snap to edges
2. **Toolbar Collapse**: Minimize toolbar
3. **Export Settings**: Download settings JSON
4. **Themes**: Light/dark mode

## Development Workflow

### Making Changes

1. Edit files in the extension directory
2. Go to `chrome://extensions/`
3. Click reload icon for Aligner
4. Reload any open tabs to see changes
5. Check service worker console for errors
6. Check page console for content script errors

### Debugging

1. **Service Worker**:

   - `chrome://extensions/` → Inspect views: service worker
   - Check initialization and message handling

2. **Content Script**:

   - Right-click page → Inspect
   - Check for Aligner-related console logs
   - Verify Shadow DOM structure in Elements tab

3. **Popup**:

   - Right-click popup → Inspect
   - Check settings load and save

4. **Options Page**:
   - Right-click options → Inspect
   - Check all controls function

### Testing Strategy

1. Test on fresh profile
2. Test on various websites (simple and complex)
3. Test all features individually
4. Test feature combinations
5. Test error scenarios
6. Test performance on large pages
7. Verify storage limits

## Code Quality Checklist

Every new feature must:

- [ ] Have proper error handling (`chrome.runtime.lastError`)
- [ ] Use try-catch on async operations
- [ ] No placeholder/TODO code without implementation
- [ ] Follow style guide (2-space indent, clear naming)
- [ ] Include inline comments for complex logic
- [ ] Clean up resources on disable
- [ ] Work without interfering with page
- [ ] Respect all settings from options page
- [ ] Update this guide with implementation notes

## Resources

- [Chrome Extension Manifest V3 Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Shadow DOM Guide](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Chrome Commands API](https://developer.chrome.com/docs/extensions/reference/commands/)
- [Chrome Debugger Protocol](https://chromedevtools.github.io/devtools-protocol/) (for Phase 4)

## Contact & Support

For issues, feature requests, or contributions, see README.md.

---

Last updated: December 2025
