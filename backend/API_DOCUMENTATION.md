# Onam Festival Backend API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: {YOUR_DOMAIN}/api
```

## Authentication

Currently, the API does not require authentication. This is suitable for public event registration but should be enhanced for production use with admin features.

---

## Endpoints

### Health Check

#### GET `/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Onam Festival API is running",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

**Status Code:** `200 OK`

---

### Orders

#### POST `/api/orders`

Create a new order (event registration).

**Request Body:**
```json
{
  "studentInfo": {
    "name": "John Doe",
    "studentId": "MITADT2024001",
    "email": "john.doe@mituniversity.edu.in",
    "phone": "9876543210",
    "course": "B.Tech",
    "department": "Computer Science",
    "year": "2nd Year",
    "hostel": "Hostel A" // Optional
  },
  "orderItems": [
    {
      "id": "sadya-001",
      "name": "Sadya",
      "quantity": 2,
      "price": 250,
      "total": 500
    }
  ],
  "payment": {
    "method": "upi", // "cash" or "upi"
    "upiId": "john@paytm", // Required for UPI
    "transactionId": "TXN123456789" // Required for UPI
  },
  "totalAmount": 500
}
```

**Field Validations:**

**Student Info:**
- `name`: Required, non-empty string
- `studentId`: Required, non-empty string, indexed for queries
- `email`: Required, valid email format
- `phone`: Required, exactly 10 digits (numbers only)
- `course`: Required, non-empty string
- `department`: Required, non-empty string
- `year`: Required, must be one of: `"1st Year"`, `"2nd Year"`, `"3rd Year"`, `"4th Year"`, `"Post Graduate"`
- `hostel`: Optional string

**Order Items:**
- Array with at least one item
- Each item must have:
  - `id`: Required, non-empty string
  - `name`: Required, non-empty string
  - `quantity`: Required, integer >= 1
  - `price`: Required, number >= 0
  - `total`: Required, number >= 0 (should equal price * quantity)

**Payment:**
- `method`: Required, must be `"cash"` or `"upi"`
- `upiId`: Required if method is `"upi"`, must match format: `username@provider`
- `transactionId`: Required if method is `"upi"`

**Total Amount:**
- Must match the sum of all item totals (within 0.01 tolerance)

**Success Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "orderId": "65f1234567890abcdef12345",
    "orderNumber": "ONAM-20250127-0001",
    "status": "pending",
    "totalAmount": 500,
    "orderDate": "2025-01-27T10:30:00.000Z"
  }
}
```

**Status Code:** `201 Created`

**Error Responses:**

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "Name is required",
      "path": "studentInfo.name",
      "location": "body"
    }
  ]
}
```

**UPI Payment Missing Fields (400):**
```json
{
  "success": false,
  "message": "UPI ID and Transaction ID are required for UPI payment"
}
```

**Total Amount Mismatch (400):**
```json
{
  "success": false,
  "message": "Total amount mismatch"
}
```

**Duplicate Order Number (400):**
```json
{
  "success": false,
  "message": "Duplicate order number. Please try again."
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Failed to create order",
  "error": "Error message (only in development)"
}
```

---

#### GET `/api/orders/:orderId`

Get a specific order by its MongoDB ID.

**URL Parameters:**
- `orderId`: MongoDB ObjectId of the order

**Success Response:**
```json
{
  "success": true,
  "order": {
    "_id": "65f1234567890abcdef12345",
    "orderNumber": "ONAM-20250127-0001",
    "studentInfo": {
      "name": "John Doe",
      "studentId": "MITADT2024001",
      "email": "john.doe@mituniversity.edu.in",
      "phone": "9876543210",
      "course": "B.Tech",
      "department": "Computer Science",
      "year": "2nd Year",
      "hostel": "Hostel A"
    },
    "orderItems": [
      {
        "id": "sadya-001",
        "name": "Sadya",
        "quantity": 2,
        "price": 250,
        "total": 500
      }
    ],
    "payment": {
      "method": "upi",
      "upiId": "john@paytm",
      "transactionId": "TXN123456789"
    },
    "totalAmount": 500,
    "status": "pending",
    "orderDate": "2025-01-27T10:30:00.000Z",
    "createdAt": "2025-01-27T10:30:00.000Z",
    "updatedAt": "2025-01-27T10:30:00.000Z"
  }
}
```

**Status Code:** `200 OK`

**Error Responses:**

