# 🎓 LMS Backend — Microservices Architecture

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-8-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A production-ready Learning Management System backend built with microservices, designed for scalability and clean separation of concerns.**

</div>

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────┐
                        │   🌐 Client / Frontend   │
                        └────────────┬────────────┘
                                     │
                               All Requests
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                🐳 Docker Compose Network (lms-network)             │
│                                                                    │
│                   ┌─────────────────────────┐                      │
│                   │    🚀 API Gateway        │                     │
│                   │       Port: 4000         │                     │
│                   └───┬─────────┬─────────┬─┘                     │
│                       │         │         │                        │
│            ┌──────────┘         │         └──────────┐             │
│            │                    │                    │             │
│            ▼                    ▼                    ▼             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│   │  🔐 Auth        │  │  🔔 Notification│  │  🎓 Course      │  │
│   │  Service        │  │  Service        │  │  Service        │  │
│   │  Port: 5001     │  │  Port: 5002     │  │  Port: 5003     │  │
│   │  /api/v1/auth   │  │  /api/v1/users  │  │  /api/v1/courses│  │
│   └─────────────────┘  └─────────────────┘  │  📋 Planned     │  │
│                                             └─────────────────┘  │
│                                                                    │
│                   ┌─────────────────────────┐                      │
│                   │    ⚡ Redis              │                     │
│                   │    Port: 6379            │                     │
│                   │    Cache & Rate Limit    │                     │
│                   └─────────────────────────┘                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Services Directory

| Service | Port | Status | Description |
|---------|------|--------|-------------|
| 🚀 **api-gateway** | `4000` | ✅ Active | Entry point — routing, rate limiting, JWT auth, reverse proxy |
| 🔐 **auth-service** | `5001` | 🚧 In Progress | User authentication, authorization & token management |
| 🔔 **notification-service** | `5002` | 🚧 In Progress | Push notifications, email alerts, SMS & messaging |
| 🎓 **course-service** | `5003` | 📋 Planned | Course management (not yet created) |
| ⚡ **Redis** | `6379` | ✅ Active | Caching & rate limiting |

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| 🟦 Language | TypeScript 7.x | Type-safe development |
| 🟢 Runtime | Node.js 24 (Alpine) | Lightweight server runtime |
| ⚡ Framework | Express.js 5.x | HTTP server & routing |
| 🛡️ Validation | Zod 4.x | Schema-based env & input validation |
| 📝 Logging | Pino + pino-http | Structured JSON logging |
| 🔴 Cache | Redis 8 (Alpine) | Rate limiting & caching |
| 🔀 Proxy | http-proxy-middleware 4.x | Reverse proxy to microservices |
| 🔒 Security | Helmet 8.x | HTTP security headers |
| 🐳 Containers | Docker + Docker Compose | Service orchestration |
| 🔄 Dev Server | tsx (watch mode) | Hot-reload in development |

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd "Project structure"
```

### 2️⃣ Setup Environment

```bash
cp .env.example .env
```

> [!TIP]
> The `.env.example` file has sensible defaults. Update `JWT_SECRET` and `REDIS_PASSWORD` with your own values for production.

### 3️⃣ Start All Services

```bash
docker compose up --build
```

> [!TIP]
> Run in detached mode with `-d` flag:
> ```bash
> docker compose up --build -d
> ```

### 4️⃣ Verify Everything is Running

```bash
# Gateway health
curl http://localhost:4000/health

# Auth service health
curl http://localhost:5001/health

# Notification service health
curl http://localhost:5002/health
```

---

## 🧪 API Endpoints

### Health Checks

| Method | Endpoint | Service |
|--------|----------|---------|
| `GET` | `http://localhost:4000/health` | API Gateway |
| `GET` | `http://localhost:5001/health` | Auth Service |
| `GET` | `http://localhost:5002/health` | Notification Service |

### Auth Routes (via Gateway)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | User login |
| `POST` | `/api/v1/auth/register` | User registration |

### Notification Routes (via Gateway)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/notifications/send` | Send notification |

---

## 🔐 API Gateway Features

