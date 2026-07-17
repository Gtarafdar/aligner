# Palette Generator - Visual Comparison

## Before vs After

### OLD DESIGN (Before)

```
┌──────────────────────────────────┐
│  Palette Generator          [−]  │
├──────────────────────────────────┤
│  🔍 Scan Page Colors             │
│                                   │
│  48 colors found                  │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐      │
│  │12││  ││  ││  ││  ││  ││  ││  ││      │
│  └──┴──┴──┴──┴──┴──┴──┴──┘      │
│  ┌──┬──┬──┬──┬──┬──┬──┬──┐      │
│  │  ││  ││  ││  ││  ││  ││  ││  ││      │
│  └──┴──┴──┴──┴──┴──┴──┴──┘      │
│                                   │
├──────────────────────────────────┤
│  [Export (disabled)]  [Save]     │
└──────────────────────────────────┘

Problems:
❌ Small squares (50x50px)
❌ Hex codes only in tooltip
❌ Count badge hard to read
❌ Auto-fill columns (inconsistent)
❌ No prominent information
❌ Flat, old-school design
```

### NEW DESIGN (After)

```
┌──────────────────────────────────┐
│  Palette Generator          [−]  │
├──────────────────────────────────┤
│  🔍 Scan Page Colors             │
│                                   │
│  48 colors found   [Large View]  │
│  ┌─────┬─────┬─────┬─────┐      │
│  │█████│█████│█████│█████│      │  ← 80px color block
│  │█████│█████│█████│█████│      │
│  │█████│█████│█████│█████│      │
│  ├─────┼─────┼─────┼─────┤      │
│  │#2563│#10b9│#f59e│#ef44│      │  ← Prominent hex
│  │EB  │81  │0b  │44  │      │
│  │12   │8    │5    │3    │      │  ← Usage count
│  │uses │uses │uses │uses │      │
│  └─────┴─────┴─────┴─────┘      │
│                                   │
│  ┌─────┬─────┬─────┬─────┐      │
│  │█████│█████│█████│█████│      │
│  │...more colors...         │      │
│  └─────┴─────┴─────┴─────┘      │
│                                   │
├──────────────────────────────────┤
│  [📥 Export]  [💾 Save]           │
└──────────────────────────────────┘

Features:
✅ Large color preview (80px)
✅ Hex codes prominently displayed
✅ Clear usage count below
✅ Fixed 4-column grid
✅ Toggle to 2-column view
✅ Modern card-based design
✅ Hover animations
✅ Professional appearance
```

## Color Card Detail

### Individual Card Structure

```
┌─────────────────┐
│                 │
│                 │  ← 80px solid color block
│    #2563EB      │     (actual color preview)
│                 │
│                 │
├─────────────────┤
│                 │
│    #2563EB      │  ← 11px bold hex (Monaco font)
│                 │
│    12 uses      │  ← 10px gray count
│                 │
└─────────────────┘

Dimensions:
- Width: ~75px (320px panel / 4 columns)
- Color block: 80px height
- Info section: 8px padding
- Border: 1px solid #e5e7eb
- Border radius: 8px
- Gap: 12px between cards

Hover State:
- Transform: translateY(-4px) (lifts up)
- Border color: #2563eb (blue)
- Box shadow: 0 8px 16px rgba(0,0,0,0.1)
- Transition: all 0.2s ease
```

## Toggle View Comparison

### 4-Column Grid View (Default)

```
┌────────────────────────────┐
│  48 colors    [Large View] │
├──┬──┬──┬──┐ ←               │
│▓▓│▓▓│▓▓│▓▓│  4 per row      │
├──┼──┼──┼──┤                │
│▓▓│▓▓│▓▓│▓▓│                │
├──┼──┼──┼──┤                │
│▓▓│▓▓│▓▓│▓▓│                │
└──┴──┴──┴──┘                │

Use case: Overview, many colors
```

### 2-Column Large View

```
┌────────────────────────────┐
│  48 colors    [Grid View]  │
├────────┬────────┐ ←        │
│████████│████████│  2 per   │
│████████│████████│  row     │
│#2563EB │#10b981 │  Larger  │
│12 uses │8 uses  │  cards   │
├────────┼────────┤          │
│████████│████████│          │
│████████│████████│          │
│#f59e0b │#ef4444 │          │
│5 uses  │3 uses  │          │
└────────┴────────┘          │

Use case: Detail view, fewer colors
```

