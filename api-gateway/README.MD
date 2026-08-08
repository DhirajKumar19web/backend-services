# LMS API Gateway Service

A high-performance, production-ready API Gateway for the LMS Microservices Architecture built with **Node.js, Express, TypeScript, Redis, Pino, Helmet**, and **Http-Proxy-Middleware**.

---

## 🏗️ Architecture & Request Execution Pipeline

All incoming HTTP requests pass sequentially through the following middleware pipeline:

```
                   Request
                      │
                      ▼
              Security Headers (Helmet)
                      │
                      ▼
            Request ID (x-request-id)
                      │
                      ▼
                     CORS
                      │
                      ▼
            Request Logger (Pino HTTP)
                      │
                      ▼
            Rate Limiter (Redis Sliding Window)
                      │
                      ▼
             Body Parser (JSON & URL-Encoded)
                      │
                      ▼
              Route / Proxy Layer
                      │
              ┌───────┼───────┐
              ▼       ▼       ▼
            Auth     User    Course
          Service  Service  Service
              │       │       │
              └───────┼───────┘
                      ▼
                   Response
                      │
                   Error?
                      ▼
            404 & Global Error Handler
```

---

## 📂 Project Structure

```
src/
├── config/
│   ├── env.ts                       # Environment variable validation (Zod)
│   └── redis.ts                     # Backward compatibility export
│
├── middlewares/
│   ├── not-found.middleware.ts      # 404 Route Not Found handler
│   ├── error.middleware.ts          # Centralized global error handler
│   ├── request-id.middleware.ts     # Correlation / trace ID header propagation
│   ├── request-logger.middleware.ts # Pino HTTP structured logger
│   ├── rate-limit.middleware.ts     # Redis sliding window rate limiter
│   └── security.middleware.ts       # Helmet HTTP security headers
│
├── redis/
│   └── redis.ts                     # Ioredis client connection & lifecycle
│
├── proxy/
│   ├── proxy.ts                     # Http-proxy-middleware instances
│   └── proxy-error.ts               # Upstream 502/503/504 proxy error handler
│
├── routes/
│   ├── gateway/                     # Gateway routing table & microservice sub-routes
│   │   └── index.ts
│   ├── health/                      # Gateway & Redis health check route
│   └── index.ts                     # Routes barrel export
│
├── app.ts                           # Express app & middleware setup
└── server.ts                        # HTTP server listener & graceful shutdown
```

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default `.env` configuration:

```env
# Server Configuration
NODE_ENV=development
GATEWAY_HOST=0.0.0.0
GATEWAY_PORT=4000

# Redis Cache & Rate Limiting Configuration
REDIS_URL=redis://localhost:6379

# Microservice Proxy URLs & Prefixes
AUTH_SERVICE_URL=http://auth-service:5001
AUTH_ROUTE_PREFIX=/api/v1/auth

USER_SERVICE_URL=http://user-service:5002
USER_ROUTE_PREFIX=/api/v1/users

COURSE_SERVICE_URL=http://course-service:5003
COURSE_ROUTE_PREFIX=/api/v1/courses
```

### 2. Local Development

Install dependencies and start dev server:

```bash
npm install
npm run dev
```

Run TypeScript typecheck:

```bash
npm run typecheck
```

---

## 🐳 Docker Deployment

### Development Environment

```bash
docker compose -f docker-compose.yml up -d --build
docker compose -f docker-compose.yml logs -f gateway
```

### Production Environment

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f gateway
```

---

## 🩺 Health Check & API Endpoints

- **Gateway Health**: `GET /health`
- **Auth Microservice**: `ANY /api/v1/auth/*` -> `http://auth-service:5001/*`
- **User Microservice**: `ANY /api/v1/users/*` -> `http://user-service:5002/*`
- **Course Microservice**: `ANY /api/v1/courses/*` -> `http://course-service:5003/*`
