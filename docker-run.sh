#!/bin/bash

# Docker build and run script for hello-bravo backend

set -e

echo "🐳 Building Docker image..."
docker build -t hello-bravo-backend ./backend

echo "🚀 Running backend in production mode..."
echo "   Environment: production"
echo "   Port: 8000"
echo "   URL: http://localhost:8000"
echo ""

# Run with production environment
docker run -p 8000:8080 \
  -e ENVIRONMENT=production \
  --env-file ./backend/.env.production \
  hello-bravo-backend

echo ""
echo "✅ Backend stopped" 