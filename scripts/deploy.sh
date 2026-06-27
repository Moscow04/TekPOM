#!/bin/bash
set -e

echo "============================================"
echo "  TekTariq PM — Deploy Script"
echo "============================================"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "1. Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi
echo "   Docker: $(docker --version)"

echo ""
echo "2. Updating code from Git..."
if command -v git &> /dev/null && [ -d ".git" ]; then
    git pull
    echo "   Code updated."
else
    echo "   Not a git repo or git not available — skipping pull."
fi

echo ""
echo "3. Configuring environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    JWT_SECRET=$(openssl rand -hex 64)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i "" "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
    echo "   .env created with random JWT secret."
else
    echo "   .env already exists — keeping existing."
fi

set -a
source .env
set +a

echo ""
echo "4. Building and starting services..."
COMPOSE_FILES="-f docker-compose.yml"
if [ -n "$DOMAIN" ]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
    echo "   Production mode detected (DOMAIN=$DOMAIN)"
fi

docker compose $COMPOSE_FILES build --parallel
docker compose $COMPOSE_FILES up -d

echo ""
echo "============================================"
echo "  Deploy complete!"
echo "============================================"
if [ -n "$DOMAIN" ]; then
    echo "  Frontend:  https://$DOMAIN"
    echo "  API:       https://$DOMAIN/api"
    echo "  MinIO:     https://console.$DOMAIN"
else
    echo "  Frontend:  http://localhost:3000"
    echo "  API:       http://localhost:4000/api/v1"
fi
echo "  DB:        postgresql://tektariq:16-10Ac030@localhost:5432/tektariq_pm"
echo ""
echo "  Login:     superadmin@tektariq.com / TeKtArIq2024!"
echo ""
echo "  Stop:      docker compose down"
echo "  Logs:      docker compose logs -f"
echo "============================================"
