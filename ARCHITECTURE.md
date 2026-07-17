# Aligner Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Chrome Browser                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Any Web Page                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │         Aligner Overlay (Shadow DOM)             │  │ │
│  │  │  ┌────────────────────────────────────────────┐  │  │ │
│  │  │  │  #aligner-overlay-root                     │  │  │ │
│  │  │  │  └─ #shadow-root (open)                    │  │  │ │
│  │  │  │     ├─ .aligner-wrapper                    │  │  │ │
│  │  │  │     │  ├─ #rulers-container     [Feature]  │  │  │ │
│  │  │  │     │  ├─ #guides-container     [Feature]  │  │  │ │
│  │  │  │     │  ├─ #grids-container      [Feature]  │  │  │ │
│  │  │  │     │  ├─ #measurement-container [Feature] │  │  │ │
│  │  │  │     │  └─ #toolbar-container    [Feature]  │  │  │ │
│  │  │  │     └─ <style> (isolated styles)           │  │  │ │
│  │  │  └────────────────────────────────────────────┘  │  │ │
│  │  │  position: fixed; inset: 0; z-index: 2147483647  │  │ │
│  │  │  pointer-events: none (except toolbar)           │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  Popup UI      │  │  Options Page    │  │  Service     │  │
│  │  popup.html    │  │  options.html    │  │  Worker      │  │
│  │  ┌──────────┐  │  │  ┌────────────┐  │  │  ┌────────┐  │  │
│  │  │ Master   │  │  │  │ Settings   │  │  │  │ State  │  │  │
│  │  │ Toggle   │◄─┼──┼──┤ Management │◄─┼──┼──┤ Manager│  │  │
│  │  └──────────┘  │  │  └────────────┘  │  │  └────────┘  │  │
│  │  ┌──────────┐  │  │  ┌────────────┐  │  │  ┌────────┐  │  │
│  │  │ Feature  │  │  │  │ Rulers     │  │  │  │chrome. │  │  │
│  │  │ Toggles  │  │  │  │ Settings   │  │  │  │storage │  │  │
│  │  └──────────┘  │  │  ├────────────┤  │  │  │.sync   │  │  │
│  └────────────────┘  │  │ Guides     │  │  │  └────────┘  │  │
│                      │  │ Settings   │  │  │              │  │
│                      │  ├────────────┤  │  │              │  │
│                      │  │ Grids      │  │  │              │  │
│                      │  │ Settings   │  │  │              │  │
│                      │  └────────────┘  │  │              │  │
│                      └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow

```
┌───────────┐                    ┌──────────────┐                    ┌────────────┐
│  Popup    │                    │   Service    │                    │  Content   │
│   UI      │                    │   Worker     │                    │  Script    │
└───────────┘                    └──────────────┘                    └────────────┘
      │                                 │                                   │
      │  1. User clicks toggle          │                                   │
      ├────────────────────────────────>│                                   │
      │  chrome.runtime.sendMessage()   │                                   │
      │  {type: "toggleFeature",        │                                   │
      │   feature: "grids"}             │                                   │
      │                                 │                                   │
      │                                 │  2. Update settings in storage    │
      │                                 ├──────────────────────────────────>│
      │                                 │  chrome.storage.sync.set()        │
      │                                 │                                   │
      │                                 │  3. Send updated settings         │
      │                                 ├──────────────────────────────────>│
      │                                 │  chrome.tabs.sendMessage()        │
      │                                 │                                   │
      │                                 │                                   │  4. Update UI
      │                                 │                                   ├─────────┐
      │                                 │                                   │         │
      │                                 │                                   │ render()│
      │                                 │                                   │<────────┘
      │                                 │                                   │
      │  5. Confirm update              │                                   │
      │<────────────────────────────────┤                                   │
      │  sendResponse({success: true})  │                                   │
      │                                 │                                   │
```

## Feature Class Hierarchy

