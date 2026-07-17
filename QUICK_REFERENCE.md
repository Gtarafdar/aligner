# Aligner Development - Quick Reference

## [Quick Start Commands]

```bash
# Load extension
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this directory

# Reload after changes
chrome://extensions/ → Click reload icon

# Debug service worker
chrome://extensions/ → Inspect views: service worker

# Debug content script
Right-click page → Inspect → Console
```

## [Key Files]

| File                   | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `manifest.json`        | Extension config, permissions, commands |
| `service-worker.js`    | State management, messaging hub         |
| `content/content.js`   | Main overlay system, all features       |
| `popup/popup.html`     | Quick toggle UI                         |
| `options/options.html` | Full settings page                      |

## [Design System]

### Colors

```css
Primary:   #2563eb (blue-600)
Secondary: #10b981 (green-500)
Accent:    #f59e0b (amber-500)
Gray-500:  #6b7280
Gray-800:  #1f2937
Gray-50:   #f9fafb
Success:   #22c55e
Warning:   #f59e0b
Error:     #ef4444
```

### Typography

```css
Font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
Sizes: 12px (small), 14px (body), 16px (header), 20px (title)
Weights: 400 (regular), 500 (medium), 600 (semibold)
```

## [Common Patterns]

### Chrome API Call with Error Handling

```javascript
chrome.storage.sync.get(["settings"], (result) => {
  if (chrome.runtime.lastError) {
    console.error("Error:", chrome.runtime.lastError);
    return;
  }
  // Use result
});
```

### Async Messaging

```javascript
chrome.runtime.sendMessage({ type: "getData" }, (response) => {
  if (chrome.runtime.lastError) {
    console.error("Message error:", chrome.runtime.lastError);
    return;
  }
  // Use response
});
```

### Throttled Event Handler

```javascript
let lastCall = 0;
const throttleMs = 16; // ~60fps

element.addEventListener("mousemove", (e) => {
  const now = Date.now();
  if (now - lastCall < throttleMs) return;
  lastCall = now;

  requestAnimationFrame(() => {
    // Handle event
  });
});
```

### Feature Class Template

```javascript
class MyFeature extends Feature {
  constructor(container, settings) {
    super(container, settings);
    // Initialize
  }

  render() {
    if (!this.container || !this.visible) return;

    // Clear and re-render
    this.container.innerHTML = "";

    // Create elements
    const element = document.createElement("div");
    element.style.cssText = `
      /* styles */
    `;

    this.container.appendChild(element);
  }

  cleanup() {
    // Remove event listeners, clear resources
  }
}
```

## [Critical Rules]

### DO

- [x] Check `chrome.runtime.lastError` on every callback
- [x] Wrap async operations in try-catch
- [x] Use `pointer-events: none` on overlay
- [x] Isolate styles with Shadow DOM
- [x] Throttle mouse events
- [x] Use `requestAnimationFrame` for drawing
- [x] Clean up event listeners on disable
- [x] Validate all user inputs
- [x] Test on multiple sites

### DON'T

- [ ] Leave TODO comments without implementation
- [ ] Mutate page DOM without explicit feature
- [ ] Assume settings exist (use defaults)
- [ ] Block page interactions
- [ ] Use purple gradients (design rule)
- [ ] Skip error handling
- [ ] Create memory leaks
- [ ] Use external CDNs (bundle if needed)

## [Debugging Checklist]

**Extension not loading?**

- Check manifest.json syntax
- Look for errors in extension page
- Verify all file paths exist

**Content script not injecting?**

- Check matches pattern in manifest
- Reload page after enabling extension
- Check host permissions

**Features not appearing?**

- Verify master toggle is ON
- Check feature-specific toggle
- Look for console errors
- Verify Shadow DOM created

**Settings not saving?**

- Check service worker console
- Verify storage quota not exceeded
- Check for chrome.runtime.lastError

**Performance issues?**

- Throttle event handlers
- Use requestAnimationFrame
- Remove unnecessary DOM nodes
- Check for memory leaks

## 📊 Testing Protocol

1. **Fresh Install Test**

   - Load extension on clean profile
   - Verify default settings
   - Test each feature individually

2. **Cross-Site Test**

   - Simple HTML page
   - Complex web app (Gmail, Twitter)
   - Site with strict CSP
   - http:// and https://

3. **Feature Combination Test**

   - Enable all features at once
   - Toggle features on/off rapidly
   - Check for conflicts

4. **Error Scenario Test**

   - Disconnect internet (no impact)
   - Fill storage quota
   - Invalid settings values
   - Page reload during use

5. **Performance Test**
   - Large pages (1000+ elements)
   - Rapid mouse movement
   - Multiple measurements
   - Memory usage over time

## [Current Phase Status]

### Phase 1 (MVP) - [80% Complete]

- [x] Core architecture
- [x] Basic features
- [ ] Polish and bug fixes
- [ ] Icon creation
- [ ] Toolbar dragging

### Phase 2 (Next) - Planning

- [ ] Grid system rendering
- [ ] Drawing tools
- [ ] Preset system

### Phase 3 (Future)

- [ ] Responsive overlay
- [ ] Inspect-lite

### Phase 4 (Optional)

- [ ] Device emulation
- [ ] Accessibility helpers

## 📝 Before Each Commit

- [ ] No console errors
- [ ] All features work independently
- [ ] Settings save/load correctly
- [ ] Code follows style guide
- [ ] Error handling in place
- [ ] No TODOs without implementation
- [ ] Test on at least 3 different sites
- [ ] Update IMPLEMENTATION.md if needed

## [Quick Links]

- **Extensions Page**: `chrome://extensions/`
- **Service Worker Internals**: `chrome://serviceworker-internals/`
- **Shortcuts Config**: `chrome://extensions/shortcuts`
- **PRD**: `PRD.md`
- **Implementation Guide**: `IMPLEMENTATION.md`
- **Copilot Instructions**: `.github/copilot-instructions.md`

---

**Remember**: Be precise, thorough, and complete. No fake code, always handle errors, follow the style guide.
