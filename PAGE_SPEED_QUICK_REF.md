# Page Speed Feature - Quick Reference

## Quick Start

1. **Open Extension**: Click Aligner icon in toolbar
2. **Enable Feature**: Click "Page Speed" button (≉ icon)
3. **Run Audit**: Click "Run Performance Audit" in the sidebar
4. **View Results**: Review metrics, opportunities, and diagnostics

## Feature Overview

### Icon: ≉

### Panel Size: 480px width

### Position: Fixed (top: 80px, right: 20px)

### Tabs: 3 (Metrics, Opportunities, Diagnostics)

## Performance Metrics

### Core Web Vitals

- **FCP** (First Contentful Paint): < 1.8s = Good
- **LCP** (Largest Contentful Paint): < 2.5s = Good
- **TBT** (Total Blocking Time): < 200ms = Good
- **CLS** (Cumulative Layout Shift): < 0.1 = Good
- **SI** (Speed Index): < 3.4s = Good

### Additional Metrics

- **TTI** (Time to Interactive)
- **Max FID** (Max Potential First Input Delay)
- **TTFB** (Time to First Byte)

## Score Interpretation

### 90-100 (Green) ✓

- **Label**: Good
- **Status**: Excellent performance
- **Action**: Maintain current optimization

### 50-89 (Orange) !

- **Label**: Needs Improvement
- **Status**: Moderate performance issues
- **Action**: Review opportunities

### 0-49 (Red) ✗

- **Label**: Poor
- **Status**: Significant performance problems
- **Action**: Immediate optimization needed

## Common Opportunities

1. **Reduce Total Page Size** (> 3MB)

   - Enable compression
   - Minify assets
   - Code splitting

2. **Reduce HTTP Requests** (> 100)

   - Bundle files
   - Use HTTP/2
   - Lazy loading

3. **Improve First Contentful Paint** (> 2.5s)

   - Minimize render-blocking
   - Inline critical CSS
   - Defer JavaScript

4. **Optimize Images** (> 500KB each)

   - Convert to WebP
   - Responsive images
   - Compress quality

5. **Eliminate Render-Blocking Resources**
   - Add defer/async
   - Inline critical JS
   - Dynamic imports

## Common Diagnostics

1. **Slow Server Response** (TTFB > 600ms)

   - Server caching
   - Use CDN
   - Optimize backend

2. **Slow DOM Content Loaded** (> 3s)

   - Reduce DOM size
   - Defer parsing
   - Minimize third-party

3. **Multiple CSS Files** (> 3)

   - Bundle CSS
   - Inline critical
   - Remove unused

4. **Many Third-Party Scripts** (> 5)
   - Defer non-critical
   - Self-host critical
   - Remove unused

## UI Controls

### Header

- **Drag**: Click and drag from header to move panel
- **Minimize**: Click "−" button (creates floating ≉ button)
- **Close**: Click "×" button (removes panel)

### Tabs

- **Metrics**: Performance score and Core Web Vitals
- **Opportunities**: Actionable recommendations with fix plans
- **Diagnostics**: Detailed analysis with solutions

### Accordion Sections

- **Show Fix Plan**: Expands opportunity details
- **Hide Fix Plan**: Collapses details
- **Show Details**: Expands diagnostic details
- **Hide Details**: Collapses details

## Keyboard Shortcuts

None (feature uses click interactions only)

## Settings

### Default Settings

```javascript
{
  enabled: false,
  autoRun: false,
  showMetrics: true,
  showOpportunities: true,
  showDiagnostics: true
}
```

### Profile Templates

- **Designer**: Disabled by default
- **Developer**: Disabled by default
- **Review**: Disabled by default

## Technical Details

### Performance API Used

- `performance.getEntriesByType("navigation")`
- `performance.getEntriesByType("paint")`
- `performance.getEntriesByType("resource")`
- `performance.getEntriesByType("layout-shift")`

### Scoring Algorithm

Lighthouse-compatible weighted scoring:

- FCP: 10%
- LCP: 25%
- TBT: 30%
- CLS: 25%
- SI: 10%

### No External Dependencies

- Uses only native browser APIs
- No CDN or npm packages
- Self-contained implementation

## Troubleshooting

### Issue: Panel doesn't open

**Solution**: Check console for errors, reload page

### Issue: No metrics displayed

**Solution**: Page may not have loaded completely, try refreshing

### Issue: Audit takes too long

**Solution**: Page may have many resources, wait up to 5 seconds

### Issue: Scores seem inaccurate

**Solution**: Audit reflects current page state, refresh for latest data

### Issue: Panel overlaps content

**Solution**: Drag panel to different position

### Issue: Minimized button not visible

**Solution**: Check bottom-right corner (bottom: 230px)

## Files Modified

1. **manifest.json** - Added debugger permission
2. **service-worker.js** - Added pageSpeed settings
3. **popup/popup.html** - Added Page Speed button
4. **content/content.js** - Added PageSpeedFeature class

## Files Created

1. **test-page-speed.html** - Test page
2. **PAGE_SPEED_COMPLETE.md** - Full documentation
3. **PAGE_SPEED_QUICK_REF.md** - This file

## Testing Commands

```bash
# Open test page in browser
open test-page-speed.html

# Reload extension
chrome://extensions/ → Click reload icon

# Check errors
Open DevTools → Console tab
```

## Status

✅ **Implementation**: Complete  
✅ **Testing**: Ready  
✅ **Documentation**: Complete  
✅ **Integration**: No breaking changes

## Support

For issues or questions:

1. Check PAGE_SPEED_COMPLETE.md for detailed docs
2. Review test-page-speed.html for examples
3. Check browser console for errors

---

_Last updated: December 21, 2025_
