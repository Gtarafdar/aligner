# Phase 4 Development Plan

## Overview

Phase 4 implements **practical advanced features** from the PRD while deferring complex DevTools Protocol integration. Focus on features that provide immediate value without requiring additional permissions or complex APIs.

## Scope Decision

### ✅ Included (Feasible & High Value)

1. **Profile Templates** - Built-in presets (Designer/Developer/Review)
2. **Breakpoint Markers** - Visual responsive overlay (no viewport changes)
3. **Hover Inspect** - Box model overlay on Ctrl+Hover
4. **Typography Inspector** - Font info on text hover
5. **Color Picker** - Click to sample colors with copy-to-clipboard

### ❌ Deferred (Complex, Requires New Permissions)

1. **True Device Emulation** - Requires `debugger` permission, Chrome DevTools Protocol
2. **Full Accessibility Suite** - Complex, requires ARIA parsing, focus tracking
3. **Network-based Features** - Out of scope for visual tools
4. **Advanced Responsive Controls** - Viewport manipulation needs DevTools API

## Implementation Strategy

### Architecture Decisions

- **No new permissions required** - All features use existing `activeTab` + `storage`
- **Non-intrusive** - Inspect mode only active on Ctrl key modifier
- **Performance first** - Use event delegation, throttling, requestAnimationFrame
- **Graceful degradation** - Features fail silently if browser APIs unavailable

### Code Organization

```
content/content.js
├── ResponsiveFeature class (~100 lines)
│   ├── Breakpoint line rendering
│   ├── Configurable breakpoints
│   └── Label positioning
├── InspectFeature class (~200 lines)
│   ├── Box model overlay (4 colored regions)
│   ├── Typography tooltip
│   ├── Color sampling
│   └── Ctrl key detection
└── Feature integration

service-worker.js
└── Built-in templates (Designer, Developer, Review)

popup/popup.html & popup.js
└── Responsive & Inspect toggle buttons

options/options.html & options.js
└── Responsive & Inspect configuration sections
```

---

## Feature 1: Profile Templates

### Description

3 built-in preset configurations optimized for different workflows.

### Templates

**1. Designer Mode**

```javascript
{
  rulers: { enabled: true, color: '#6b7280', opacity: 0.8 },
  guides: { enabled: false },
  grids: {
    enabled: true,
    type: 'column',
    color: '#ec4899',
    opacity: 0.2
  },
  measurement: { enabled: false },
  drawing: { enabled: false }
}
```

**2. Developer Mode**

```javascript
{
  rulers: { enabled: true, color: '#3b82f6', opacity: 0.7 },
  guides: { enabled: true, color: '#10b981', opacity: 0.6 },
  grids: {
    enabled: true,
    type: 'baseline',
    color: '#8b5cf6',
    opacity: 0.15
  },
  measurement: { enabled: true },
  drawing: { enabled: false }
}
```

**3. Review Mode**

```javascript
{
  rulers: { enabled: false },
  guides: { enabled: true, color: '#f59e0b', opacity: 0.7 },
  grids: { enabled: false },
  measurement: { enabled: true },
  drawing: { enabled: true, color: '#ef4444', opacity: 0.8 }
}
```

### Implementation

- **Location**: `service-worker.js` - Add `builtInTemplates` object
- **UI**: Add "Built-in Templates" section in popup above custom presets
- **Storage**: Don't save to storage (always available as defaults)
- **Interaction**: Click button → Load template instantly

### Files Modified

- `service-worker.js` - Add templates object
- `popup/popup.html` - Add template buttons section
- `popup/popup.js` - Add `loadBuiltInTemplate()` handler

---

## Feature 2: Breakpoint Markers Overlay

### Description

Display vertical lines at common responsive breakpoints with labels.

### Breakpoints (Default)

```javascript
const DEFAULT_BREAKPOINTS = [
  { name: "Mobile", width: 320, color: "#ef4444" },
  { name: "Tablet", width: 768, color: "#f59e0b" },
  { name: "Desktop", width: 1024, color: "#10b981" },
  { name: "Wide", width: 1440, color: "#3b82f6" },
];
```

