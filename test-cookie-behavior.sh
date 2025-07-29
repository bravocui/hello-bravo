#!/bin/bash

# Test Cookie Behavior
# This script helps debug cookie issues

SERVICE_URL="https://hello-bravo-api-772654378329.us-central1.run.app"

echo "🔍 Testing Cookie Behavior"
echo "=========================="

echo ""
echo "1. Testing cookie configuration..."
curl -s -X OPTIONS "${SERVICE_URL}/user/profile" \
    -H "Origin: https://bravocui.github.io" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: content-type" \
    -v 2>&1 | grep -E "(Access-Control-Allow-Credentials|Set-Cookie)" || echo "No cookie headers visible"

echo ""
echo "2. Testing with mock cookie..."
curl -s -w "HTTP Status: %{http_code}\n" \
    "${SERVICE_URL}/user/profile" \
    -H "Cookie: session_token=mock-token" \
    -H "Origin: https://bravocui.github.io"

echo ""
echo "3. Testing CORS preflight for fitness endpoint..."
curl -s -X OPTIONS "${SERVICE_URL}/fitness/entries" \
    -H "Origin: https://bravocui.github.io" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: content-type" \
    -w "HTTP Status: %{http_code}\n" \
    -o /dev/null

echo ""
echo "🔧 Debugging Information:"
echo "=========================="
echo ""
echo "🍪 Cookie Issues to Check:"
echo "1. SameSite Policy: Should be 'none' for cross-domain"
echo "2. Secure Flag: Must be true for SameSite=none"
echo "3. Domain: Should be None (let browser handle)"
echo "4. Path: Should be '/' (for all paths)"
echo ""
echo "🌐 Frontend Domain: https://bravocui.github.io"
echo "🔗 Backend Domain: ${SERVICE_URL}"
echo ""
echo "📝 Browser Debugging Steps:"
echo "1. Open Developer Tools (F12)"
echo "2. Go to Application tab"
echo "3. Check Cookies section"
echo "4. Look for 'session_token' cookie"
echo "5. Verify cookie attributes:"
echo "   • Domain: Should match backend domain"
echo "   • Path: Should be '/'"
echo "   • SameSite: Should be 'none'"
echo "   • Secure: Should be true"
echo ""
echo "🔍 Expected Cookie Attributes:"
echo "   • Name: session_token"
echo "   • Domain: hello-bravo-api-772654378329.us-central1.run.app"
echo "   • Path: /"
echo "   • SameSite: none"
echo "   • Secure: true"
echo "   • HttpOnly: true" 