```
📨 Request
    │
    ▼
🛡️ Helmet Security
    │
    ▼
🆔 Request ID
    │
    ▼
🌐 CORS
    │
    ▼
📝 Pino Logger
    │
    ▼
⏱️ Rate Limiter
    │
    ▼
🔑 JWT Auth
    │
    ▼
📋 Body Parser
    │
    ▼
🔀 Proxy / Routes
    │
    ▼
📤 Response
```

| Feature | Description |
|---------|-------------|
| 🛡️ **Security Headers** | Helmet-based HTTP security |
| 🆔 **Request Tracing** | UUID per request for distributed tracing |
| ⏱️ **Rate Limiting** | Redis-backed request throttling |
| 🔑 **JWT Authentication** | Optional Bearer token verification |
| 🔀 **Reverse Proxy** | Dynamic forwarding to downstream services |
| 📝 **Structured Logging** | JSON logs with Pino |
| 🔄 **Graceful Shutdown** | SIGTERM/SIGINT handling with Redis cleanup |

---

## 📂 Project Structure

```
├── 📄 .env.example                 # Environment template
├── 📄 docker-compose.yml           # Full orchestration
├── 📄 PROJECT_ANALYSIS.md          # Detailed project analysis
│
├── 📁 api-gateway/                 # ✅ Core gateway service
│   ├── src/
│   │   ├── server.ts               # Entry point + graceful shutdown
│   │   ├── app.ts                  # Express app + middleware chain
│   │   ├── config/env.ts           # Zod-validated env config
│   │   ├── middlewares/            # Security, auth, rate-limit, logging
│   │   ├── proxy/                  # Reverse proxy factory
│   │   ├── routes/                 # Health & gateway routes
│   │   ├── redis/                  # Redis client
│   │   └── errors/                 # Custom error classes
│   ├── Dockerfile
│   └── Dockerfile.dev
│
├── 📁 auth-service/                # 🚧 Authentication service
│   ├── src/
│   │   └── server.ts               # Basic Express server
│   ├── Dockerfile
│   └── Dockerfile.dev
│
└── 📁 notification-service/        # 🚧 Notification service
    ├── src/
    │   └── server.ts               # Basic Express server
    ├── Dockerfile
    └── Dockerfile.dev
```

---

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build & start all services |
| `docker compose up --build -d` | Start in background |
| `docker compose down` | Stop all services |
| `docker compose down -v` | Stop & remove volumes |
| `docker compose logs -f` | Follow all service logs |
| `docker compose logs -f api-gateway` | Follow specific service logs |
| `docker compose restart auth-service` | Restart a specific service |

---

## 🔧 Development (Without Docker)

> [!WARNING]
> When running without Docker, update `.env` file:
> - `REDIS_HOST=redis` → `REDIS_HOST=localhost`
> - `AUTH_SERVICE_URL=http://auth-service:5001` → `http://localhost:5001`
> - Similarly update other service URLs

```bash
# Install Redis locally
brew install redis
redis-server --requirepass "your_password"

# In separate terminals:
cd api-gateway && npm install && npm run dev
cd auth-service && npm install && npm run dev
cd notification-service && npm install && npm run dev
```

---

## 📜 Available Scripts (Per Service)

| Script | Command | Description |
|--------|---------|-------------|
| 🔄 Dev | `npm run dev` | Start with hot-reload (tsx watch) |
| 🏗️ Build | `npm run build` | Compile TypeScript |
| 🚀 Start | `npm start` | Run production build |
| ✅ Typecheck | `npm run typecheck` | Type validation only |

---

## 🗺️ Roadmap

- [x] API Gateway with full middleware pipeline
- [x] Docker Compose orchestration
- [x] Redis integration for rate limiting
- [x] Environment validation with Zod
- [ ] Auth Service — JWT login/register implementation
- [ ] Auth Service — Database integration (PostgreSQL/MongoDB)
- [ ] Notification Service — Email/SMS/Push logic
- [ ] Course Service — New microservice
- [ ] Message Queue (RabbitMQ/Kafka) for async notifications
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit & integration tests
- [ ] CI/CD pipeline

---

## 📄 License

ISC

---

<div align="center">

**Built with ❤️ using Node.js, TypeScript & Docker**

</div>
