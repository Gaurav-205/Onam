# Onam Festival Website

A full-stack web application for the Onam Festival celebration at MIT ADT University, featuring event registration, traditional shopping, and cultural information.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Onam
   ```

2. **Backend Setup**
   ```bash
   cd Onam/backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd Onam/frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

## 📁 Project Structure

```
Onam/
├── backend/          # Node.js/Express API
│   ├── config/       # Configuration files
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── server.js     # Entry point
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── config/      # Configuration
│   │   └── utils/       # Utility functions
│   └── vite.config.js
└── DEPLOYMENT.md     # Deployment guide
```

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Nodemailer (Email service)
- Express Validator (Input validation)
- Express Rate Limit (Rate limiting)

### Frontend
- React 18
- React Router DOM
- Vite (Build tool)
- Tailwind CSS
- Context API (State management)

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Allowed frontend URLs (comma-separated)
- `EMAIL_USER` - Email service username
- `EMAIL_PASSWORD` - Email service password
- `UPI_ID` - UPI payment ID
- `WHATSAPP_GROUP_LINK` - WhatsApp group link
- `LOG_LEVEL` - Logging level

**Frontend (.env)**
- `VITE_API_BASE_URL` - Backend API URL

See `.env.example` files for detailed configuration.

## 📝 Features

- ✅ Event registration with order management
- ✅ Traditional shopping cart
- ✅ Email confirmation
- ✅ Responsive design
- ✅ Skeleton loaders
- ✅ Error boundaries
- ✅ Rate limiting
- ✅ Input validation
- ✅ Security headers
- ✅ Production optimizations

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Backend:**
```bash
cd Onam/backend
npm install --production
npm run prod
```

**Frontend:**
```bash
cd Onam/frontend
npm install
npm run build
# Deploy dist/ folder to your hosting service
```

## 📚 Documentation

- [Backend README](./Onam/backend/README.md)
- [Frontend README](./Onam/frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🔒 Security

- CORS protection
- Rate limiting
- Input validation and sanitization
- Security headers
- Environment variable protection
- Error message sanitization

## 📄 License

ISC

## 👥 Contributors

MIT ADT University - Onam Festival Team
