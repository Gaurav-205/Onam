# Image Optimization Guide

This guide explains how to optimize images for better performance.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install --save-dev sharp
   ```

2. **Run the optimization script:**
   ```bash
   node scripts/optimize-images.js
   ```

3. **The script will:**
   - Convert all `.jpg`, `.jpeg`, and `.png` images to WebP format
   - Optimize original images (compress them)
   - Create multiple sizes for the logo (for responsive images)

## Manual Optimization

If you prefer to optimize images manually:

### Using Online Tools
- **Squoosh** (https://squoosh.app/) - Free, browser-based image optimizer
- **TinyPNG** (https://tinypng.com/) - Compress PNG and JPEG
- **CloudConvert** (https://cloudconvert.com/) - Convert to WebP

### Using Command Line (with Sharp)

```bash
# Install sharp globally
npm install -g sharp-cli

# Convert single image to WebP
sharp-cli input.jpg -o output.webp -q 85

# Resize and convert
sharp-cli input.jpg -o output.webp -q 85 -w 800
```

### Image Size Guidelines

Based on Lighthouse recommendations:

1. **Logo** (`logo.png`):
   - Current: 500x500px (184.5 KiB)
   - Optimized: 56x56px (for navbar), 112x112px (2x retina)
   - Target: < 10 KiB per size

2. **Product Images** (Shopping, Cart):
   - Current: 736x741px (~100-200 KiB each)
   - Optimized: 400x400px max
   - Target: < 50 KiB per image

3. **Sadya Dish Images**:
   - Current: 736x741px (~100-150 KiB each)
   - Optimized: 40x40px (display size)
   - Target: < 5 KiB per image

4. **Event Images**:
   - Current: Various sizes
   - Optimized: 384x256px max
   - Target: < 50 KiB per image

## WebP Format Benefits

- **30-50% smaller** file sizes compared to JPEG/PNG
- **Better quality** at smaller file sizes
- **Widely supported** by modern browsers (95%+)
- **Automatic fallback** to original format in OptimizedImage component

## Browser Support

WebP is supported in:
- Chrome 23+ (2012)
- Firefox 65+ (2019)
- Safari 14+ (2020)
- Edge 18+ (2018)

The `OptimizedImage` component automatically falls back to the original format for older browsers.

## Performance Impact

Expected improvements:
- **Image download size**: ~1,590 KiB savings (as reported by Lighthouse)
- **LCP improvement**: Faster Largest Contentful Paint
- **Bandwidth savings**: Especially important for mobile users
- **Better SEO**: Faster page loads improve search rankings

## Next Steps

After optimizing images:

1. **Test the changes:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Run Lighthouse again** to verify improvements

3. **Commit both formats:**
   - Keep original `.jpg`/`.png` files for fallback
   - Add `.webp` files for modern browsers
   - Both will be served based on browser support

## Troubleshooting

### Sharp installation fails
- Make sure you have Node.js 14+ installed
- On Windows, you may need Visual Studio Build Tools
- Try: `npm install --save-dev sharp --build-from-source`

### Images not loading
- Check that both `.webp` and original formats exist
- Verify file paths in `OptimizedImage` component
- Check browser console for errors

### File size still large
- Reduce quality setting (currently 85)
- Resize images to actual display dimensions
- Use responsive images with proper `sizes` attribute

