# LMS Microservices Docker Deployment Guide

## 1. Project Docker Structure

Each microservice contains the following files to support independent building and deploying:
- `Dockerfile` - Multi-stage build optimized for production. Runs compiled code and only installs production dependencies.
- `Dockerfile.dev` - Development build. Supports live reload (e.g. `tsx watch`) and local bind mounts.
- `.dockerignore` - Ignores `node_modules`, `dist`, `.env` files, `.git`, etc., to keep image sizes small and secure.

At the root level, we have two Compose files:
- `docker-compose.dev.yml` - Used for local development of the entire stack. Uses bind mounts for live code reloading and `Dockerfile.dev`.


## 2. Development vs Production Differences

| Feature | Development (`Dockerfile.dev`) | Production (`Dockerfile`) |
| --- | --- | --- |
| **Base Image** | `node:24-alpine` | `node:24-alpine` |
| **Dependencies** | All (dev + prod) | Only production (`npm ci --omit=dev`) |
| **Code Source** | Bind mounted via Compose | Copied and compiled inside image |
| **Execution** | `npm run dev` (e.g., `tsx watch`) | `node dist/server.js` |
| **User** | Default (root) | Non-root user (`appuser`) |
| **Environment** | `NODE_ENV=development` | `NODE_ENV=production` |

## 3. Local Development

To run the complete application locally using Docker Compose:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Build and start all services in detached mode:
   ```bash
   docker compose -f docker-compose.dev.yml up --build -d
   ```
3. View logs for a specific service (e.g., `api-gateway`):
   ```bash
   docker compose -f docker-compose.dev.yml logs -f api-gateway
   ```
4. Stop all services:
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

## 4. Independent Production Deployment

Since each microservice can be deployed to its own server, you must build and deploy them independently. Do NOT rely on Docker Compose networking (e.g. `http://auth-service:5001`) if they are on separate physical machines.

### Step 1: Build the Image
On your CI/CD pipeline or build server:
```bash
docker build -f auth-service/Dockerfile -t your-registry/auth-service:1.0.0 ./auth-service
docker push your-registry/auth-service:1.0.0
```

### Step 2: Deploy to the Target Server
On Server 2 (Auth Service):
```bash
docker pull your-registry/auth-service:1.0.0
docker run -d \
  --name auth-service \
  --restart unless-stopped \
  -p 5001:5001 \
  --env-file .env.production \
  your-registry/auth-service:1.0.0
```

## 5. Required Environment Variables

When deploying a service to a separate server, provide its specific `.env.production` file.
For example, for the `api-gateway`:
- `NODE_ENV=production`
- `GATEWAY_PORT=4000`
- `AUTH_SERVICE_URL=http://<IP_OF_SERVER_2>:5001`
- `USER_SERVICE_URL=http://<IP_OF_SERVER_3>:5004`
- `REDIS_HOST=<IP_OF_REDIS_SERVER>`
- `REDIS_PASSWORD=your_secure_password`

You should use DNS names (e.g., `auth.internal.yourdomain.com`) instead of IP addresses if possible, secured via an internal VPC or VPN.

## 6. Inter-Service Communication

Services deployed on different servers must communicate over the network. 
- Ensure that the ports (e.g., `5001` for Auth) are accessible from the API Gateway server.
- **Security:** Do not expose internal microservice ports to the public internet. Use a firewall (e.g., UFW, AWS Security Groups) to restrict incoming traffic on port `5001` to only accept connections from the API Gateway's IP address.

## 7. Infrastructure Services (PostgreSQL, Redis, RabbitMQ, MinIO)

Infrastructure services should be deployed on dedicated nodes or as managed services.
- **PostgreSQL:** Port `5432` should be restricted. Persist the `/var/lib/postgresql/data` volume.
- **Redis:** Restrict port `6379`. Always use a strong `REDIS_PASSWORD`.
- **RabbitMQ:** Restrict ports `5672` (AMQP) and `15672` (Management UI). Ensure `RABBITMQ_DEFAULT_USER` is not `guest` in production, as `guest` can only connect via localhost by default.
- **MinIO:** Ensure persistent volumes are mounted for `/data`. Expose the API port (`9000`) appropriately, and restrict the Console port (`9001`).

## 8. Firewall & Security Considerations

- **Public Internet:** Only expose the API Gateway port (e.g., `4000` or `443` via a reverse proxy like Nginx) to the public internet.
- **Internal Traffic:** All other service ports (5001-5009, 6379, 5672) should be completely blocked from the outside and only allow internal VPC/VPN traffic.
- **Non-root Containers:** Production images use a non-root `appuser`. Ensure any mounted volumes have the correct ownership/permissions.

## 9. Persistent Volumes and Backup

- **MinIO Data:** Must use a persistent volume or bind mount to a separate disk. Set up daily backups (e.g., via `mc mirror` or standard disk snapshots).
- **PostgreSQL, Redis & RabbitMQ:** Map data directories to persistent volumes. If using them only for caching/transient messages, persistence may be optional, but recommended.

## 10. Troubleshooting and Rollbacks

- View production container logs:
  ```bash
  docker logs -f auth-service
  ```
- Exec into a running production container (if needed for debugging):
  ```bash
  docker exec -it auth-service /bin/sh
  ```
- **Rollback:** If a new image tag `1.0.1` fails, simply stop the container and run the previous tag `1.0.0`:
  ```bash
  docker stop auth-service
  docker rm auth-service
  docker run -d --name auth-service -p 5001:5001 --env-file .env.production your-registry/auth-service:1.0.0
  ```
