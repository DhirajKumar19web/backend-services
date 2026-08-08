# Microservices Project Structure

This repository contains multiple backend services for the application system:

## 📁 Services Directory

- 🚀 **`api-gateway`**: Entry point for API routing, rate limiting, and request forwarding.
- 🔐 **`auth-service`**: Service handling user authentication, authorization, token generation, and user management.
- 🔔 **`notification-service`**: Service handling push notifications, email alerts, SMS, and messaging events.

## 🛠️ Getting Started

Each service is an independent microservice with its own dependencies, environment config, and scripts.

```bash
# Navigate to a specific service
cd auth-service

# Install dependencies
npm install

# Start development server
npm run dev
```
