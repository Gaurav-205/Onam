# Video Background Setup for Onam Festival Website

## 🎥 Adding Video Background

To add a video background to your Onam festival website, follow these steps:

### 1. Video Requirements
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD) or higher
- **Duration**: 10-30 seconds (will loop automatically)
- **File Size**: Keep under 10MB for optimal performance

### 2. Video Content Suggestions
For an authentic Onam experience, consider videos featuring:
- **Pookalam creation** - Hands arranging flowers
- **Kerala landscapes** - Backwaters, coconut trees, tea gardens
- **Traditional dance** - Kathakali, Mohiniyattam
- **Boat races** - Vallam Kali scenes
- **Festival celebrations** - Colorful Onam festivities

### 3. File Placement
Place your video file in the `public` folder:
```
public/
├── onam-background.mp4    # Your video file
└── onam-poster.jpg        # Thumbnail image (optional)
```

### 4. Video Optimization Tips
- **Compress**: Use tools like HandBrake or FFmpeg
- **Trim**: Keep only the best 10-15 seconds
- **Loop**: Ensure the video ends smoothly to loop seamlessly
- **Mobile**: Consider creating a lower resolution version for mobile devices

### 5. Fallback
The website automatically falls back to a beautiful gradient background if:
- Video file is missing
- Browser doesn't support video
- Video fails to load

### 6. Performance Considerations
- **Lazy Loading**: Video only loads when needed
- **Muted**: Video is muted by default for better user experience
- **Responsive**: Video scales appropriately on all devices

## 🎬 Sample Video Sources
- **Stock Footage**: Sites like Pexels, Pixabay, or Unsplash
- **Local Content**: Record your own Onam celebrations
- **Cultural Videos**: Kerala Tourism official content

## 🔧 Customization
To change the video source, edit `src/components/Hero.jsx`:
```jsx
<source src="/your-video-name.mp4" type="video/mp4" />
```

## 📱 Mobile Considerations
- Mobile devices may have different video support
- Consider using a static image for very slow connections
- Test on various devices and network conditions

---

**Note**: The video background creates an immersive experience similar to the Kerala Tourism website, making your Onam festival website truly authentic and engaging!