### Visual Design

- **Line**: Dashed vertical line, 2px width, extends full viewport height
- **Label**: Fixed at top (Y: 10px), shows name + width (e.g., "Tablet · 768px")
- **Color**: Each breakpoint has distinct color for quick recognition
- **Opacity**: 0.6 default, configurable
- **Z-index**: Below other overlays but above page content

### Behavior

- Only shows breakpoints within current viewport width
- Updates on window resize (debounced 100ms)
- Respects scroll position (fixed positioning)
- Can be toggled on/off independently

### Configuration Options

- Enable/disable
- Add/remove custom breakpoints
- Change colors per breakpoint
- Adjust opacity
- Show/hide labels

### Implementation

```javascript
class ResponsiveFeature extends Feature {
  constructor(container, settings) {
    super(container, settings);
    this.breakpoints = settings.responsive.breakpoints || DEFAULT_BREAKPOINTS;
    this.handleResize = this.debounce(this.render.bind(this), 100);
  }

  init() {
    if (this.visible) {
      window.addEventListener("resize", this.handleResize);
      this.render();
    }
  }

  render() {
    // Clear existing
    this.container.innerHTML = "";

    const viewportWidth = window.innerWidth;

    this.breakpoints.forEach((bp) => {
      if (bp.width <= viewportWidth) {
        // Create line + label
        const line = this.createBreakpointLine(bp);
        this.container.appendChild(line);
      }
    });
  }

  createBreakpointLine(breakpoint) {
    // SVG line with label
  }

  cleanup() {
    window.removeEventListener("resize", this.handleResize);
  }
}
```

### Files Modified

- `content/content.js` - Add ResponsiveFeature class (~120 lines)
- `popup/popup.html` - Add Responsive button
- `popup/popup.js` - Add toggle handler
- `options/options.html` - Add responsive section
- `options/options.js` - Add breakpoint management UI
- `service-worker.js` - Add responsive default settings

---

## Feature 3: Hover Box Model Inspector

### Description

Display element box model (content, padding, border, margin) on Ctrl+Hover.

### Visual Design

**Box Model Overlay**:

- Content: rgba(138, 180, 248, 0.3) - Blue
- Padding: rgba(147, 196, 125, 0.3) - Green
- Border: rgba(255, 229, 153, 0.3) - Yellow
- Margin: rgba(246, 178, 107, 0.3) - Orange

**Tooltip**:

- Position: Above element (or below if near top)
- Background: White with shadow
- Content:
  ```
  div.classname
  Content: 200×100
  Padding: 10 20 10 20
  Border: 1px solid
  Margin: 0 auto 20 auto
  ```

### Behavior

- **Activation**: Only when Ctrl key pressed + mouse hover
- **Target**: Element under cursor (use `document.elementFromPoint()`)
- **Update**: Real-time as mouse moves (throttled 50ms)
- **Exclusion**: Ignore Aligner's own overlay elements
- **Deactivation**: Release Ctrl or leave element

### Implementation

```javascript
class InspectFeature extends Feature {
  constructor(container, settings) {
    super(container, settings);
    this.ctrlPressed = false;
    this.currentElement = null;
    this.overlay = null;
    this.tooltip = null;
  }

  init() {
    if (this.visible) {
      document.addEventListener("keydown", this.handleKeyDown);
      document.addEventListener("keyup", this.handleKeyUp);
      document.addEventListener("mousemove", this.handleMouseMove);
    }
  }

  handleKeyDown = (e) => {
    if (e.key === "Control") {
      this.ctrlPressed = true;
      document.body.style.cursor = "crosshair";
    }
  };

  handleKeyUp = (e) => {
    if (e.key === "Control") {
      this.ctrlPressed = false;
      document.body.style.cursor = "";
      this.hideOverlay();
    }
  };

  handleMouseMove = this.throttle((e) => {
    if (!this.ctrlPressed) return;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || this.isOwnElement(element)) return;

    this.showBoxModel(element);
    this.showTooltip(element, e);
  }, 50);

  showBoxModel(element) {
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);

    // Extract box model values
    const padding = this.parsePadding(computed);
    const border = this.parseBorder(computed);
    const margin = this.parseMargin(computed);

    // Render colored overlays for each region
    this.renderBoxModelOverlay(rect, padding, border, margin);
  }

  showTooltip(element, event) {
    // Create tooltip with element info
  }
}
```

