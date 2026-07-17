# Aligner - Chrome Extension Development Guidelines

## Project Context

**Aligner** is a Chrome extension providing non-intrusive visual design and measurement tools (rulers, grids, guides, measurement, drawing) for web layouts. Works as an overlay system similar to Figma's layout aids, applied directly to live web pages.

**Current Status**: Phase 1 MVP (80% complete) - Core architecture, rulers, guides, measurement tools, toolbar, popup, and options page implemented.

## Core Principles

You are the Chrome extension developer for Aligner. Follow these mandatory practices for all code generation and modifications.

## Extension Architecture

- **Manifest V3 Only**: Always use Manifest V3 (`manifest_version: 3`). No Manifest V2 code.
- **Service Workers**: Use service workers instead of background pages. Import scripts via `importScripts()` for shared logic.
- **Content Scripts**: Isolate content scripts from page context. Use `chrome.runtime.sendMessage()` for communication with service worker.
- **Popup/Options**: Keep UI components lightweight. Defer heavy logic to service workers.

## Code Quality Standards

### No Fake Code

- Never use placeholder functions like `// TODO: implement this` without actual implementation
- All promises must have proper `.catch()` handlers or try-catch blocks
- All chrome API calls must include error checking via `chrome.runtime.lastError`
- Example:
  ```javascript
  chrome.storage.local.get(["key"], (result) => {
    if (chrome.runtime.lastError) {
      console.error("Storage error:", chrome.runtime.lastError);
      return;
    }
    // Use result
  });
  ```

### Syntax Error Prevention

- Always validate JSON before parsing: use try-catch with `JSON.parse()`
- Check for null/undefined before accessing properties: use optional chaining (`?.`)
- Validate DOM elements exist before manipulation: `if (element) { ... }`
- Type check user inputs and API responses

### Dependency Management

- Minimize external dependencies. Prefer native browser APIs
- If libraries needed, use CDN imports in HTML or bundle with build tools
- Document all dependencies in `package.json` with exact versions (no `^` or `~`)
- Never mix different versions of the same library across files

## Styling & UI Guidelines

### Color Palette (No Purple Gradients)

- **Primary**: `#2563eb` (blue-600)
- **Secondary**: `#10b981` (green-500)
- **Accent**: `#f59e0b` (amber-500)
- **Neutral**: `#6b7280` (gray-500), `#1f2937` (gray-800), `#f9fafb` (gray-50)
- **Semantic**: Success `#22c55e`, Warning `#f59e0b`, Error `#ef4444`

### Modern UI Style

```css
/* Use modern, clean design patterns */
.container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.button {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
```

### Typography

- Font: System fonts `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- Sizes: `12px` (small), `14px` (body), `16px` (headers), `20px` (titles)
- Weights: 400 (regular), 500 (medium), 600 (semibold)

## Chrome Extension API Best Practices

### Permissions

- Request minimal permissions. Only add what's actively used
- Use optional permissions for advanced features: `chrome.permissions.request()`
- Document why each permission is needed in comments

### Storage

- Use `chrome.storage.sync` for user preferences (limit 100KB)
- Use `chrome.storage.local` for larger data (limit 10MB)
- Always set and check storage quotas

```javascript
// Good practice
const defaultSettings = { theme: "light", enabled: true };
chrome.storage.sync.get(defaultSettings, (settings) => {
  if (chrome.runtime.lastError) return;
  applySettings(settings);
});
```

### Messaging

- Use `chrome.runtime.sendMessage()` for one-time requests
- Use `chrome.runtime.connect()` for long-lived connections
- Always validate message sender and content:

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.id || sender.id !== chrome.runtime.id) return;
  if (!message.type) return;

  switch (message.type) {
    case "getData":
      handleGetData().then(sendResponse);
      return true; // Keep channel open for async response
  }
});
```

## Debugging Strategy

### Common Issues & Solutions

1. **Service Worker Crashes**

   - Check: Event listeners registered correctly on install
   - Fix: Move listeners outside of conditional blocks
   - Test: Reload extension and check `chrome://serviceworker-internals`

2. **Content Script Not Injecting**

   - Check: `manifest.json` matches patterns correct
   - Check: Host permissions granted
   - Fix: Use `"matches": ["<all_urls>"]` for testing, then restrict
   - Test: Inspect page → Check "Content Scripts" tab

3. **Storage Not Persisting**

   - Check: Using `.sync` vs `.local` appropriately
   - Check: Not exceeding quota limits
   - Fix: Implement quota management and error handlers
   - Test: `chrome.storage.sync.getBytesInUse()`

4. **CORS Errors**
   - Check: Using `fetch()` from service worker, not content script
   - Check: Host permissions in manifest
   - Fix: Add host to `host_permissions` array
   - Test: Network tab in extension service worker console

### Debugging Workflow

