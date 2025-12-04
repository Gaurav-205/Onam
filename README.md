# Onam Festival Website

A full-stack web application for the Onam Festival celebration at MIT ADT University, featuring event registration, traditional shopping, and cultural information. Built with React, Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Features
- ✅ **Event Registration**: Students can register for Onam events with order management
- ✅ **Shopping Cart**: Traditional Onam shopping items with cart functionality
- ✅ **Email Confirmation**: Automated email confirmations for registrations
- ✅ **Responsive Design**: Fully responsive design optimized for all devices
- ✅ **Performance Optimized**: Lighthouse score 95+ with optimized images and code splitting
- ✅ **Accessibility**: WCAG 2.1 compliant with ARIA labels and keyboard navigation

### Technical Features
- ✅ **Error Boundaries**: Graceful error handling with React Error Boundaries
- ✅ **Skeleton Loaders**: Loading states for better UX
- ✅ **Rate Limiting**: API rate limiting to prevent abuse
- ✅ **Input Validation**: Comprehensive client and server-side validation
- ✅ **Security Headers**: Production-ready security headers
- ✅ **Code Splitting**: Lazy loading for optimal performance
- ✅ **Image Optimization**: WebP support and responsive images
- ✅ **Video Optimization**: Optimized video loading with fallbacks

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM 7** - Client-side routing
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 3** - Utility-first CSS framework
- **Context API** - State management
- **Vitest** - Unit testing framework

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js 4** - Web framework
- **MongoDB** - Database
- **Mongoose 8** - ODM for MongoDB
- **Nodemailer 7** - Email service
- **Express Validator** - Input validation
- **Express Rate Limit** - Rate limiting middleware

### Deployment
- **Netlify** - Frontend hosting
- **Render/Vercel/Railway** - Backend hosting options
- **MongoDB Atlas** - Cloud database option

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0.0 or higher (required for Vite 7 and React Router 7)
- **npm** 10.0.0 or higher (or **yarn** 1.22.0+)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control

### Verify Installation

```bash
node --version  # Should be v20.0.0 or higher
npm --version   # Should be v10.0.0 or higher
mongod --version  # If using local MongoDB
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Onam
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env  # If .env.example exists, or create manually
```

