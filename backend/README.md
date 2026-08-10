# Lost & Found Backend

Phase 1 backend foundation for LAN-first deployment on Raspberry Pi.

## Stack

- Node.js + Express + TypeScript
- Prisma ORM + SQLite
- JWT authentication + role based authorization
- Multer-ready upload directories
- Centralized validation and error handling

## Quick Start

1. Copy environment file:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Prisma client and create initial migration:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   ```

4. Bootstrap super admin:

   ```bash
   npm run bootstrap:admin
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

## Current APIs

- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

## Planned in Next Phases

- Found Items module
- Lost Reports module
- Matching engine
- Return history workflows
- Search and reporting endpoints
