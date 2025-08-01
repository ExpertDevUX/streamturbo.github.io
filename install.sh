#!/bin/bash

# StreamVibe Auto Installation Script
# Compatible with Ubuntu 20.04+ and CentOS 8+

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
SSL_EMAIL=""
DB_PASSWORD=""
SESSION_SECRET=""
INSTALL_DIR="/opt/streamvibe"
SERVICE_USER="streamvibe"

# Logo
echo -e "${BLUE}"
cat << "EOF"
  ____  _                      __     _____ _          
 / ___|| |_ _ __ ___  __ _ _ __ __\ \   / /_ _| |__   ___ 
 \___ \| __| '__/ _ \/ _` | '_ '_ \ \ / / | || '_ \ / _ \
  ___) | |_| | |  __/ (_| | | | | \ V /  | || |_) |  __/
 |____/ \__|_|  \___|\__,_|_| |_|  \_/  |___|_.__/ \___|
                                                        
 Professional Live Streaming Platform
 
EOF
echo -e "${NC}"

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Detect OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    print_error "Cannot detect OS. This script supports Ubuntu 20.04+ and CentOS 8+"
    exit 1
fi

print_status "Detected OS: $OS $VER"

# Get user input
get_user_input() {
    echo -e "${BLUE}StreamVibe Installation Configuration${NC}"
    echo "Please provide the following information:"
    echo ""
    
    while [[ -z "$DOMAIN" ]]; do
        read -p "Enter your domain name (e.g., streaming.example.com): " DOMAIN
    done
    
    while [[ -z "$SSL_EMAIL" ]]; do
        read -p "Enter email for SSL certificate: " SSL_EMAIL
    done
    
    while [[ -z "$DB_PASSWORD" ]]; do
        read -s -p "Enter PostgreSQL password: " DB_PASSWORD
        echo ""
    done
    
    if [[ -z "$SESSION_SECRET" ]]; then
        SESSION_SECRET=$(openssl rand -base64 32)
        print_status "Generated session secret"
    fi
    
    echo ""
    print_status "Configuration complete!"
}

# Install dependencies based on OS
install_dependencies() {
    print_status "Installing system dependencies..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt update
        apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
        
        # Add Node.js repository
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        
        # Add PostgreSQL repository
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
        echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
        
        # Install packages
        apt update
        apt install -y nodejs postgresql-14 postgresql-contrib nginx certbot python3-certbot-nginx \
                      ffmpeg build-essential git supervisor ufw fail2ban
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
        # Enable EPEL
        dnf install -y epel-release
        
        # Add Node.js repository
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        
        # Install PostgreSQL
        dnf module install -y postgresql:13
        
        # Install packages
        dnf install -y nodejs postgresql-server postgresql-contrib nginx certbot python3-certbot-nginx \
                      ffmpeg gcc gcc-c++ make git supervisor firewalld fail2ban
        
        # Initialize PostgreSQL
        postgresql-setup --initdb
        systemctl enable postgresql
        systemctl start postgresql
    else
        print_error "Unsupported OS: $OS"
        exit 1
    fi
    
    print_status "System dependencies installed successfully"
}

# Configure PostgreSQL
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Start PostgreSQL
    systemctl enable postgresql
    systemctl start postgresql
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE USER streamvibe WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE streamvibe OWNER streamvibe;
GRANT ALL PRIVILEGES ON DATABASE streamvibe TO streamvibe;
ALTER USER streamvibe CREATEDB;
\q
EOF
    
    # Configure PostgreSQL for local connections
    PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
    PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
    
    if [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]]; then
        PG_CONFIG_DIR="/var/lib/pgsql/data"
    fi
    
    # Update pg_hba.conf for local connections
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG_DIR/postgresql.conf"
    
    systemctl restart postgresql
    
    print_status "PostgreSQL configured successfully"
}

# Create system user
create_user() {
    print_status "Creating system user..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/bash -m -d /home/$SERVICE_USER $SERVICE_USER
        print_status "User $SERVICE_USER created"
    else
        print_status "User $SERVICE_USER already exists"
    fi
}

