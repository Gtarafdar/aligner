# Lottie Scraping - Testing Checklist

## 🧪 Pre-Testing Setup

- [ ] Chrome browser (v120+)
- [ ] Extension loaded in `chrome://extensions`
- [ ] Developer mode enabled
- [ ] Extension shows no errors in service worker console

---

## ✅ Test 1: Extension Loading

**Steps:**

1. Navigate to `chrome://extensions`
2. Click "Load unpacked"
3. Select "Web design toolbox" folder
4. Check extension appears with no errors

**Expected Result:**

- ✅ Aligner extension loaded
- ✅ Version shows 1.1.0
- ✅ No errors in console
- ✅ Icon appears in toolbar

**Status:** [ ] PASS [ ] FAIL

**Notes:**

---

---

## ✅ Test 2: Basic Activation

**Steps:**

1. Open any webpage
2. Press `Ctrl+Shift+M` (or click extension icon)
3. Click "Media Manager" button in toolbar

**Expected Result:**

- ✅ Toolbar appears
- ✅ Media Manager panel opens
- ✅ Tabs visible (Images, SVG, Video, etc.)
- ✅ Lottie tab present

**Status:** [ ] PASS [ ] FAIL

**Notes:**

---

---

## ✅ Test 3: Layer 1 - DOM Detection

**Steps:**

1. Open `test-lottie-complete.html`
2. Open Media Manager
3. Click "Lottie" tab
4. Look for first animation (lottie-player)

**Expected Result:**

- ✅ Animation appears immediately (no button click needed)
- ✅ Type badge shows "lottie-player"
- ✅ URL shown: `https://assets3.lottiefiles.com/...`
- ✅ Preview shows 🎨 emoji

**Status:** [ ] PASS [ ] FAIL

**Screenshot/Notes:**

---

---

## ✅ Test 4: Layer 2 - Inline JSON Detection

**Steps:**

1. Same page as Test 3
2. Scroll in Media Manager
3. Look for second animation (Inline Test Animation)

**Expected Result:**

- ✅ Animation appears immediately
- ✅ Type badge shows "inline"
- ✅ Shows "Inline JSON animation" as description
- ✅ Metadata shows version and layer count (e.g., "v5.7.4 · 1 layers")

**Status:** [ ] PASS [ ] FAIL

**Screenshot/Notes:**

---

---

## ✅ Test 5: Layer 3 - Fetch Hook

**Steps:**

1. Same page as Test 3
2. Click button: "Load Animation via Fetch"
3. Wait 2 seconds
4. Check if new animation appears in list

**Expected Result:**

- ✅ Button click triggers fetch
- ✅ Animation appears in Media Manager
- ✅ Type badge shows "network"
- ✅ URL shown: `https://assets9.lottiefiles.com/...`

**Status:** [ ] PASS [ ] FAIL

**Notes:**

---

---

## ✅ Test 6: Layer 3b - XHR Hook

**Steps:**

1. Same page as Test 3
2. Click button: "Load Animation via XHR"
3. Wait 2 seconds
4. Check if new animation appears in list

**Expected Result:**

- ✅ Button click triggers XHR
- ✅ Animation appears in Media Manager
- ✅ Type badge shows "network"
- ✅ URL shown: `https://assets10.lottiefiles.com/...`

**Status:** [ ] PASS [ ] FAIL

**Notes:**

---

---

## ✅ Test 7: Layer 4 - API Hook

**Steps:**

1. Same page as Test 3
2. Click button: "Load Animation via API"
3. Wait 2 seconds
4. Check if animation appears in list

**Expected Result:**

- ✅ Button click triggers lottie.loadAnimation()
- ✅ Animation appears in Media Manager
- ✅ Type badge shows "api" or "network"
- ✅ URL shown: `https://assets2.lottiefiles.com/...`

**Status:** [ ] PASS [ ] FAIL

**Notes:**

---

---

## ✅ Test 8: Deduplication

**Steps:**

1. Same page with all animations loaded
2. Click "Refresh" button in Media Manager toolbar
3. Count animations before and after

**Expected Result:**

- ✅ Same count before and after refresh
- ✅ No duplicate entries
- ✅ All animations still present

**Status:** [ ] PASS [ ] FAIL

**Count Before:** **\_**  
**Count After:** **\_**

---

## ✅ Test 9: Copy URL Action

**Steps:**

1. Find any animation with URL (Layer 1, 3, or 4)
2. Click 📋 "Copy URL" button
3. Paste in notepad/text editor

**Expected Result:**

- ✅ Toast notification: "📋 URL copied to clipboard!"
- ✅ URL is valid Lottie JSON endpoint
- ✅ URL starts with `https://`

**Copied URL:**

---

**Status:** [ ] PASS [ ] FAIL

---

## ✅ Test 10: Copy JSON Action

**Steps:**

1. Find inline animation (Layer 2)
2. Click 📄 "Copy JSON" button
3. Paste in text editor
4. Validate JSON (use jsonlint.com)

**Expected Result:**

