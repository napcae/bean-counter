#!/bin/bash
# One-time Strava OAuth setup for Bean Counter

set -e

echo "=== Bean Counter Strava Setup ==="
echo ""
echo "This script will guide you through getting your Strava refresh token."
echo "You only need to do this ONCE."
echo ""

read -p "Enter your Strava Client ID: " CLIENT_ID
read -p "Enter your Strava Client Secret: " CLIENT_SECRET

echo ""
echo "Step 1: Opening authorization URL in your browser..."
echo ""

REDIRECT_URI="http://localhost:8000/"
AUTH_URL="https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=activity:read_all"

if command -v xdg-open &> /dev/null; then
  xdg-open "$AUTH_URL"
elif command -v open &> /dev/null; then
  open "$AUTH_URL"
else
  echo "Please open this URL in your browser:"
  echo "$AUTH_URL"
fi

echo ""
read -p "After authorizing, copy the CODE from the URL and paste it here: " AUTH_CODE

echo ""
echo "Step 2: Exchanging code for tokens..."
echo ""

TOKEN_RESPONSE=$(curl -s -X POST https://www.strava.com/api/v3/oauth/token \
  -d "client_id=${CLIENT_ID}" \
  -d "client_secret=${CLIENT_SECRET}" \
  -d "code=${AUTH_CODE}" \
  -d "grant_type=authorization_code")

REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$REFRESH_TOKEN" ]; then
  echo "ERROR: Failed to get refresh token. Response:"
  echo "$TOKEN_RESPONSE"
  exit 1
fi

echo "✓ Success!"
echo ""
echo "Step 3: Add these to GitHub Settings → Secrets and variables → Actions"
echo ""
echo "STRAVA_CLIENT_ID:"
echo "$CLIENT_ID"
echo ""
echo "STRAVA_CLIENT_SECRET:"
echo "$CLIENT_SECRET"
echo ""
echo "STRAVA_REFRESH_TOKEN:"
echo "$REFRESH_TOKEN"
echo ""
echo "After that, your sync workflow will auto-rotate the refresh token forever."