Edit `.env` with your configuration (see [Configuration](#-configuration) section).

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env  # If .env.example exists, or create manually
```

Edit `.env` with your API URL (see [Configuration](#-configuration) section).

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

#### Required Variables

```env
# Server Configuration
NODE_ENV=development                    # Environment: development or production
PORT=3000                                # Server port (default: 3000)

# Database
MONGODB_URI=mongodb://localhost:27017/onam-festival  # MongoDB connection string
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority

# CORS Configuration
FRONTEND_URL=http://localhost:5173      # Allowed frontend URLs (comma-separated for multiple)
# Example for production: https://onammitadt.netlify.app,https://www.onammitadt.com
```

#### Optional Variables

```env
# Email Configuration (Required for email functionality)
EMAIL_USER=your-email@gmail.com         # Email service username
EMAIL_PASSWORD=your-app-password         # Email service password (use App Password for Gmail)
EMAIL_SERVICE=gmail                     # Email service: gmail, outlook, yahoo, or custom
EMAIL_FROM_NAME=Onam Festival - MIT ADT University  # Display name for emails

# Custom SMTP Configuration (if not using Gmail)
EMAIL_HOST=smtp.example.com             # SMTP host
EMAIL_PORT=587                          # SMTP port (587 for TLS, 465 for SSL)
EMAIL_SECURE=false                      # Use SSL/TLS (true for port 465, false for 587)
EMAIL_DEBUG=false                       # Enable email debugging

# Payment Configuration
UPI_ID=your-upi-id@paytm                # UPI payment ID

# Communication
WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/...  # WhatsApp group invite link

# Logging
LOG_LEVEL=info                          # Log level: error, warn, info, debug (default: info)

# Platform Detection (Auto-detected, but can be set manually)
RENDER=true                              # Set to true if deploying on Render
VERCEL=true                             # Set to true if deploying on Vercel
RAILWAY_ENVIRONMENT=production         # Set if deploying on Railway
HEROKU=true                             # Set to true if deploying on Heroku
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

#### Required Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000  # Backend API URL
# For production: https://your-backend-api.com
```

#### Optional Variables

```env
# Payment Configuration (Optional - usually fetched from backend)
VITE_UPI_ID=your-upi-id@paytm           # UPI payment ID (fallback if backend unavailable)
```

### MongoDB Setup

#### Option 1: Local MongoDB

1. **Install MongoDB** on your system
2. **Start MongoDB service:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```
3. **Use connection string:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/onam-festival
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from Atlas dashboard
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority
   ```

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated password in `EMAIL_PASSWORD`

## 🏃 Running the Application

### Development Mode

#### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3000`

#### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

#### Start Backend in Production

```bash
cd backend
npm run prod
# or
NODE_ENV=production npm start
```

### Health Check

Visit `http://localhost:3000/health` to verify backend is running.

## 📁 Project Structure

```
Onam/
├── backend/                    # Backend API
│   ├── config/                 # Configuration files
│   │   ├── app.js             # Application configuration
│   │   └── database.js        # Database connection
│   ├── middleware/             # Express middleware
│   │   ├── database.js        # Database status middleware
│   │   ├── requestId.js       # Request ID middleware
│   │   └── validation.js      # Input validation middleware
│   ├── models/                 # MongoDB models
│   │   └── Order.js           # Order model
│   ├── routes/                 # API routes
│   │   └── orders.js          # Order routes
│   ├── utils/                  # Utility functions
│   │   ├── emailService.js    # Email service
│   │   ├── logger.js          # Custom logger
│   │   └── rateLimiter.js     # Rate limiting
│   ├── server.js              # Express server entry point
│   ├── test-email.js          # Email testing script
│   ├── package.json           # Backend dependencies
│   └── Procfile               # Process file for deployment
│
├── frontend/                   # Frontend React application
│   ├── public/                # Static assets
│   │   ├── images/            # Image files
│   │   ├── videos/            # Video files
│   │   └── robots.txt         # SEO robots file
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── CartIcon.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OptimizedImage.jsx
│   │   │   ├── Sadya.jsx
│   │   │   ├── Shopping.jsx
│   │   │   ├── SkeletonLoader.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── UnderDevelopment.jsx
│   │   │   └── VideoSection.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── ComingSoon.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Shopping.jsx
│   │   ├── context/           # React Context
│   │   │   └── CartContext.jsx
│   │   ├── hooks/             # Custom hooks
│   │   │   └── useToast.js
│   │   ├── config/            # Configuration
│   │   │   ├── api.js
│   │   │   └── app.js
│   │   ├── constants/         # Constants
│   │   │   └── headings.js
│   │   ├── data/              # Static data
│   │   │   ├── events.js
│   │   │   ├── sadyaDishes.js
│   │   │   └── shoppingItems.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── price.js
│   │   │   ├── validation.js
│   │   │   └── __tests__/     # Unit tests
│   │   ├── test/              # Test setup
│   │   │   └── setup.js
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── scripts/               # Build scripts
│   │   ├── optimize-images.js
│   │   └── optimize-large-image.js
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── vitest.config.js       # Vitest configuration
│   ├── netlify.toml           # Netlify configuration
│   └── package.json           # Frontend dependencies
│
└── README.md                  # This file
```

## 💻 Development

### Available Scripts

#### Backend Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run prod     # Start production server with NODE_ENV=production
npm run test:email  # Test email functionality
```

#### Frontend Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run build:prod       # Build with NODE_ENV=production
npm run preview          # Preview production build locally
npm run preview:prod     # Preview production build on port 4173
npm run lint             # Run ESLint
npm test                 # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage
npm run optimize:images  # Optimize images (convert to WebP)
npm run optimize:large-image  # Optimize large images
```

### Code Style

- **ESLint** is configured for code quality
- **Prettier** formatting (if configured)
- Follow React best practices and hooks rules
- Use functional components with hooks
- Prefer `const` over `let`, avoid `var`

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm test                 # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI
npm run test:coverage    # Generate coverage report
```

### Backend Testing

Currently, backend testing is manual. Test endpoints using:

- **Health Check**: `GET /health`
- **Create Order**: `POST /api/orders`
- **Get Orders**: `GET /api/orders?studentId=MITADT2024XXX`

### Email Testing

```bash
cd backend
node test-email.js your-email@example.com
```

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL=https://your-backend-api.com`

3. **Netlify Configuration:**
   - The `netlify.toml` file is already configured with:
     - Security headers
     - Cache control
     - Redirects

### Backend Deployment

#### Option 1: Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard
6. Set `NODE_ENV=production`

#### Option 2: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Add environment variables in Vercel dashboard

#### Option 3: Railway

1. Create a new project on Railway
2. Connect your repository
3. Add environment variables
4. Railway auto-detects Node.js

### Environment Variables for Production

Ensure all required environment variables are set in your hosting platform:

**Backend:**
- `NODE_ENV=production`
- `MONGODB_URI` (MongoDB Atlas connection string)
- `FRONTEND_URL` (your frontend URL)
- `EMAIL_USER` and `EMAIL_PASSWORD`
- `UPI_ID` (if using UPI payments)
- `WHATSAPP_GROUP_LINK` (optional)

**Frontend:**
- `VITE_API_BASE_URL` (your backend API URL)

### Database Setup for Production

Use **MongoDB Atlas** for production:

1. Create a production cluster
2. Create a database user with appropriate permissions
3. Whitelist your backend server IP (or use `0.0.0.0/0` with proper authentication)
4. Get the connection string and add to `MONGODB_URI`

## 🔒 Security

### Implemented Security Measures

- ✅ **CORS Protection**: Configured allowed origins
- ✅ **Rate Limiting**: API rate limiting to prevent abuse
- ✅ **Input Validation**: Client and server-side validation
- ✅ **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, CSP, HSTS
- ✅ **Environment Variables**: Sensitive data in environment variables
- ✅ **Error Sanitization**: Error messages don't expose sensitive information
- ✅ **HTTPS**: Enforced in production
- ✅ **Request ID**: Unique request IDs for tracking

### Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong MongoDB passwords**
3. **Rotate API keys regularly**
4. **Keep dependencies updated**: `npm audit` and `npm update`
5. **Use App Passwords** for email (not regular passwords)
6. **Enable MongoDB authentication**
7. **Whitelist IPs** in MongoDB Atlas for production

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

**Issue**: `Error: Cannot find module`
- **Solution**: Run `npm install` in the backend directory

**Issue**: `MongoDB connection error`
- **Solution**: 
  - Check if MongoDB is running (local) or connection string is correct (Atlas)
  - Verify `MONGODB_URI` in `.env`
  - Check network connectivity

#### Frontend won't connect to backend

**Issue**: CORS error
- **Solution**: 
  - Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
  - Check backend CORS configuration

**Issue**: API requests fail
- **Solution**: 
  - Verify `VITE_API_BASE_URL` in frontend `.env`
  - Check backend is running
  - Check browser console for errors

#### Email not sending

**Issue**: Email authentication failed
- **Solution**: 
  - For Gmail, use App Password (not regular password)
  - Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
  - Check `EMAIL_SERVICE` matches your provider

**Issue**: Email timeout
- **Solution**: 
  - Check network connectivity
  - Verify SMTP settings for custom email providers
  - Check firewall/security settings

#### Images not loading

**Issue**: Images return 404
- **Solution**: 
  - Verify images exist in `frontend/public/`
  - Check image paths in components
  - Clear browser cache

#### Build errors

**Issue**: Vite build fails
- **Solution**: 
  - Check for syntax errors: `npm run lint`
  - Verify all imports are correct
  - Check Node.js version (18+)

### Debug Mode

Enable debug logging:

**Backend:**
```env
LOG_LEVEL=debug
NODE_ENV=development
```

**Frontend:**
- Check browser DevTools Console
- Check Network tab for API requests
- Use React DevTools for component debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 📄 License

ISC

## 👥 Contributors

MIT ADT University - Onam Festival Team

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for Onam Festival at MIT ADT University**
