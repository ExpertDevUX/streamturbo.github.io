# StreamVibe - Live Streaming Platform

## Overview

StreamVibe is a comprehensive live streaming platform built with modern full-stack architecture. It provides real-time streaming capabilities, interactive chat functionality, advanced creator tools, and professional administration features. The platform supports multiple authentication methods, RTMP streaming, and includes both viewer and creator experiences with administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: Custom translation context supporting multiple languages

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: Drizzle ORM with dual support for PostgreSQL and SQLite
- **Authentication**: Passport.js with multiple strategies (local, Google OAuth, Facebook OAuth)
- **Session Management**: Express sessions with configurable storage (PostgreSQL/Memory)
- **Real-time Communication**: WebSocket server for live chat and streaming updates

### Data Storage Solutions
- **Primary Database**: PostgreSQL for production (with SQLite fallback for development)
- **ORM**: Drizzle with automatic schema management and migrations
- **Session Storage**: PostgreSQL sessions table or memory store for development
- **Media Storage**: Local filesystem with plans for cloud storage integration

### Authentication and Authorization
- **Multi-provider Authentication**: Local email/password, Google OAuth2, Facebook OAuth
- **Role-based Access Control**: User, moderator, and admin roles
- **Session Security**: HTTP-only cookies with CSRF protection
- **Password Security**: bcryptjs for hashing with salt rounds

### Streaming Infrastructure
- **RTMP Server**: Node Media Server for receiving streams
- **Video Processing**: FFmpeg integration for transcoding and adaptive bitrate
- **Stream Delivery**: HLS and DASH protocols for cross-platform compatibility
- **Real-time Features**: WebSocket connections for live chat and viewer count updates

### Key Design Patterns
- **Repository Pattern**: Storage abstraction layer for database operations
- **Middleware Architecture**: Express middleware for authentication, authorization, and request processing
- **Event-driven Architecture**: WebSocket events for real-time updates
- **Component Composition**: React component hierarchy with shared UI primitives
- **Type Safety**: End-to-end TypeScript with shared schema definitions

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with TypeScript, Vite for bundling and development
- **Node.js Backend**: Express.js with TypeScript compilation via tsx
- **Database**: Drizzle ORM supporting both PostgreSQL and SQLite backends

### Authentication Services
- **OAuth Providers**: Google OAuth2 and Facebook OAuth integration
- **Passport.js**: Authentication middleware with multiple strategy support
- **Session Management**: Express-session with connect-pg-simple for PostgreSQL storage

### Media and Streaming
- **Node Media Server**: RTMP server for stream ingestion
- **FFmpeg**: Video processing and transcoding (system dependency)
- **WebSocket**: Real-time communication for chat and live updates

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide Icons**: Comprehensive icon library for UI elements

### Development and Build Tools
- **Vite**: Fast development server and production bundler
- **ESBuild**: Fast JavaScript/TypeScript bundling for server-side code
- **TypeScript**: Type checking and compilation across frontend and backend

### Third-party Integrations
- **Replit Integration**: Special handling for Replit development environment
- **Chart Libraries**: Recharts for analytics and data visualization
- **PDF Generation**: jsPDF for admin report generation
- **Form Handling**: React Hook Form with Zod validation

### System Dependencies (Production)
- **Nginx**: Reverse proxy and RTMP module for production deployment
- **PostgreSQL**: Primary database for production environments
- **Let's Encrypt**: SSL certificate management for HTTPS
- **Systemd**: Service management for production deployment