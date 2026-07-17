# Phase 3 Feature Testing Plan

## Overview

This document provides step-by-step testing instructions for the newly implemented Phase 3 features:

- Drawing Persistence (per-page URL storage)
- Enhanced Measurement (ΔX/ΔY display)
- Presets System (save/load/export/import)

## Prerequisites

1. Load extension in Chrome: `chrome://extensions` → Enable Developer Mode → Load unpacked
2. Point to: `/Users/gtarafdar/Downloads/Web design toolbox`
3. Open Chrome DevTools (F12) to monitor console for errors

---

## Test 1: Drawing Persistence System

### Objective

Verify drawings persist per page URL using `chrome.storage.local`

### Steps

#### 1.1 Basic Persistence Test

1. Navigate to any website (e.g., `https://example.com`)
2. Open Aligner popup, enable Drawing mode
3. Draw 3 shapes:
   - 1 line (Ctrl+Shift+D → click Line)
   - 1 rectangle
   - 1 circle
4. **Verify**: Shapes appear on page
5. Reload page (F5)
6. **Expected**: All 3 shapes reappear in exact positions
7. **Check DevTools Console**: Look for `[Aligner Drawing] Loaded X drawings from storage`

#### 1.2 Multi-Page Test

1. While still on `https://example.com`, note the 3 shapes
2. Navigate to different site (e.g., `https://github.com`)
3. **Verify**: No shapes visible (clean slate)
4. Draw 2 different shapes on GitHub
5. Navigate back to `https://example.com`
6. **Expected**: Original 3 shapes still there
7. Navigate forward to GitHub
8. **Expected**: The 2 GitHub shapes still there

#### 1.3 Shape Interaction Persistence

1. On any page, draw 1 rectangle
2. Select rectangle, drag it to new position
3. Reload page
4. **Expected**: Rectangle in new position (not original)
5. Select rectangle, resize it using corner handles
6. Reload page
7. **Expected**: Rectangle at new size
8. Delete rectangle (select + Delete key)
9. Reload page
10. **Expected**: Rectangle is gone

#### 1.4 Clear All Test

1. Draw 5 shapes on a page
2. Open Aligner popup
3. Click "Clear All Drawings" button (red button)
4. **Verify**: Confirm dialog appears: "Delete all drawings on this page?"
5. Click "Cancel"
6. **Expected**: Shapes still visible
7. Click "Clear All Drawings" again
8. Click "OK" in dialog
9. **Expected**: All shapes disappear instantly
10. Reload page
11. **Expected**: Page remains clean (no shapes reappear)

#### 1.5 Storage Key Test (Technical)

1. Open Chrome DevTools → Application tab → Storage → Local Storage → `chrome-extension://[your-extension-id]`
2. Draw shapes on `https://example.com/page1`
3. **Verify**: Key exists like `aligner_drawings_aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdlMQ==`
4. Navigate to `https://example.com/page2` (different path)
5. Draw different shapes
6. **Verify**: New key created (different base64 suffix)
7. Both keys should exist side-by-side

### Success Criteria

- ✅ Drawings persist after page reload
- ✅ Different pages have separate drawing sets
- ✅ Shape modifications (move/resize) persist
- ✅ Delete operations persist
- ✅ Clear All removes all drawings and updates storage
- ✅ No console errors during any operation
- ✅ Storage keys follow format: `aligner_drawings_<base64_url_substring>`

---

## Test 2: Enhanced Measurement

### Objective

Verify measurement displays distance + ΔX/ΔY with improved styling

### Steps

#### 2.1 Basic Measurement Display

1. Open any webpage
2. Open Aligner popup, enable Measurement mode (toggle ON)
3. Click point A at coordinates (100, 100) - top-left of viewport
4. Move mouse to point B at (300, 400) - bottom-right
5. **Verify Label Shows**:
   - Top line (bold): "360px" (or similar distance)
   - Bottom line (smaller): "ΔX: 200px · ΔY: 300px"
6. **Check Styling**:
   - White background
   - Box shadow visible
   - Text centered
   - Distance in bold
   - Deltas in regular weight

