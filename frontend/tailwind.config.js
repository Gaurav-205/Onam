/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'onam-green': '#059669',
        'onam-gold': '#D97706',
        'onam-red': '#DC2626',
        'onam-orange': '#EA580C',
        'onam-yellow': '#EAB308',
        'onam-purple': '#7C3AED',
        'onam-pink': '#EC4899',
      },
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
        'heading': ['Prata', 'serif'],
        'samarkan': ['Samarkan', 'cursive'],
        'elegant': ['Playfair Display', 'serif'],
        'decorative': ['Cinzel', 'serif'],
        'ornate': ['Great Vibes', 'cursive'],
        'script': ['Dancing Script', 'cursive'],
        'malayalam': ['Noto Serif Malayalam', 'serif'],
        'malayalam-sans': ['Noto Sans Malayalam', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'onam-gradient': 'linear-gradient(135deg, #059669 0%, #D97706 50%, #DC2626 100%)',
      }
    },
  },
  plugins: [],
}
