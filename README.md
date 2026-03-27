<div align="center">
  <img src="frontend/public/logo.png" alt="Onam Festival Logo" width="100" />

  # Onam Festival Website

  Full-stack cultural portal for MIT ADT University Onam celebrations

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-onammitadt.netlify.app-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://onammitadt.netlify.app)
  [![CI Workflow](https://github.com/Gaurav-205/Onam/actions/workflows/ci.yml/badge.svg)](https://github.com/Gaurav-205/Onam/actions/workflows/ci.yml)
  [![Deploy Workflow](https://github.com/Gaurav-205/Onam/actions/workflows/deploy.yml/badge.svg)](https://github.com/Gaurav-205/Onam/actions/workflows/deploy.yml)
  [![Node](https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
  [![License](https://img.shields.io/badge/License-ISC-orange?style=flat-square)](backend/package.json)
</div>

---

## Overview

This project is a full-stack Onam festival platform for MIT ADT University. It presents cultural sections, event information, a traditional shopping catalog, and backend-powered order registration with validation, persistence, and email workflows.

The cart and checkout user flow is currently disabled intentionally.

---

## Features

| Module | Description |
|--------|-------------|
| Home Experience | Hero section, cultural visuals, and responsive section navigation |
| Sadya Showcase | Dedicated section for Onam feast details and media |
| Events | Event highlights and informational cards |
| Shopping Catalog | Traditional items catalog view (cart actions disabled for now) |
| Coming Soon | Placeholder area for upcoming modules |
| Order API | Backend order creation/retrieval with server-side validation |
| Email Utilities | Order confirmation and test-email endpoints with modular email service |
| Security Basics | Rate limiting, CORS controls, request IDs, and production-safe diagnostics |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite 7, React Router 7, Tailwind CSS 3, Vitest |
| Backend | Node.js 20, Express 4, MongoDB, Mongoose 8, Nodemailer 8, express-validator |
| Infrastructure | Netlify (frontend), Render-compatible backend, MongoDB Atlas/local MongoDB |
| CI/CD | GitHub Actions workflows at .github/workflows/ci.yml and .github/workflows/deploy.yml |

---

## Screenshots

> Screenshots below are representative. The live app at [onammitadt.netlify.app](https://onammitadt.netlify.app) reflects the current state.

| Home Page | Events Page | Shopping |
|:---:|:---:|:---:|
| <img src="frontend/public/picture1.png" alt="Home Page" width="260" /> | <img src="frontend/public/picture2.png" alt="Events Page" width="260" /> | <img src="frontend/public/picture3.png" alt="Shopping" width="260" /> |

Additional pages like Sadya, Shopping, and Coming Soon are available through the main navigation, with responsive layouts tuned for both mobile and desktop.

---

## Local Setup

### Prerequisites

- Node.js >= 20
- npm >= 10
- MongoDB (local or Atlas)

### 1. Clone and install

```bash
git clone https://github.com/Gaurav-205/Onam.git
cd Onam

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

PowerShell (Windows) alternative:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

### 3. Run locally

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:3000

---

## Project Structure

```text
Onam/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   │   ├── email/
│   │   ├── emailService.js
│   │   ├── logger.js
│   │   └── rateLimiter.js
│   ├── scripts/
│   │   └── syntax-check.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── scripts/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
└── README.md
```

---

## API Routes

| Prefix | Routes |
|--------|--------|
| /health | GET health status |
| /api/config | GET public frontend config |
| /api/orders | POST create order, GET list by studentId, GET by order id |
| /api/test-email | GET email connection diagnostic |
| /api/test-email-send | POST send test email |
| /api/email-diagnostics | GET non-sensitive email config status |

---

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| ci.yml | Push / PR to main/master | Runs backend tests and frontend lint, tests, and build |
| deploy.yml | After ci.yml success on main/master or manual run | Builds deploy artifact and prepares deployment |

---

## Notes

- Cart and checkout routes are intentionally disabled for now.
- Backend order creation is controlled by CHECKOUT_ENABLED in backend environment configuration.
- Cart-related frontend state files were removed as part of cleanup.

---

## Running Checks

```bash
# Frontend
cd frontend
npm run lint
npm test
npm run build

# Backend
cd backend
npm test
```

The backend check currently validates JavaScript syntax for all backend files.

If backend dev startup shows "Port 3000 is already in use", set a different value in backend/.env, for example:

```text
PORT=3001
```

---

## License

ISC

---

<div align="center">
  Built by <a href="https://github.com/Gaurav-205">Gaurav Khandelwal</a>
</div>