#### 2.2 Horizontal Line Test

1. Click point A at (100, 200)
2. Move to point B at (400, 200) (same Y)
3. **Expected Label**:
   - Distance: "300px"
   - "ΔX: 300px · ΔY: 0px"
4. Click to lock measurement
5. **Verify**: Blue line appears, label persists

#### 2.3 Vertical Line Test

1. Click point A at (200, 100)
2. Move to point B at (200, 500) (same X)
3. **Expected Label**:
   - Distance: "400px"
   - "ΔX: 0px · ΔY: 400px"

#### 2.4 Diagonal Test (45°)

1. Click point A at (100, 100)
2. Move to point B at (200, 200)
3. **Expected**:
   - Distance: "141px" (≈ √(100² + 100²))
   - "ΔX: 100px · ΔY: 100px"

#### 2.5 Negative Delta Test

1. Click point A at (300, 300)
2. Move to point B at (100, 100) (moving up-left)
3. **Expected**:
   - Distance: "283px" (always positive)
   - "ΔX: -200px · ΔY: -200px" (negatives preserved)

#### 2.6 Label Positioning

1. Make measurement near top edge (Y < 50)
2. **Verify**: Label appears below line (not cut off)
3. Make measurement near bottom edge
4. **Verify**: Label appears above line
5. Make measurement near left/right edges
6. **Verify**: Label remains visible (not cut off)

#### 2.7 Multiple Measurements

1. Create 3 different measurements
2. **Verify**: All 3 labels visible simultaneously
3. **Verify**: Each shows correct distance and deltas
4. Press Escape key
5. **Expected**: All measurements clear

### Success Criteria

- ✅ Distance always shown in bold on first line
- ✅ ΔX and ΔY shown on second line with "·" separator
- ✅ Calculations correct for all angles
- ✅ Negative deltas display correctly
- ✅ Label positioning avoids viewport edges
- ✅ Box shadow and styling match design guidelines
- ✅ Multiple measurements work simultaneously
- ✅ No console errors

---

## Test 3: Presets System

### Objective

Verify save/load presets and export/import JSON functionality

### Steps

#### 3.1 Save Preset Test

