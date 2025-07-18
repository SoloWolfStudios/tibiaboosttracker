# Tibia Discord Bot - Web Dashboard

## Overview

This is a full-stack web application that provides a Discord bot for tracking and posting daily boosted creatures and bosses from the MMORPG Tibia, along with a comprehensive web dashboard for monitoring and configuration. The bot automatically posts updates at 10:06 CEST (6 minutes after server save) and includes smart change detection to prevent spam.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with dark theme design
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Data Fetching**: Custom query client with built-in error handling

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **Development**: Vite middleware integration for hot reloading

### Key Components

#### Discord Bot Features
- Automatic daily updates at 10:06 CEST
- Slash commands: `/update`, `/creature`, `/boss`, `/next`
- Rich Discord embeds with creature images and stats
- Smart change detection to avoid duplicate posts
- TibiaData API v4 integration with fallback mechanisms

#### Web Dashboard Features
- Real-time bot status monitoring
- Creature tracking and history
- Configuration management
- API testing interface
- Activity logs and troubleshooting

#### Database Schema
- `users`: User authentication and management
- `bot_logs`: Activity logging with timestamps and levels
- `bot_status`: Real-time bot status tracking
- `creatures`: Creature data with boosted status tracking
- `api_tests`: API endpoint testing and monitoring

## Data Flow

1. **Bot Operations**: Discord bot fetches data from TibiaData API, processes changes, and posts updates
2. **Status Updates**: Bot reports status to database via REST API
3. **Dashboard Monitoring**: Web interface queries bot status and logs in real-time
4. **Configuration**: Web dashboard allows configuration changes that affect bot behavior
5. **API Testing**: Dashboard provides interface to test and monitor external API endpoints

## External Dependencies

### Core Dependencies
- **Discord Integration**: Discord.js for bot functionality
- **TibiaData API**: External API for game data (v4)
- **Database**: Neon PostgreSQL serverless database
- **UI Components**: Radix UI primitives with Shadcn/ui wrapper

### Development Tools
- **Build System**: Vite with TypeScript support
- **ORM**: Drizzle Kit for database migrations
- **Styling**: PostCSS with Autoprefixer
- **Type Safety**: Zod for runtime schema validation

## Deployment Strategy

### Railway Deployment
The application is configured for Railway deployment with the following setup:

#### Required Environment Variables
- `DISCORD_TOKEN`: Discord bot authentication token
- `CREATURE_CHANNEL_ID`: Discord channel for creature updates
- `BOSS_CHANNEL_ID`: Discord channel for boss updates
- `DATABASE_URL`: PostgreSQL connection string (auto-provisioned by Railway)

#### Build Process
1. Frontend builds to `dist/public` directory
2. Backend builds with esbuild to `dist/index.js`
3. Single production server serves both static frontend and API routes

#### Architecture Decisions
- **Monolith Design**: Single application serving both frontend and backend reduces deployment complexity
- **Serverless Database**: Neon PostgreSQL provides automatic scaling and connection pooling
- **Static Asset Serving**: Production server serves pre-built React assets with API fallback
- **Session Storage**: PostgreSQL-backed sessions for persistent user authentication
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Development Experience**: Vite HMR integration for rapid development iteration

The application uses a hybrid approach where the development server runs Vite middleware for hot reloading, while production serves static assets directly from Express, providing optimal performance in both environments.