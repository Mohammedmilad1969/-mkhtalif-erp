#!/bin/bash
# Generates secure random secrets for the .env file

echo "DOMAIN=yourdomain.com"
echo "DB_PASSWORD=$(openssl rand -hex 16)"
echo "MINIO_PASSWORD=$(openssl rand -hex 16)"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