- ✅ Toast notification: "📄 JSON copied to clipboard!"
- ✅ Valid JSON structure
- ✅ Has required fields: v, fr, layers

**Status:** [ ] PASS [ ] FAIL

**JSON Valid:** [ ] YES [ ] NO

---

## ✅ Test 11: Download Action

**Steps:**

1. Find any animation
2. Click ⬇️ "Download" button
3. Check Downloads folder

**Expected Result:**

- ✅ Toast notification: "⬇️ Download started!"
- ✅ File downloads successfully
- ✅ Filename: `lottie-animation.json` or URL-based
- ✅ File is valid JSON

**Status:** [ ] PASS [ ] FAIL

**File Size:** **\_** KB

---

## ✅ Test 12: Real Website Test (lottiefiles.com)

**Steps:**

1. Navigate to https://lottiefiles.com
2. Open Media Manager
3. Click Lottie tab
4. Browse the page (scroll, click animations)
5. Check detected animations

**Expected Result:**

- ✅ Multiple Lottie animations detected
- ✅ Animations appear as you interact
- ✅ No console errors
- ✅ Download works

**Status:** [ ] PASS [ ] FAIL

**Count Detected:** **\_**

---

## ✅ Test 13: Real Website Test (CodePen)

**Steps:**

1. Navigate to https://codepen.io/search/pens?q=lottie
2. Click on any Lottie animation pen
3. Open Media Manager
4. Check Lottie tab

**Expected Result:**

- ✅ Animation detected
- ✅ Correct type badge
- ✅ Actions work (copy, download)

**Status:** [ ] PASS [ ] FAIL

**Pen URL:**

---

---

## ✅ Test 14: Console Errors Check

**Steps:**

1. Open DevTools (F12)
2. Go to Console tab
3. Perform tests 1-13
4. Check for any errors

**Expected Result:**

- ✅ No errors in console
- ✅ No warnings related to Aligner
- ✅ postMessage events visible (if verbose logging enabled)

**Status:** [ ] PASS [ ] FAIL

**Errors Found:**

---

---

## ✅ Test 15: Memory/Performance Check

**Steps:**

1. Open DevTools > Performance tab
2. Start recording
3. Open Media Manager
4. Click Lottie tab
5. Load all test animations
6. Stop recording
7. Check performance metrics

**Expected Result:**

- ✅ No memory leaks
- ✅ Smooth UI interactions
- ✅ Hooks add <5ms overhead per fetch

**Status:** [ ] PASS [ ] FAIL

**Notes:**

---

---

## ✅ Test 16: Feature Toggle

**Steps:**

1. Open Media Manager
2. Close it (X button or Ctrl+Shift+M)
3. Open DevTools
4. Check `window.__alignerLottieCache`
5. Re-open Media Manager

**Expected Result:**

- ✅ Cache persists between open/close
- ✅ No errors on re-open
- ✅ Hooks still functional

**Status:** [ ] PASS [ ] FAIL

---

## ✅ Test 17: Edge Cases

### Empty Page

- [ ] Open blank page (about:blank)
- [ ] Open Media Manager
- [ ] Expected: No crashes, shows "No Lottie animations found"

### Page Without Lottie

- [ ] Open simple HTML page (no Lottie)
- [ ] Open Media Manager
- [ ] Expected: Empty Lottie tab, no errors

### Invalid JSON

- [ ] Page returns invalid JSON
- [ ] Expected: Gracefully ignored (validation prevents)

**Status:** [ ] PASS [ ] FAIL

---

## 📊 Final Results

**Total Tests:** 17  
**Passed:** **\_** / 17  
**Failed:** **\_** / 17  
**Success Rate:** **\_** %

---

## 🐛 Issues Found

| Test # | Issue Description | Severity | Notes |
| ------ | ----------------- | -------- | ----- |
|        |                   |          |       |
|        |                   |          |       |
|        |                   |          |       |

**Severity Levels:**

- 🔴 **Critical** - Feature broken, blocks usage
- 🟠 **High** - Major functionality affected
- 🟡 **Medium** - Minor functionality affected
- 🟢 **Low** - Cosmetic or edge case

---

## ✅ Sign-Off

**Tester Name:** **********\_\_\_**********  
**Date:** **********\_\_\_**********  
**Chrome Version:** **********\_\_\_**********  
**OS:** **********\_\_\_**********

**Overall Status:**

- [ ] ✅ APPROVED - Ready for production
- [ ] ⚠️ CONDITIONAL - Minor issues, can proceed with fixes
- [ ] ❌ REJECTED - Critical issues, requires fixes

**Comments:**

---

---

---

---

## 📝 Next Steps

If all tests pass:

1. Update STATUS.md with test results
2. Tag version 1.1.0 in git
3. Consider publishing to Chrome Web Store
4. Plan Phase 2 enhancements

If issues found:

1. Document in GitHub issues
2. Prioritize by severity
3. Fix and retest
4. Update version to 1.1.1

---

**Test File:** `test-lottie-complete.html`  
**Documentation:** `LOTTIE_IMPLEMENTATION.md`, `LOTTIE_COMPLETE.md`  
**Version:** 1.1.0