**Order Not Found (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Invalid ObjectId (500):**
```json
{
  "success": false,
  "message": "Failed to fetch order"
}
```

---

#### GET `/api/orders`

Query orders by student ID, email, or status.

**Query Parameters:**
- `studentId` (optional): Filter by student ID
- `email` (optional): Filter by email address (case-insensitive)
- `status` (optional): Filter by status (`pending`, `confirmed`, `cancelled`, `completed`)

**Note:** You can combine multiple query parameters.

**Example Requests:**
```
GET /api/orders?studentId=MITADT2024001
GET /api/orders?email=john.doe@mituniversity.edu.in
GET /api/orders?status=pending
GET /api/orders?studentId=MITADT2024001&status=confirmed
```

**Success Response:**
```json
{
  "success": true,
  "count": 2,
  "orders": [
    {
      "_id": "65f1234567890abcdef12345",
      "orderNumber": "ONAM-20250127-0001",
      "studentInfo": { ... },
      "orderItems": [ ... ],
      "payment": { ... },
      "totalAmount": 500,
      "status": "pending",
      "orderDate": "2025-01-27T10:30:00.000Z",
      "createdAt": "2025-01-27T10:30:00.000Z",
      "updatedAt": "2025-01-27T10:30:00.000Z"
    },
    {
      "_id": "65f1234567890abcdef12346",
      "orderNumber": "ONAM-20250127-0002",
      ...
    }
  ]
}
```

**Features:**
- Results sorted by `orderDate` (newest first)
- Limited to 50 orders per query
- Returns full order details

**Status Code:** `200 OK`

**Empty Result:**
```json
{
  "success": true,
  "count": 0,
  "orders": []
}
```

---

#### PATCH `/api/orders/:orderId/status`

Update the status of an order.

**URL Parameters:**
- `orderId`: MongoDB ObjectId of the order

**Request Body:**
```json
{
  "status": "confirmed" // "pending", "confirmed", "cancelled", or "completed"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "_id": "65f1234567890abcdef12345",
    "orderNumber": "ONAM-20250127-0001",
    "status": "confirmed",
    ...
  }
}
```

**Status Code:** `200 OK`

**Error Responses:**

**Invalid Status (400):**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Order Not Found (404):**
```json
{
  "success": false,
  "message": "Order not found"
}
```

---

## Order Status Values

- `pending`: Order created, awaiting confirmation
- `confirmed`: Order confirmed by admin
- `cancelled`: Order cancelled
- `completed`: Order fulfilled/completed

---

## Order Number Format

Order numbers are auto-generated in the format:
```
ONAM-YYYYMMDD-XXXX
```

Example: `ONAM-20250127-0001`

Where:
- `YYYYMMDD`: Date in year-month-day format
- `XXXX`: 4-digit sequential number (padded with zeros)

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional: Detailed validation errors
}
```

**Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

**Note:** Rate limiting is not currently implemented. It is recommended to add rate limiting for production use to prevent abuse.

---

## CORS

The API is configured to accept requests from:
- Development: `http://localhost:5173`
- Production: Configured via `FRONTEND_URL` environment variable

CORS is enabled with credentials support.

---

## Example Usage

### cURL Examples

**Create Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "studentInfo": {
      "name": "John Doe",
      "studentId": "MITADT2024001",
      "email": "john.doe@mituniversity.edu.in",
      "phone": "9876543210",
      "course": "B.Tech",
      "department": "Computer Science",
      "year": "2nd Year"
    },
    "orderItems": [
      {
        "id": "sadya-001",
        "name": "Sadya",
        "quantity": 1,
        "price": 250,
        "total": 250
      }
    ],
    "payment": {
      "method": "cash"
    },
    "totalAmount": 250
  }'
```

**Get Order by ID:**
```bash
curl http://localhost:3000/api/orders/65f1234567890abcdef12345
```

**Query Orders by Student ID:**
```bash
curl "http://localhost:3000/api/orders?studentId=MITADT2024001"
```

**Update Order Status:**
```bash
curl -X PATCH http://localhost:3000/api/orders/65f1234567890abcdef12345/status \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

### JavaScript/Fetch Examples

**Create Order:**
```javascript
const response = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    studentInfo: {
      name: "John Doe",
      studentId: "MITADT2024001",
      email: "john.doe@mituniversity.edu.in",
      phone: "9876543210",
      course: "B.Tech",
      department: "Computer Science",
      year: "2nd Year"
    },
    orderItems: [
      {
        id: "sadya-001",
        name: "Sadya",
        quantity: 1,
        price: 250,
        total: 250
      }
    ],
    payment: {
      method: "cash"
    },
    totalAmount: 250
  })
})

const data = await response.json()
console.log(data)
```

---

## Database Schema

### Order Schema

```javascript
{
  orderNumber: String (unique, indexed, auto-generated),
  studentInfo: {
    name: String (required),
    studentId: String (required, indexed),
    email: String (required, indexed, lowercase),
    phone: String (required, 10 digits),
    course: String (required),
    department: String (required),
    year: String (enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate']),
    hostel: String (optional)
  },
  orderItems: [{
    id: String (required),
    name: String (required),
    quantity: Number (required, min: 1),
    price: Number (required, min: 0),
    total: Number (required, min: 0)
  }],
  payment: {
    method: String (enum: ['cash', 'upi'], required),
    upiId: String (optional, required if method is 'upi'),
    transactionId: String (optional, required if method is 'upi')
  },
  totalAmount: Number (required, min: 0),
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending'),
  orderDate: Date (default: now, indexed),
  notes: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Future Enhancements

1. **Authentication:** JWT-based authentication for admin endpoints
2. **Email Notifications:** Send confirmation emails after order creation
3. **Payment Verification:** Integrate with payment gateway APIs to verify transactions
4. **Order Tracking:** Real-time order status updates
5. **Bulk Operations:** Bulk status updates for admin
6. **Analytics Endpoints:** Order statistics and reports
7. **Webhooks:** Support for payment gateway webhooks

---

**Last Updated:** 2025-01-27  
**API Version:** 1.0.0

