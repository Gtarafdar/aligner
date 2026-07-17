# Color Picker - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

1. **Enable**: Press `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
2. **Pick**: Click "🎯 Pick Color from Page"
3. **Select**: Click any element on the webpage
4. **Copy**: Click any format (HEX/RGB/HSL) to copy

---

## ⌨️ Keyboard Shortcuts

| Shortcut                   | Action              |
| -------------------------- | ------------------- |
| `Ctrl+Shift+C` (Win/Linux) | Toggle Color Picker |
| `Cmd+Shift+C` (Mac)        | Toggle Color Picker |

---

## 🎨 Panel Sections

### 1. Current Color Display

- Shows the selected/picked color
- 3 formats displayed simultaneously:
  - **HEX**: `#2563EB`
  - **RGB**: `rgb(37, 99, 235)`
  - **HSL**: `hsl(217, 83%, 53%)`
- Click any format → copies to clipboard

### 2. Pick Color Button

- **Blue button** = Inactive (click to activate)
- **Red button** = Active (click to stop)
- Cursor changes to crosshair when active

### 3. Picked Colors History

- Grid of recently picked colors (max 50)
- Newest colors appear first
- Click any swatch → set as current + copy
- "Clear All" button → removes all history

### 4. Saved Palettes

- Named collections of colors
- "+ Save Current" → saves all picked colors
- 🗑️ button → deletes palette

---

## 🎯 Common Tasks

### Pick a Color

```
1. Click "🎯 Pick Color from Page"
2. Hover over any element (tooltip shows preview)
3. Click element to pick
4. Done! Color added to history
```

### Copy Color in Different Format

```
1. Pick a color (or click history swatch)
2. Find "Current Color" section at top
3. Click your preferred format:
   - HEX for web/CSS
   - RGB for programming
   - HSL for design work
4. Color copied to clipboard!
```

### Save a Palette

```
1. Pick multiple colors
2. Click "+ Save Current" (in Palettes section)
3. Enter palette name (e.g., "Brand Colors")
4. Click OK
5. Palette saved!
```

### Use Saved Palette

```
1. Find palette in "Saved Palettes" section
2. View color preview
3. To delete: Click 🗑️ button
4. (Future: Click to load into history)
```

---

## 🎨 Color Picking Tips

### What Colors Can I Pick?

✅ **Works Great:**

- Solid background colors
- Text colors
- Border colors
- Button colors
- Card/container backgrounds
- Icon colors
- Gradient colors (picks dominant)

⚠️ **Special Cases:**

- **Transparent backgrounds**: Picks text color instead
- **Gradients**: Extracts gradient colors
- **Inherited colors**: Walks up DOM tree
- **CSS variables**: Gets computed value

### Best Practices

1. **Hover First**: Preview color before clicking
2. **Check Format**: Switch format before copying if needed
3. **Save Palettes**: Group related colors together
4. **Clear History**: Remove old colors periodically

---

## 🖱️ Panel Controls

### Move Panel

- **Click + Drag** header area
- Position anywhere on screen

### Minimize Panel

- Click **"−"** button (top-right)
- Content hides, header remains
- Click again to expand

### Close Panel

- Click **"×"** button (top-right)
- Panel hidden (feature still enabled)
- Press `Ctrl+Shift+C` to reopen

---

## 💾 Storage & Persistence

### What's Saved?

- ✅ Picked color history (max 50)
- ✅ Saved palettes
- ✅ Panel position (during session)
- ✅ Settings preferences

### What's Not Saved?

- ❌ Current color selection
- ❌ Pick mode state
- ❌ Panel minimize state

### Storage Limits

- **Color History**: 50 colors max
- **Palettes**: Unlimited (within Chrome storage quota)
- **Total Storage**: ~10MB available

---

## 🔧 Settings

### Default Settings

```javascript
{
  enabled: false,       // Toggle feature on/off
  format: 'hex',        // Default format (hex, rgb, hsl)
  maxHistory: 50,       // Max colors in history
  autoOpen: false       // Auto-open panel on enable
}
```

### Customize Settings

1. Open Options page (right-click extension icon)
2. Navigate to "Color Picker" tab
3. Adjust settings
4. Click "Save"

---

## 🎨 Color Formats Explained

### HEX (`#RRGGBB`)

- **Example**: `#2563EB`
- **Use**: CSS, HTML, web design
- **Format**: 6 characters (00-FF each for R, G, B)

### RGB (`rgb(r, g, b)`)

- **Example**: `rgb(37, 99, 235)`
- **Use**: Programming, JavaScript, canvas
- **Format**: 3 numbers (0-255 each)
- **With Alpha**: `rgba(37, 99, 235, 0.8)`

### HSL (`hsl(h, s%, l%)`)

- **Example**: `hsl(217, 83%, 53%)`
- **Use**: Design, color adjustments
- **Format**:
  - H (Hue): 0-360 degrees
  - S (Saturation): 0-100%
  - L (Lightness): 0-100%
- **With Alpha**: `hsla(217, 83%, 53%, 0.8)`

---

## 🧪 Testing Your Setup

### Quick Test

1. Open test-color-picker.html
2. Press `Ctrl+Shift+C`
3. Pick a color from "Test 1: Solid Color Blocks"
4. Verify color appears in history
5. Click history swatch → should copy to clipboard

### Full Test Checklist

