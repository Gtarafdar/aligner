# 📷 Image Features Documentation

## Overview

Aligner now includes comprehensive image manipulation features that rival professional page builders like Elementor. This document covers all image-related functionality.

---

## 🎯 Image Detection

### Automatic Detection

When you select an element using the inspector (Ctrl+Shift+I), Aligner automatically detects if it's an image:

- **IMG tags**: Detected as `<img>` elements
- **Background images**: Detected via CSS `background-image` property

### Visual Indicators

- **Regular elements**: Blue outline (`#3b82f6`)
- **Image elements**: Amber outline (`#f59e0b`)
- **Toast notification**: "📷 Image element selected - Check Image tab!"

### Image Information Display

When an image is selected, the Image tab shows:

- **Source URL**: Full path to the image
- **Dimensions**: Width × Height in pixels
- **Type**: IMG tag or background image

---

## 🖼️ Image Controls Tab

The Image Controls tab is organized into several sections:

### 1. Image Information Section

Displays when an image element is selected:

```html
📷 Image Element Detected ━━━━━━━━━━━━━━━━━━━━━━━━━━ Source:
https://example.com/image.jpg Dimensions: 400 × 300px
```

### 2. Image Upload & Replace

#### Upload Image Button

- **Action**: Opens file picker
- **Accepts**: All image formats (JPG, PNG, GIF, WebP, SVG)
- **Behavior**:
  - For IMG tags: Replaces `src` attribute
  - For background images: Sets as `background-image` CSS
  - Shows preview before applying
  - Converts to data URL (base64)

**Code Example**:

```javascript
// Upload handler
const file = e.target.files[0];
const reader = new FileReader();
reader.onload = (event) => {
  const dataUrl = event.target.result;
  element.src = dataUrl; // For IMG tags
  // OR
  element.style.backgroundImage = `url(${dataUrl})`; // For divs
};
reader.readAsDataURL(file);
```

#### Replace with URL Button

- **Action**: Prompts for image URL
- **Behavior**:
  - Replaces image source with provided URL
  - Works for both IMG tags and background images
  - Updates preview container
  - Applies background-size: cover for backgrounds

**Usage**:

1. Click "🔗 Replace with URL"
2. Enter URL (e.g., `https://picsum.photos/400/300`)
3. Image updates immediately

#### Remove Image Button

- **Action**: Removes image or clears background
- **Behavior**:
  - For IMG tags: Removes element completely (with confirmation)
  - For background images: Sets `background-image: none`
  - Closes inspector panel after removal

---

### 3. Image Preview Container

Shows preview of uploaded/selected images:

- **Hidden by default**: Only shown after upload
- **Max width**: 100%
- **Border radius**: 4px
- **Border**: 1px solid #e5e7eb

---

### 4. Image Manipulation Section

#### Crop Image Button

- **Action**: Applies CSS clip-path crop
- **Method**: Prompts for crop values
- **Format**: `top right bottom left` (e.g., "10px 10px 10px 10px")
- **CSS Applied**: `clip-path: inset(10px 10px 10px 10px)`

**Advanced Crop Example**:

```css
/* 10% from top, 5% from sides */
clip-path: inset(10% 5% 0 5%);

/* Asymmetric crop */
clip-path: inset(0 20px 30px 0);
```

#### Remove Background Button

- **Action**: Applies transparency effect
- **Method**: CSS-based background removal
- **CSS Applied**:
  ```css
  mix-blend-mode: multiply;
  background: transparent;
  ```
- **Note**: Not true background removal, but visual effect
- **Best For**: Images on white backgrounds

#### Flip Horizontal Button

- **Action**: Flips image left-to-right
- **CSS Applied**: `transform: scaleX(-1)`
- **Behavior**: Toggles on/off (click again to flip back)
- **Preserves**: Existing transforms (rotate, scale, etc.)

#### Flip Vertical Button

- **Action**: Flips image top-to-bottom
- **CSS Applied**: `transform: scaleY(-1)`
- **Behavior**: Toggles on/off
- **Preserves**: Existing transforms

---

### 5. Find Images Feature

#### Find Images Button

- **Action**: Scans entire page for all images
- **Detects**:
  - All `<img>` tags
  - Elements with `background-image` CSS
- **Excludes**: Aligner's own UI elements

#### Found Images List