1. Open Aligner popup
2. Configure specific settings:
   - Enable Rulers (color: #ff0000, thickness: 3)
   - Enable Guides (color: #00ff00, thickness: 2)
   - Enable Grid (color: #0000ff, spacing: 10)
   - Drawing color: #ff00ff, opacity: 0.5
3. Scroll to "Presets" section in popup
4. Click "💾 Save Preset" button
5. **Verify**: Prompt appears asking for preset name
6. Enter name: "Test Preset 1"
7. Click OK
8. **Expected**: Success message briefly appears
9. **Verify**: "Load Preset" dropdown now includes "Test Preset 1"

#### 3.2 Load Preset Test

1. Open Aligner options page (right-click extension icon → Options)
2. Change all settings to different values:
   - Rulers color: #ffffff, thickness: 1
   - Guides color: #000000, thickness: 1
   - Grid disabled
   - Drawing color: #000000, opacity: 1.0
3. Close options, open popup
4. **Verify**: Settings reflect new values
5. In "Load Preset" dropdown, select "Test Preset 1"
6. **Expected**:
   - Popup UI updates immediately
   - Rulers color: #ff0000, thickness: 3
   - Guides color: #00ff00, thickness: 2
   - Grid enabled with color: #0000ff, spacing: 10
   - Drawing color: #ff00ff, opacity: 0.5
7. Open options page
8. **Verify**: All settings match preset values

#### 3.3 Multiple Presets Test

1. Create second preset with different values
2. Name it "Test Preset 2"
3. Create third preset: "Dark Mode"
4. **Verify**: Dropdown shows all 3 presets
5. Switch between presets multiple times
6. **Expected**: Each preset applies its settings correctly
7. Reload extension (chrome://extensions → Reload)
8. **Verify**: All 3 presets still available after reload

#### 3.4 Export Settings Test

1. Configure unique settings (use memorable values)
2. Open options page
3. Scroll to bottom footer
4. Click "📤 Export Settings" button
5. **Expected**: File download starts
6. **Verify File**:
   - Filename format: `aligner-settings-YYYY-MM-DD.json`
   - File is valid JSON
   - Open in text editor
   - Contains all settings (rulers, guides, grid, measurement, drawing, toolbar, tooltips)
7. **Check Console**: "Settings exported successfully!" status message

#### 3.5 Import Settings Test

1. Modify all settings to random values
2. Open options page
3. Click "📥 Import Settings" button
4. **Expected**: File picker dialog opens
5. Select the JSON file from step 3.4
6. **Expected**:
   - Success message: "Settings imported successfully!"
   - Page reloads after 1 second
7. **Verify**: All settings match original exported values
8. Open popup
9. **Verify**: Popup UI reflects imported settings

#### 3.6 Invalid JSON Test

1. Create text file `invalid.json` with content: `{invalid json}`
2. Open options page
3. Click "📥 Import Settings"
4. Select `invalid.json`
5. **Expected**: Alert dialog: "Error importing settings. Please check the file format."
6. **Verify**: Settings unchanged (not corrupted)
7. Check console: Error logged with details

#### 3.7 Storage Sync Test (Technical)

1. Open DevTools → Application → Storage → Sync Storage
2. Save a preset named "Preset A"
3. **Verify Key**: `aligner_presets` exists
4. **Verify Value**: JSON object with `"Preset A"` property
5. Save second preset "Preset B"
6. **Verify**: Both presets in same `aligner_presets` object
7. **Check Size**: Ensure < 8KB (sync storage limit)

### Success Criteria

- ✅ Presets save with custom names
- ✅ Load preset applies all settings correctly
- ✅ Multiple presets coexist without conflicts
- ✅ Presets persist after extension reload
- ✅ Export creates valid JSON file with correct filename format
- ✅ Import applies settings and reloads page
- ✅ Invalid JSON handled gracefully with error message
- ✅ Settings unchanged after failed import
- ✅ No console errors during any operation
- ✅ Storage sync limits respected (< 100KB total)

---

## Test 4: Integration Test

### Objective

Verify all Phase 3 features work together without conflicts

### Steps

#### 4.1 Combined Workflow Test

1. Navigate to `https://example.com`
2. Load preset "Dark Mode"
3. Enable Drawing mode
4. Draw 3 shapes
5. Enable Measurement mode
6. Create 2 measurements
7. Reload page
8. **Verify**:
   - Dark Mode settings still active
   - 3 drawings reappear
   - 2 measurements reappear
9. Export settings to JSON
10. Clear all drawings
11. Load different preset
12. **Verify**: Drawings cleared, settings changed
13. Import original JSON
14. **Verify**: Original settings restored
15. Drawings still cleared (import doesn't restore drawings)

#### 4.2 Performance Test

1. Draw 20 shapes on a page
2. **Check DevTools Performance tab**
3. Reload page
4. **Expected**: Load time < 500ms
5. **Check Console**: No quota errors
6. Create 10 different presets
7. **Verify**: All load/save operations fast (< 100ms)

#### 4.3 Edge Cases

1. Test drawing persistence on:
   - Page with query parameters: `https://example.com?id=123`
   - Page with hash: `https://example.com#section`
   - Localhost: `http://localhost:3000`
   - File URL: `file:///path/to/file.html`
2. **Verify**: Each URL gets separate storage
3. Test export/import with:
   - Empty settings object `{}`
   - Partial settings object (missing some keys)
4. **Verify**: Handles gracefully, fills defaults

---

## Console Monitoring

Throughout all tests, monitor Chrome DevTools Console for:

### Expected Messages (Normal)

- `[Aligner] Extension loaded`
- `[Aligner Drawing] Loaded X drawings from storage`
- `[Aligner Drawing] Drawings saved to storage`
- `[Aligner Options] Settings exported successfully!`
- `[Aligner Options] Settings imported successfully!`

### Error Patterns to Watch

- ❌ `chrome.storage.local quota exceeded`
- ❌ `Uncaught (in promise)`
- ❌ `TypeError: Cannot read property`
- ❌ `JSON.parse` errors (except invalid import test)
- ❌ Any red error messages during normal operations

---

## Rollback Procedure

If critical issues found during testing:

1. **Identify**: Note exact steps to reproduce
2. **Document**: Screenshot, console logs, error messages
3. **Rollback**:
   ```bash
   git log --oneline  # Find commit before Phase 3 changes
   git checkout <commit-hash>
   ```
4. **Report**: Create detailed bug report
5. **Fix**: Address root cause
6. **Re-test**: Run full test plan again

---

## Test Results Template

```markdown
## Test Execution Results

**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Chrome Version**: [e.g., 120.0.6099.109]

### Test 1: Drawing Persistence

- [ ] 1.1 Basic Persistence: PASS / FAIL
- [ ] 1.2 Multi-Page: PASS / FAIL
- [ ] 1.3 Shape Interaction: PASS / FAIL
- [ ] 1.4 Clear All: PASS / FAIL
- [ ] 1.5 Storage Key: PASS / FAIL
      **Notes**: [Any issues or observations]

### Test 2: Enhanced Measurement

- [ ] 2.1 Basic Display: PASS / FAIL
- [ ] 2.2 Horizontal: PASS / FAIL
- [ ] 2.3 Vertical: PASS / FAIL
- [ ] 2.4 Diagonal: PASS / FAIL
- [ ] 2.5 Negative Delta: PASS / FAIL
- [ ] 2.6 Label Positioning: PASS / FAIL
- [ ] 2.7 Multiple Measurements: PASS / FAIL
      **Notes**: [Any issues]

### Test 3: Presets System

- [ ] 3.1 Save Preset: PASS / FAIL
- [ ] 3.2 Load Preset: PASS / FAIL
- [ ] 3.3 Multiple Presets: PASS / FAIL
- [ ] 3.4 Export Settings: PASS / FAIL
- [ ] 3.5 Import Settings: PASS / FAIL
- [ ] 3.6 Invalid JSON: PASS / FAIL
- [ ] 3.7 Storage Sync: PASS / FAIL
      **Notes**: [Any issues]

### Test 4: Integration

- [ ] 4.1 Combined Workflow: PASS / FAIL
- [ ] 4.2 Performance: PASS / FAIL
- [ ] 4.3 Edge Cases: PASS / FAIL
      **Notes**: [Any issues]

### Overall Result

- **PASS**: All tests passed
- **FAIL**: [List failing tests]

### Blockers

[List any critical issues preventing release]

### Non-Critical Issues

[List minor issues to address later]
```

---

## Next Steps After Testing

1. **If All Pass**:

   - Mark tasks 9-11 as completed in todo list
   - Move to Task 12: Update IMPLEMENTATION.md
   - Prepare for release

2. **If Issues Found**:
   - Document in test results
   - Fix critical issues first
   - Re-run failed tests
   - Iterate until pass

---

## Quick Verification Commands

```javascript
// Run in DevTools Console on any page with Aligner active

// Check storage keys
chrome.storage.local.get(null, (data) => {
  console.log(
    "Local Storage:",
    Object.keys(data).filter((k) => k.startsWith("aligner_drawings"))
  );
});

// Check presets
chrome.storage.sync.get("aligner_presets", (data) => {
  console.log("Presets:", data.aligner_presets);
});

// Check current settings
chrome.storage.sync.get("settings", (data) => {
  console.log("Settings:", data.settings);
});

// Monitor storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  console.log(`Storage [${area}] changed:`, changes);
});
```

---

## Completion Checklist

- [ ] All Test 1 substeps passed (Drawing Persistence)
- [ ] All Test 2 substeps passed (Enhanced Measurement)
- [ ] All Test 3 substeps passed (Presets System)
- [ ] All Test 4 substeps passed (Integration)
- [ ] No console errors during normal operations
- [ ] Performance acceptable (< 500ms load times)
- [ ] Storage quotas respected
- [ ] Edge cases handled gracefully
- [ ] Documentation updated (IMPLEMENTATION.md)
- [ ] STATUS.md reflects Phase 3 completion

**When all checked**: Phase 3 is production-ready! 🎉
