#!/bin/bash

# Quick Fix for CORS and Cookie Issues
# This script updates the Cloud Run service with proper CORS configuration

echo "🔧 Quick Fix for CORS and Cookie Issues"
echo "======================================="

# Update Cloud Run with proper CORS configuration
echo "Updating CORS configuration..."

# Set ALLOWED_ORIGINS to include common frontend domains
ALLOWED_ORIGINS="https://bravocui.github.io,http://localhost:3000,https://localhost:3000,http://127.0.0.1:3000,https://127.0.0.1:3000"

# Update the service
gcloud run services update hello-bravo-api \
    --region=us-central1 \
    --set-env-vars="ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

echo "✅ CORS configuration updated!"
echo ""
echo "🌐 Allowed origins: ${ALLOWED_ORIGINS}"
echo ""
echo "📝 Next steps:"
echo "1. Refresh your frontend application"
echo "2. Clear browser cookies for the domain"
echo "3. Try logging in again"
echo "4. Check browser developer tools (F12) for CORS errors"
echo ""
echo "🔍 Test the fix:"
echo "curl -X OPTIONS 'https://hello-bravo-api-772654378329.us-central1.run.app/user/profile' \\"
echo "  -H 'Origin: https://bravocui.github.io' \\"
echo "  -H 'Access-Control-Request-Method: GET' \\"
echo "  -H 'Access-Control-Request-Headers: content-type' \\"
echo "  -v" 