# Media Manager - Complete Guide

## Overview

The Media Manager is an all-in-one media asset extractor and downloader built into the Aligner Chrome extension. It can detect, preview, and download any media asset from any website - images, SVG, videos, fonts, icons, and even Lottie animation files.

## Key Features

### 🔍 Comprehensive Media Detection

- **Images**: Finds all `<img>` tags, background images, srcset images, and `<picture>` elements
- **SVG**: Detects inline SVG elements, external SVG files, and SVG backgrounds
- **Videos**: Locates `<video>` tags, source elements, and embedded videos (YouTube, Vimeo, Dailymotion)
- **Fonts**: Extracts all @font-face font files (WOFF, WOFF2, TTF, OTF, EOT)
- **Icons**: Finds favicons, apple-touch-icons, manifest icons, and Open Graph images
- **Lottie**: Discovers JSON animation files and Lottie player elements

### 📦 Beautiful UI

- Clean, modern sidebar panel with gradient header
- Organized tabs for each media type with real-time counters
- Thumbnail previews for visual media
- Hover effects and smooth transitions
- Fully draggable and repositionable
- Minimizable to floating button

### ⬇️ Flexible Download Options

- Download individual items with proper filenames
- Bulk download all items of a specific type
- Copy URLs to clipboard instantly
- Copy inline content (SVG code, Lottie JSON)
- Preview items in new tab before downloading

### ⚙️ Smart Features

- Auto-scan on activation (configurable)
- Real-time scanning progress indicator
- Intelligent duplicate detection
- Respects extension's own UI elements (won't scan itself)
- Works on any website, no external dependencies

## How to Use

### Activating Media Manager

**Method 1: Popup Menu**

1. Click the Aligner extension icon in Chrome toolbar
2. Enable the main extension toggle if not already on
3. Click the "Media" button (📦 icon)

**Method 2: Options Page**

1. Right-click Aligner icon → "Options"
2. Navigate to "Media Manager" section
3. Toggle "Enable Media Manager" switch

### Scanning for Media

1. Once activated, the Media Manager panel appears on the right side of the screen
2. Click the green "🔍 Scan Page" button to detect all media
3. Scanning progress is shown with a spinning animation
4. Results appear organized by media type in tabs

**Auto-Scan**: Enable in settings to automatically scan when activating the feature

### Browsing Results

- Click any tab (Images, SVG, Videos, Fonts, Icons, Lottie) to filter
- Each tab shows the count of items found
- Scroll through the list to browse all detected media
- Hover over cards for visual feedback

### Downloading Media

**Individual Item:**

- Click the ⬇️ (download) icon on any media card
- File downloads with appropriate filename
- Toast notification confirms download started

**Bulk Download:**

- Switch to the tab for the media type you want
- Click "⬇️ Download All" button at the top
- All items download with 200ms stagger to prevent browser blocking

**Copy URL:**

- Click the 📋 (copy) icon to copy the URL to clipboard
- Great for sharing or pasting into design tools

**Copy Content:**

- For inline SVG and Lottie JSON, click the 📄 (copy content) button
- Entire code/JSON is copied to clipboard
- Useful for embedding in your own projects

**Preview:**

- Click the 👁️ (preview) icon (available for images, SVG, icons)
- Opens media in a new browser tab
- Useful for inspecting before downloading

### Panel Controls

**Drag to Reposition:**

- Click and drag the panel header (blue gradient area)
- Release to drop in new position
- Panel remembers position during session

**Minimize:**

- Click the "−" button in top-right corner
- Panel minimizes to a floating 📦 button
- Click button to restore panel
- Floating button is also draggable

**Close:**

- Click the "×" button in top-right corner
- Closes the Media Manager completely
- Re-enable from popup to reopen

## Settings

Access Media Manager settings from the Options page:

### Enable Media Manager

Toggle to activate/deactivate the feature globally.

### Auto-scan on Activation

When enabled, automatically scans the page for media as soon as you activate the Media Manager. When disabled, you need to manually click "Scan Page" button.

## Technical Details

### What Gets Detected

**Images:**

- Standard `<img src="...">` tags
- `srcset` attribute images (all variants)
- `<picture>` source elements
- CSS `background-image` on any element
- Base64 encoded images
- Remote and local image sources

**SVG:**

- Inline `<svg>` elements with complete code
- External SVG files via `<img src="*.svg">`
- SVG background images in CSS
- Dimensions extracted where available

**Videos:**

- `<video>` elements with src or currentSrc
- `<source>` children of video elements
- Poster images from videos
- Embedded YouTube videos (iframe)
- Embedded Vimeo videos (iframe)
- Embedded Dailymotion videos (iframe)
- Video dimensions and duration when available

**Fonts:**

- All `@font-face` rules from stylesheets
- Extracts family name, URL, format, weight, and style
- Handles WOFF, WOFF2, TTF, OTF, EOT formats
- Skips cross-origin stylesheets for security

**Icons:**

