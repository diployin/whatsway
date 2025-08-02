# WhatsApp Business Platform

## Overview

This is a comprehensive WhatsApp Business messaging platform built with a modern full-stack architecture. The application provides dashboard analytics, contact management, campaign creation, message templates, inbox management, automation flows, and settings configuration for WhatsApp Business API integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Component Library**: Shadcn/ui design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Neon Database serverless connection
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

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### WhatsApp Integration
The application is designed to integrate with:
- WhatsApp Business Cloud API (v23.0)
- MM Lite API for high-volume messaging
- Dynamic webhook endpoints for real-time message events
- Channel-specific webhook configuration with signature verification

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

## Recent Changes

### Channel-Specific Data Filtering (August 2025)
- Implemented comprehensive channel filtering across all sections
- Channel switcher now auto-refreshes all data when switching channels
- All queries invalidated on channel switch for immediate data updates
- Channel-specific filtering implemented for:
  - Contacts: Only shows contacts for active channel
  - Templates: Displays templates specific to selected channel
  - Campaigns: Filters campaigns by active channel
  - Team Inbox: Shows conversations for active channel only
  - Analytics: Displays metrics for selected channel
  - Dashboard: Shows stats specific to active channel

### Send Message Dialog Enhancement (August 2025)
- Removed channel dropdown from send message dialog
- Now uses active channel automatically for dedicated channel access
- Displays active channel name in message dialog
- Shows warning if no active channel is selected
- Simplified user experience for channel-specific operations

### Database Schema Updates (August 2025)
- Made channelId columns nullable in conversations, automations, and analytics tables
- Migrated existing records to use active channel
- Fixed SQL syntax errors in channel filtering queries
- Ensured backward compatibility while supporting multi-channel operations

### Contact Management Enhancement (August 2025)
- Fixed contact edit functionality with proper form dialog
- Implemented 3-dots dropdown menu with edit, message, and delete actions
- Added proper delete confirmation dialog replacing browser confirm
- Implemented group management features:
  - Group creation dialog
  - Extract unique groups from all contacts
  - Filter contacts by selected group
  - Dynamic group dropdown menu in filter bar
  - Group assignment in contact forms
- Updated pagination to show filtered contact counts
- Enhanced empty state messages for group filtering

### WhatsApp API Version Update (January 2025)
- Updated WhatsApp Cloud API version to v23.0
- API version is now configurable via WHATSAPP_API_VERSION environment variable
- Ensures compatibility with latest WhatsApp Business Platform features

### Global Webhook Implementation (January 2025)
- Simplified webhook architecture to use one global webhook for all channels
- Single global webhook endpoint: `/webhook/d420e261-9c12-4cee-9d65-253cda8ab4bc`
- Updated webhook configuration:
  - Removed channel-specific webhook URLs
  - Removed foreign key constraint on webhook_configs table
  - Simplified webhook UI to show only global webhook URL
  - Updated webhook dialog to remove channel selection
- Global webhook benefits:
  - One webhook URL for all WhatsApp Business accounts
  - Events from all channels received at single endpoint
  - Routing based on phone_number_id in webhook payload
  - Simplified configuration in Facebook Business Manager
- Enhanced database schema changes:
  - Made channelId nullable in webhook_configs table
  - Removed foreign key constraints for global webhook support

### Template Status Synchronization Fix (January 2025)
- Fixed critical issue where templates approved on Meta were showing as pending in the application
- Enhanced webhook handler to properly update template statuses in database when receiving webhook events
- Updated webhook service to route message_template_status_update events to the handler
- Added manual template sync functionality:
  - Created /api/templates/sync endpoint to fetch template statuses from WhatsApp API
  - Added sync button to templates page UI with loading indicator
  - Sync operation fetches templates from WhatsApp and updates local statuses
  - Shows success message with count of updated templates
- Template status events now properly update database records instead of just logging
- Users can now manually trigger sync to immediately update template statuses without waiting for webhooks

### Code Refactoring and Routes Modularization (August 2025)
- Successfully split the monolithic 1200+ line routes.ts file into modular route files
- Created organized server/routes/ directory structure with separate files for each feature:
  - channels.routes.ts - Channel management endpoints
  - contacts.routes.ts - Contact CRUD operations  
  - templates.routes.ts - Template management and sync
  - campaigns.routes.ts - Campaign operations
  - conversations.routes.ts - Conversation handling
  - messages.routes.ts - Message operations
  - automations.routes.ts - Automation workflows
  - whatsapp.routes.ts - WhatsApp-specific operations
  - webhooks.routes.ts - Webhook configuration and handling
  - dashboard.routes.ts - Dashboard stats endpoints
  - media.routes.ts - Media upload handling
  - index.ts - Main route registration file
- Maintained all existing functionality during refactoring
- Fixed critical send message 404 error caused by endpoint changes
- Preserved backward compatibility with all existing API endpoints

### Channel Switching Data Refresh Implementation (August 2025)
- Fixed channel switching to immediately refresh all page data
- Updated API functions to support channelId parameter for proper filtering
- Enhanced channel switcher component with refetchQueries for instant updates
- All pages now properly filter data by active channel:
  - Dashboard shows channel-specific stats
  - Contacts displays only contacts for active channel
  - Templates shows channel-specific templates
  - Campaigns filters by active channel
  - Team Inbox shows channel conversations
  - Automation displays channel automations
  - Analytics shows channel-specific metrics
- Fixed "Cannot access 'activeChannel' before initialization" error in contacts page by reordering queries