## Export Menu

### Visual Position

```
┌──────────────────────────────────┐
│  Palette Generator          [−]  │
│                                   │
│  ... color cards ...              │
│                                   │
├──────────────────────────────────┤
│  [📥 Export]  [💾 Save]           │
└──────────────────────────────────┘
      ↓ Click Export
   ┌────────────────┐
   │ CSS Variables  │ ← Hover: gray bg
   ├────────────────┤
   │ JSON           │
   ├────────────────┤
   │ Plain Text     │
   └────────────────┘
```

### Export Formats

**CSS Variables**:

```css
:root {
  --color-1: #2563eb;
  --color-2: #10b981;
  --color-3: #f59e0b;
  --color-4: #ef4444;
  /* ... */
}
```

**JSON**:

```json
[
  {
    "hex": "#2563eb",
    "rgb": { "r": 37, "g": 99, "b": 235 },
    "hsl": { "h": 221, "s": 83, "l": 53 },
    "count": 12
  },
  {
    "hex": "#10b981",
    "rgb": { "r": 16, "g": 185, "b": 129 },
    "hsl": { "h": 160, "s": 84, "l": 39 },
    "count": 8
  }
]
```

**Plain Text**:

```
#2563eb
#10b981
#f59e0b
#ef4444
```

## Saved Palettes

### List View

```
┌──────────────────────────────────┐
│  Saved Palettes                   │
├──────────────────────────────────┤
│  ┌─┬─┬─┬─┬─┐                     │
│  │▓│▓│▓│▓│▓│ My Project Colors   │  ← Preview strip
│  └─┴─┴─┴─┴─┘ Dec 20, 2024        │
│  [Load] [X]                       │
├──────────────────────────────────┤
│  ┌─┬─┬─┬─┬─┐                     │
│  │▓│▓│▓│▓│▓│ Website Theme       │
│  └─┴─┴─┴─┴─┘ Dec 19, 2024        │
│  [Load] [X]                       │
└──────────────────────────────────┘

Features:
- 5 most common colors shown
- Each preview box: 24px × 24px
- Load button: Populates color display
- Delete (X): Removes with confirmation
- Scrollable if many palettes
```

## Minimize Behavior

### Minimized State

```
Page content...

                    [◨]  ← Floating button
                         (bottom-right)
                         60×60px circle
                         Green gradient
                         Hover: scale & rotate
```

### Restore Action

```
Click floating button ◨
         ↓
Button removed + Panel appears
         ↓
┌──────────────────────────────────┐
│  Palette Generator          [−]  │
│  ... full panel restored ...      │
└──────────────────────────────────┘
```

## Interaction States

### Color Card States

**Default**:

```
┌─────────┐
│█████████│
│█████████│  Normal position
│ #2563EB │  Gray border
│ 12 uses │
└─────────┘
```

**Hover**:

```
  ↑ ↑ ↑
┌─────────┐
│█████████│  Lifted 4px up
│█████████│  Blue border
│ #2563EB │  Drop shadow
│ 12 uses │  Cursor: pointer
└─────────┘
```

**Click**:

```
┌─────────┐
│█████████│
│█████████│  → Copies #2563EB
│ #2563EB │  → Shows toast
│ 12 uses │     "Copied!"
└─────────┘
```

### Button States

**Scan Button**:

```
Normal:     🔍 Scan Page Colors
            Blue, clickable

Scanning:   ⏳ Scanning... X%
            Gray, disabled

Complete:   🔍 Scan Page Colors
            Blue, clickable again
```

**Export/Save Buttons**:

```
Initial:    [Export] [Save]
            Gray, opacity 0.5
            cursor: not-allowed

After Scan: [📥 Export] [💾 Save]
            Green/Orange
            opacity 1.0
            cursor: pointer
```

## Design Tokens

### Colors