- **Display**: Scrollable list (max-height: 150px)
- **Each item shows**:
  - 40×40px thumbnail
  - Image number (e.g., "Image 1")
  - Dimensions (e.g., "400×300px")
- **Interactions**:
  - Hover: Highlights image on page with blue outline
  - Click: Selects image and opens inspector
- **Summary**: Shows total count at top

**Example Output**:

```
Found 12 images and 3 background images
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[🖼️] Image 1
     400×300px

[🖼️] Image 2
     1920×1080px

[🖼️] Image 3
     200×200px
```

---

### 6. Size Controls

#### Width & Height Inputs

- **Type**: Text input
- **Format**: Any CSS unit (px, %, em, rem, vw, vh)
- **Default**: Current computed width/height
- **Live Update**: Changes applied on blur

**Examples**:

```
Width: 400px
Height: 300px

Width: 100%
Height: auto

Width: 50vw
Height: 75vh
```

#### Size Presets

Six quick-size buttons:

1. **Full Width**: `width: 100%`
2. **Half Width**: `width: 50%`
3. **Small**: `width: 200px`
4. **Medium**: `width: 400px`
5. **Large**: `width: 600px`
6. **Auto**: `width: auto; height: auto`

---

### 7. Object-Fit Controls

Five buttons to control how images fit their containers:

1. **Cover**: `object-fit: cover` - Fills container, may crop
2. **Contain**: `object-fit: contain` - Fits entirely, may letterbox
3. **Fill**: `object-fit: fill` - Stretches to fill
4. **None**: `object-fit: none` - Natural size
5. **Scale Down**: `object-fit: scale-down` - Smaller of none or contain

**Use Cases**:

- **Cover**: Hero images, backgrounds
- **Contain**: Logos, icons (preserve aspect ratio)
- **Fill**: When exact dimensions needed (may distort)
- **None**: Small images, thumbnails
- **Scale Down**: Responsive images that shouldn't upscale

---

### 8. Border Radius Controls

#### Slider Control

- **Range**: 0px to 100px
- **Default**: 0px (no rounding)
- **Live preview**: Updates in real-time

#### Presets

Four quick-shape buttons:

1. **Rounded**: `8px` - Subtle corners
2. **More Rounded**: `16px` - Pronounced corners
3. **Pill**: `50px` - Capsule shape
4. **Circle**: `50%` - Perfect circle (works best on square images)

**Examples**:

```css
/* Rounded corners */
border-radius: 8px;

/* Profile photo */
border-radius: 50%; /* + width: height for perfect circle */

/* Card image */
border-radius: 12px 12px 0 0; /* Rounded top only */
```

---

### 9. Image Filters

Five slider controls for CSS filters:

#### Grayscale (0-100%)

- **0%**: Full color
- **100%**: Black and white
- **CSS**: `filter: grayscale(50%)`

#### Blur (0-20px)

- **0px**: Sharp
- **20px**: Very blurry
- **Use For**: Backgrounds, privacy, artistic effect
- **CSS**: `filter: blur(5px)`

#### Brightness (0-200%)

- **0%**: Completely black
- **100%**: Normal
- **200%**: Very bright
- **CSS**: `filter: brightness(120%)`

#### Contrast (0-200%)

- **0%**: Flat gray
- **100%**: Normal
- **200%**: High contrast
- **CSS**: `filter: contrast(150%)`

#### Sepia (0-100%)

- **0%**: No effect
- **100%**: Full sepia (vintage look)
- **CSS**: `filter: sepia(80%)`

**Combining Filters**:

```css
/* Instagram-like vintage effect */
filter: sepia(40%) contrast(120%) brightness(110%);

/* Soft focus background */
filter: blur(10px) brightness(90%);

/* High contrast B&W */
filter: grayscale(100%) contrast(150%);
```

---

### 10. Clip-Path Shapes

Eight preset shape buttons:

1. **Circle**: Perfect circle

   ```css
   clip-path: circle(50% at center);
   ```

2. **Ellipse**: Oval shape

   ```css
   clip-path: ellipse(50% 40% at center);
   ```

3. **Triangle**: Upward pointing triangle

   ```css
   clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
   ```

4. **Octagon**: Eight-sided shape

   ```css
   clip-path: polygon(
     30% 0%,
     70% 0%,
     100% 30%,
     100% 70%,
     70% 100%,
     30% 100%,
     0% 70%,
     0% 30%
   );
   ```

