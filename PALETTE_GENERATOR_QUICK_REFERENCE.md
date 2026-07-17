# Palette Generator - Quick Reference

## What It Does

Automatically scans any webpage and extracts all colors used in text, backgrounds, borders, and SVG elements. Builds organized color palettes with smart grouping by similarity.

## Quick Start (5 Steps)

1. **Enable the Feature**

   - Click Aligner icon in Chrome toolbar
   - Click the "🎨 Palette" button
   - Panel appears on right side of page

2. **Scan a Page**

   - Click "🔍 Scan Page Colors" button
   - Wait 1-3 seconds for analysis
   - Color grid appears with extracted colors

3. **Copy a Color**

   - Click any color swatch
   - Color copied to clipboard (HEX format by default)
   - Checkmark appears as feedback

4. **Export Palette**

   - Click "📥 Export" button
   - Choose format: CSS Variables, JSON, or Plain Text
   - Entire palette copied to clipboard

5. **Save for Later**
   - Click "💾 Save" button
   - Enter a name for the palette
   - Saved to browser storage

## Settings (Options Page)

### Access Settings

`chrome://extensions` → Aligner → Options → Palette Generator tab

### Key Settings

**Scan Scope** (Default: Visible Area Only)

- **Visible**: Only scans elements currently visible in viewport (faster)
- **All**: Scans entire DOM including off-screen elements (more comprehensive)

**Include Types** (Default: All enabled)

- ☑ Text Colors - color property
- ☑ Background Colors - background-color
- ☑ Border Colors - all border sides
- ☑ SVG Fill/Stroke - SVG element colors

**Max Colors** (Default: 48, Range: 12-96)

- Limits how many colors appear in final palette
- Most frequent colors prioritized

**Grouping Tolerance** (Default: 8, Range: 1-20)

- How similar colors must be to group together
- 1 = Very strict (more individual colors)
- 20 = Very loose (heavy grouping of similar shades)

**Ignore Transparent** (Default: ON)

- Skips fully transparent colors (alpha = 0)

**Ignore White & Black** (Default: OFF)

