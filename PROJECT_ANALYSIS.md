# 🔍 Project Analysis — LMS Microservices Backend

## 📌 Overview

This is a **Learning Management System (LMS)** backend built on a **Microservices Architecture**. The project uses TypeScript + Express.js and is orchestrated via Docker Compose.

---

## 🏗️ Architecture

```
                         ┌─────────────────────┐
                         │      FRONTEND       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     API GATEWAY     │
                         │      :4000          │
                         └──────────┬──────────┘
                                    │
        ┌───────────────┬───────────┼──────────────┬───────────────┐
        ▼               ▼           ▼              ▼               ▼
   ┌─────────┐    ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐
   │  Auth   │    │  User    │ │ Course   │ │ Enrollment│ │  Payment  │
   │ Service │    │ Service  │ │ Service  │ │  Service  │ │  Service  │
   └────┬────┘    └────┬─────┘ └────┬─────┘ └─────┬─────┘ └─────┬─────┘
        │              │            │              │             │
        ▼              ▼            ▼              ▼             ▼
    auth_db         user_db      course_db     enrollment_db  payment_db


        ┌───────────────┬──────────────┬──────────────┬───────────────┐
        ▼               ▼              ▼              ▼
   ┌──────────┐   ┌───────────┐ ┌────────────┐ ┌──────────────┐
   │ Progress │   │ Assessment│ │ Certificate│ │ Notification │
   │ Service  │   │ Service   │ │  Service   │ │   Service    │
   └────┬─────┘   └─────┬─────┘ └─────┬──────┘ └──────┬───────┘
        ▼               ▼             ▼               ▼
   progress_db    assessment_db  certificate_db notification_db


                         ┌─────────────────┐
                         │ Message Broker  │
                         │ RabbitMQ/Kafka  │
                         └─────────────────┘

                         ┌─────────────────┐
                         │      Redis      │
                         │ Cache / Limits  │
                         └─────────────────┘
```

---

## 📁 Services Breakdown

| Service | Port | Status | Role |
|---------|------|--------|------|
| **api-gateway** | `4000` | ✅ Fully Built | Entry point — routing, rate limiting, JWT auth, reverse proxy |
| **auth-service** | `5001` | ⚠️ Placeholder | Login/Register endpoints (placeholder responses only) |
| **notification-service** | `5002` | ⚠️ Placeholder | Notification send endpoint (placeholder response only) |
| **course-service** | `5003` | ❌ Not Created | Referenced in config but folder doesn't exist |
| **Redis** | `6379` | ✅ Ready | Caching & rate limiting |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Language | TypeScript |
| Runtime | Node.js 24 (Alpine) |
| Framework | Express.js v5 |
| Validation | Zod v4 |
| Logging | Pino |
| Caching | Redis 8 (Alpine) |
| Proxy | http-proxy-middleware |
| Security | Helmet |
| Containerization | Docker + Docker Compose |
| Dev Server | tsx (watch mode) |

---

## 🚀 API Gateway — Feature Details

API Gateway is the most developed service. Its features:

| Feature | File | Description |
|---------|------|-------------|
| Env Validation | `config/env.ts` | Zod schema validates all environment variables |
| Security | `security.middleware.ts` | Helmet-based security headers |
| Request ID | `request-id.middleware.ts` | Unique request ID per request |
| Logging | `request-logger.middleware.ts` | Pino-based structured logging |
| Rate Limiting | `rate-limit.middleware.ts` | Redis-backed rate limiter |
| JWT Auth | `auth.middleware.ts` | Optional JWT verification middleware |
| Reverse Proxy | `proxy.ts` | `http-proxy-middleware` forwards to downstream services |
| Error Handling | `error.middleware.ts` | Centralized error handler |
| Graceful Shutdown | `server.ts` | SIGTERM/SIGINT handle & Redis clean close |

---

## 🚦 How to Start

### Prerequisites

- **Docker Desktop** must be installed and running

### Method 1: Docker Compose (Recommended ✅)

Easiest way — one command starts everything:

```bash
# Navigate to project root
cd "Project structure"

# Build + start all services
docker compose up --build
```

> [!TIP]
> To run in background, add `-d` flag:
> ```bash
> docker compose up --build -d
> ```

### Method 2: Individual Services (Without Docker)

If you don't want to use Docker, start each service separately:

```bash
# Step 1: Install & run Redis locally
brew install redis
redis-server --requirepass "your_redis_password"

# Step 2: API Gateway
cd api-gateway
npm install
npm run dev

# Step 3: Auth Service (new terminal)
cd auth-service
npm install
npm run dev

# Step 4: Notification Service (new terminal)
cd notification-service
npm install
npm run dev
```

> [!WARNING]
> Without Docker, you must update the `.env` file:
> - Change `REDIS_HOST=redis` → `REDIS_HOST=localhost`
> - Change service URLs from `http://auth-service:5001` → `http://localhost:5001` (and similarly for others)

---

## ✅ Verify Services Are Running

After starting, test with these commands:

```bash
# API Gateway health check
curl http://localhost:4000/health

# Auth Service health check
curl http://localhost:5001/health

# Notification Service health check
curl http://localhost:5002/health

# Auth login endpoint (placeholder)
curl -X POST http://localhost:4000/api/v1/auth/login

# Notification endpoint (placeholder)
curl -X POST http://localhost:4000/api/v1/notifications/send
```

---

## 🛑 Stop Services

```bash
# If running in foreground: Ctrl+C

# If running in background:
docker compose down

# Remove everything including volumes:
docker compose down -v
```

---

## ⚠️ Current Observations

> [!IMPORTANT]
> **Auth Service & Notification Service are both placeholders** — they only have basic health check and placeholder endpoints. Real business logic (JWT token generation, DB connection, actual notification sending) is not implemented yet.

> [!WARNING]
> **Course Service (`course-service`)** is referenced in `.env` and proxy config, but the folder has not been created yet. Docker Compose also doesn't define its container. Routes to `/api/v1/courses/*` will fail.

> [!NOTE]
> **No Database** is being used by any service currently. Auth service will typically need PostgreSQL/MongoDB for storing user data.
