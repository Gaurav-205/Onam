# 🖼️ Image Setup for Shopping Section

## **Required Images**
Place these images in your `public` folder:

### **1. Mundu Image**
- **File**: `mundu-image.jpg`
- **Content**: Traditional white cotton dhoti/mundu
- **Size**: 400x300px or larger
- **Format**: JPG, PNG, or WebP

### **2. Kerala Saree Image**
- **File**: `kerala-saree-image.jpg`
- **Content**: Kerala Kasavu saree with golden borders
- **Size**: 400x300px or larger
- **Format**: JPG, PNG, or WebP

### **3. Sadya Image**
- **File**: `sadya-image.jpg`
- **Content**: Traditional Onam feast on banana leaf
- **Size**: 400x300px or larger
- **Format**: JPG, PNG, or WebP

## **Image Sources**
- **Stock Photos**: Pexels, Unsplash, Pixabay
- **Local Photos**: Take photos of actual items
- **Cultural Images**: Kerala Tourism websites

## **File Structure**
```
public/
├── mundu-image.jpg
├── kerala-saree-image.jpg
├── sadya-image.jpg
└── ... other files
```

## **Current Setup**
- Images are set to display when available
- Fallback to colored icon placeholders
- Responsive design for all screen sizes

## **Customization**
To use different image names, update the `image` property in `Shopping.jsx`:
```jsx
image: "/your-image-name.jpg"
```

---

**Note**: The shopping section will work with or without images. Without images, it shows beautiful colored icon placeholders.
