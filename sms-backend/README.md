# Society Management System — Backend

> Node.js + Express + MongoDB REST API with Socket.io real-time support.

## Tech Stack

| Layer         | Technology                         |
| ------------- | ---------------------------------- |
| Runtime       | Node.js 20 (LTS)                   |
| Framework     | Express 4                          |
| Database      | MongoDB via Mongoose 8             |
| Auth          | JWT + Refresh Token + Passport-JWT |
| Real-time     | Socket.io 4                        |
| File Storage  | Cloudinary                         |
| Push Notify   | Firebase Admin                     |
| Payments      | Razorpay                           |
| Email         | Nodemailer                         |
| SMS/WA        | Twilio                             |
| Validation    | Joi                                |
| Containerized | Docker + Docker Compose            |

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd sms-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Run (Development)

```bash
npm run dev
```

### 4. Run with Docker

```bash
docker-compose up --build
```

## Project Structure

```
src/
├── modules/        # Feature modules (auth, resident, visitor …)
├── shared/models/  # Cross-module Mongoose models
├── middleware/     # Express middlewares
├── config/         # Third-party service configs
├── services/       # Shared service helpers
├── socket/         # Socket.io server & handlers
├── jobs/           # Cron jobs
├── utils/          # Generic utilities
└── routes/         # API route aggregator
```

## API Base URL

```
http://localhost:5000/api/v1
```

## Health Check

```
GET /health
```
