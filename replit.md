# WhatsApp Business Platform

## Overview
<<<<<<< HEAD
This project is a comprehensive WhatsApp Business messaging platform designed to empower businesses with robust tools for managing WhatsApp communications. Its core purpose is to streamline customer engagement, enhance marketing efforts, and improve operational efficiency via the WhatsApp Business API. Key capabilities include dashboard analytics, contact management, campaign creation, message templates, inbox management, and automation flows.

## User Preferences
=======

This is a comprehensive WhatsApp Business messaging platform built with a modern full-stack architecture. The application provides dashboard analytics, contact management, campaign creation, message templates, inbox management, automation flows, and settings configuration for WhatsApp Business API integration.

## User Preferences

>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
<<<<<<< HEAD
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Framework**: Radix UI components with Tailwind CSS
- **Component Library**: Shadcn/ui
- **Build Tool**: Vite
=======
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Component Library**: Shadcn/ui design system
- **Build Tool**: Vite for development and production builds
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Neon Database serverless connection
<<<<<<< HEAD
- **ORM**: Drizzle ORM
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Architectural Pattern**: Model-View-Controller (MVC) for code organization.

### Core System Design
- **Dashboard System**: Real-time statistics, message delivery analytics, campaign performance tracking.
- **Contact Management**: CSV import, groups, tagging, search, filtering, bulk operations, duplicate prevention.
- **Campaign Management**: Template-based message creation, recipient selection, scheduling, delivery tracking.
- **Template System**: WhatsApp Business API template creation, organization, approval status, media support, and comprehensive syncing.
- **Inbox & Conversations**: Real-time message management, conversation history, status tracking, reply functionality, WATI-style UI redesign with split-panel layout, real-time message status indicators, 24-hour window enforcement, and date separators.
- **Automation Framework**: Visual workflow builder supporting trigger-based automation and conditional logic with nodes for user reply, time gap, send template, custom reply, and keyword catch.
- **Team Management**: Comprehensive team management with roles (admin/manager/agent), conversation assignments, activity logs, and a dedicated UI.
- **Channel-Specific Data Filtering**: All platform data dynamically filters based on the active channel selected.
- **Global Webhook Implementation**: Utilizes a single global endpoint for all channels, routing events based on `phone_number_id` in the payload, including detailed error capture and message status tracking.
- **Authentication System**: Session-based authentication with protected routes, default admin user, and integrated login/logout functionality.
- **Modularity**: Extensive refactoring into modular components and a repository pattern for improved maintainability and separation of concerns.
=======
- **ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main entities:
- **Users**: Authentication and user management
- **Contacts**: Customer contact information with groups and tags
- **Campaigns**: Marketing and transactional message campaigns
- **Templates**: WhatsApp message templates with approval status
- **Conversations**: Chat conversations with contacts
- **Messages**: Individual messages within conversations
- **Automations**: Workflow automation rules and triggers
- **Analytics**: Performance metrics and tracking data

## Key Components

### 1. Dashboard System
- Real-time statistics and metrics
- Message delivery analytics
- Campaign performance tracking
- Quick action shortcuts

### 2. Contact Management
- CSV import with field mapping
- Contact groups and tagging system
- Search and filtering capabilities
- Bulk operations support

### 3. Campaign Management
- Template-based message creation
- Recipient selection (CSV, contacts, groups)
- Scheduling and automation
- Delivery status tracking

### 4. Template System
- WhatsApp Business API template creation
- Category-based organization (marketing, transactional, utility)
- Approval status management
- Media attachment support

### 5. Inbox & Conversations
- Real-time message management
- Contact conversation history
- Message status tracking
- Reply functionality

### 6. Automation Framework
- Visual workflow builder (planned)
- Trigger-based automation
- Conditional logic support
- API integration capabilities

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack React Query
2. **API Layer**: Express.js handles routing and request validation
3. **Business Logic**: Storage layer abstracts database operations
4. **Database**: Drizzle ORM executes type-safe PostgreSQL queries
5. **Response**: JSON data flows back through the stack to update UI
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
<<<<<<< HEAD
- **drizzle-orm**: Type-safe ORM
=======
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### WhatsApp Integration
<<<<<<< HEAD
- **WhatsApp Business Cloud API**: Configurable version (currently v23.0), used for messaging, template management, and fetching phone number details.
- **Dynamic Webhook Endpoints**: For real-time message events with signature verification and status updates.

