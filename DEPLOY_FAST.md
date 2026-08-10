# Fastest Deployment (Docker Compose)

This setup runs all 3 apps with one command:

- Backend API on `:4000`
- Security Portal on `:5173`
- Admin Dashboard on `:5174`

## 1) Prerequisites

- Docker Desktop (Windows) or Docker Engine (Linux)
- Ports `4000`, `5173`, `5174` open on host

## 2) Configure environment

From project root:

```powershell
Copy-Item .env.deploy.example .env.deploy
```

Then edit `.env.deploy` and set:

- `JWT_ACCESS_SECRET` to a strong random value
- `FRONTEND_API_BASE_URL` to your real server URL, for example:
  - `http://192.168.1.119:4000/api/v1` (LAN)
  - `https://api.yourdomain.com/api/v1` (public)

## 3) Build and run

```powershell
docker compose --env-file .env.deploy up -d --build
```

## 4) Access apps

- Security Portal: `http://<server-ip>:5173`
- Admin Dashboard: `http://<server-ip>:5174`
- Backend Health: `http://<server-ip>:4000/api/v1/health`

## 5) First-time admin bootstrap

Run once after containers are up:

```powershell
docker exec rssb-backend npm run bootstrap:admin
```

Optional seed data:

```powershell
docker exec rssb-backend npm run seed:master-data
```

## 6) Useful commands

```powershell
# Logs
docker compose logs -f backend
docker compose logs -f security-portal
docker compose logs -f admin-dashboard

# Restart
docker compose restart

# Stop
docker compose down
```

## Notes

- SQLite DB and uploads persist in Docker volumes:
  - `backend_prisma`
  - `backend_uploads`
- If you change `FRONTEND_API_BASE_URL`, rebuild frontend images:

```powershell
docker compose --env-file .env.deploy up -d --build security-portal admin-dashboard
```
