# TekTariq PM

Internal project management platform for TekTariq IT Solutions Limited.

## Quick Start (Docker — One Click)

```bash
# Windows (PowerShell)
.\scripts\deploy.ps1

# Linux/Mac
chmod +x scripts/deploy.sh && ./scripts/deploy.sh
```

This will:
1. Generate a secure JWT secret
2. Create the `.env` file
3. Build and start all services via Docker Compose
4. Auto-create database tables and seed sample data

**Default login:** `superadmin@tektariq.com` / `TeKtArIq2024!`

## Manual Setup (Development)

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed sample data
pnpm db:seed

# Start all services in dev mode
pnpm dev
```

## Architecture

```
/apps
  /web          Next.js 14 frontend (port 3000)
  /api          NestJS backend (port 4000)
  /worker       BullMQ background workers
/packages
  /db           Prisma schema + client
  /shared       Zod schemas, types, constants
  /policy       CASL ability definitions
  /config       Shared ESLint + TypeScript configs
  /ui           Shared React components
```

## Database

PostgreSQL 16 with Prisma ORM.
Connection: `postgresql://tektariq:16-10Ac030@localhost:5432/tektariq_pm`

## Default Accounts

| Email | Roles |
|---|---|
| superadmin@tektariq.com | SUPER_ADMIN, CAB_MEMBER |
| ceo@tektariq.com | CEO, CAB_MEMBER |
| cpo@tektariq.com | CPO, CAB_MEMBER |
| cto@tektariq.com | CTO, CAB_MEMBER |
| cbo@tektariq.com | CBO, CAB_MEMBER |
| coo@tektariq.com | COO, CAB_MEMBER |
| pm@tektariq.com | PRODUCT_MANAGER |
| designer@tektariq.com | PRODUCT_DESIGNER |
| design-lead@tektariq.com | PRODUCT_DESIGN_TEAM_LEAD |
| engineer@tektariq.com | FRONTEND_DEVELOPER |
| ba@tektariq.com | BUSINESS_ANALYST |

All accounts have password: `TeKtArIq2024!`