5. **Star**: Five-pointed star

   ```css
   clip-path: polygon(
     50% 0%,
     61% 35%,
     98% 35%,
     68% 57%,
     79% 91%,
     50% 70%,
     21% 91%,
     32% 57%,
     2% 35%,
     39% 35%
   );
   ```

6. **Hexagon**: Six-sided shape

   ```css
   clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
   ```

7. **Speech Bubble**: Dialog bubble shape

   ```css
   clip-path: polygon(
     0% 0%,
     100% 0%,
     100% 75%,
     75% 75%,
     75% 100%,
     50% 75%,
     0% 75%
   );
   ```

8. **None**: Remove all clipping
   ```css
   clip-path: none;
   ```

**Use Cases**:

- **Circle/Ellipse**: Profile photos, avatars
- **Triangle**: Directional indicators, logos
- **Hexagon**: Modern design elements
- **Star**: Ratings, badges, highlights
- **Speech Bubble**: Testimonials, quotes

---

## 🔄 Workflow Examples

### Example 1: Upload Custom Product Image

1. Activate inspector (Ctrl+Shift+I)
2. Click on product image (amber outline appears)
3. Go to Image tab
4. Click "📤 Upload Image"
5. Select file from computer
6. Image preview appears
7. Image is replaced immediately
8. Adjust size/filters as needed

### Example 2: Create Circular Profile Photo

1. Select image element
2. Go to Image tab
3. Set size to square (e.g., 200×200px)
4. Click "Circle" in Border Radius section
5. Optionally add border with Effects tab
6. Copy CSS to reuse elsewhere

### Example 3: Apply Vintage Filter Effect

1. Select image
2. Go to Image tab
3. Adjust sliders:
   - Sepia: 60%
   - Contrast: 120%
   - Brightness: 110%
4. Optionally add slight blur (2px) for softness
5. Copy CSS for consistent styling

### Example 4: Find and Replace All Images

1. Click "🔍 Find Images on Page"
2. Review list of all images (12 found)
3. Hover over each to see on page
4. Click to select specific image
5. Use "Replace with URL" for batch replacement
6. Copy CSS patterns to apply to others

### Example 5: Crop and Flip Image

1. Select image with unwanted edges
2. Click "✂️ Crop Image"
3. Enter values: "20px 10px 20px 10px"
4. Image crops from edges
5. Click "↔️ Flip Horizontal" if needed
6. Adjust filters for final touch

---

## 🎨 Advanced Techniques

### Combining Effects

Stack multiple effects for professional results:

```css
/* Hero image overlay effect */
filter: brightness(70%) contrast(110%);
mix-blend-mode: multiply;
```

```css
/* Frosted glass background */
filter: blur(10px) brightness(120%);
backdrop-filter: blur(5px);
```

```css
/* Artistic portrait */
filter: grayscale(30%) sepia(20%) contrast(120%);
clip-path: circle(45% at center);
border-radius: 50%;
```

### Custom Clip-Path Shapes

Use the browser console to apply custom shapes:

```javascript
element.style.clipPath = "polygon(0 0, 100% 0, 90% 100%, 10% 100%)"; // Trapezoid
element.style.clipPath = "circle(60% at 70% 30%)"; // Off-center circle
element.style.clipPath = "ellipse(100% 75% at 50% 50%)"; // Wide ellipse
```

### Responsive Image Sizing

Combine with viewport units:

```css
/* Responsive hero */
width: 100vw;
height: 60vh;
object-fit: cover;
```

```css
/* Adaptive card image */
width: clamp(200px, 50vw, 400px);
height: auto;
```

---

## 🐛 Troubleshooting

### Issue: Image doesn't show amber outline

**Solution**:

- Ensure element is actually an `<img>` tag or has `background-image` CSS
- Check if element is hidden by Aligner's own overlay
- Refresh inspector (close and reopen)

### Issue: Upload doesn't work

**Solution**:

- Check file size (browser may have limits)
- Ensure file is valid image format
- Check browser console for errors
- Try smaller image or different format

### Issue: Crop values not working

**Solution**:

- Use correct format: "top right bottom left"
- Include units: "10px 10px 10px 10px"
- Check if element already has clip-path
- Use browser DevTools to debug

### Issue: Background removal doesn't work well

**Solution**:

- This is CSS-based, not true background removal
- Works best on white/light backgrounds
- Try adjusting mix-blend-mode values
- Consider using external tool for true transparency

