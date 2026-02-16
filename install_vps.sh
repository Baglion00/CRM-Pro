#!/bin/bash

# AutoQuote Pro - VPS Installer Script
# Usage: ./install_vps.sh [domain_name]

DOMAIN=$1

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}   AutoQuote Pro - VPS Automated Installer      ${NC}"
echo -e "${BLUE}=================================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo).${NC}"
  exit 1
fi

# 1. Update System
echo -e "\n${GREEN}[1/5] Updating system packages...${NC}"
apt update && apt upgrade -y

# 2. Install Dependencies
echo -e "\n${GREEN}[2/5] Installing dependencies (Nginx, Certbot, Node.js, PM2)...${NC}"
apt install -y nginx certbot python3-certbot-nginx curl git

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# 3. Ask for Domain if not provided
if [ -z "$DOMAIN" ]; then
    echo -e "\n${BLUE}Enter your domain name (e.g., crm.example.com):${NC}"
    read DOMAIN
fi

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Domain is required. Exiting.${NC}"
    exit 1
fi

# 4. Configure Nginx
echo -e "\n${GREEN}[3/5] Configuring Nginx for $DOMAIN...${NC}"

cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root /var/www/autoquote;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Proxy (if backend is present)
    # location /api {
    #     proxy_pass http://localhost:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade \$http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host \$host;
    #     proxy_cache_bypass \$http_upgrade;
    # }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default 2>/dev/null
nginx -t && systemctl reload nginx

# 5. SSL Certificate
echo -e "\n${GREEN}[4/5] Obtaining SSL Certificate via Let's Encrypt...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# 6. Deploy App (Placeholder)
echo -e "\n${GREEN}[5/5] Setup Complete!${NC}"
echo -e "You can now deploy your built React app to: ${BLUE}/var/www/autoquote${NC}"
echo -e "Access your CRM at: ${BLUE}https://$DOMAIN${NC}"
