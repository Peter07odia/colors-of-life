#!/bin/bash

# Colors of Life - Cloudflare Tunnel Setup for n8n
# This provides a more reliable alternative to ngrok for exposing local n8n

echo "🌐 Setting up Cloudflare Tunnel for n8n..."

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "📥 Installing cloudflared..."
    
    # Install based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install cloudflared
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
    else
        echo "❌ Unsupported OS. Please install cloudflared manually."
        exit 1
    fi
fi

# Login to Cloudflare (opens browser)
echo "🔐 Please login to your Cloudflare account..."
cloudflared tunnel login

# Create tunnel
TUNNEL_NAME="colorsoflife-n8n"
echo "🚇 Creating tunnel: $TUNNEL_NAME"
cloudflared tunnel create $TUNNEL_NAME

# Get tunnel UUID
TUNNEL_UUID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')

if [ -z "$TUNNEL_UUID" ]; then
    echo "❌ Failed to create tunnel"
    exit 1
fi

echo "✅ Tunnel created with UUID: $TUNNEL_UUID"

# Create tunnel configuration
CONFIG_DIR="$HOME/.cloudflared"
mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_DIR/config.yml" << EOF
tunnel: $TUNNEL_UUID
credentials-file: $CONFIG_DIR/$TUNNEL_UUID.json

ingress:
  - hostname: n8n-colorsoflife.your-domain.com
    service: http://localhost:5678
  - service: http_status:404
EOF

echo "📝 Configuration created at $CONFIG_DIR/config.yml"
echo ""
echo "🔧 Next steps:"
echo "1. Update your domain DNS to point to the tunnel"
echo "2. Run: cloudflared tunnel route dns $TUNNEL_NAME n8n-colorsoflife.your-domain.com"
echo "3. Start tunnel: cloudflared tunnel run $TUNNEL_NAME"
echo ""
echo "🌐 Your n8n will be available at: https://n8n-colorsoflife.your-domain.com"
echo ""
echo "📱 Update your .env file:"
echo "EXPO_PUBLIC_N8N_WEBHOOK_URL=https://n8n-colorsoflife.your-domain.com" 