### Files Modified

- `content/content.js` - Add InspectFeature class (~250 lines)
- `popup/popup.html` - Add Inspect button
- `popup/popup.js` - Add toggle handler
- `service-worker.js` - Add inspect default settings

---

## Feature 4: Typography Inspector

### Description

Show font information when hovering text elements with Ctrl pressed.

### Display Info

```
Font: Inter, sans-serif
Size: 16px (1rem)
Line Height: 24px (1.5)
Weight: 400 (Regular)
Color: #1f2937
Letter Spacing: 0px
```

### Behavior

- Extends InspectFeature
- Only activates on text-containing elements
- Checks if element has text content (not just children)
- Uses `getComputedStyle()` for all values
- Shows rem equivalent for font-size

### Implementation

```javascript
// Inside InspectFeature class
showTypography(element) {
  const computed = window.getComputedStyle(element);

  // Check if element has text
  const hasText = element.textContent.trim().length > 0;
  if (!hasText) return;

  const fontSize = computed.fontSize;
  const fontSizeRem = parseFloat(fontSize) / 16;

  const info = {
    fontFamily: computed.fontFamily,
    fontSize: `${fontSize} (${fontSizeRem.toFixed(2)}rem)`,
    lineHeight: computed.lineHeight,
    fontWeight: this.getFontWeightName(computed.fontWeight),
    color: computed.color,
    letterSpacing: computed.letterSpacing
  };

  this.renderTypographyTooltip(info);
}

getFontWeightName(weight) {
  const weights = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  };
  return `${weight} (${weights[weight] || 'Unknown'})`;
}
```

### Files Modified

- `content/content.js` - Extend InspectFeature (~80 additional lines)

---

## Feature 5: Color Picker

### Description

Click element while holding Ctrl to sample its color and copy to clipboard.

### Display

```
Background: #ffffff
Text Color: #1f2937
RGB: rgb(31, 41, 55)
HSL: hsl(217, 28%, 17%)
[Copied to clipboard!]
```

### Behavior

- **Activation**: Ctrl + Click on element
- **Sampled Colors**:
  - Background color
  - Text color (if text element)
- **Copy**: Click color value to copy to clipboard
- **Toast**: Show "Copied!" message briefly (2s)
- **Swatch**: Show color swatch next to values

### Implementation

```javascript
// Inside InspectFeature class
handleClick = (e) => {
  if (!this.ctrlPressed) return;

  e.preventDefault();
  e.stopPropagation();

  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element || this.isOwnElement(element)) return;

  this.sampleColor(element, e);
}

sampleColor(element, event) {
  const computed = window.getComputedStyle(element);

  const bgColor = computed.backgroundColor;
  const textColor = computed.color;

  // Convert to hex, rgb, hsl
  const colors = {
    background: {
      hex: this.rgbToHex(bgColor),
      rgb: bgColor,
      hsl: this.rgbToHsl(bgColor)
    },
    text: {
      hex: this.rgbToHex(textColor),
      rgb: textColor,
      hsl: this.rgbToHsl(textColor)
    }
  };

  this.showColorPopup(colors, event.clientX, event.clientY);
}

async copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    this.showToast('Copied to clipboard!');
  } catch (err) {
    console.error('[Aligner Inspect] Copy failed:', err);
  }
}
```

### Files Modified

- `content/content.js` - Extend InspectFeature (~100 additional lines)

