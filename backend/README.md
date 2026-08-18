# 🌿 Dr. Arjun's Homoeo Care — Backend API

Enterprise-grade REST API backend built with **Node.js**, **Express**, and **MongoDB (Mongoose)** for Dr. Arjun's Homoeo Care clinic.

---

## 🏗️ Architecture Overview

The backend follows a **Modular Clean Architecture (Layered Architecture)**:

```
backend/
├── src/
│   ├── config/          # Database, Environment, and SMTP Mailer configurations
│   ├── constants/       # User Roles, Appointment Statuses, Consultation types
│   ├── controllers/     # HTTP Request handlers & JSON responses
│   ├── middlewares/     # JWT Auth, Role-Based Access Control, Rate Limiting, Validation, Global Errors
│   ├── models/          # Mongoose Schemas (User, Doctor, Appointment, ContactMessage)
│   ├── routes/          # Express route definitions versioned under /api/v1
│   ├── services/        # Business logic (Booking, Email alerts, Authentication)
│   ├── utils/           # Standardized ApiResponse, ApiError, AsyncHandler, Logger
│   ├── validations/     # Zod schema validators
│   └── app.js           # Express app setup and middleware pipeline
├── scripts/             # Database seeding scripts (Admin & Doctors)
├── server.js            # Main server entrypoint
├── .env.example         # Environment template
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and update your MongoDB URI and SMTP credentials:
```bash
cp .env.example .env
```

### 3. Seed Doctors & Admin
Run the automated seeder to create Dr. Nagarjuna, Dr. Harshitha, and default Super Admin accounts:
```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@drarjun.com`
- Password: `AdminPassword@2026`

### 4. Run Server
- **Development (with hot reload):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

---

## 📡 API Endpoints Reference

### 🟢 Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API Welcome message & version |
| `GET` | `/api/v1/health` | Service healthcheck |
| `POST` | `/api/v1/appointments` | Book a new patient appointment (Rate Limited) |
| `GET` | `/api/v1/doctors` | List all active homeopathic doctors & specializations |
| `GET` | `/api/v1/doctors/:id` | Get doctor profile by ID |
| `POST` | `/api/v1/contact` | Submit general contact message |
| `POST` | `/api/v1/auth/login` | Staff/Doctor/Admin login (returns JWT token) |

---

### 🔒 Protected Endpoints (Requires `Authorization: Bearer <token>`)

#### Authentication
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/me` | Logged In User | Get current logged-in user profile |
| `POST` | `/api/v1/auth/register` | `SUPER_ADMIN` | Register new doctor/receptionist |

#### Appointments Management
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/appointments` | Admin / Doctor | Get all appointments (supports `?page=`, `?limit=`, `?status=`, `?search=`, `?date=`) |
| `GET` | `/api/v1/appointments/:id` | Admin / Doctor | Get single appointment details |
| `PATCH` | `/api/v1/appointments/:id/status` | Admin / Doctor | Update appointment status (`CONFIRMED`, `COMPLETED`, `CANCELLED`, etc.) |
| `DELETE` | `/api/v1/appointments/:id` | `SUPER_ADMIN` | Delete appointment record |

#### Analytics & Messages
| Method | Endpoint | Required Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/stats/overview` | Admin / Doctor | Dashboard statistics (today's counts, treatment distribution) |
| `GET` | `/api/v1/contact` | Admin / Staff | List patient contact inquiries |
| `PATCH` | `/api/v1/contact/:id/read` | Admin / Staff | Mark contact inquiry as read |

---

## 🛡️ Security Features
- **Helmet**: Secures HTTP response headers against clickjacking, sniffing, and XSS.
- **Express Rate Limit**: Prevents automated booking spam and brute-force login attacks.
- **Input Validation with Zod**: Validates Indian phone number patterns, email formats, and required fields.
- **JWT + Role-Based Access Control**: Prevents unauthorized access to patient health data.
- **Centralized Error Handling**: Safely hides internal stack traces in production.
