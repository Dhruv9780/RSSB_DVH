# Vercel Deployment Guide

This repo should be deployed as 3 separate Vercel projects:

1. `security-portal` (Vite frontend)
2. `admin-dashboard` (Vite frontend)
3. `backend` (Express API as Vercel Serverless Function)

## 1) Database choice

### Recommended for this backend
Use **PostgreSQL** on a free tier:
- Supabase (free)
- Neon (free)

This backend is now configured for Postgres in Prisma.

### If you want SQLite over the internet
Use **Turso (libSQL)**. It is SQLite-compatible over HTTP, but requires a Prisma adapter setup that is different from standard Prisma Postgres workflow.

## 2) Backend setup (`backend`)

Set these Vercel environment variables:

- `NODE_ENV=production`
- `DATABASE_URL=<your-supabase-or-neon-postgres-url>`
- `JWT_ACCESS_SECRET=<long-random-secret-at-least-24-chars>`
- `JWT_ACCESS_EXPIRES_IN=8h`
- `ENABLE_LOCAL_UPLOADS=false`

Then run schema sync once against your hosted DB:

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run bootstrap:admin
npm run seed:master-data
```

Notes:
- `ENABLE_LOCAL_UPLOADS=false` disables disk-based uploads because Vercel filesystem is not persistent.
- For production media uploads, move to object storage (Supabase Storage, Cloudinary, or S3-compatible).

## 3) Security portal setup (`security-portal`)

Set Vercel environment variable:

- `VITE_API_BASE_URL=https://<your-backend-vercel-domain>/api/v1`

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## 4) Admin dashboard setup (`admin-dashboard`)

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

If later this app calls backend APIs, add:

- `VITE_API_BASE_URL=https://<your-backend-vercel-domain>/api/v1`

## 5) Vercel project root directories

When creating projects in Vercel dashboard, choose root directories:

- `security-portal`
- `admin-dashboard`
- `backend`

## 6) Post-deploy verification

- Backend health: `https://<backend-domain>/api/v1/health`
- Security portal loads and can login
- Admin dashboard loads

If login fails, verify `VITE_API_BASE_URL` points to the backend domain and CORS is enabled.
