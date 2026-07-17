# Product Requirements Document (PRD)

**Product Name:** Aligner

## Product Summary

A Chrome extension that provides non-intrusive visual design and measurement tools (rulers, grids, guides, measurement, responsive controls, drawing tools) on any website, without interfering with mouse or keyboard interactions.

The tool works as a visual overlay, similar to Figma's layout aids, but applied directly to live web pages.

## Goals

- Help designers and frontend developers validate layouts visually
- Avoid opening Chrome DevTools for common layout checks
- Provide Figma-like layout assistance on real web pages
- Be lightweight, toggle-based, and non-destructive

## Non-Goals

- No DOM mutation by default
- No page reloads
- No code editing
- No data collection or network tracking

## Target Users

- UI/UX designers
- Frontend developers
- QA engineers
- Product reviewers

## Core Principles

1. Does not interfere with page interaction
2. Everything is optional and toggleable
3. Instant on/off without reload
4. Visually clear, minimal UI
5. Accurate pixel measurements
6. Safe permissions first; advanced permissions optional

## Technical Architecture

### Chrome Extension (Manifest V3)

**Components:**

- **Content Script**: Injects overlay UI, manages rulers, grids, guides, drawing, measurement
- **Service Worker**: State management, messaging
- **Popup**: Master on/off, quick feature toggles
- **Options Page**: Full feature configuration
- **Optional DevTools**: For true responsive emulation (advanced mode)

### Overlay Architecture

- Single root overlay container
- Attached to `<body>`
- Uses Shadow DOM to avoid CSS conflicts
- `position: fixed; inset: 0;`
- `z-index: 2147483647`

### Interaction Rules

- Default: `pointer-events: none`
- Only toolbar and active tools receive pointer events
- Keyboard shortcuts only active when extension is enabled

## Feature Set

### 1. Rulers

**Description:** Horizontal and vertical rulers similar to Figma.

**Capabilities:**

- Top and left rulers
- Tick marks
- Zero origin control

**Controls:**

- On / Off
- Color
- Opacity
- Thickness
- Units (px, rem)
- Tick density

### 2. Guides (Manual & Drawn Lines)

**Description:** User-defined lines used for alignment, spacing, or visual reference.

**Types:**

- Horizontal
- Vertical
- Angled
- Free-draw straight lines

**Controls:**

- On / Off
- Color
- Opacity
- Thickness
- Snap to pixel
- Lock / unlock
- Delete / clear all

### 3. Grids

**Description:** Layout grids over the page.

**Types:**

- Baseline grid
- Column grid
- Modular grid

**Controls:**

- On / Off
- Grid type
- Spacing
- Gutter
- Margins
- Color
- Opacity
- Per-breakpoint presets

### 4. Measurement Tools

**Description:** Measure distances visually without inspecting elements.

**Tools:**

- Point-to-point line measurement
- Rectangle measurement
- Angle measurement

**Data Shown:**

- Width
- Height
- ΔX / ΔY
- Distance
- Angle

**Controls:**

- On / Off
- Units
- Snap
- Show CSS px / device px

### 5. Drawing Tools

**Description:** Draw reference lines or shapes for annotation or layout planning.

**Tools:**

- Line
- Rectangle
- Circle

**Controls:**

- On / Off
- Color
- Opacity
- Stroke width
- Lock drawings
- Clear drawings

### 6. Responsive Controls

**Two Modes:**

**A. Overlay-Only (Safe Mode – Default)**

- Shows breakpoint markers
- Simulated viewport boundaries
- Responsive grids

**B. True Device Emulation (Advanced Mode)**

- Uses Chrome Debugger Protocol
- Changes viewport, DPR, UA

**Controls:**

- On / Off
- Device presets
- Custom width/height
- Reset to normal

### 7. Inspect-Lite Tools (Optional)

**Features:**

- Hover box model overlay
- Spacing to siblings
- Typography info
- Color info

### 8. Accessibility Helpers (Optional)

**Features:**

- Contrast checker
- Text size warnings
- Focus order visualization

### 9. Presets & Storage

**Features:**

- Save guide/grid presets per domain
- Export / import JSON
- Profiles (Designer / Developer / Review)

## Options Page Requirements

**Sections:**

1. General
2. Rulers
3. Guides
4. Grids
5. Measurement
6. Drawing
7. Responsive
8. Inspect Tools
9. Accessibility
10. Shortcuts
11. Advanced

**Requirements:**

- Every feature must have enable/disable toggle
- Description text
- Visual example (optional)
- Changes apply immediately
- No reload required

## Tooltips & Help System

**Types:**

- Hover tooltips on icons
- Inline descriptions in options page
- First-time onboarding tips

**Rules:**

- Short, clear, non-technical
- Can be disabled globally
- Shown only once unless reset

## UX Controls

**Toolbar:**

- Floating, minimal
- Dockable
- Collapsible

**Keyboard Shortcuts:**

- Toggle extension
- Toggle rulers
- Toggle grids
- Activate measurement mode
- (Customizable in options)

## Performance & Safety

- Throttled mouse events
- requestAnimationFrame for drawing
- No page DOM modification unless enabled
- No network access
- Local-only storage

## MVP Build Plan

**Phase 1:**

- Overlay system
- Rulers
- Guides
- Measurement
- Toggles

**Phase 2:**

- Grids
- Drawing tools
- Presets

**Phase 3:**

- Responsive overlay
- Inspect-lite tools

**Phase 4:**

- Advanced responsive emulation
- Accessibility tools
