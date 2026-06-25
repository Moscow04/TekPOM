#!/bin/bash
set -e

echo "🚀 TekTariq PM — One-Click Deploy"
echo "===================================="
echo ""

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "1. Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    exit 1
fi
echo "   ✅ Docker: $(docker --version)"

if [ ! -f "$ROOT_DIR/.env" ]; then
    echo "2. Creating .env file from template..."
    cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
    JWT_SECRET=$(openssl rand -hex 64)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ROOT_DIR/.env"
    echo "   ✅ JWT secret generated"
fi

echo "3. Loading environment variables..."
set -a
source "$ROOT_DIR/.env"
set +a
echo "   ✅ Environment loaded"

echo "4. Building and starting all services..."
cd "$ROOT_DIR"
docker compose build --parallel
docker compose up -d

echo ""
echo "5. Waiting for services..."
sleep 10

echo ""
echo "✅ Deploy complete!"
echo "===================================="
echo "Frontend:  http://localhost:3000"
echo "API:       http://localhost:4000/api/v1"
echo "Database:  postgresql://tektariq:16-10Ac030@localhost:5432/tektariq_pm"
echo "Redis:     redis://localhost:6379"
echo "MinIO:     http://localhost:9000"
echo "===================================="
echo "Default login credentials:"
echo "  Email:    superadmin@tektariq.com"
echo "  Password: TeKtArIq2024!"
echo "===================================="
echo "To stop:   docker compose down"
echo "To view logs: docker compose logs -f"