- [ ] Panel opens with keyboard shortcut
- [ ] Panel opens from toolbar button
- [ ] Pick mode activates (crosshair cursor)
- [ ] Tooltip shows color preview on hover
- [ ] Clicking element picks color
- [ ] Color appears in history grid
- [ ] Clicking history swatch copies color
- [ ] Format conversion works (HEX/RGB/HSL)
- [ ] Palette saves with custom name
- [ ] Palette deletes when clicking 🗑️
- [ ] Panel is draggable
- [ ] Minimize/maximize works
- [ ] Close button hides panel
- [ ] No console errors

---

## 🐛 Troubleshooting

### Panel Won't Open

- ✅ Check extension is enabled (popup)
- ✅ Try toolbar button instead of shortcut
- ✅ Check for keyboard shortcut conflicts
- ✅ Reload the page (Ctrl+R)

### Pick Mode Not Working

- ✅ Verify button text says "Stop Picking"
- ✅ Check cursor changed to crosshair
- ✅ Reload extension
- ✅ Clear browser cache

### Colors Not Saving

- ✅ Check browser console for errors
- ✅ Verify chrome.storage permissions
- ✅ Check storage quota (chrome://settings/cookies)
- ✅ Try clearing extension storage

### Copy Not Working

- ✅ Check clipboard permissions
- ✅ Try clicking format again
- ✅ Look for toast notification
- ✅ Test paste in text editor

### Wrong Color Picked

- ✅ Verify you clicked desired element
- ✅ Try picking background vs text separately
- ✅ Check for overlapping elements
- ✅ Use Inspector feature to verify element

---

## 📊 Feature Comparison

### vs ColorZilla

| Feature           | Color Picker            | ColorZilla      |
| ----------------- | ----------------------- | --------------- |
| Pick colors       | ✅                      | ✅              |
| Color history     | ✅                      | ✅              |
| Palettes          | ✅                      | ✅              |
| Format conversion | ✅ HEX/RGB/HSL          | ✅ More formats |
| CSS gradients     | ⚠️ Partial              | ✅ Full         |
| Color analyzer    | ❌                      | ✅              |
| Webpage analysis  | ❌                      | ✅              |
| **Advantage**     | Integrated with Aligner | Standalone tool |

### vs Built-in DevTools

| Feature        | Color Picker    | DevTools         |
| -------------- | --------------- | ---------------- |
| Pick from page | ✅ One-click    | ⚠️ Multi-step    |
| History        | ✅ Persistent   | ❌ None          |
| Palettes       | ✅ Yes          | ❌ None          |
| Ease of use    | ✅ Simple       | ⚠️ Complex       |
| Integration    | ✅ With Aligner | ✅ With DevTools |

---

## 🎯 Use Cases

### Web Designers

- Extract brand colors from inspiration sites
- Build color palettes for new projects
- Match colors across different pages
- Create style guides

### Developers

- Get exact color values for CSS
- Extract colors from mockups
- Debug color issues
- Copy colors between projects

### QA/Testing

- Verify brand color consistency
- Check color implementation matches design
- Test color accessibility
- Document color bugs

### Content Creators

- Match colors from screenshots
- Create cohesive color schemes
- Extract colors from images
- Build brand guidelines

---

## 💡 Pro Tips

### Efficiency Tips

1. **Keyboard First**: Use `Ctrl+Shift+C` to toggle panel quickly
2. **Format Choice**: Set default format in settings for faster workflow
3. **Palette Organization**: Name palettes clearly ("Header", "Buttons", etc.)
4. **Clear Regularly**: Keep history manageable by clearing old colors

### Workflow Tips

1. **Pick Then Sort**: Collect all colors first, organize into palettes later
2. **Test Variants**: Pick multiple shades of same color for comparisons
3. **Document Context**: Include color purpose in palette name
4. **Cross-Reference**: Use with Inspect feature for full element details

### Advanced Tips

1. **Multiple Formats**: Copy HEX for CSS, RGB for JavaScript
2. **Palette Export**: Use saved palettes for style guide documentation
3. **Color Systems**: Build design systems by organizing related colors
4. **Accessibility**: Use with WCAG checker (Inspect feature) for contrast

---

## 🔮 Coming Soon (Phase 2)

### Planned Features

- **CSS Variable Editor**: Modify CSS custom properties on page
- **Theme Generator**: Create full color themes
- **Export Options**: JSON, CSS, SCSS, Tailwind formats
- **Color Harmonies**: Generate complementary colors
- **Gradient Editor**: Create and export gradients
- **Accessibility Checker**: WCAG compliance for picked colors

---

## 📚 Related Features

### Works Great With:

- **Inspect Feature**: Get full element details + color picking
- **Media Manager**: Extract colors from images/videos
- **Rulers & Guides**: Align color-coded guides
- **Drawing Tool**: Use picked colors for annotations

---

## 🎓 Learning Resources

### Color Theory

- [Color Wheel Pro](https://www.color-wheel-pro.com/)
- [Adobe Color](https://color.adobe.com/)
- [Coolors](https://coolors.co/)

### Accessibility

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/#use-of-color)

### CSS Colors

- [MDN Color Values](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value)
- [CSS Tricks Color Guide](https://css-tricks.com/almanac/properties/c/color/)

---

## 📞 Support

### Get Help

- Check console for errors (`F12` → Console tab)
- Review test file: test-color-picker.html
- Read full documentation: COLOR_PICKER_COMPLETE.md

### Report Issues

- Include browser version
- Describe steps to reproduce
- Attach console errors
- Provide test page URL if possible

---

**Happy Color Picking! 🎨**

_Made with ❤️ for the Aligner extension_