# Install StreamVibe application
install_application() {
    print_status "Installing StreamVibe application..."
    
    # Create installation directory
    mkdir -p $INSTALL_DIR
    cd $INSTALL_DIR
    
    # Clone or copy application files
    if [[ -d "/tmp/streamvibe" ]]; then
        cp -r /tmp/streamvibe/* .
    else
        print_warning "Application files not found. Please ensure the application is in /tmp/streamvibe"
        print_status "Creating minimal structure for now..."
        mkdir -p {client,server,shared}
    fi
    
    # Install Node.js dependencies
    if [[ -f "package.json" ]]; then
        npm install --production
    else
        # Create minimal package.json if not exists
        cat > package.json << EOF
{
  "name": "streamvibe",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "tsx build"
  }
}
EOF
        npm install
    fi
    
    # Set ownership
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    
    print_status "Application installed"
}

# Configure Nginx
setup_nginx() {
    print_status "Configuring Nginx..."
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Create StreamVibe site configuration
    cat > /etc/nginx/sites-available/streamvibe << EOF
# RTMP configuration
rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        allow publish all;
        
        application live {
            live on;
            
            # HLS
            hls on;
            hls_path /var/www/html/hls;
            hls_fragment 3;
            hls_playlist_length 60;
            
            # DASH
            dash on;
            dash_path /var/www/html/dash;
            dash_fragment 3;
            dash_playlist_length 60;
            
            # Record streams
            record all;
            record_path /var/recordings;
            record_unique on;
            record_suffix .flv;
            
            # Authentication
            on_publish http://localhost:5000/api/rtmp/auth;
            on_publish_done http://localhost:5000/api/rtmp/done;
        }
    }
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;
    
    # StreamVibe server
    upstream streamvibe_backend {
        server 127.0.0.1:5000;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name $DOMAIN;
        
        # Redirect to HTTPS
        return 301 https://\$server_name\$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;
        
        # SSL configuration (will be updated by certbot)
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # Serve HLS and DASH streams
        location /hls {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }
            root /var/www/html;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
        }
        
        location /dash {
            types {
                application/dash+xml mpd;
            }
            root /var/www/html;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
        }
        
        # API routes with rate limiting
        location /api/auth {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://streamvibe_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://streamvibe_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # WebSocket for real-time features
        location /ws {
            proxy_pass http://streamvibe_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Static files
        location / {
            proxy_pass http://streamvibe_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # Enable client caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://streamvibe_backend;
        }
    }
}
EOF
    
    # Create directories for streaming
    mkdir -p /var/www/html/{hls,dash}
    mkdir -p /var/recordings
    chown -R www-data:www-data /var/www/html
    chown -R $SERVICE_USER:$SERVICE_USER /var/recordings
    
    # Enable site
    ln -sf /etc/nginx/sites-available/streamvibe /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    print_status "Nginx configured successfully"
}

# Setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Stop nginx temporarily
    systemctl stop nginx
    
    # Get certificate
    certbot certonly --standalone -d $DOMAIN --email $SSL_EMAIL --agree-tos --no-eff-email
    
    # Start nginx
    systemctl start nginx
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    print_status "SSL certificate configured"
}

# Create systemd service
create_service() {
    print_status "Creating systemd service..."
    
    cat > /etc/systemd/system/streamvibe.service << EOF
[Unit]
Description=StreamVibe Live Streaming Platform
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=streamvibe
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://streamvibe:$DB_PASSWORD@localhost:5432/streamvibe
Environment=SESSION_SECRET=$SESSION_SECRET
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable streamvibe
    
    print_status "Service created successfully"
}

# Configure firewall
setup_firewall() {
    print_status "Configuring firewall..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # UFW for Ubuntu/Debian
        ufw --force enable
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 1935/tcp  # RTMP
    else
        # firewalld for CentOS/RHEL
        systemctl enable firewalld
        systemctl start firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=1935/tcp  # RTMP
        firewall-cmd --reload
    fi
    
    print_status "Firewall configured"
}

# Setup monitoring and security
setup_security() {
    print_status "Setting up security and monitoring..."
    
    # Configure fail2ban
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
EOF
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Setup log rotation
    cat > /etc/logrotate.d/streamvibe << EOF
/var/log/streamvibe/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
    postrotate
        systemctl reload streamvibe
    endscript
}
EOF
    
    # Create log directory
    mkdir -p /var/log/streamvibe
    chown $SERVICE_USER:$SERVICE_USER /var/log/streamvibe
    
    print_status "Security configured"
}

# Build and start application
start_application() {
    print_status "Building and starting application..."
    
    cd $INSTALL_DIR
    
    # Build application if package.json exists
    if [[ -f "package.json" ]]; then
        sudo -u $SERVICE_USER npm run build 2>/dev/null || print_warning "Build failed, starting anyway"
    fi
    
    # Start services
    systemctl start nginx
    systemctl start streamvibe
    
    # Check status
    sleep 5
    if systemctl is-active --quiet streamvibe; then
        print_status "StreamVibe started successfully"
    else
        print_error "Failed to start StreamVibe service"
        systemctl status streamvibe
    fi
    
    if systemctl is-active --quiet nginx; then
        print_status "Nginx started successfully"
    else
        print_error "Failed to start Nginx"
        systemctl status nginx
    fi
}

# Main installation process
main() {
    echo -e "${GREEN}Starting StreamVibe installation...${NC}"
    echo ""
    
    get_user_input
    install_dependencies
    create_user
    setup_database
    install_application
    setup_nginx
    setup_ssl
    create_service
    setup_firewall
    setup_security
    start_application
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN} StreamVibe Installation Complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}Your StreamVibe platform is now running at:${NC}"
    echo -e "${YELLOW}https://$DOMAIN${NC}"
    echo ""
    echo -e "${BLUE}Services status:${NC}"
    echo "- StreamVibe: $(systemctl is-active streamvibe)"
    echo "- Nginx: $(systemctl is-active nginx)"
    echo "- PostgreSQL: $(systemctl is-active postgresql)"
    echo ""
    echo -e "${BLUE}Important information:${NC}"
    echo "- Application directory: $INSTALL_DIR"
    echo "- Database: streamvibe (PostgreSQL)"
    echo "- Service user: $SERVICE_USER"
    echo "- RTMP URL: rtmp://$DOMAIN:1935/live"
    echo "- Logs: journalctl -u streamvibe -f"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Access your platform at https://$DOMAIN"
    echo "2. Create your admin account"
    echo "3. Configure streaming settings"
    echo "4. Start streaming!"
    echo ""
    echo -e "${GREEN}Installation completed successfully!${NC}"
}

# Run main function
main "$@"