# Palette Generator Testing Checklist

## Overview

Complete testing guide for the newly implemented Palette Generator feature in Aligner extension.

## Phase 1: Basic Functionality ✅

### Settings (Options Page)

- [ ] Open chrome://extensions → Aligner → Options
- [ ] Navigate to "Palette Generator" tab
- [ ] Verify all settings are visible and properly labeled:
  - [ ] Enable/Disable toggle
  - [ ] Scan Scope dropdown (Visible/All)
  - [ ] Include Types checkboxes (Text, Background, Border, SVG)
  - [ ] Max Colors slider (12-96, default 48)
  - [ ] Grouping Tolerance slider (1-20, default 8)
  - [ ] Ignore Transparent toggle (default ON)
  - [ ] Ignore White/Black toggle (default OFF)
  - [ ] Max Elements input (1000-50000, default 10000)
- [ ] Change each setting and verify it saves (no console errors)
- [ ] Refresh options page and verify settings persist

### Popup UI

- [ ] Open extension popup
- [ ] Verify "Palette" button is visible with 🎨 icon
- [ ] Click button to enable feature
- [ ] Verify button shows active state
- [ ] Click again to disable
- [ ] No console errors during toggle

## Phase 2: Core Feature Testing

### Panel Display

- [ ] Enable Palette Generator from popup
- [ ] Verify panel appears on right side of page
- [ ] Panel should have:
  - [ ] Title "Palette Generator"
  - [ ] Minimize button (−)
  - [ ] "🔍 Scan Page Colors" button (blue, full width)
  - [ ] Empty state message
  - [ ] Export button (disabled/grayed)
  - [ ] Save button (disabled/grayed)

### Minimize/Restore

- [ ] Click minimize button
- [ ] Verify panel collapses to header only
- [ ] Button changes to (+)
- [ ] Click again to restore
- [ ] Content reappears

## Phase 3: Color Extraction

### Test Page 1: Simple HTML (test-palette-generator.html)

- [ ] Load test-palette-generator.html
- [ ] Enable Palette Generator
- [ ] Click "Scan Page Colors"
- [ ] Verify:
  - [ ] Button shows "⏳ Scanning..." during scan
  - [ ] Button returns to normal after scan
  - [ ] Colors are displayed in grid
  - [ ] Count shows number of colors found (expect ~30-40)
  - [ ] Export and Save buttons become enabled
- [ ] Hover over color swatches:
  - [ ] Swatch scales up slightly
  - [ ] Border changes to blue
  - [ ] Shadow appears
