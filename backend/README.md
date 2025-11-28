# Onam Festival Backend API

Backend server for Onam Festival website with MongoDB database integration.

## 🚀 Features

- **MongoDB Integration**: Full database setup with Mongoose
- **Order Management**: Create, read, and update orders
- **Student Registration**: Store student information for event registration
- **Payment Tracking**: Support for cash and UPI payments
- **RESTful API**: Clean API endpoints
- **Validation**: Input validation with express-validator
- **Error Handling**: Comprehensive error handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Edit `.env` file with your MongoDB connection:**
```env
MONGODB_URI=mongodb://localhost:27017/onam-festival
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

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

### Option 2: MongoDB Atlas (Cloud)

1. **Create account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** (free tier available)
3. **Get connection string** from Atlas dashboard
4. **Update `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onam-festival?retryWrites=true&w=majority
```

## 🚀 Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

Server will run on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Create Order
```
POST /api/orders
Content-Type: application/json

Body:
{
  "studentInfo": {
    "name": "John Doe",
    "studentId": "MITADT2024XXX",
    "email": "john@mituniversity.edu.in",
    "phone": "8955142954",
    "course": "B.Tech",
    "department": "Computer Science",
    "year": "2nd Year",
    "hostel": "Hostel A"
  },
  "orderItems": [
    {
      "id": "mundu-001",
      "name": "Mundu",
      "quantity": 2,
      "price": 280,
      "total": 560
    }
  ],
  "payment": {
    "method": "upi",
    "upiId": "8955142954-2@ybl",
    "transactionId": "TXN123456789"
  },
  "totalAmount": 560
}
```

### Get Order by ID
```
GET /api/orders/:orderId
```

### Get Orders (with filters)
```
GET /api/orders?studentId=MITADT2024XXX
GET /api/orders?email=john@mituniversity.edu.in
GET /api/orders?status=pending
```

### Update Order Status
```
PATCH /api/orders/:orderId/status
Content-Type: application/json

Body:
{
  "status": "confirmed"
}
```

## 📊 Database Schema

### Order Model
- `orderNumber`: Unique order identifier (auto-generated)
- `studentInfo`: Student details (name, ID, email, phone, course, etc.)
- `orderItems`: Array of ordered items
- `payment`: Payment information (method, UPI ID, transaction ID)
- `totalAmount`: Total order amount
- `status`: Order status (pending, confirmed, cancelled, completed)
- `orderDate`: Order creation date
- `createdAt`, `updatedAt`: Timestamps

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/onam-festival` |
| `PORT` | Server port | `3000` |
| `FRONTEND_URL` | Frontend URL(s) for CORS (comma-separated for multiple) | `http://localhost:5173,https://onammitadt.netlify.app` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `UPI_ID` | UPI ID for payments (required in production) | None |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` |
| `WHATSAPP_GROUP_LINK` | WhatsApp group invite link | None |
| `EMAIL_USER` | Email address for sending notifications | None |
| `EMAIL_PASSWORD` | Email password or app password | None |
| `EMAIL_SERVICE` | Email service (gmail, outlook, etc.) | `gmail` |
| `EMAIL_HOST` | SMTP host (for custom SMTP) | None |
| `EMAIL_PORT` | SMTP port (for custom SMTP) | `587` |
| `EMAIL_SECURE` | Use secure connection (true/false) | `false` |

### Production Deployment (Render)

For deployment on Render, set these environment variables:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
PORT=10000
FRONTEND_URL=https://onammitadt.netlify.app
NODE_ENV=production
UPI_ID=your-upi-id@ybl
LOG_LEVEL=info

# WhatsApp Group Link
WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/your-group-invite-link

# Email Configuration (for order confirmations)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail
# OR for custom SMTP:
# EMAIL_HOST=smtp.yourdomain.com
# EMAIL_PORT=587
# EMAIL_SECURE=false
```

**Important:** 
- Render automatically sets `PORT`, but you can override it
- Make sure `FRONTEND_URL` includes your Netlify domain
- `UPI_ID` is required - orders will fail without it
- `EMAIL_USER` and `EMAIL_PASSWORD` are required for email notifications
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password
- `WHATSAPP_GROUP_LINK` should be a WhatsApp group invite link

## 🧪 Testing

Test the API using curl or Postman:

```bash
# Health check
curl http://localhost:3000/health

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "studentInfo": {
      "name": "Test Student",
      "studentId": "TEST001",
      "email": "test@test.com",
      "phone": "1234567890",
      "course": "B.Tech",
      "department": "CS",
      "year": "1st Year"
    },
    "orderItems": [{
      "id": "mundu-001",
      "name": "Mundu",
      "quantity": 1,
      "price": 280,
      "total": 280
    }],
    "payment": {
      "method": "cash"
    },
    "totalAmount": 280
  }'
```

## 📝 Notes

- Orders are automatically assigned unique order numbers
- All timestamps are stored in UTC
- Database indexes are set up for fast queries
- Validation ensures data integrity
- **Email notifications are sent automatically** when orders are created
- **WhatsApp group link** is included in order confirmation emails and success page

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Add to `.env`:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-digit-app-password
   EMAIL_SERVICE=gmail
   ```

### Custom SMTP Setup

For other email providers (Outlook, custom SMTP):
```env
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_SERVICE=custom
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Test Email Configuration

In development, test your email setup:
```bash
curl http://localhost:3000/api/test-email
```

## 📱 WhatsApp Group Link

1. **Create a WhatsApp group** for Onam festival updates
2. **Get the invite link:**
   - Open WhatsApp group → Group info → Invite via link
   - Copy the invite link
3. **Add to `.env`:**
   ```env
   WHATSAPP_GROUP_LINK=https://chat.whatsapp.com/your-group-invite-link
   ```

The link will be:
- Included in order confirmation emails
- Displayed on the order success page
- Available via `/api/config` endpoint

## 🤝 Frontend Integration

Update frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The frontend is already configured to use this API!