---

## Feature 6: UI Integration

### Popup Changes

**Add Buttons**:

```html
<!-- After Measurement button -->
<div class="control-group">
  <button class="feature-button" data-feature="responsive">
    <span class="button-icon">📱</span>
    <span class="button-label">Responsive</span>
  </button>
  <button class="feature-button" data-feature="inspect">
    <span class="button-icon">🔍</span>
    <span class="button-label">Inspect</span>
  </button>
</div>

<!-- Built-in Templates Section (before custom presets) -->
<div class="section">
  <div class="section-title">Built-in Templates</div>
  <div class="template-buttons">
    <button class="template-button" data-template="designer">
      🎨 Designer
    </button>
    <button class="template-button" data-template="developer">
      💻 Developer
    </button>
    <button class="template-button" data-template="review">✅ Review</button>
  </div>
</div>
```

### Options Page Changes

**Responsive Section**:

```html
<div class="section" id="responsive-section">
  <h2>Responsive Controls</h2>

  <div class="setting">
    <label>
      <input type="checkbox" id="responsive-enabled" />
      Enable Responsive Mode
    </label>
  </div>

  <div class="setting">
    <label>Breakpoints</label>
    <div id="breakpoints-list">
      <!-- Dynamically populated -->
    </div>
    <button id="add-breakpoint">+ Add Breakpoint</button>
  </div>

  <div class="setting">
    <label>Opacity</label>
    <input type="range" id="responsive-opacity" min="0" max="1" step="0.1" />
  </div>
</div>
```

**Inspect Section**:

```html
<div class="section" id="inspect-section">
  <h2>Inspect Tools</h2>

  <div class="setting">
    <label>
      <input type="checkbox" id="inspect-enabled" />
      Enable Inspect Mode
    </label>
  </div>

  <div class="setting">
    <label>
      <input type="checkbox" id="inspect-box-model" />
      Show Box Model
    </label>
  </div>

  <div class="setting">
    <label>
      <input type="checkbox" id="inspect-typography" />
      Show Typography Info
    </label>
  </div>

  <div class="setting">
    <label>
      <input type="checkbox" id="inspect-color" />
      Enable Color Picker
    </label>
  </div>
</div>
```

### Service Worker Settings

```javascript
const DEFAULT_SETTINGS = {
  // ... existing settings ...

  responsive: {
    enabled: false,
    breakpoints: [
      { name: "Mobile", width: 320, color: "#ef4444" },
      { name: "Tablet", width: 768, color: "#f59e0b" },
      { name: "Desktop", width: 1024, color: "#10b981" },
      { name: "Wide", width: 1440, color: "#3b82f6" },
    ],
    opacity: 0.6,
    showLabels: true,
  },

  inspect: {
    enabled: false,
    showBoxModel: true,
    showTypography: true,
    enableColorPicker: true,
    tooltipPosition: "auto", // 'above', 'below', 'auto'
  },
};

// Built-in templates
const BUILT_IN_TEMPLATES = {
  designer: {
    /* Designer Mode config */
  },
  developer: {
    /* Developer Mode config */
  },
  review: {
    /* Review Mode config */
  },
};
```

---

## Testing Plan

### Unit Tests (Manual)

**Profile Templates**:

1. Click "Designer" template → Verify rulers + column grid enabled
2. Click "Developer" template → Verify rulers + guides + baseline enabled
3. Click "Review" template → Verify guides + drawing enabled
4. Switch between templates rapidly → No errors
5. Custom presets still work independently

**Responsive Markers**:

1. Enable responsive mode → Lines appear at breakpoints
2. Resize window → Lines update correctly (debounced)
3. Add custom breakpoint → Appears correctly
4. Change breakpoint color → Updates immediately
5. Disable → Lines disappear, no memory leaks

**Box Model Inspector**:

