#!/bin/bash

# Deploy Guest Login and New User Restrictions
# This script deploys the updated authentication system

echo "🔧 Deploying Guest Login and New User Restrictions"
echo "=================================================="

echo "📋 What's new:"
echo "   • Guest login functionality"
echo "   • New user restriction (contact admin message)"
echo "   • Accounting feature hidden for guests"
echo "   • Enhanced user role management"

echo ""
echo "🗄️  Running database migration..."

# Run database migration for development first
cd backend
echo "🔧 Migrating development database..."
python3 migrate_add_guest_role.py

if [ $? -eq 0 ]; then
    echo "✅ Development database migration successful"
else
    echo "❌ Development database migration failed"
    exit 1
fi

echo ""
echo "🚀 Deploying backend..."

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t gcr.io/772654378329/hello-bravo-api .

# Push to Google Container Registry
echo "📤 Pushing to Google Container Registry..."
docker push gcr.io/772654378329/hello-bravo-api

cd ..

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy hello-bravo-api \
    --image gcr.io/772654378329/hello-bravo-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated

echo ""
echo "🗄️  Running production database migration..."
echo "⚠️  WARNING: This will modify the PRODUCTION database!"
read -p "Do you want to run production database migration? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    cd backend
    python3 migrate_production_guest_role.py
    cd ..
else
    echo "⏭️  Skipping production database migration"
    echo "💡 You can run it manually later with: cd backend && python3 migrate_production_guest_role.py"
fi

echo ""
echo "🚀 Deploying frontend..."

# Deploy frontend
cd frontend

# Build the frontend
echo "🔨 Building frontend..."
npm run build

cd ..

echo ""
echo "✅ Guest login system deployed!"
echo ""
echo "🔍 New Features:"
echo "   • 🎭 Guest login button (replaces demo)"
echo "   • 🚫 New users get 'contact admin' message"
echo "   • 💰 Accounting hidden for guest users"
echo "   • 👤 Guest role added to user system"
echo ""
echo "📝 Expected Behavior:"
echo "   • Guest login: Limited features, no accounting"
echo "   • New Google user: 'Contact admin' message"
echo "   • Existing user: Full access"
echo "   • Guest warning: Yellow banner on dashboard"
echo ""
echo "🗄️  Database Status:"
echo "   • Development: ✅ GUEST role added"
if [ "$confirm" = "yes" ]; then
    echo "   • Production: ✅ GUEST role added"
else
    echo "   • Production: ⏭️  Pending manual migration"
fi 