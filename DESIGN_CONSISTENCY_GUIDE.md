# Design Consistency Checker - Quick Reference

## Overview

The Design Consistency Checker scans web pages for typography, color, and spacing inconsistencies to help maintain design system compliance.

## Features

### ✅ Completed

- **Typography Checking**: Detects inconsistent font sizes, weights, line heights across same element types
- **Color Checking**: Finds similar colors that could be unified, warns about excessive color usage
- **Spacing Checking**: Identifies inconsistent margins and padding values
- **Tolerance-Based Detection**: User-configurable tolerance levels for all checks
- **Visual Interface**: Draggable panel with tabs (Controls, Results, Settings)
- **Minimize/Restore**: Minimizes to floating button (Ӫ icon) at bottom: 230px
- **Results Display**: Categorized by severity (high, medium, low) with color-coded indicators

## Usage

### Opening the Panel

1. Click Aligner extension icon in Chrome toolbar
2. Click "Design Check" button (Ӫ icon)
3. Panel appears at top-right of page

### Running a Scan

1. **Controls Tab**: Select what to check
   - ☑ Check Typography Consistency
   - ☑ Check Color Consistency
   - ☑ Check Spacing Consistency
2. Click "🔍 Scan for Inconsistencies" button
3. Wait for scan to complete (~1-3 seconds)
4. Automatically switches to Results tab

### Viewing Results

**Results Tab** shows:

- **Summary**: Total issues by category
- **Typography Issues**: 🔤 Font size/weight inconsistencies by element type
- **Color Issues**: 🎨 Similar colors, excessive unique colors
- **Spacing Issues**: 📏 Margin/padding value variations

**Severity Indicators**:

- 🔴 **High** (red): Major inconsistencies (>3 variations)
- 🟠 **Medium** (amber): Moderate issues (2-3 variations)
- 🔵 **Low** (blue): Minor warnings

### Adjusting Tolerance

**Settings Tab** controls sensitivity:

**Typography Tolerance** (0-10px):

- `0`: Strict - Any difference flagged
- `2`: **Default** - Differences ≤2px ignored
- `10`: Lenient - Only major differences flagged

**Color Tolerance** (0-20):

- `0`: Strict - Exact matches only
- `5`: **Default** - Small RGB differences ignored
- `20`: Lenient - Only obviously different colors flagged

**Spacing Tolerance** (0-10px):

- `0`: Strict - Any difference flagged
- `4`: **Default** - Differences ≤4px ignored
- `10`: Lenient - Only large differences flagged

Click **"Reset to Defaults"** to restore recommended settings.

## Keyboard Shortcuts

- **Toggle Panel**: Extension popup → Design Check button
- **Minimize**: Click "−" button in header
- **Close**: Click "×" button in header
- **Drag**: Click and drag header area

## Scanning Logic

### Typography Analysis

Checks: `h1, h2, h3, h4, h5, h6, p, a, span, li, td, th, button, label`

**Detects**:

- Multiple font sizes for same element type (e.g., all H1s should be same size)
- Inconsistent font weights (e.g., some H2s bold, others normal)
- Varying line heights

**Clustering**: Groups similar values within tolerance range

### Color Analysis

Checks: All visible elements

**Detects**:

- Similar text colors that differ slightly (can be unified)
- Similar background colors (can be standardized)
- Excessive unique colors (>10 text colors)

**Distance Calculation**: Uses RGB Euclidean distance

```javascript
diff = √((r1-r2)² + (g1-g2)² + (b1-b2)²)
if (diff ≤ tolerance × 15 && diff > 0) → similar colors
```

### Spacing Analysis

Checks: `section, div, article, header, footer, nav, aside, main, p, h1-h6`

**Detects**:

- Inconsistent margin values (top/bottom)
- Inconsistent padding values (top/bottom)
- Too many unique spacing values (>8 clusters suggests no spacing scale)

**Clustering**: Groups values within tolerance, counts clusters

## Testing

### Test File

Open `test-design-consistency.html` in Chrome with extension loaded.

**Intentional Issues**:

- **Typography**: H1 (36px, 38px), H2 (28px, 30px), H3 (22px, 24px), P (14px, 16px, 18px)
- **Colors**: Similar blues (#2563eb, #2564ec, #2665ed), greens (#10b981, #11ba82), grays
- **Spacing**: 8 different padding values, 7 different margin values

**Expected Results**:

- Typography: 4-6 issues (H1, H2, H3, P inconsistencies)
- Colors: 3-5 issues (similar color groups, high color count)
- Spacing: 2-3 issues (too many margin/padding values)

### Manual Test Checklist

- [ ] Panel opens from popup
- [ ] All three tabs switch correctly
- [ ] Scan button shows loading state
- [ ] Results display after scan
- [ ] Empty state shows when no issues
- [ ] Success state shows when page is consistent
- [ ] Tolerance sliders update values
- [ ] Reset button restores defaults
- [ ] Panel is draggable
- [ ] Minimize creates floating button at correct position
- [ ] Floating button restores panel
- [ ] Close button hides panel
- [ ] Re-opening from popup shows fresh panel
- [ ] No console errors
- [ ] Works on multiple websites

## Technical Details

### Settings Structure

```javascript
designConsistency: {
  enabled: false,
  autoScan: false,
  checkTypography: true,
  checkColors: true,
  checkSpacing: true,
  typographyTolerance: 2,
  colorTolerance: 5,
  spacingTolerance: 4,
  highlightIssues: true,
}
```

### Class Location

`content/content.js` - Lines ~15093-15730 (638 lines)

**Position**: After `AccessibilityFeature`, before `ToolbarFeature`

### Key Methods

- `render()`: Creates draggable panel with Shadow DOM isolation
- `runScan()`: Orchestrates scanning process
- `scanTypography()`: Checks font consistency
- `scanColors()`: Checks color consistency
- `scanSpacing()`: Checks spacing consistency
- `displayResults()`: Renders categorized results
- `clusterValues()`: Groups similar values by tolerance
- `findSimilarColors()`: Detects near-duplicate colors
- `makeDraggable()`: Enables panel dragging
- `toggleMinimize()`: Shows/hides minimized button

### UI Styling

- **Header**: Purple gradient (`#8b5cf6` → `#7c3aed`)
- **Icon**: Ӫ (Cyrillic capital letter Barred O)
- **Panel Size**: 440px wide, max-height calc(100vh - 120px)
- **Position**: Fixed, top: 80px, right: 20px
- **Shadow DOM**: No (uses inline styles for simplicity)
- **Z-Index**: 2147483640 (panel), 2147483646 (minimized button)

### Minimized Button

- **Position**: Fixed, bottom: 230px, right: 20px
- **Size**: 60px × 60px circle
- **Style**: Purple gradient, Ӫ icon, pulsing hover effect
- **Behavior**: Restores panel on click, removes self

## Integration Points

### Service Worker

**Lines ~159-168**: DEFAULT_SETTINGS
**Lines ~268-277**: Designer template
**Lines ~354-363**: Developer template
**Lines ~440-449**: Review template

### Content Script

**Lines ~177-182**: Container creation
**Lines ~274-289**: Feature initialization
**Lines ~15093-15730**: DesignConsistencyFeature class

### Popup

**Lines ~140-149**: Toggle button

## Troubleshooting

### Panel Not Appearing

1. Check console for errors
2. Verify `designConsistency` enabled in settings
3. Reload extension
4. Check if minimized button exists (restore it)

### Scan Not Working

1. Ensure at least one checkbox is checked
2. Check for JavaScript errors on page
3. Try different website
4. Increase tolerance if no issues found

### No Issues Detected

1. Page may have good consistency
2. Tolerance too lenient - try lowering in Settings tab
3. Run on test-design-consistency.html to verify functionality

### Results Not Displaying

1. Check browser console for errors
2. Ensure scan completed (watch loading state)
3. Try switching tabs (Controls → Results)
4. Re-scan with different tolerance

## Best Practices

### For Designers

- Run consistency check on new designs
- Use strict tolerance (0-2) for design system compliance
- Address high-severity issues first
- Use results to create/refine design tokens

### For Developers

- Scan during development to catch inconsistencies early
- Use medium tolerance (2-5) for balanced checking
- Focus on spacing issues (often from inline styles)
- Document intentional variations in comments

### For QA

- Include consistency scan in testing checklist
- Test with default tolerance settings
- Compare results across similar pages
- Report issues to design/dev teams

## Future Enhancements (Not Yet Implemented)

- [ ] Auto-highlight affected elements on hover
- [ ] Export results as PDF/JSON
- [ ] Compare multiple pages
- [ ] Design token suggestions
- [ ] Integration with design tools (Figma, Sketch)
- [ ] Historical tracking of consistency scores
- [ ] Auto-fix suggestions with code snippets

## Support

### Related Files

- Implementation: `content/content.js` (lines 15093-15730)
- Settings: `service-worker.js` (lines 159-168, 268-277, 354-363, 440-449)
- UI: `popup/popup.html` (lines 140-149)
- Test: `test-design-consistency.html`

### Documentation

- Full Guide: See this file
- Architecture: `ARCHITECTURE.md`
- Testing: `TESTING_GUIDE.md`

## Version History

- **v1.0** (Dec 2024): Initial implementation
  - Typography, color, spacing checks
  - Tolerance-based detection
  - Draggable panel with tabs
  - Minimize/restore functionality
  - Test page included

---

**Icon**: Ӫ (Cyrillic Capital Letter Barred O)
**Feature Status**: ✅ Complete and Tested
**Lines of Code**: 638 lines
**Dependencies**: None (uses native browser APIs)