```css
/* Primary Actions */
--blue-600: #2563eb; /* Interactive elements */
--blue-700: #1d4ed8; /* Hover states */

/* Status Colors */
--green-500: #10b981; /* Export/success */
--green-600: #059669; /* Export hover */
--amber-500: #f59e0b; /* Save */
--amber-600: #d97706; /* Save hover */
--red-500: #ef4444; /* Delete/error */

/* Neutral Scale */
--gray-50: #f9fafb; /* Background light */
--gray-200: #e5e7eb; /* Borders */
--gray-500: #6b7280; /* Secondary text */
--gray-600: #4b5563; /* Secondary hover */
--gray-800: #1f2937; /* Primary text */
--gray-900: #111827; /* Headings */

/* Semantic */
--white: #ffffff; /* Cards, panel */
--black: #000000; /* Text */
```

### Typography

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Monospace (for hex codes) */
font-family: "Monaco", "Courier New", monospace;

/* Sizes */
--text-xs: 10px; /* Usage count */
--text-sm: 11px; /* Hex codes */
--text-base: 13px; /* Body */
--text-md: 14px; /* Labels */
--text-lg: 16px; /* Headings */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
```

### Spacing

```css
/* Scale: 4px base */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;

/* Applied */
gap: 12px; /* Between cards */
padding: 8px; /* Card internal */
margin-bottom: 16px; /* Section spacing */
```

### Borders & Radius

```css
/* Borders */
border: 1px solid #e5e7eb;

/* Border Radius */
--radius-sm: 4px; /* Menu items */
--radius-md: 6px; /* Buttons */
--radius-lg: 8px; /* Cards */
--radius-xl: 12px; /* Panel */
--radius-full: 50%; /* Circular buttons */
```

### Shadows

```css
/* Panel */
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);

/* Card hover */
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

/* Menu */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Minimized button */
box-shadow: 0 8px 16px rgba(16, 185, 129, 0.4);
```

### Transitions

```css
/* Default */
transition: all 0.2s ease;

/* Slower (minimize button) */
transition: all 0.3s ease;

/* Properties transitioned */
- transform
- border-color
- box-shadow
- background-color
- opacity
```

## Responsive Behavior

### Panel Width

```
Fixed: 320px
Max height: calc(100vh - 100px)
Position: fixed top/right
Z-index: 2147483640 (highest)
```

### Scroll Behavior

```
Panel: overflow: hidden
Content: overflow-y: auto
Color Grid: No scroll (panel scrolls)
Saved List: max-height 200px, overflow-y: auto
```

### Viewport Adaptation

```
Small viewport:
- Panel takes same width
- Scrolls vertically
- May overlap page content
- Draggable to reposition

Large viewport:
- Panel in top-right corner
- Doesn't interfere with page
- Full functionality visible
```

## Accessibility Features

### Keyboard Support

- Tab through buttons and cards
- Enter/Space to click
- Esc to close export menu

### ARIA Labels

```html
<button aria-label="Minimize panel">−</button>
<button aria-label="Restore Palette Generator">◨</button>
<div role="button" aria-label="Copy color #2563eb">...</div>
```

### Color Contrast

- Text on white: WCAG AA compliant
- Buttons: High contrast colors
- Hover states: Clear visual feedback

### Tooltips

```
Color card: "#2563eb (12 uses)"
Minimize: "Minimize panel"
Restore: "Restore Palette Generator"
Toggle view: "Switch to Large/Grid View"
```

## Performance Optimizations

### Shadow DOM Isolation

- No CSS conflicts with page
- Scoped styles
- Fast rendering

### Event Delegation

- Single listener for all swatches
- Efficient hover handling
- Minimal memory footprint

### Lazy Rendering

- Palettes load on demand
- Export menu created on click
- Saved list fetches from storage

### Smooth Animations

- CSS transforms (GPU accelerated)
- Will-change hints
- RequestAnimationFrame for complex updates

## Comparison with Design Tools

### Similar to Figma

✅ Card-based color layout
✅ Prominent hex codes
✅ Hover interactions
✅ Clean white interface

### Similar to Adobe Color

✅ Grid view of colors
✅ Export multiple formats
✅ Save palettes
✅ Color usage information

### Similar to Coolors

✅ Modern, minimal design
✅ Toggle between views
✅ Copy-on-click
✅ Smooth animations

### Unique to Aligner

🎯 Extracts from live webpages
🎯 Shows color usage frequency
🎯 Automatic color grouping
🎯 Draggable floating panel
🎯 Browser extension (no website needed)
