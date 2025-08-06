# WhatsApp Business Platform

## Overview
This project is a comprehensive WhatsApp Business messaging platform designed to empower businesses with robust tools for managing WhatsApp communications. Its core purpose is to streamline customer engagement, enhance marketing efforts, and improve operational efficiency via the WhatsApp Business API. Key capabilities include dashboard analytics, contact management, campaign creation, message templates, inbox management, and automation flows.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Framework**: Radix UI components with Tailwind CSS
- **Component Library**: Shadcn/ui
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Neon Database serverless connection
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

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### WhatsApp Integration
- **WhatsApp Business Cloud API**: Configurable version (currently v23.0), used for messaging, template management, and fetching phone number details.
- **Dynamic Webhook Endpoints**: For real-time message events with signature verification and status updates.

### Development Tools
- **Vite**: Fast development server and build tool.
- **TypeScript**: Type safety across the stack.
- **ESBuild**: Fast JavaScript bundling for production.