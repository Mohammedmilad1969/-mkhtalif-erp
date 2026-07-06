#!/bin/bash
set -e

echo "=== Mkhtalif ERP - Production Deployment ==="

# Prompt for domain
read -p "Enter your domain (e.g., erp.example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "Domain is required!"
    exit 1
fi

# Copy env template
if [ ! -f .env ]; then
    cp .env.prod .env
    echo "Created .env file - please edit it with secure passwords"
    exit 1
fi

# Set domain in .env
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env
else
    sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env
fi

echo "=== Starting services ==="
docker compose -f docker-compose.prod.yml up -d --build

echo "=== Waiting for services to be healthy ==="
sleep 10

echo "=== Running database migrations ==="
docker exec mkhtalif-api npx prisma migrate deploy

echo "=== Done! ==="
echo "Frontend: https://$DOMAIN"
echo "API:      https://$DOMAIN/api/v1"
echo "MinIO:    http://$DOMAIN:9001"