1. Open `chrome://extensions` → Enable "Developer mode"
2. Check service worker console: Click "Inspect views: service worker"
3. Check content script console: Inspect page → Look for extension ID
4. Review errors in `chrome.runtime.lastError`
5. Use `console.log` with timestamps: `console.log('[${new Date().toISOString()}]', message)`

## Testing Checklist

Before completing any feature:

- [ ] No console errors in service worker
- [ ] No console errors in content scripts
- [ ] No console errors in popup/options pages
- [ ] All async operations have error handlers
- [ ] Storage operations respect quota limits
- [ ] Permissions are minimal and documented
- [ ] UI is responsive and matches style guide
- [ ] Code follows consistent formatting (2-space indentation)
- [ ] No hardcoded values (use constants or config)
- [ ] All TODO items completed or explicitly noted

## Aligner Project Structure

```
Web design toolbox/
├── manifest.json              # Extension configuration (Manifest V3)
├── service-worker.js          # State management, messaging hub
├── content/
│   ├── content.js            # Main overlay system, all features
│   └── content.css           # Minimal base styles
├── popup/
│   ├── popup.html            # Quick toggle UI
│   ├── popup.js              # Popup logic
│   └── popup.css             # Popup styles
├── options/
│   ├── options.html          # Full settings page
│   ├── options.js            # Settings logic
│   └── options.css           # Settings styles
├── assets/
│   └── icons/                # Extension icons (need creation)
├── PRD.md                    # Product requirements
├── IMPLEMENTATION.md         # Implementation guide
├── QUICK_REFERENCE.md        # Dev quick reference
└── README.md                 # User documentation
```

### Key Architecture Decisions

- **Shadow DOM**: All overlay UI isolated to avoid CSS conflicts
- **Overlay System**: Single root container (`pointer-events: none`) with feature layers
- **Feature Classes**: Each tool (rulers, guides, measurement) extends base `Feature` class
- **No DOM Mutation**: Extension doesn't modify page structure by default
- **Keyboard First**: Full keyboard shortcut support (Ctrl+Shift+L, R, G, M)

## Common Patterns

### Safe DOM Manipulation

```javascript
function safeQuerySelector(selector) {
  try {
    return document.querySelector(selector);
  } catch (e) {
    console.error("Invalid selector:", selector);
    return null;
  }
}
```

### Retry Logic for API Calls

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### State Management

````javascript
// Use a simple state object with getters/setters
const state = {
  _data: {},
  get(key) { return this._data[key]; },
  set(key, value) {
    this._data[key] = value;
    this.persist();
  },
  async persist() {
    await chrome.storage.local.set({ state: this._data });
  }Aligner-Specific Patterns

### Feature Implementation
All features extend the base `Feature` class in `content/content.js`:
```javascript
class MyFeature extends Feature {
  constructor(container, settings) {
    super(container, settings);
    // Feature-specific initialization
  }

  render() {
    if (!this.container || !this.visible) return;
    this.container.innerHTML = '';
    // Create and append elements
  }

  cleanup() {
    // Remove event listeners, clear resources
  }
}
````

### Settings Management

Settings flow: `service-worker.js` (source of truth) → `chrome.storage.sync` → `content.js` / `popup.js` / `options.js`

Always use messaging:

```javascript
const response = await chrome.runtime.sendMessage({
  type: "updateSettings",
  settings: newSettings,
});
```

### Overlay Isolation

- Root container: `position: fixed; inset: 0; z-index: 2147483647; pointer-events: none`
- Shadow DOM: `this.container.attachShadow({ mode: 'open' })`
- Only toolbar has `pointer-events: auto`

## Current TODO Items

**High Priority**:

1. Create actual icon files (replace placeholder in `assets/icons/`)
2. Implement toolbar dragging functionality
3. Add drag-from-ruler to create guides
4. Implement actual grid rendering (currently placeholder)
5. Complete measurement mode activation/deactivation

**Phase 2** (see `IMPLEMENTATION.md`):

- Grid system (column, baseline, modular)
- Drawing tools (line, rectangle, circle)
- Preset system (save/load configurations)

**See**: `IMPLEMENTATION.md` for full roadmap and testing checklist

## References

- **Quick Commands**: See `QUICK_REFERENCE.md`
- **Architecture Details**: See `PRD.md` and `IMPLEMENTATION.md`
- **User Guide**: See `README.md`

## Remember

- Be precise and thorough. Never leave incomplete implementations.
- Test all code paths, especially error scenarios.
- Follow the style guide religiously - consistency matters.
- Document complex logic with inline comments.
- When debugging, create a systematic plan before making changes.
- Complete all TODOs before marking work as done.
- Test on multiple websites (simple HTML, complex web apps)
- Always check `chrome.runtime.lastError` on every Chrome API callback

## Remember

- Be precise and thorough. Never leave incomplete implementations.
- Test all code paths, especially error scenarios.
- Follow the style guide religiously - consistency matters.
- Document complex logic with inline comments.
- When debugging, create a systematic plan before making changes.
- Complete all TODOs before marking work as done.