### Development Tools
- **Vite**: Fast development server and build tool.
- **TypeScript**: Type safety across the stack.
- **ESBuild**: Fast JavaScript bundling for production.

## Recent Changes
- Flexible database support (Jan 7, 2025):
  - Added support for both standard PostgreSQL and Neon cloud databases
  - Auto-detection of database type based on connection string
  - Fixed SSL/WebSocket errors for self-hosted PostgreSQL
  - Removed hard dependency on Neon for deployments
  - SSL configuration handled automatically based on environment
  - Created DATABASE_SETUP.md with comprehensive configuration guide
  - Updated installers to support both database types
- Plesk compatibility fixes (Jan 7, 2025):
  - Created multiple Plesk-compatible startup files (passenger_wsgi.js, plesk-start.js, app.js)
  - Added Plesk fix script to resolve Phusion Passenger startup issues
  - Handles ES modules in CommonJS environment for Plesk
  - Created PLESK_DEPLOYMENT.md with detailed instructions
- Enhanced installer system (Jan 7, 2025):
  - Updated installer.sh to support Neon and standard PostgreSQL options
  - Created comprehensive INSTALLATION_GUIDE.md covering all platforms
  - Added production-ready configurations (nginx.conf, ecosystem.config.js)
  - Docker support with optimized multi-stage builds
- Simplified and consolidated installation system (Jan 6, 2025):
  - Created single robust `installer.sh` that works on ALL servers (Plesk, DigitalOcean, cPanel, AWS, etc.)
  - Added complete Docker support with `Dockerfile` and `docker-compose.yml`
  - Created comprehensive `DOCKER_INSTALL.md` with step-by-step Docker deployment
  - Added `app.js` for Plesk Node.js compatibility (CommonJS entry point)
  - Created `ecosystem.config.js` for PM2 process management
  - Added `nginx.conf` for production reverse proxy
  - Installer auto-handles: Node.js installation, PostgreSQL setup, dependency installation, build process, PM2 configuration, Nginx setup, SSL certificates
  - Installation time: 5-10 minutes on any server
  - Cleaned up root directory by removing redundant installer files
- Achieved 100% CodeCanyon compliance (Jan 6, 2025):
  - Refactored analytics controller into modular services
  - Created analytics.service.ts, campaign-analytics.service.ts, and export.service.ts
  - All functions now under 100 lines for JIT optimization
  - Added explicit "use strict" declarations and semicolons throughout
  - Created comprehensive CODECANYON_COMPLIANCE_REPORT.md
- Created comprehensive technical documentation (Jan 6, 2025):
  - Added TECHNICAL_DOCUMENTATION.md with complete system documentation
  - Covers architecture, technology stack, file structure, and customization guides
  - Written for both technical and non-technical users
  - Includes troubleshooting, API documentation, and database schema
=======
The application is designed to integrate with:
- WhatsApp Business Cloud API
- WhatsApp Business API (On-premises)
- Webhook endpoints for message delivery status

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- tsx for TypeScript execution in development
- Automatic database schema synchronization

### Production
1. **Frontend Build**: Vite builds React app to static assets
2. **Backend Build**: ESBuild bundles server code for Node.js
3. **Database Migration**: Drizzle Kit handles schema migrations
4. **Deployment**: Single Node.js process serving API and static files

### Environment Requirements
- Node.js runtime environment
- PostgreSQL database (Neon Database recommended)
- Environment variables for database connection
- WhatsApp Business API credentials (for messaging features)

The application follows a monorepo structure with shared types and schemas, enabling type safety across frontend and backend while maintaining clear separation of concerns.
>>>>>>> f53b7f6e (Modernize user interface with animations and a visually appealing design)