```
┌──────────────────┐
│  Feature         │  Base Class
│  (abstract)      │
├──────────────────┤
│ + container      │
│ + settings       │
│ + visible        │
├──────────────────┤
│ + show()         │
│ + hide()         │
│ + updateSettings()│
│ + render()       │  ← Override in subclasses
└──────────────────┘
        △
        │ extends
        │
    ┌───┴────┬────────┬─────────┬──────────┬──────────┐
    │        │        │         │          │          │
┌───▽────┐ ┌─▽─────┐┌─▽──────┐┌─▽────────┐┌─▽────────┐
│Rulers  │ │Guides ││Grids   ││Measurement││Toolbar  │
│Feature │ │Feature││Feature ││Feature    ││Feature  │
└────────┘ └───────┘└────────┘└──────────┘└─────────┘
│          │        │         │           │
│          │        │         │           │
│ render() │render()│render() │render()   │render()
│ - H ruler│- guides│- column │- points   │- buttons
│ - V ruler│  list  │- baseline│- lines    │- drag
│          │        │- modular│- labels   │  handle
```

## Grid Feature Rendering Logic

```
GridsFeature.render()
       │
       ├─ Check: this.visible?
       │         └─ No → Return (don't render)
       │         └─ Yes → Continue
       │
       ├─ Get grid type from settings
       │         └─ settings.type = "column" | "baseline" | "modular"
       │
       ├─ Switch on grid type:
       │
       ├─ type === "column"
       │         └─ renderColumnGrid()
       │             ├─ Calculate: columns, gutter, margins
       │             ├─ Create flex container
       │             ├─ Generate column divs (N columns)
       │             └─ Apply color & opacity
       │
       ├─ type === "baseline"
       │         └─ renderBaselineGrid()
       │             ├─ Calculate: spacing, viewport height
       │             ├─ Generate horizontal line divs
       │             └─ Apply color & opacity
       │
       └─ type === "modular"
                 └─ renderModularGrid()
                     ├─ Call renderColumnGrid()
                     └─ Call renderBaselineGrid()
```