1. Hold Ctrl, hover element → Box model overlay appears
2. Release Ctrl → Overlay disappears
3. Hover different elements → Overlay updates
4. Test on: divs, spans, buttons, inputs
5. Verify correct padding/border/margin colors

**Typography Inspector**:

1. Ctrl+Hover text → Font info tooltip appears
2. Test on various font sizes → Rem conversion correct
3. Test on different font weights → Weight name correct
4. Non-text elements → No typography tooltip

**Color Picker**:

1. Ctrl+Click element → Color popup appears
2. Click hex value → Copied to clipboard, toast shown
3. Test on various backgrounds → Correct colors sampled
4. Test on text → Both background and text color shown

### Integration Tests

1. Enable all Phase 1-4 features simultaneously
2. Test on 5 different websites (simple HTML, complex SPAs)
3. Check performance: Frame rate > 30fps, load time < 500ms
4. Verify no console errors
5. Test all keyboard shortcuts still work
6. Verify storage quotas not exceeded

---

## Performance Considerations

### Event Throttling

```javascript
// Responsive resize
handleResize = debounce(this.render.bind(this), 100);

// Inspect mouse move
handleMouseMove = throttle(this.updateInspect.bind(this), 50);
```

### Memory Management

- Remove event listeners on disable
- Clear DOM elements on hide
- Use WeakMap for element caching
- Cancel pending RAF requests on cleanup

### Rendering Optimization

- Use CSS transforms for positioning
- Batch DOM updates with DocumentFragment
- Use requestAnimationFrame for animations
- Minimize reflows with position: fixed

---

## File Change Summary

| File                   | Lines Added | Description                                  |
| ---------------------- | ----------- | -------------------------------------------- |
| `content/content.js`   | ~500        | ResponsiveFeature + InspectFeature classes   |
| `popup/popup.html`     | ~80         | Template buttons, Responsive/Inspect toggles |
| `popup/popup.js`       | ~150        | Template handlers, feature toggles           |
| `options/options.html` | ~120        | Responsive + Inspect sections                |
| `options/options.js`   | ~200        | Breakpoint management, inspect settings      |
| `service-worker.js`    | ~100        | Built-in templates, new settings             |
| `content/content.css`  | ~80         | Styles for inspect overlays, tooltips        |

**Total**: ~1,230 lines of new code

---

## Risk Assessment

### Low Risk

- Profile templates (simple preset loading)
- Breakpoint markers (basic rendering)
- Color picker (standard browser APIs)

### Medium Risk

- Box model overlay (complex positioning calculations)
- Typography inspector (font parsing edge cases)
- Performance with all features enabled

### Mitigation

- Extensive testing on varied websites
- Performance monitoring with console.time()
- Graceful error handling throughout
- Feature flags for easy disable
- Progressive enhancement approach

---

## Success Criteria

- ✅ All 6 features implemented without bugs
- ✅ No new permissions required
- ✅ No breaking changes to Phase 1-3
- ✅ Performance remains acceptable (< 500ms loads)
- ✅ No console errors during normal usage
- ✅ All tests pass
- ✅ Documentation complete
- ✅ Storage quotas respected

---

## Timeline Estimate

- **Task 2**: Profile Templates - 30 min
- **Task 3**: Breakpoint Markers - 1.5 hours
- **Task 4**: Box Model Inspector - 2 hours
- **Task 5**: Typography Inspector - 1 hour
- **Task 6**: Color Picker - 1 hour
- **Task 7**: UI Integration - 1 hour
- **Tasks 8-10**: Testing - 1.5 hours
- **Task 11**: Documentation - 30 min
- **Task 12**: Final Integration - 30 min

**Total**: ~9.5 hours development time

---

## Next Steps

After completing Phase 4:

1. User acceptance testing
2. Production release (v1.0.0)
3. Gather usage metrics and feedback
4. Plan future enhancements based on real usage
5. Consider: DevTools Protocol features (Phase 5?)

---

**Plan Created**: December 13, 2025  
**Developer**: GitHub Copilot  
**Status**: Ready for implementation