### Issue: Find Images shows too many

**Solution**:

- Extension filters out its own UI elements
- Background images on every div will be detected
- Use the list to identify specific images
- Refine selection by clicking thumbnails

---

## 🔧 Technical Details

### File Upload Process

```javascript
1. User clicks "Upload Image" button
2. Hidden file input (<input type="file">) is triggered
3. User selects image file
4. FileReader API reads file as data URL
5. Data URL (base64) is set as image source
6. Preview container displays result
7. Toast notification confirms success
```

### Image Detection Algorithm

```javascript
function isImageElement(element) {
  const isImg = element.tagName.toLowerCase() === "img";
  const hasBgImage =
    window.getComputedStyle(element).backgroundImage !== "none";
  return isImg || hasBgImage;
}
```

### Flip Transform Logic

```javascript
// Preserve existing transforms
const currentTransform = element.style.transform || "";

// Toggle horizontal flip
if (currentTransform.includes("scaleX(-1)")) {
  element.style.transform = currentTransform.replace("scaleX(-1)", "scaleX(1)");
} else {
  element.style.transform = currentTransform + " scaleX(-1)";
}
```

### Find Images Scanner

```javascript
// Find IMG tags
const allImages = document.querySelectorAll("img");

// Find background images
const bgImages = [];
document.querySelectorAll("*").forEach((el) => {
  const bgImg = window.getComputedStyle(el).backgroundImage;
  if (bgImg && bgImg !== "none" && !isOwnElement(el)) {
    bgImages.push(el);
  }
});
```

---

## 📊 Feature Comparison

| Feature            | Aligner         | Elementor    | Webflow       |
| ------------------ | --------------- | ------------ | ------------- |
| Upload Image       | ✅              | ✅           | ✅            |
| Replace from URL   | ✅              | ✅           | ✅            |
| Find All Images    | ✅              | ❌           | ❌            |
| CSS Filters        | ✅ (5 types)    | ✅ (8 types) | ✅ (10 types) |
| Clip-Path Shapes   | ✅ (8 shapes)   | ❌           | ✅ (5 shapes) |
| Flip H/V           | ✅              | ✅           | ✅            |
| Crop Tool          | ✅ (CSS-based)  | ✅ (Visual)  | ✅ (Visual)   |
| Background Removal | ✅ (CSS effect) | ❌           | ❌            |
| Object-Fit Control | ✅ (5 modes)    | ✅           | ✅            |
| Border Radius      | ✅              | ✅           | ✅            |
| Copy CSS/HTML      | ✅              | ✅           | ✅            |
| Free to Use        | ✅              | ❌           | ❌            |

---

## 🚀 Future Enhancements

Potential features for future versions:

1. **Visual Crop Tool**: Drag-and-drop crop interface
2. **True Background Removal**: Integration with AI services
3. **Image Optimization**: Compress and resize images
4. **Lazy Loading**: Add lazy loading attributes
5. **Srcset Generator**: Create responsive image sets
6. **Alt Text Editor**: Edit alt attributes for accessibility
7. **Image Effects Library**: Pre-built effect combinations
8. **Undo/Redo**: Track image manipulation history
9. **Export Presets**: Save and share filter combinations
10. **Batch Operations**: Apply same edits to multiple images

---

## 📚 Related Documentation

- [Inspector Guide](INSPECTOR_GUIDE.md) - Full inspector features
- [Quick Reference](QUICK_REFERENCE.md) - Keyboard shortcuts
- [Testing Guide](TESTING_GUIDE.md) - How to test features
- [Implementation](IMPLEMENTATION.md) - Technical architecture

---

## 💡 Pro Tips

1. **Use Find Images first** on complex pages to locate all images quickly
2. **Combine filters** for unique artistic effects (sepia + contrast + brightness)
3. **Test clip-paths on different aspect ratios** to see which shapes work best
4. **Save effective filter combinations** by copying CSS
5. **Use object-fit: cover** for hero images to prevent distortion
6. **Apply circular clip-path + border-radius: 50%** for perfect profile photos
7. **Flip horizontally** to mirror directional graphics
8. **Use slight blur (2-3px)** on backgrounds for depth effect
9. **Copy HTML+CSS** to preserve exact styling when moving images
10. **Reset inline styles** if experimenting goes wrong

---

**Version**: 1.0  
**Last Updated**: 2024  
**License**: MIT