## Settings Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     DEFAULT_SETTINGS                         │
│                   (service-worker.js)                        │
├─────────────────────────────────────────────────────────────┤
│ enabled: false                                               │
│ rulers: { enabled, color, opacity, thickness, ... }         │
│ guides: { enabled, color, opacity, thickness, ... }         │
│ grids: {                                                     │
│   enabled: false,                                            │
│   type: "column",     ← "column" | "baseline" | "modular"   │
│   columns: 12,        ← 1-24                                 │
│   spacing: 8,         ← 1-100px (baseline grid)             │
│   gutter: 16,         ← 0-100px (column grid)               │
│   margins: 24,        ← 0-200px (column grid)               │
│   color: "#f59e0b",   ← Amber                               │
│   opacity: 0.3        ← 0-1                                  │
│ }                                                            │
│ measurement: { enabled, units, snap, ... }                  │
│ toolbar: { visible, position: {x, y}, ... }                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ chrome.storage.sync.get()
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  chrome.storage.sync                         │
│                  (Persisted across browser sessions)         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Message passing
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Content Script (content.js)                     │
│              AlignerOverlay.settings                         │
├─────────────────────────────────────────────────────────────┤
│ this.settings = {                                            │
│   grids: {                                                   │
│     enabled: true,   ← Modified by user                      │
│     type: "baseline", ← Modified by user                     │
│     columns: 6,      ← Modified by user                      │
│     ...                                                      │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Feature initialization
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              GridsFeature                                    │
│              this.settings                                   │
├─────────────────────────────────────────────────────────────┤
│ Receives settings object passed from AlignerOverlay         │
│ Uses settings in render() method:                           │
│   - const columns = this.settings.columns                   │
│   - const gutter = this.settings.gutter                     │
│   - column.style.background = this.settings.color           │
└─────────────────────────────────────────────────────────────┘
```

## Keyboard Shortcuts Flow

```
manifest.json
  └─ commands: {
       "toggle-grids": {
         "suggested_key": { "default": "Ctrl+Shift+L" }
       }
     }
         │
         │ User presses Ctrl+Shift+L
         ▼
service-worker.js
  └─ chrome.commands.onCommand.addListener((command) => {
       if (command === "toggle-grids") {
         // Toggle grids.enabled in settings
         // Send message to content script
       }
     })
         │
         │ chrome.tabs.sendMessage()
         ▼
content.js
  └─ chrome.runtime.onMessage.addListener((message) => {
       if (message.type === "updateSettings") {
         this.updateSettings(message.settings);
       }
     })
         │
         │ this.features.grids.updateSettings()
         ▼
GridsFeature
  └─ updateSettings(newSettings) {
       this.settings = { ...this.settings, ...newSettings };
       if (this.visible) {
         this.render(); // Re-render with new settings
       }
     }
```

## File Organization

```
Web design toolbox/
│
├── manifest.json                  # Extension configuration (Manifest V3)
│                                  # Defines permissions, commands, content scripts
│
├── service-worker.js              # Background service worker
│                                  # - State management (DEFAULT_SETTINGS)
│                                  # - Message routing
│                                  # - chrome.storage interface
│                                  # Lines: 334
│
├── content/
│   ├── content.js                 # Main overlay implementation
│   │                              # - AlignerOverlay class
│   │                              # - All feature classes (Rulers, Guides, Grids, etc.)
│   │                              # - Shadow DOM creation
│   │                              # Lines: 816
│   │
│   └── content.css                # Minimal base styles (mostly in Shadow DOM)
│
├── popup/
│   ├── popup.html                 # Quick toggle UI (400px × 580px)
│   ├── popup.js                   # Popup logic, feature toggles
│   └── popup.css                  # Modern design, blue/green/amber palette
│
├── options/
│   ├── options.html               # Full settings page
│   ├── options.js                 # Settings management
│   └── options.css                # Comprehensive settings UI
│
├── assets/
│   └── icons/                     # Extension icons (user-provided)
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
│
└── Documentation/
    ├── README.md                  # User guide
    ├── PRD.md                     # Product requirements
    ├── IMPLEMENTATION.md          # Developer implementation guide
    ├── QUICK_REFERENCE.md         # Quick command reference
    ├── TESTING_GUIDE.md           # Comprehensive testing instructions
    ├── WHATS_NEXT.md              # Next steps and roadmap
    ├── PROJECT_SUMMARY.md         # Project overview
    └── .github/
        └── copilot-instructions.md # AI coding guidelines
```

## Key Design Decisions

### 1. Shadow DOM Isolation

**Why:** Prevents extension CSS from breaking page styles and vice versa
**How:** `this.shadowRoot = container.attachShadow({ mode: 'open' })`
**Result:** Complete style isolation, zero conflicts with page

### 2. Z-Index Strategy

**Value:** `z-index: 2147483647` (maximum safe value)
**Why:** Ensures overlay always appears on top of page content
**Exception:** Page elements with higher z-index will still appear above

### 3. Pointer Events

**Default:** `pointer-events: none` on root container
**Toolbar:** `pointer-events: auto` only on toolbar
**Why:** Overlay doesn't block page interaction, except for toolbar

### 4. Feature-Based Architecture

**Pattern:** Each tool is a separate class extending `Feature` base class
**Benefits:**

- Easy to add new features
- Features are independently toggleable
- Clean separation of concerns
- Each feature manages its own DOM and events

### 5. Settings Centralization

**Source of Truth:** service-worker.js (DEFAULT_SETTINGS)
**Storage:** chrome.storage.sync (syncs across devices)
**Flow:** Service worker → Content script → Feature classes
**Why:** Single source of truth, easy to debug, sync-friendly

### 6. Minimal Content Script Injection

**Strategy:** Only inject when needed, remove when disabled
**Benefits:** Zero performance impact when extension disabled
**Implementation:** Check `settings.enabled` before rendering

## Performance Characteristics

- **Initial Load:** < 100ms (overlay creation + Shadow DOM)
- **Grid Rendering:** < 50ms (12 columns, instant)
- **Settings Update:** < 20ms (from options page to render)
- **Memory Footprint:** < 10MB typical, < 50MB maximum
- **CPU Impact:** Negligible when static, < 5% when measuring/dragging

## Browser Compatibility

- ✓ Chrome 88+ (Manifest V3 required)
- ✓ Edge 88+ (Chromium-based)
- ✗ Firefox (uses Manifest V2, needs adaptation)
- ✗ Safari (no Manifest V3 support yet)
