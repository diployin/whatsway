# WhatsApp Business Platform

## Overview
This project is a comprehensive WhatsApp Business messaging platform featuring a modern full-stack architecture. It aims to provide businesses with powerful tools for managing WhatsApp communications, including dashboard analytics, contact management, campaign creation, message templates, inbox management, and automation flows. The platform's vision is to streamline customer engagement, enhance marketing efforts, and improve operational efficiency through the WhatsApp Business API.

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
- **Architectural Pattern**: Model-View-Controller (MVC) for code organization and separation of concerns.

### Core System Design
- **Dashboard System**: Real-time statistics, message delivery analytics, campaign performance tracking.
- **Contact Management**: CSV import, groups, tagging, search, filtering, bulk operations.
- **Campaign Management**: Template-based message creation, recipient selection, scheduling, delivery tracking.
- **Template System**: WhatsApp Business API template creation, category organization, approval status management, media support.
- **Inbox & Conversations**: Real-time message management, conversation history, status tracking, reply functionality, WATI-style UI redesign with split-panel layout, real-time message status indicators, 24-hour window enforcement, and date separators.
- **Automation Framework**: Designed for visual workflow building, trigger-based automation, conditional logic (planned).
- **Team Management**: Comprehensive team management functionality with roles (admin/manager/agent), conversation assignments, activity logs, and a dedicated UI.
- **Channel-Specific Data Filtering**: All data (contacts, templates, campaigns, inbox, analytics, dashboard) dynamically filters based on the active channel selected.
- **Global Webhook Implementation**: Simplified webhook architecture utilizing a single global endpoint for all channels, routing events based on `phone_number_id` in the payload.

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework

### WhatsApp Integration
- **WhatsApp Business Cloud API**: Configurable version (currently v23.0).
- **MM Lite API**: For high-volume messaging.
- **Dynamic Webhook Endpoints**: For real-time message events with signature verification.

### Development Tools
- **Vite**: Fast development server and build tool.
- **TypeScript**: Type safety across the stack.
- **ESBuild**: Fast JavaScript bundling for production.

## Recent Changes
- Fixed critical campaign message sending issue by implementing actual WhatsAppApiService integration instead of just logging
- Added static sendTemplateMessage method to WhatsAppApiService for proper campaign execution
- Enhanced template syncing to fetch complete template data including components, header, body, footer, and buttons
- Implemented contact duplicate prevention system with user feedback showing statistics (e.g., "90 added, 10 duplicates")
- Enhanced API campaign functionality with sample code generation and improved API details display
- Updated template sync to import all templates from WhatsApp API with proper language handling
- Enhanced contact import with duplicate detection showing detailed statistics
- Improved API campaign details display with copy buttons and sample code generation
- Added phone number formatting utility to ensure proper international format (+countrycode) for WhatsApp API message delivery
- Enhanced webhook processing to properly capture WhatsApp message status updates (sent, delivered, read, failed)
- Added comprehensive error details capture in webhook with errorDetails field storing code, title, message, and errorData
- Updated Message Logs UI to display detailed error information including Meta API error codes and messages
- Implemented proper message status tracking through webhook status updates for better delivery insights
- Conducted comprehensive technical compliance assessment against global standards (Score: 85/100)
- Created TECHNICAL_COMPLIANCE_REPORT.md documenting compliance with 27 technical requirements
- Fixed parseInt usage to include radix parameter (10) for proper number parsing
- Successfully refactored large React components for technical compliance (Score improved: 85→98/100):
  - Settings component: 1405 lines → 74 lines (8 modular components: ChannelSettings, WebhookSettings, TeamSettings, AccountSettings, ApiKeySettings, plus dialog components)
  - Templates component: 1291 lines → 277 lines (3 modular components: TemplatesTable, TemplatePreview, TemplateDialog)
- Fixed all TypeScript errors in refactored components (Badge variant compatibility, JSX syntax errors, type mismatches)
- Completed server-side refactoring using repository pattern (Technical compliance score: 98→100/100):
  - database-storage.ts: 751 lines → ~350 lines
  - Created 13 modular repository classes (User, Contact, Campaign, Channel, Template, Conversation, Message, Automation, Analytics, WebhookConfig, MessageQueue, ApiLog, WhatsappChannel)
  - Improved code maintainability and separation of concerns
  - Fixed all TypeScript errors in repository implementation
- Enhanced Meta API integration to request comprehensive phone number fields (Jan 3, 2025):
  - Added request for all available fields including messaging_limit_tier, account_review_status, quality_score
  - Fixed messaging limit display to use messaging_limit_tier field instead of messaging_limit
  - Added console logging for debugging API responses
- Implemented MM Lite API support for marketing messages (Jan 3, 2025):
  - Updated sendTemplateMessage to use /marketing_messages endpoint for marketing campaigns
  - Maintains backward compatibility using /messages endpoint for service/utility/authentication messages
  - Added isMarketing parameter to control endpoint selection
- Fixed Meta API field validation errors (Jan 3, 2025):
  - Removed non-existent fields (message_template_namespace, currency) from WhatsAppBusinessPhoneNumber API requests
  - Updated to use only confirmed valid fields: id, account_mode, display_phone_number, is_official_business_account, is_pin_enabled, is_preverified_number, messaging_limit_tier, name_status, new_name_status, platform_type, quality_rating, quality_score, search_visibility, status, throughput, verified_name, code_verification_status, certificate
  - Fixed channel health check in controllers and cron job to prevent API errors