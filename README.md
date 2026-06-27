# TekTariq PM

Internal project management platform for TekTariq IT Solutions Limited.

## Quick Start (Local)

**Prerequisites:** Docker and Git.

```bash
# Clone the repo
git clone https://github.com/Moscow04/TekPOM.git
cd TekPOM

# One-click deploy (no chmod needed)
bash scripts/deploy.sh
```

The script will:
1. Check Docker is installed
2. Pull the latest code from Git
3. Generate a `.env` with a random JWT secret
4. Build and start all services via Docker Compose

Open **http://localhost:3000** and log in with:
- **Email:** `superadmin@tektariq.com`
- **Password:** `TeKtArIq2024!`

## Production Deployment (your own server / VPS)

> This turns on HTTPS via Caddy (automatic Let's Encrypt SSL).

### 1. Prepare the server

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

### 2. Clone the repo

```bash
git clone https://github.com/Moscow04/TekPOM.git
cd TekPOM
```

### 3. Set your domain

```bash
# Create .env with your domain
cp .env.example .env
# Edit .env and set:
#   DOMAIN=tekpom.yourdomain.com
#   ACME_EMAIL=you@email.com   (for Let's Encrypt notices)
```

### 4. Deploy

```bash
bash scripts/deploy.sh
```

That's it. The script detects `DOMAIN` is set and automatically:
- Uses `docker-compose.prod.yml` to add the Caddy reverse proxy
- Gets a free SSL certificate via Let's Encrypt
- Exposes everything on port 443 (HTTPS)

### Updating

```bash
cd TekPOM
bash scripts/deploy.sh    # pulls latest code and rebuilds
```

### Troubleshooting the server

| Symptom | Fix |
|---------|-----|
| `permission denied` on scripts | Use `bash scripts/deploy.sh` instead of `./scripts/deploy.sh` |
| Port 80/443 already in use | Stop any existing web server: `sudo systemctl stop nginx` |
| SSL certificate not issued | Make sure DNS for your domain points to this server's IP, and port 80 is reachable |

## Manual Setup (Development without Docker)

**Prerequisites:** Node.js 20+, pnpm 9+, PostgreSQL 16, Redis.

```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
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

## Services (Docker)

| Service   | Local              | Production              |
|-----------|--------------------|--------------------------|
| Frontend  | http://localhost:3000 | https://your.domain   |
| API       | http://localhost:4000/api/v1 | https://your.domain/api |
| Database  | postgres:16-alpine | postgres:16-alpine       |
| Redis     | redis:7-alpine     | redis:7-alpine           |
| MinIO     | http://localhost:9000 | internal (127.0.0.1)  |
| Caddy     | —                  | auto HTTPS, port 443     |

## Default Accounts

All passwords: `TeKtArIq2024!`

| Email | Roles |
|-------|-------|
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

## Commands

| Command | Description |
|---------|-------------|
| `bash scripts/deploy.sh` | One-click deploy (local or production) |
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop all services |
| `docker compose logs -f` | Follow logs |
| `pnpm dev` | Start all services in dev mode |
| `pnpm build` | Build all packages |
| `pnpm db:seed` | Seed database |
