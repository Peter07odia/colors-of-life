#!/bin/bash

# Colors of Life - n8n Webhook Setup and Testing Script
# This script helps configure and test n8n webhook connectivity

echo "🔧 Colors of Life - n8n Webhook Setup"
echo "======================================"

# Function to test n8n connection
test_n8n_connection() {
    local url=$1
    echo "🔍 Testing n8n connection to: $url"
    
    # Test basic connectivity
    if curl -s --connect-timeout 5 "$url/healthz" > /dev/null 2>&1; then
        echo "✅ n8n is accessible"
        return 0
    else
        echo "❌ n8n is not accessible"
        return 1
    fi
}

# Function to test webhook endpoint
test_webhook_endpoint() {
    local url=$1
    echo "🔍 Testing webhook endpoint: $url/webhook/avatar-creation"
    
    # Test webhook with dummy data
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d '{"test": true, "userId": "test", "avatarId": "test"}' \
        "$url/webhook/avatar-creation" \
        --connect-timeout 10)
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ Webhook endpoint is working"
        return 0
    elif [ "$http_code" = "404" ]; then
        echo "❌ Webhook endpoint not found (404) - workflow may not be active"
        return 1
    else
        echo "⚠️ Webhook returned HTTP $http_code"
        return 1
    fi
}

# Current configuration check
echo ""
echo "📋 Current Configuration:"
echo "------------------------"

if [ -f ".env.local" ]; then
    N8N_URL=$(grep "EXPO_PUBLIC_N8N_WEBHOOK_URL" .env.local | cut -d'=' -f2)
    if [ -n "$N8N_URL" ]; then
        echo "Current n8n URL: $N8N_URL"
    else
        echo "❌ EXPO_PUBLIC_N8N_WEBHOOK_URL not found in .env.local"
    fi
else
    echo "❌ .env.local file not found"
fi

# Setup options
echo ""
echo "🛠️ Setup Options:"
echo "1. Local n8n (http://localhost:5678)"
echo "2. ngrok tunnel (requires ngrok running)"
echo "3. Cloudflare tunnel (requires setup)"
echo "4. Custom URL"
echo "5. Test current configuration"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        N8N_URL="http://localhost:5678"
        echo "Setting up local n8n..."
        ;;
    2)
        echo "📱 First, start ngrok in another terminal:"
        echo "   ngrok http 5678"
        echo ""
        read -p "Enter your ngrok URL (e.g., https://abc123.ngrok.io): " ngrok_url
        N8N_URL="$ngrok_url"
        ;;
    3)
        read -p "Enter your Cloudflare tunnel URL: " cf_url
        N8N_URL="$cf_url"
        ;;
    4)
        read -p "Enter custom n8n URL: " custom_url
        N8N_URL="$custom_url"
        ;;
    5)
        if [ -n "$N8N_URL" ]; then
            test_n8n_connection "$N8N_URL"
            test_webhook_endpoint "$N8N_URL"
        else
            echo "❌ No n8n URL configured"
        fi
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

# Test the connection
echo ""
echo "🔍 Testing Connection:"
echo "--------------------"

if test_n8n_connection "$N8N_URL"; then
    if test_webhook_endpoint "$N8N_URL"; then
        echo ""
        echo "✅ All tests passed! Updating configuration..."
        
        # Update .env.local
        if [ -f ".env.local" ]; then
            # Remove existing line and add new one
            grep -v "EXPO_PUBLIC_N8N_WEBHOOK_URL" .env.local > .env.local.tmp
            echo "EXPO_PUBLIC_N8N_WEBHOOK_URL=$N8N_URL" >> .env.local.tmp
            mv .env.local.tmp .env.local
        else
            echo "EXPO_PUBLIC_N8N_WEBHOOK_URL=$N8N_URL" > .env.local
        fi
        
        # Update Supabase secrets
        echo "🔐 Updating Supabase secrets..."
        if command -v supabase &> /dev/null; then
            supabase secrets set N8N_WEBHOOK_URL="$N8N_URL"
            echo "✅ Supabase secrets updated"
        else
            echo "⚠️ Supabase CLI not found. Please run manually:"
            echo "   supabase secrets set N8N_WEBHOOK_URL=\"$N8N_URL\""
        fi
        
        echo ""
        echo "🎉 Setup complete!"
        echo "📱 Restart your Expo app to use the new configuration"
        
    else
        echo ""
        echo "❌ Webhook test failed. Please check:"
        echo "1. Is n8n running?"
        echo "2. Is the avatar-creation workflow active?"
        echo "3. Is the webhook URL correct?"
    fi
else
    echo ""
    echo "❌ Connection test failed. Please check:"
    echo "1. Is n8n running?"
    echo "2. Is the URL correct?"
    echo "3. Are there any firewall/network issues?"
fi 