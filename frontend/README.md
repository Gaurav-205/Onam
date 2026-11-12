# Onam Festival Website

A beautiful, responsive one-page website celebrating the Onam festival - Kerala's National Festival of Tradition & Culture.

## 🎉 About Onam

Onam is a nostalgia that brings back memories from childhood and the simple ways of life that prevailed in the villages back in the day. It is the celebration of the myth of Mahabali – the demon king who once ruled the land and is believed to visit his old subjects every year around this time.

## ✨ Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Scrolling**: Interactive navigation with smooth scroll to sections
- **Modern UI**: Beautiful gradients and animations inspired by Kerala's vibrant culture
- **Interactive Elements**: Hover effects, floating animations, and smooth transitions
- **Comprehensive Content**: Covers all aspects of Onam festival

## 🚀 Sections

1. **Hero Section** - Main introduction with animated floating elements
2. **History** - The legend of Mahabali and Onam's origins
3. **Boat Races** - Vallam Kali and traditional boat competitions
4. **Shopping** - Onam shopping traditions and items
5. **Sadya** - Traditional Onam feast with 12+ dishes
6. **Games** - Traditional Onam games and cultural activities
7. **Festivals** - 10-day Onam celebration calendar
8. **Rituals** - Pookalam, Athachamayam, and other traditions
9. **Gallery** - Visual showcase of Onam celebrations
10. **Footer** - Contact information and quick links

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3
- **Fonts**: Inter (Google Fonts)
- **Icons**: Emoji icons for visual appeal

## 🎨 Design Features

- **Color Palette**: Inspired by Onam's vibrant colors (green, gold, red, orange, yellow)
- **Typography**: Clean, modern Inter font family
- **Animations**: Floating elements, hover effects, and smooth transitions
- **Gradients**: Beautiful color gradients representing Kerala's diversity
- **Cards**: Interactive card components with hover animations

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_UPI_ID=your-upi-id@ybl
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🌐 Production Deployment

### Vercel Deployment

The frontend is configured for Vercel deployment (`vercel.json`, project root directory `frontend`):

1. **Build Settings:**
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Environment Variables (in Vercel project settings):**
   ```env
   VITE_API_BASE_URL=https://onam-vaot.onrender.com/api
   ```

3. **Deployed URLs:**
   - Frontend: https://onam-bice.vercel.app
   - Backend API: https://onam-vaot.onrender.com

**Note:** The UPI ID is fetched from the backend API, so no need to set `VITE_UPI_ID` in production.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎯 Customization

### Colors
The website uses custom Tailwind colors defined in `tailwind.config.js`:
- `onam-green`: #059669
- `onam-gold`: #D97706
- `onam-red`: #DC2626
- `onam-orange`: #EA580C
- `onam-yellow`: #EAB308

### Components
Custom CSS components are defined in `src/index.css`:
- `.btn-primary` - Primary button styling
- `.btn-secondary` - Secondary button styling
- `.card` - Card component styling
- `.section-padding` - Section spacing utility

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global styles and Tailwind imports
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## 🌟 Inspiration

This website is inspired by the official [Kerala Tourism Onam page](https://www.keralatourism.org/onam/) and celebrates the rich cultural heritage of Kerala's most important festival.

## 📄 License

This project is created for educational and demonstration purposes.

## 🤝 Contributing

Feel free to contribute to improve the website with:
- Additional sections
- Enhanced animations
- Better accessibility
- Performance optimizations
- Content improvements

## 📞 Contact

For any questions or suggestions, please reach out to the development team.

---

**Happy Onam! 🎉🌸**
*Celebrating Kerala's Tradition & Culture*
