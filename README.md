# Aligner - Chrome Extension

A Chrome extension that provides non-intrusive visual design and measurement tools for web layouts.

## Features

### Phase 1 (MVP) - [Implemented]

- **Rulers**: Horizontal and vertical rulers with tick marks and measurements
- **Guides**: Draggable alignment guides with snap-to-pixel support
- **Measurement Tools**: Point-to-point distance measurement
- **Toolbar**: Floating, minimal toolbar with quick feature toggles
- **Keyboard Shortcuts**: Quick access to all features
- **Options Page**: Comprehensive settings for all features

### Phase 2 (Coming Soon)

- **Grids**: Baseline, column, and modular grids
- **Drawing Tools**: Lines, rectangles, and circles for annotations
- **Presets**: Save and load guide/grid configurations per domain

### Phase 3 (Completed)

- **Responsive Overlay**: Device viewport emulation with Chrome DevTools-style controls
- **Inspect-Lite**: Comprehensive element inspection with live editing and CSS extraction
- **Media Manager**: All-in-one media asset downloader for images, SVG, video, fonts, icons, and Lottie

### Phase 4 (Future)

- **Advanced Grid Systems**: Baseline, column, and modular grids with responsive breakpoints
- **Enhanced Drawing Tools**: More shapes, text annotations, and export options
- **Accessibility Helpers**: Contrast checker, focus order visualization, ARIA helpers

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the extension directory

## Usage

### Quick Start

1. Click the Aligner icon in your browser toolbar
2. Toggle the extension on using the master switch
3. Enable individual features (rulers, guides, measurement, etc.)
4. Use keyboard shortcuts for quick access:
   - `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`) - Toggle extension
   - `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`) - Toggle rulers
   - `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`) - Toggle grids
   - `Ctrl+Shift+M` (Mac: `Cmd+Shift+M`) - Toggle measurement

### Features

#### Rulers

- Shows pixel measurements along top and left edges
- Configurable color, opacity, thickness, and tick density
- Drag from rulers to create guides (coming soon)

#### Guides

- Create horizontal and vertical alignment guides
- Snap to pixel for precision
- Lock/unlock to prevent accidental movement
- Clear all or delete individually

#### Measurement Tools

- Click and drag to measure distances between points
- Shows width, height, and total distance
- Snap to elements for accuracy
- Configurable units (px, rem, em)

#### Toolbar

- Floating toolbar with quick feature toggles
- Draggable to any position
- Minimal design that doesn't interfere with page

#### Media Manager

A comprehensive media asset extractor and downloader that finds and extracts all media from any website:

**Supported Media Types:**

- **Images**: `<img>` tags, background images, srcset, `<picture>` elements
- **SVG**: Inline SVG, external SVG files, SVG backgrounds
- **Videos**: `<video>` tags, source elements, embedded videos (YouTube, Vimeo, Dailymotion)
- **Fonts**: @font-face declarations (WOFF, WOFF2, TTF, OTF, EOT)
- **Icons**: Favicons, apple-touch-icon, manifest icons, og:image
- **Lottie**: JSON animation files, Lottie player elements

**Features:**

- One-click page scanning to detect all media assets
- Organized tabs for each media type with item counts
- Thumbnail previews for images, videos, and icons
- Individual download or bulk download by type
- Copy URLs to clipboard
- Copy inline content (SVG code, Lottie JSON)
- Auto-scan option to detect media on feature activation
- Draggable and minimizable panel interface
- No external dependencies - works offline

**Usage:**

1. Enable Media Manager from the popup or extension menu
2. Click "Scan Page" to detect all media (or enable auto-scan in settings)
3. Browse tabs to see different media types
4. Click preview icon to view media in new tab
5. Click download icon to save individual items
6. Click "Download All" to batch download all items of a type
7. Drag panel to reposition or minimize to floating button

### Settings

Access comprehensive settings via:

1. Click the Aligner icon
2. Click "Settings" at the bottom
3. Configure each feature individually

## Architecture

### Core Principles

- **Non-intrusive**: Overlay system with `pointer-events: none` by default
- **Isolated**: Uses Shadow DOM to avoid CSS conflicts with page
- **Performant**: Throttled events and `requestAnimationFrame` for drawing
- **Safe**: Minimal permissions, no DOM mutation by default

### Technical Stack

- **Manifest V3**: Modern Chrome extension architecture
- **Service Worker**: Background state management and messaging
- **Content Script**: Overlay injection and feature rendering
- **Shadow DOM**: Style isolation and conflict prevention

### File Structure

```
.
├── manifest.json           # Extension configuration
├── service-worker.js       # Background logic and state
├── content/
│   ├── content.js         # Main overlay and feature system
│   └── content.css        # Minimal base styles
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.js           # Popup logic
│   └── popup.css          # Popup styles
├── options/
│   ├── options.html       # Settings page UI
│   ├── options.js         # Settings logic
│   └── options.css        # Settings styles
└── assets/
    └── icons/             # Extension icons
```

## Development

### Prerequisites

- Chrome browser (version 88+)
- Text editor

### Setup

1. Clone the repository
2. Load unpacked extension in Chrome
3. Make changes to files
4. Click the reload icon on `chrome://extensions/` to test changes

### Code Quality

- Follows Chrome extension best practices
- All async operations have error handlers
- No placeholder/fake code
- Comprehensive error checking via `chrome.runtime.lastError`

### Style Guide

- Modern, clean design with defined color palette
- Blue primary (`#2563eb`), green secondary (`#10b981`), amber accent (`#f59e0b`)
- System fonts for consistency
- 2-space indentation for JavaScript
- Semantic class names

## Troubleshooting

### Extension Not Working

1. Check if extension is enabled on `chrome://extensions/`
2. Make sure the master toggle is ON in the popup
3. Reload the page you're trying to use it on
4. Check browser console for errors (F12)

### Features Not Appearing

1. Ensure individual features are enabled in settings
2. Check if extension master toggle is ON
3. Try disabling and re-enabling the feature
4. Check the service worker console for errors

### Content Script Not Injecting

1. Verify manifest.json has correct matches pattern
2. Check if page has Content Security Policy restrictions
3. Reload the extension
4. Reload the page

## Contributing

This is an active development project. Contributions welcome!

### Areas for Contribution

- Grid system implementation (Phase 2)
- Drawing tools (Phase 2)
- Preset system (Phase 2)
- Performance optimizations
- Bug fixes and testing

## License

MIT License - See LICENSE file for details

## Credits

Developed following Chrome Extension Manifest V3 best practices.
Inspired by design tools like Figma and browser DevTools.

---

**Version**: 1.0.0  
**Last Updated**: December 2025