- Filters out pure white (#FFFFFF) and pure black (#000000)
- Useful for focusing on brand/accent colors

**Max Elements Scan** (Default: 10000, Range: 1000-50000)

- Performance limit - stops scanning after N elements
- Higher = more thorough but slower
- Lower = faster but may miss colors on large pages

## Export Formats

### CSS Variables

```css
:root {
  --color-1: #2563eb;
  --color-2: #10b981;
  --color-3: #f59e0b;
}
```

**Use Case:** Drop directly into your CSS/SCSS files

### JSON

```json
[
  {
    "hex": "#2563EB",
    "rgb": { "r": 37, "g": 99, "b": 235 },
    "hsl": { "h": 217, "s": 0.83, "l": 0.53 },
    "count": 12
  }
]
```

**Use Case:** Import into design tools, process programmatically

### Plain Text

```
#2563EB
#10B981
#F59E0B
```

**Use Case:** Quick color lists, Figma/Sketch imports

## Keyboard Shortcuts

**None** - Palette Generator is click-only (as requested)

Use popup toggle or Aligner toolbar to enable/disable

## Tips & Tricks

### Get More Colors

- Set Scan Scope to "Entire Page (All DOM)"
- Increase Max Colors to 72 or 96
- Decrease Grouping Tolerance to 3-5
- Disable "Ignore White & Black"

### Get Fewer Colors

- Set Scan Scope to "Visible Area Only"
- Decrease Max Colors to 24 or 12
- Increase Grouping Tolerance to 15-20
- Enable "Ignore White & Black"

### Focus on Brand Colors

- Enable "Ignore White & Black"
- Disable "Ignore Transparent"
- Set Max Colors to 12-24
- Grouping Tolerance: 10-12

### Extract Text-Only Colors

- Disable all Include Types except "Text Colors"
- Useful for analyzing typography color schemes

### Best Performance on Large Sites

- Set Max Elements Scan to 5000
- Use "Visible Area Only" scan scope
- Scroll to area of interest before scanning

## Color Format (from Color Picker Settings)

The format you choose in **Color Picker → Default Color Format** affects how Palette Generator copies individual colors:

- **HEX** (Default): `#2563EB`
- **RGB**: `rgb(37, 99, 235)`
- **HSL**: `hsl(217, 83%, 53%)`

_Export formats are independent of this setting_

## Common Use Cases

### 1. Design System Creation

**Scenario:** You're redesigning a website and want to audit the current color palette

**Steps:**

1. Navigate to your site
2. Scan entire page (Scan Scope: All)
3. Export as CSS Variables
4. Review and consolidate colors
5. Create your design system tokens

### 2. Competitor Analysis

**Scenario:** Analyze colors used by a competitor

**Steps:**

1. Visit competitor site
2. Scan page
3. Export as JSON
4. Import into Figma/design tool
5. Analyze color harmony and usage

### 3. Color Accessibility Audit

**Scenario:** Check what colors are actually used for contrast testing

**Steps:**

1. Scan your page
2. Note text colors and backgrounds
3. Use external contrast checker with extracted colors
4. Identify problematic combinations

### 4. Inspiration Gathering

**Scenario:** Found a beautifully designed site, want to save the color palette

**Steps:**

1. Scan the page
2. Save palette with descriptive name
3. Use saved palette as inspiration for your project

### 5. Theming System

**Scenario:** Building light/dark themes for your app

**Steps:**

1. Scan light theme page → Save as "Light Theme"
2. Switch to dark theme → Save as "Dark Theme"
3. Compare palettes
4. Export both as CSS variables

## Troubleshooting

### No Colors Found

**Causes:**

- All Include Types disabled → Enable at least one
- Page has no styling → Navigate to styled page
- Filters too aggressive → Disable "Ignore White & Black"

### Too Many Similar Colors

**Solution:** Increase Grouping Tolerance to 12-15

### Missing Some Colors

**Solution:**

- Change Scan Scope to "Entire Page (All DOM)"
- Scroll to bring elements into view (if using Visible mode)
- Increase Max Colors limit

### Scan Takes Forever

**Solution:**

- Decrease Max Elements Scan to 5000 or lower
- Use "Visible Area Only" scan scope
- Page may have 20k+ elements (check DevTools)

### Wrong Format When Copying

**Solution:** Change format in Options → Color Picker → Default Color Format

### Can't Find Saved Palettes

**Current Limitation:** Palettes are saved but there's no UI to load them yet. Check browser storage:

- DevTools → Application → Local Storage → Extension ID
- Look for keys starting with `palette_`

## Performance Expectations

| Page Type           | Elements   | Scan Time   | Colors Found |
| ------------------- | ---------- | ----------- | ------------ |
| Simple HTML         | 100-500    | <1 second   | 10-20        |
| Landing Page        | 500-2000   | 1-2 seconds | 20-40        |
| Web App (GitHub)    | 2000-5000  | 2-3 seconds | 30-50        |
| Complex App (Gmail) | 5000-10000 | 3-5 seconds | 40-60        |

_Results vary based on settings and page structure_

## Integration with Color Picker

Both features can run simultaneously:

- **Color Picker:** Manual eyedropper for precise color picking
- **Palette Generator:** Automatic extraction of all page colors

Use together for comprehensive color workflows:

1. Generate palette to see overview
2. Use Color Picker for specific elements
3. Save both to color history/palettes

## Browser Compatibility

✅ Chrome (Manifest V3)  
✅ Edge (Chromium)  
✅ Brave  
❌ Firefox (requires Manifest V2 version)  
❌ Safari (requires Safari-specific manifest)

## Limitations

- **Visual Colors vs Computed Styles:** Extracts colors from CSS computed styles, not from image pixels or canvas elements
- **Cross-Origin Iframes:** Cannot access colors from cross-origin iframes
- **Dynamic Content:** Only scans content present at scan time (not dynamically loaded later)
- **Pseudo-elements:** Cannot extract colors from ::before/::after pseudo-elements
- **Shadow DOM:** Limited access to colors inside shadow DOM of other components

## Development Info

**Version:** 1.0.0  
**Added:** December 2024  
**Dependencies:** None (uses native Chrome APIs)  
**Storage:** chrome.storage.local  
**Permissions:** activeTab, storage (already granted)

## Support

For issues, see:

- **PALETTE_GENERATOR_TEST_CHECKLIST.md** - Comprehensive testing guide
- **PALETTE_GENERATOR_COMPLETE.md** - Full implementation details
- **test-palette-generator.html** - Test page with diverse colors

---

**Enjoy your new Palette Generator! 🎨**
