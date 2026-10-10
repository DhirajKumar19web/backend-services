# PROGRESS-SERVICE
This service is configured for fully independent Docker deployment.

## Build and Push Image
```bash
docker build -f Dockerfile -t your-registry/progress-service:1.0.0 .
docker push your-registry/progress-service:1.0.0
```

## Deploy to Server
1. Copy `docker-compose.yml` and `.env.example` to your target server.
2. Rename `.env.example` to `.env` and update the variables with your production IPs/URLs.
3. Run the service:
```bash
docker compose up -d
```

## Update and Rollback
- To update: Change image tag in `docker-compose.yml`, then run `docker compose up -d`.
- To rollback: Revert the image tag in `docker-compose.yml` and run `docker compose up -d`.