- `<link rel="icon">` favicons
- `<link rel="shortcut icon">` favicons
- `<link rel="apple-touch-icon">` icons (all sizes)
- Manifest.json icons (if manifest exists)
- `<meta property="og:image">` Open Graph images
- Icon sizes and purposes extracted

**Lottie Files:**

- Elements with `data-lottie` attribute
- Elements with `data-animation-path` attribute
- Elements with class `.lottie`
- `<lottie-player>` custom elements
- Inline JSON scripts (validated as Lottie format)
- Checks for Lottie signature (v, fr, ip, op, layers)

### Duplicate Detection

The scanner intelligently avoids adding duplicate URLs. If the same image/video/font is referenced multiple times on the page, it only appears once in results.

### Element Filtering

The Media Manager respects its own UI elements and won't scan:

- The Aligner overlay container (`#aligner-overlay`)
- Inspector panel elements
- Media Manager panel itself
- Any element with ID starting with `aligner-`

### Performance

- Scanning is asynchronous and non-blocking
- Uses efficient DOM queries
- Throttled to prevent UI lag
- Results cached until next scan
- Memory-efficient data structures

## Use Cases

### Web Designers

- Download all images from a page for inspiration
- Extract SVG icons for use in projects
- Grab font files for offline use
- Download reference images

### Developers

- Extract all media assets from a website
- Get font declarations for matching typography
- Download Lottie animations for analysis
- Collect icons for design system

### Content Creators

- Save images from articles/galleries
- Download video thumbnails
- Extract social media images (og:image)
- Collect visual assets for mood boards

### QA/Testing

- Verify all images are loading correctly
- Check font loading across pages
- Audit video embedding
- Validate icon implementations

## Troubleshooting

### No Media Found After Scan

**Possible Causes:**

- Page genuinely has no media of that type
- Media loaded dynamically after scan (try rescanning)
- Media behind authentication/login
- Cross-origin restrictions preventing access

**Solutions:**

- Scroll the page to lazy-load images, then rescan
- Check the original page - media may not exist
- Try scanning a different page

### Download Not Starting

**Possible Causes:**

- Browser blocking downloads (check Chrome settings)
- Too many simultaneous downloads (bulk download)
- Invalid or broken media URL
- Cross-origin download restrictions

**Solutions:**

- Check Chrome's download bar at bottom
- Allow multiple downloads in browser prompt
- Try downloading items individually
- Check if URL is accessible (click preview icon)

### Panel Not Appearing

**Possible Causes:**

- Extension not enabled
- Media Manager toggle is off
- Panel minimized (look for floating button)
- JavaScript error (check console)

**Solutions:**

- Enable extension from popup
- Click Media Manager button in popup
- Look for minimized floating button
- Reload page and try again

### Scan Button Disabled

**Possible Cause:**

- Scan already in progress

**Solution:**

- Wait for current scan to complete (usually 1-2 seconds)

### Blank Thumbnails

**Possible Causes:**

- Image failed to load
- CORS restrictions on image
- Invalid image URL

**Note:**

- Card still shows filename and URL
- Download may still work (browser bypasses CORS)
- Fallback icon (🖼️) shows for broken images

## Privacy & Security

### No External Requests

Media Manager operates entirely within your browser. It only scans the current page's DOM and existing stylesheets. No data is sent to external servers.

### Respects Cross-Origin Policy

When scanning stylesheets, cross-origin stylesheets that can't be accessed are skipped with a warning in the console. This is a browser security feature.

### Downloads Use Browser API

All downloads use the native browser download mechanism (`<a download>`). Files are saved to your default download location.

### No Tracking

Media Manager doesn't track what you scan or download. All operations are local to your browser session.

## Best Practices

### Efficient Scanning

- Enable auto-scan for convenience
- Rescan after scrolling lazy-loaded pages
- Switch tabs to see organized results
- Use bulk download for large collections

### Organizing Downloads

- Download images separately from videos
- Use separate bulk downloads per type for organization
- Copy URLs to organize in spreadsheet/doc first
- Preview before downloading to verify content

### Handling Large Pages

- Expect longer scan times on media-heavy pages
- Use tabs to break down large result sets
- Download in batches rather than all at once
- Be patient with bulk downloads (200ms stagger)

## Keyboard Shortcuts

Currently, Media Manager uses click-based interactions. Future updates may add:

- Keyboard navigation through results
- Quick download shortcuts
- Panel show/hide hotkey

## Future Enhancements

Planned improvements:

- Filter/search within results
- Sort by file size/dimensions
- Export results as CSV/JSON
- Batch rename downloaded files
- Compare media between pages
- Historical scan results
- Custom download location per type

## Support

If you encounter issues:

1. Check browser console for errors (F12 → Console)
2. Verify extension is up to date
3. Try on a different website
4. Reload the extension
5. Report bugs via GitHub issues

## Credits

Media Manager is part of the Aligner Chrome Extension project, designed to provide comprehensive tooling for web designers and developers. Built with modern web standards and Chrome Extension Manifest V3 best practices.

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Compatible With:** Chrome 88+