- [ ] Check if these colors are present:
  - [ ] Blues (#2563eb, #3b82f6)
  - [ ] Purples (#667eea, #764ba2, #8b5cf6)
  - [ ] Greens (#10b981, #14b8a6)
  - [ ] Reds/Ambers (#ef4444, #f59e0b)
  - [ ] Grays (#f9fafb, #4b5563, #6b7280)

### Test Page 2: GitHub (Complex Web App)

- [ ] Navigate to https://github.com
- [ ] Enable Palette Generator
- [ ] Scan with "Visible Area Only"
- [ ] Verify colors extracted (expect 20-35)
- [ ] Change setting to "Entire Page (All DOM)"
- [ ] Scan again
- [ ] Verify more colors found
- [ ] Check for GitHub's brand colors (black, white, blues, greens)

### Test Page 3: Image-Heavy Site

- [ ] Navigate to any image-heavy website (e.g., Unsplash, Dribbble)
- [ ] Scan page
- [ ] Verify colors extracted from UI elements (not image pixels)
- [ ] Should find brand colors, text colors, UI backgrounds

### Test Page 4: SVG-Heavy Site

- [ ] Navigate to site with SVG icons/graphics
- [ ] Enable "SVG Fill/Stroke Colors" in settings
- [ ] Scan page
- [ ] Verify SVG colors are included
- [ ] Disable "SVG Fill/Stroke Colors"
- [ ] Scan again
- [ ] Verify fewer colors found (SVG colors excluded)

## Phase 4: Color Interaction

### Copy Individual Colors

- [ ] Scan any page to get palette
- [ ] Click on a color swatch
- [ ] Verify:
  - [ ] Checkmark (✓) appears briefly
  - [ ] Color is copied to clipboard
  - [ ] No console errors
- [ ] Paste clipboard content
- [ ] Verify correct color format (HEX by default)

### Change Color Format

- [ ] Go to Options → Color Picker → Default Color Format
- [ ] Change to RGB
- [ ] Return to test page
- [ ] Scan and copy a color
- [ ] Paste - should be in RGB format: `rgb(r, g, b)`
- [ ] Change to HSL
- [ ] Scan and copy a color
- [ ] Paste - should be in HSL format: `hsl(h, s%, l%)`
- [ ] Change back to HEX

## Phase 5: Export Functionality

### CSS Variables Export

- [ ] Scan a page to generate palette
- [ ] Click "📥 Export" button
- [ ] Dropdown menu appears with 3 options
- [ ] Click "CSS Variables"
- [ ] Verify:
  - [ ] Button shows "✓ Copied!" feedback
  - [ ] Feedback disappears after 2 seconds
- [ ] Paste clipboard content
- [ ] Verify format:

```css
:root {
  --color-1: #HEXCODE;
  --color-2: #HEXCODE;
  ...;
}
```

- [ ] All colors numbered sequentially
- [ ] Valid CSS syntax

### JSON Export

- [ ] Click Export → JSON
- [ ] Paste clipboard content
- [ ] Verify valid JSON format:

```json
[
  {
    "hex": "#HEXCODE",
    "rgb": { "r": 255, "g": 255, "b": 255 },
    "hsl": { "h": 360, "s": 1, "l": 0.5 },
    "count": 5
  }
]
```

- [ ] Parse with JSON.parse() - no errors
- [ ] Contains all extracted colors
- [ ] Each color has hex, rgb, hsl, count properties

### Plain Text Export

- [ ] Click Export → Plain Text
- [ ] Paste clipboard content
- [ ] Verify format: one HEX code per line

```
#HEXCODE1
#HEXCODE2
#HEXCODE3
```

- [ ] Easy to import into design tools

### Export Menu Behavior

- [ ] Click Export button
- [ ] Menu opens
- [ ] Click outside menu
- [ ] Menu closes automatically
- [ ] Click Export button again
- [ ] Menu toggles off

## Phase 6: Save/Load Palettes

### Save Palette

- [ ] Scan a page
- [ ] Click "💾 Save" button
- [ ] Prompt appears: "Enter a name for this palette"
- [ ] Default name includes current date
- [ ] Enter custom name: "Test Palette 1"
- [ ] Click OK
- [ ] Verify:
  - [ ] Button shows "✓ Saved!" feedback
  - [ ] Feedback disappears after 2 seconds
  - [ ] No console errors

### Save Multiple Palettes

- [ ] Navigate to different page
- [ ] Scan and save as "Test Palette 2"
- [ ] Navigate to third page
- [ ] Scan and save as "Test Palette 3"
- [ ] All should save without errors

### Verify Storage

- [ ] Open DevTools → Application → Storage → Local Storage
- [ ] Check chrome-extension://[extension-id]
- [ ] Should see keys like `palette_[timestamp]`
- [ ] Each palette object should contain:
  - [ ] id (timestamp string)
  - [ ] name (custom name)
  - [ ] url (page URL)
  - [ ] createdAt (ISO timestamp)
  - [ ] colors array

## Phase 7: Settings Impact

### Scan Scope

- [ ] Set "Scan Scope" to "Visible Area Only"
- [ ] Scroll to bottom of long page
- [ ] Scan - should only get colors from visible area
- [ ] Set to "Entire Page (All DOM)"
- [ ] Scan - should get more colors
- [ ] Verify difference in color count

### Include Types

- [ ] Disable all color types except "Text Colors"
- [ ] Scan page
- [ ] Should only get text colors (likely fewer colors)
- [ ] Enable only "Background Colors"
- [ ] Scan - should only get backgrounds
- [ ] Enable all types
- [ ] Scan - should get all colors

### Max Colors Limit

- [ ] Set "Max Colors" to 12 (minimum)
- [ ] Scan page
- [ ] Verify palette shows exactly 12 colors
- [ ] Set to 96 (maximum)
- [ ] Scan - should show more colors
- [ ] Verify respects limit

### Grouping Tolerance

- [ ] Set "Grouping Tolerance" to 1 (strict)
- [ ] Scan page
- [ ] Note color count
- [ ] Set to 20 (loose)
- [ ] Scan - should show fewer colors (more grouping)
- [ ] Similar shades grouped together

### Ignore Transparent

- [ ] Disable "Ignore Transparent Colors"
- [ ] Scan page
- [ ] May see more colors (transparent ones included)
- [ ] Enable again
- [ ] Scan - fewer colors (transparent filtered out)

### Ignore White & Black

- [ ] Enable "Ignore White & Black"
- [ ] Scan page
- [ ] Verify no pure white (#FFF) or black (#000)
- [ ] Disable
- [ ] Scan - white/black should appear if present

### Max Elements Scan

- [ ] Set to 1000 (low)
- [ ] Scan very large page (e.g., Reddit)
- [ ] Should complete quickly (limited elements)
- [ ] Set to 50000 (high)
- [ ] Scan - may take longer but more thorough

## Phase 8: Performance Testing

### Large DOM (10k+ elements)

- [ ] Navigate to complex web app (Reddit, Twitter, Gmail)
- [ ] Set "Max Elements Scan" to 50000
- [ ] Click "Scan Page Colors"
- [ ] Verify:
  - [ ] Scan completes within 5 seconds
  - [ ] UI remains responsive during scan
  - [ ] No browser freeze
  - [ ] No memory leaks (check Task Manager)

### Rapid Scanning

- [ ] Scan a page
- [ ] Immediately click Scan again
- [ ] Verify button disabled during first scan
- [ ] No errors, no duplicate processing

### Multiple Pages

- [ ] Open 3-5 different tabs
- [ ] Enable Palette Generator in each
- [ ] Scan each tab
- [ ] Switch between tabs
- [ ] Panels remain independent
- [ ] No cross-tab interference

## Phase 9: Edge Cases

### Empty Page

- [ ] Create blank HTML page: `<html><body></body></html>`
- [ ] Scan page
- [ ] Should show "No colors found" message
- [ ] No errors

### Page with Only Images

- [ ] Page with images but minimal UI
- [ ] Scan page
- [ ] Should extract UI/text colors only (not image pixels)
- [ ] May find very few colors

### Dark Mode Sites

- [ ] Navigate to dark-themed website
- [ ] Scan page
- [ ] Verify dark colors extracted correctly
- [ ] Should see blacks, grays, dark blues

### Iframes

- [ ] Page with iframes
- [ ] Scan page
- [ ] Should extract colors from main page
- [ ] Iframes may or may not be accessible (cross-origin)

### Dynamic Content

- [ ] Page that loads content dynamically (infinite scroll)
- [ ] Scroll down to load more
- [ ] Scan page
- [ ] Should capture colors from loaded content

## Phase 10: Integration Testing

### No Interference with Other Features

- [ ] Enable Rulers
- [ ] Enable Palette Generator
- [ ] Both should work simultaneously
- [ ] Enable Guides, Grids, Measurement, Inspect
- [ ] All features coexist without conflicts
- [ ] Enable Color Picker alongside Palette Generator
- [ ] Both panels visible and functional

### Feature Toggle

- [ ] Enable Palette Generator
- [ ] Panel visible
- [ ] Disable from popup
- [ ] Panel disappears immediately
- [ ] Re-enable
- [ ] Panel reappears in same position

### Settings Sync

- [ ] Change settings in Options page
- [ ] Close options
- [ ] Enable feature
- [ ] Scan page
- [ ] Behavior reflects new settings
- [ ] No cached old settings

## Phase 11: Console & Error Checking

### No Console Errors

- [ ] Open DevTools Console (F12)
- [ ] Enable Palette Generator
- [ ] Scan page multiple times
- [ ] Change settings
- [ ] Copy colors
- [ ] Export palettes
- [ ] Save palettes
- [ ] Verify **zero console errors or warnings**

### No Syntax Errors

- [ ] Check service-worker.js console
- [ ] Check content script console
- [ ] Check popup console
- [ ] Check options page console
- [ ] All should be clean (no syntax errors)

### Chrome Runtime Errors

- [ ] Open chrome://extensions
- [ ] Check for any error badges on Aligner
- [ ] Click "Errors" if present
- [ ] Should be empty

## Phase 12: Cross-Browser Testing (Optional)

### Chrome

- [ ] Test all above in Chrome (primary target)

### Edge (Chromium)

- [ ] Install in Edge
- [ ] Verify basic functionality
- [ ] Scan page
- [ ] Export/Save

### Brave

- [ ] Install in Brave
- [ ] Test core features

## Success Criteria

✅ **All checkboxes above completed without critical errors**

### Critical (Must Pass)

- Settings load and save correctly
- Panel displays properly
- Scan extracts colors accurately
- Copy function works
- Export generates valid output
- No console errors
- No breaking of existing features

### Important (Should Pass)

- Performance acceptable on large pages
- Settings affect scan behavior correctly
- UI/UX smooth and responsive
- Saved palettes persist

### Nice to Have (Can Improve Later)

- Advanced color grouping algorithms
- Palette comparison features
- Custom export templates
- Integration with design tools

## Reporting Issues

If any test fails:

1. Note the exact test step
2. Copy console error (if any)
3. Screenshot the issue
4. Browser version and OS
5. Steps to reproduce

## Test Results Summary

**Date:** ****\_\_\_\_****  
**Tester:** ****\_\_\_\_****  
**Browser:** Chrome v**\_\_**

**Passed:** **\_** / **\_**  
**Failed:** **\_** / **\_**  
**Blocked:** **\_** / **\_**

**Critical Issues Found:**

- [ ] None
- [ ] List here

**Overall Status:**

- [ ] ✅ Ready for production
- [ ] ⚠️ Minor fixes needed
- [ ] ❌ Major issues found

**Notes:**

---

---

---
