# JavaScript Blocking - Quick Reference

## 🔧 What Was Fixed

### ✅ Issue 1: Duplicate Toasts

**Before**: JavaScript enable/disable showed 2 identical toasts  
**After**: Only 1 toast appears (silent parameter prevents duplicates)

### ✅ Issue 2: JavaScript Not Restoring

**Before**: Reset All didn't remove blocking rules, JS stayed blocked  
**After**: Proper rule removal via chrome.runtime.sendMessage

---

## 🧪 Quick Test

1. Open [test-page-controls-js-blocking.html](test-page-controls-js-blocking.html)
2. Open Page Controls → Check "Disable JavaScript" → Apply → Reload
3. **Verify**: External script shows 🔴 BLOCKED
4. **Verify**: Only 1 toast notification
5. Uncheck "Disable JavaScript" → Apply → Reload
6. **Verify**: External script shows 🟢 WORKING
7. **Verify**: Only 1 toast notification
8. Re-enable blocking → Click "Reset All" → Reload
9. **Verify**: Everything works, no blocking active

---

## 📋 Expected Behavior

### When Enabled

- Network requests for `*.js`, `*.mjs`, `*.jsx` blocked
- External scripts fail with `onerror`
- Inline scripts continue working (already in HTML)
- Toast: "⚡ JavaScript blocking enabled - reload required"

### When Disabled/Reset

- Session rules removed from `declarativeNetRequest`
- External scripts load normally
- Toast: "⚡ JavaScript unblocked - reload to restore"

---

## 🐛 If Something Breaks

### Check Service Worker Console

```
chrome://extensions → Aligner → Service worker: Inspect
```

Look for: `[Aligner] JavaScript unblocked for tab X`

### Verify Rules Removed

```javascript
chrome.declarativeNetRequest.getSessionRules((rules) => console.log(rules));
```

Should be empty when disabled/reset

### Common Issues

- **Rules persist**: Make sure `unblockJavaScript` message is sent
- **Duplicate toasts**: Check `silent` parameter is `true` in `applyControls()`
- **No reload prompt**: Verify `!silent` checks in enable/disable methods

---

## 📝 Implementation Notes

### Silent Parameter Flow

```
User clicks Apply → showNotifications = true
→ applyControls(showNotifications = true)
→ enableJavaScriptBlocking(silent = !showNotifications)
→ silent = false → shows toast ✅

Page loads → showNotifications = false
→ applyControls(showNotifications = false)
→ enableJavaScriptBlocking(silent = !showNotifications)
→ silent = true → NO toast ✅
```

### Reset Flow

```
User clicks Reset All
→ resetAllControls()
→ if (originalState.javascriptBlocked)
→ chrome.runtime.sendMessage({ type: "unblockJavaScript" })
→ handleUnblockJavaScript(tabId)
→ updateSessionRules({ removeRuleIds: [...] })
→ javascriptBlockedTabs.delete(tabId)
→ originalState.javascriptBlocked = false ✅
```

---

## ✅ All Systems Go

- [x] No syntax errors
- [x] Silent parameter working
- [x] Reset properly unblocks JavaScript
- [x] Service worker handlers verified
- [x] Test page created
- [x] Documentation complete

**Ready for production testing!** 🚀
