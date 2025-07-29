#!/bin/bash

# Comprehensive Authentication and CORS Fix
# This script fixes all issues with authentication and CORS

set -e

echo "🔧 Comprehensive Authentication and CORS Fix"
echo "==========================================="

# Get current service URL
SERVICE_URL="https://hello-bravo-api-772654378329.us-central1.run.app"
echo "🌐 Service URL: ${SERVICE_URL}"

# Step 1: Update CORS configuration with comprehensive origins
echo ""
echo "📋 Step 1: Updating CORS configuration..."

ALLOWED_ORIGINS="https://bravocui.github.io,http://localhost:3000,https://localhost:3000,http://127.0.0.1:3000,https://127.0.0.1:3000,http://localhost:3001,https://localhost:3001"

gcloud run services update hello-bravo-api \
    --region=us-central1 \
    --set-env-vars="ALLOWED_ORIGINS=${ALLOWED_ORIGINS}"

echo "✅ CORS configuration updated!"

# Step 2: Test the configuration
echo ""
echo "🧪 Step 2: Testing configuration..."

echo "Testing CORS preflight..."
curl -s -X OPTIONS "${SERVICE_URL}/user/profile" \
    -H "Origin: https://bravocui.github.io" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: content-type" \
    -w "HTTP Status: %{http_code}\n" \
    -o /dev/null

echo "Testing health endpoint..."
curl -s "${SERVICE_URL}/health" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Health: {data[\"status\"]}')
print(f'✅ Database: {data[\"database\"][\"status\"]}')
"

# Step 3: Provide debugging information
echo ""
echo "📝 Step 3: Debugging Information"
echo "================================"

echo "🔍 Current CORS Origins: ${ALLOWED_ORIGINS}"
echo ""
echo "🌐 Frontend should be running on one of these domains:"
echo "   - https://bravocui.github.io (GitHub Pages)"
echo "   - http://localhost:3000 (Local development)"
echo "   - https://localhost:3000 (Local HTTPS)"
echo ""
echo "🔧 Browser Debugging Steps:"
echo "1. Open browser developer tools (F12)"
echo "2. Go to Network tab"
echo "3. Try to log in"
echo "4. Look for CORS errors in Console tab"
echo "5. Check if cookies are being sent in Network tab"
echo ""
echo "🍪 Cookie Debugging:"
echo "1. Check Application tab in dev tools"
echo "2. Look for 'session_token' cookie"
echo "3. Verify cookie domain and path"
echo ""
echo "🔍 Test Commands:"
echo "• Test CORS: curl -X OPTIONS '${SERVICE_URL}/user/profile' -H 'Origin: https://bravocui.github.io' -v"
echo "• Test auth: curl '${SERVICE_URL}/user/profile' -H 'Cookie: session_token=test'"
echo "• View logs: gcloud logs tail -f --project=772654378329 --filter=resource.type=cloud_run_revision"
echo ""
echo "✅ Fix applied! Please:"
echo "1. Refresh your frontend application"
echo "2. Clear browser cookies for the domain"
echo "3. Try logging in again"
echo "4. Check browser developer tools for any remaining errors" 