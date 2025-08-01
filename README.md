# StreamVibe - Professional Live Streaming Platform

StreamVibe is a comprehensive live streaming platform built with modern full-stack architecture. The platform supports real-time streaming, chat functionality, advanced creator tools, and professional broadcasting capabilities with RTMP integration, auto-encoding to HLS/DASH formats, and external embed support.

## 🚀 Quick Installation Options

### Option 1: Automated Script (Recommended for VPS)

Run the automated installation script on Ubuntu 20.04+ or CentOS 8+:

```bash
# Download and run the installation script
curl -fsSL https://raw.githubusercontent.com/your-repo/streamvibe/main/install.sh | sudo bash
```

Or manual download:

```bash
# Download the script
wget https://raw.githubusercontent.com/your-repo/streamvibe/main/install.sh

# Make it executable
chmod +x install.sh

# Run installation
sudo ./install.sh
```

The script automatically installs and configures:
- Node.js 20.x
- PostgreSQL 14+
- Nginx with RTMP module
- SSL certificates (Let's Encrypt)
- FFmpeg for video processing
- System security (fail2ban, firewall)
- Service management (systemd)

### Option 2: Docker Deployment

Quick setup with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/your-repo/streamvibe.git
cd streamvibe

# Copy environment file
cp .env.example .env

# Edit configuration
nano .env

# Start services
docker-compose up -d
```

### Option 3: One-Click Cloud Deployment

Deploy to popular cloud providers:

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/your-repo/streamvibe)
[![Deploy to AWS](https://img.shields.io/badge/Deploy%20to-AWS-orange.svg)](https://aws.amazon.com/lightsail/)
[![Deploy to Google Cloud](https://img.shields.io/badge/Deploy%20to-GCP-blue.svg)](https://cloud.google.com/run)

## 📋 Prerequisites

- Ubuntu 20.04+ or CentOS 8+
- Root or sudo access
- Domain name pointing to your server
- At least 2GB RAM and 20GB disk space

## 🛠️ Manual Installation

If you prefer manual installation, follow these steps:

### 1. System Dependencies
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql nginx ffmpeg git

# CentOS/RHEL
sudo dnf install -y nodejs npm postgresql-server nginx ffmpeg git
```

### 2. Database Setup
```bash
sudo -u postgres createuser streamvibe
sudo -u postgres createdb streamvibe -O streamvibe
```

### 3. Application Setup
```bash
git clone https://github.com/your-repo/streamvibe.git
cd streamvibe
npm install
npm run build
```

### 4. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Start Services
```bash
sudo systemctl start postgresql nginx
npm start
```

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: Local SQLite database with better-sqlite3 driver
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Local authentication with bcrypt password hashing
- **Session Management**: Express sessions with memory store
- **Streaming**: Node Media Server for RTMP streaming support
- **WebSocket**: Native WebSocket server for real-time features

## Key Components

### Authentication System
- Replit Auth integration for user authentication
- Session-based authentication with PostgreSQL session store
- Protected routes and middleware for API endpoints
- User profile management with automatic account creation

### Database Schema
- **Users**: Profile information, streaming keys, follower counts
- **Sessions**: Session storage for authentication persistence
- **Categories**: Stream categories for content organization
- **Streams**: Live stream metadata and status
- **Chat Messages**: Real-time chat functionality
- Relationships between users, streams, and categories

### Streaming Infrastructure
- RTMP server for live stream ingestion
- WebSocket server for real-time chat and notifications
- Stream key validation and user authentication
- Live status management and viewer counting

### UI Components
- Responsive navigation with user dropdown and language selector
- Sidebar with categories and followed streamers
- Stream cards with thumbnails and metadata
- Live video player with controls
- Real-time chat interface
- Advanced Creator Studio with:
  - Live streaming configuration and status monitoring
  - Advanced video encoding settings (resolution, bitrate, FPS, encoder selection)
  - Auto-conversion to HLS/DASH formats with adaptive bitrate streaming
  - Comprehensive RTMP setup with step-by-step software configuration guides
  - Stream analytics and performance metrics
  - Stream tools and API integration
  - Multi-language interface support (6 languages)

## Data Flow

### Authentication Flow
1. User clicks login → redirected to Replit Auth
2. Successful auth → user data stored in database
3. Session created and stored in PostgreSQL
4. Protected routes check session validity

### Streaming Flow
1. Streamer gets unique stream key from creator studio
2. Streaming software connects to RTMP server
3. Server validates stream key and starts broadcast
4. Viewers connect via web player to HTTP stream
5. Chat messages flow through WebSocket connections

### Real-time Updates
- WebSocket connections for live chat
- Query invalidation for follower updates
- Live status updates across the platform
- Viewer count synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session store
- **node-media-server**: RTMP streaming server
- **passport**: Authentication middleware
- **openid-client**: OIDC authentication

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Build tool and dev server
- **tsx**: TypeScript execution
- **esbuild**: JavaScript bundler for production

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- Replit integration with development banner
- WebSocket server running alongside Express

### Production Build
1. Frontend built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Static files served by Express in production
4. Database migrations applied via Drizzle Kit
5. Environment variables for database and auth configuration

### Environment Requirements
- **SESSION_SECRET**: Secret for session encryption (provided automatically)
- **NODE_ENV**: Environment mode (development/production)
- Local SQLite database file (streamvibe.db) created automatically
- No external database services required

## Recent Changes (August 2025)

### Database Migration to Local SQLite (August 1, 2025)
- **Replaced Neon PostgreSQL** with local SQLite database for better performance and reliability
- **Added better-sqlite3** driver with WAL mode for optimal concurrency
- **Implemented proper query functionality** with Unix timestamp handling for all database operations
- **Created comprehensive schema** with proper foreign keys, indexes, and relationships
- **Added automatic database initialization** with table creation and seeding
- **Fixed all data persistence issues** ensuring information saves correctly
- **Database includes**: users, streams, categories, follows, chat_messages tables with full relationships

### Creator Studio Enhancement
- **Complete rewrite** of Creator Studio with advanced streaming features
- **Live encoding configuration**: Resolution, bitrate, FPS, and encoder selection
- **Auto-conversion system**: Automatic HLS/DASH conversion with adaptive bitrate streaming
- **RTMP integration**: Comprehensive setup guides for 6 streaming applications (OBS Studio, XSplit, vMix, Streamlabs Mobile, Wirecast, FFmpeg CLI)
- **Stream analytics**: Real-time metrics and performance monitoring
- **Multi-language support**: All Creator Studio features translated across 6 languages
- **Enhanced text visibility**: Fixed all text visibility issues with proper color contrast
- **Advanced tools**: Stream health monitoring, VOD management, API integration

### Translation System Completion
- Extended translation coverage to all Creator Studio components and advanced features
- Added specialized streaming terminology translations for all new RTMP software
- Maintained consistent translation quality across all technical features

## 📱 Features

### Core Streaming Features
- **Real-time RTMP Streaming**: Professional broadcasting with multiple software support
- **Auto-encoding**: Automatic conversion to HLS and DASH formats
- **Multi-quality Streaming**: Adaptive bitrate streaming (720p, 1080p, 1440p, 4K)
- **Live Chat**: Real-time viewer interaction with moderation tools
- **Stream Management**: Complete creator dashboard with analytics

### Advanced Creator Tools
- **Stream Preview**: Real-time preview with logo overlay and custom controls
- **Multiple Software Support**: OBS Studio, XSplit, vMix, Streamlabs, Wirecast, FFmpeg
- **Embed System**: Easy integration into external websites
- **Analytics Dashboard**: Comprehensive streaming metrics and viewer insights
- **Multi-language Support**: 6 language interface support

### Technical Features
- **WebSocket Communication**: Real-time updates and notifications
- **PostgreSQL Database**: Reliable data persistence and user management
- **Nginx Integration**: High-performance reverse proxy and load balancing
- **SSL/TLS Security**: Automatic certificate management with Let's Encrypt
- **API Integration**: RESTful API for external integrations

## 🎮 Streaming Software Setup

StreamVibe supports all major streaming applications:

### OBS Studio (Recommended)
1. Open OBS Studio
2. Go to Settings → Stream
3. Service: Custom
4. Server: `rtmp://your-domain.com:1935/live`
5. Stream Key: [Your unique stream key]

### XSplit
1. Open XSplit Broadcaster
2. Click Broadcast → Add Channel
3. Select Custom RTMP
4. Configure with your RTMP URL and stream key

### vMix (Professional)
1. Open vMix
2. Go to Settings → Streaming
3. Destination: Custom RTMP Server
4. Configure streaming parameters

[View complete setup guide in the Creator Studio]

## 🌐 Embed Integration

Easily embed streams into your website:

```html
<iframe 
  src="https://your-domain.com/embed/STREAM_KEY"
  width="800" 
  height="450"
  frameborder="0" 
  allowfullscreen>
</iframe>
```

### JavaScript Integration
```javascript
const player = new StreamVibePlayer({
  container: '#stream-player',
  streamKey: 'YOUR_STREAM_KEY',
  autoplay: false,
  controls: true
});
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/streamvibe

# Security
SESSION_SECRET=your-session-secret-here

# Server
PORT=5000
NODE_ENV=production

# Optional: External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Nginx RTMP Configuration
The installation script automatically configures Nginx with RTMP module for:
- Live streaming ingestion
- HLS/DASH output generation
- Stream recording
- Authentication callbacks

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores (2.4 GHz)
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps upload/download

### Recommended for Production
- **CPU**: 4+ cores (3.0+ GHz)
- **RAM**: 8GB+
- **Storage**: 200GB+ SSD
- **Network**: 1 Gbps dedicated
- **CDN**: Cloudflare or similar for global delivery

## 🔐 Security Features

- **SSL/TLS Encryption**: Automatic certificate management
- **Rate Limiting**: API and authentication protection
- **Fail2ban**: Automatic IP blocking for suspicious activity
- **Firewall Configuration**: Automated security rules
- **Database Security**: Encrypted connections and user isolation
- **CSRF Protection**: Cross-site request forgery prevention

## 📈 Monitoring & Analytics

- **Real-time Metrics**: Viewer count, stream health, bandwidth usage
- **Historical Analytics**: Stream performance, audience growth, engagement
- **System Monitoring**: Server resources, database performance, uptime
- **Alerting**: Email notifications for critical events

## 🚀 Performance Optimization

- **CDN Integration**: Global content delivery
- **Database Optimization**: Connection pooling, query optimization
- **Caching**: Redis integration for session and data caching
- **Load Balancing**: Multi-server deployment support
- **Auto-scaling**: Dynamic resource allocation

## 🐛 Troubleshooting

### Common Issues

**Stream Not Starting**
- Check RTMP URL and stream key
- Verify firewall allows port 1935
- Ensure streaming software is configured correctly

**Poor Stream Quality**
- Adjust bitrate settings in streaming software
- Check upload bandwidth
- Verify server resources

**Database Connection Issues**
- Verify PostgreSQL is running
- Check database credentials
- Ensure database exists and is accessible

### Log Locations
- Application logs: `journalctl -u streamvibe -f`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: [View full documentation](https://your-domain.com/docs)
- **Community**: [Join our Discord](https://discord.gg/streamvibe)
- **Issues**: [GitHub Issues](https://github.com/your-repo/streamvibe/issues)
- **Email**: support@streamvibe.com

---

StreamVibe is designed for scalability and can be deployed on any VPS, cloud provider, or dedicated server. The automated installation script handles all the complexity, getting you streaming in minutes.