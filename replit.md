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