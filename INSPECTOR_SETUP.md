# 🔍 Inspector Quick Setup Guide

## Problem: Inspector Not Showing?

If you can't see the inspector panel or the 🔍 button, follow these steps:

## ✅ Solution 1: Enable Inspector Feature

1. **Open Chrome DevTools** (Press F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Copy and paste this command:**

```javascript
chrome.runtime.sendMessage(
  {
    type: "updateSettings",
    settings: {
      enabled: true,
      inspect: {
        enabled: true,
        showBoxModel: true,
        showTypography: true,
        enableColorPicker: true,
      },
    },
  },
  (response) => {
    console.log("Inspector enabled!", response);
    location.reload();
  }
);
```

4. **Press Enter** and **refresh the page**
5. You should now see the 🔍 button in the bottom-right corner!

## ✅ Solution 2: Use Popup to Enable

1. Click the extension icon in Chrome toolbar
2. Toggle "Inspector" ON
3. Refresh the page
4. The 🔍 button should appear

## How to Use After Enabling:

### Method 1: Using the 🔍 Button

- Look for the blue 🔍 button in bottom-right corner
- Drag it over any element and click
- Inspector panel opens on the right side

### Method 2: Using Ctrl+Click

- Hold **Ctrl** (or **Cmd** on Mac)
- Click any element on the page
- Inspector panel opens immediately

## What You'll See:

Once open, you'll see **9 tabs** at the top:

- 🎨 CSS - View/edit CSS
- 📝 Text - Typography controls (font, size, color, etc.)
- 🌈 Colors - Color pickers for text, background, border
- 📐 Spacing - Padding, margin, border sliders
- ⚡ Tailwind - Tailwind class editor with presets
- 🌸 DaisyUI - DaisyUI components with visual examples
- 📄 HTML - HTML editor
- 📊 Details - Element information
- 🔧 Tools - Export and quick actions

## Testing:

1. Open `test-inspector.html` in your browser
2. Enable the inspector using one of the methods above
3. Try clicking different elements
4. Switch between tabs to see all features

## Still Not Working?

### Check Extension is Loaded:

1. Go to `chrome://extensions`
2. Find "Web design toolbox" or "Aligner"
3. Make sure it's **enabled** (toggle is blue)
4. Click the **reload** icon if you made code changes

### Check Console for Errors:

1. Press F12 to open DevTools
2. Go to Console tab
3. Look for any red error messages
4. If you see "[Inspect] Init called, visible: false" - that means it needs to be enabled

### Force Enable via Console:

```javascript
// Enable extension and inspector
chrome.storage.sync.set(
  {
    settings: {
      enabled: true,
      inspect: {
        enabled: true,
        showBoxModel: true,
        showTypography: true,
        enableColorPicker: true,
      },
      rulers: { enabled: false },
      guides: { enabled: false },
      grids: { enabled: false },
      measurement: { enabled: false },
      drawing: { enabled: false },
      toolbar: { enabled: false, visible: false },
      responsive: { enabled: false },
    },
  },
  () => {
    console.log("Settings saved! Refresh the page.");
    setTimeout(() => location.reload(), 500);
  }
);
```

## Features Overview:

### 📝 Text Tab:

- Edit text content directly
- Change font family (9 fonts)
- Adjust font size (8-72px)
- Adjust font weight (thin to black)
- Change line height
- Text alignment buttons
- Text color picker
- Text transform (uppercase, lowercase, etc.)

### 🌈 Colors Tab:

- Text color picker + hex input
- Background color picker + hex input
- Border color picker + hex input
- Opacity slider
- 8 color presets (instant apply)
- Copy buttons for all colors

### 📐 Spacing Tab:

- Padding sliders (4 sides, 0-100px)
- Margin sliders (4 sides, 0-100px)
- Border width slider (0-20px)
- Border radius slider (0-50px)
- All changes apply in real-time!

### 🌸 DaisyUI Tab:

- 20+ pre-styled components
- Buttons (primary, secondary, accent, ghost)
- Badges (all variants)
- Cards (multiple styles)
- Alerts (info, success, warning, error)
- Inputs and more
- One-click application
- Visual color-coded buttons

### ⚡ Tailwind Tab:

- View current classes
- Edit classes in textarea
- Apply or clear buttons
- 6 quick presets
- Auto-updates current classes

## Tips:

1. **All changes are LIVE** - you don't need to click apply (except for text content)
2. **Drag the 🔍 button** to move it if it's in the way
3. **Use color presets** for quick styling
4. **DaisyUI requires CDN** - add the link to your HTML head
5. **Export your work** - use the Tools tab to export CSS or generate Tailwind classes

---

**Need more help?** Check the browser console for detailed logs starting with [Aligner].
