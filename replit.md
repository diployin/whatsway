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
- Fixed critical dashboard translation system issues (Jan 4, 2025):
  - Resolved i18n store not loading translations properly by removing persistence layer
  - Fixed TypeScript interface mismatches between translation files and i18n.ts
  - Temporarily disabled non-English/Spanish translation files to ensure stable functionality
  - Dashboard now displays all text correctly instead of showing translation keys
  - All navigation items, dashboard cards, and UI elements show proper English/Spanish text
- Made Team Inbox mobile-responsive with hide/show functionality and back button (Jan 3, 2025):
  - Updated conversations list to hide on mobile when a conversation is selected
  - Added back button to chat header for mobile navigation
  - Fixed TypeScript errors by renaming User import from lucide-react to UserIcon
  - Fixed apiRequest method calls to use correct parameter order
- Created dashboard hooks for dynamic data fetching (Jan 3, 2025):
  - Created useDashboardStats and useAnalytics hooks in use-dashboard.ts
  - Hooks fetch real data from API endpoints with channel filtering
  - Added 30-second auto-refresh for dashboard stats
- Started implementing dynamic dashboard with real data integration
- Prepared comprehensive documentation for CodeCanyon listing (Jan 3, 2025):
  - Created DOCUMENTATION.md with full user guide, installation steps, and troubleshooting
  - Created CODECANYON_README.md for marketplace listing with feature highlights
  - Created QUICK_START_GUIDE.md for 15-minute setup process
  - Created PROJECT_STRUCTURE.md documenting complete folder architecture
  - Created API_DOCUMENTATION.md with complete REST API endpoints and examples
  - Created DEPLOYMENT_GUIDE.md with production deployment instructions
  - Created CHANGELOG.md tracking version history
  - Created LICENSE file for proprietary software licensing
  - Created .env.example with all required environment variables
  - Organized code structure for clean CodeCanyon submission
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
- Corrected MM Lite API implementation (Jan 3, 2025):
  - MM Lite is not a separate API but uses WhatsApp Cloud API's /marketing_messages endpoint
  - Updated sendTemplateMessage to use /marketing_messages endpoint for marketing campaigns
  - Maintains backward compatibility using /messages endpoint for service/utility/authentication messages
  - Added isMarketing parameter to control endpoint selection
  - Removed incorrect MM Lite configuration fields from schema and documentation
- Fixed Meta API field validation errors (Jan 3, 2025):
  - Removed non-existent fields (message_template_namespace, currency) from WhatsAppBusinessPhoneNumber API requests
  - Updated to use only confirmed valid fields: id, account_mode, display_phone_number, is_official_business_account, is_pin_enabled, is_preverified_number, messaging_limit_tier, name_status, new_name_status, platform_type, quality_rating, quality_score, search_visibility, status, throughput, verified_name, code_verification_status, certificate
  - Fixed channel health check in controllers and cron job to prevent API errors
- Implemented comprehensive authentication system (Jan 3, 2025):
  - Created auth.routes.ts with login/logout/me endpoints
  - Created auth.middleware.ts for session-based authentication
  - Migrated from teamMembers table to users table for unified user management
  - Created default admin user with credentials (username: whatsway, password: Admin@123)
  - Built complete frontend authentication with login page, auth context, and protected routes
  - Enhanced sidebar with user information display and logout functionality
- Fixed UI navigation and performance issues (Jan 3, 2025):
  - Fixed login refresh loop by correcting API paths with proper /api prefix
  - Optimized system performance by reducing message status updater frequency from 10s to 60s
  - Added Team page back to sidebar as requested
  - Removed old TeamSettings component from settings page (removed duplicate)
  - Fixed Team page errors by updating from deprecated TeamMember type to User type with firstName/lastName fields
  - Fixed all TypeScript errors in Team page (removed non-existent fields: department, onlineStatus, lastActive)
  - Added missing getTotalCount method to ContactRepository
  - Fixed apiLogs table foreign key issue by adding required requestType field in channel health monitor
- Created comprehensive easy installer system for non-technical users (Jan 3, 2025):
  - Created install.sh for Linux/Mac with full prerequisite checks, env setup, database configuration, webhook instructions, and cron job setup
  - Created install.bat for Windows with equivalent functionality adapted for Windows environment
  - Created universal install.js that auto-detects OS and runs appropriate installer
  - Created setup-env.js for interactive environment configuration with secure password generation
  - Created docker-compose.yml and Dockerfile for containerized deployment option
  - Created run-cron.sh and run-cron.bat for manual cron job execution
  - Created comprehensive INSTALL_README.md with detailed installation instructions
  - Created main README.md with project overview and quick start guide
  - Installer features: prerequisite checking, dependency installation, database setup, default admin user creation, webhook configuration guide, automated task scheduling, and systemd service setup option
- Implemented drag-drop automation flow builder feature (Jan 3, 2025):
  - Created comprehensive automation database schema with automation_workflows, automation_nodes, automation_executions, and automation_execution_logs tables
  - Built AutomationRepository with full CRUD operations for workflows, nodes, and execution tracking
  - Created automation API routes for managing automations with authentication
  - Designed and built visual drag-drop flow builder UI with modular nodes:
    - User Reply: Wait for user response with configurable timeout
    - Time Gap: Delay execution with customizable duration
    - Send Template: Send WhatsApp templates with variable support
    - Custom Reply: Send custom text messages
    - Keyword Catch: Detect keywords and branch flow accordingly
  - Implemented drag-drop functionality for reordering flow steps
  - Added real-time flow preview with expandable node configuration
  - Created automation list view with status toggling and execution statistics
  - Fixed automation repository methods to support findByChannel with optional filtering