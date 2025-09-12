# WhatsWay - WhatsApp Business Platform Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Configuration](#configuration)
5. [Features Overview](#features-overview)
6. [User Guide](#user-guide)
7. [API Documentation](#api-documentation)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)
10. [Support](#support)

## Introduction

WhatsWay is a comprehensive WhatsApp Business messaging platform that enables businesses to manage their WhatsApp communications efficiently. Built with modern technologies, it provides powerful tools for contact management, campaign creation, message templates, inbox management, and automation workflows.

### Key Technologies
- **Frontend**: React 18 with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **WhatsApp Integration**: WhatsApp Business Cloud API & MM Lite API
- **Real-time**: WebSocket for live updates

## System Requirements

### Minimum Server Requirements
- **Operating System**: Ubuntu 20.04+ / Windows Server 2019+ / macOS 10.15+
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Version 14 or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 10GB minimum free space
- **CPU**: 2 cores minimum
- **SSL Certificate**: Required for webhook functionality

### Required Accounts
- WhatsApp Business Account
- Meta Business Account
- Facebook Developer Account
- Domain with SSL certificate

## Installation Guide

### Step 1: Prerequisites Setup

#### On Ubuntu/Debian:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Git
sudo apt install -y git

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

#### On Windows:
1. Download and install Node.js from https://nodejs.org/
2. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
3. Download and install Git from https://git-scm.com/download/win

### Step 2: Database Setup

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE whatsway;
CREATE USER whatsway_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE whatsway TO whatsway_user;
\q
```

### Step 3: Application Setup

```bash
# Clone the repository (or extract from CodeCanyon package)
git clone [repository-url] whatsway
cd whatsway

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Step 4: Environment Configuration

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://whatsway_user:your_secure_password@localhost:5432/whatsway

# Session Configuration
SESSION_SECRET=your_random_session_secret_min_32_chars

# WhatsApp Configuration
WHATSAPP_API_VERSION=v23.0
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# MM Lite Configuration 
# Note: MM Lite uses the same WhatsApp Cloud API with /marketing_messages endpoint
# No separate configuration needed - automatically used for marketing campaigns

# Application URL
APP_URL=https://your-domain.com

# Port Configuration
PORT=5000
```

### Step 5: Database Migration

```bash
# Run database migrations
npm run db:push
```

### Step 6: Build the Application

```bash
# Build the frontend
npm run build
```

### Step 7: Start the Application

#### Development Mode:
```bash
npm run dev
```



#### Step 5: PM2 Configuration (Optional)
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'whatsway',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
```

#### Production Mode with PM2:
```bash
# Start the application
pm2 start npm --name "whatsway" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```




### Step 8: Nginx Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://localhost:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Step 9: Configure WhatsApp Webhook

1. Go to your Facebook App Dashboard
2. Navigate to WhatsApp > Configuration
3. Set Webhook URL: `https://your-domain.com/api/webhook`
4. Set Verify Token: (same as WHATSAPP_WEBHOOK_VERIFY_TOKEN in .env)
5. Subscribe to webhook fields: messages, message_status, message_template_status_update

## Configuration

### WhatsApp Business API Setup

1. **Create Meta Business Account**
   - Visit https://business.facebook.com
   - Create a new business account

2. **Create Facebook App**
   - Go to https://developers.facebook.com
   - Create a new app
   - Add WhatsApp product

3. **Configure WhatsApp Business**
   - Add phone number
   - Verify business
   - Generate permanent access token

### MM Lite API (Marketing Messages)

MM Lite is automatically enabled for marketing campaigns. It uses the same WhatsApp Cloud API credentials but routes marketing messages through the `/marketing_messages` endpoint for higher throughput. No additional configuration is needed.

## Features Overview

### 1. Dashboard
- Real-time message statistics
- Campaign performance metrics
- Channel health monitoring
- Activity overview

### 2. Contact Management
- Import contacts via CSV
- Contact grouping and tagging
- Advanced search and filtering
- Bulk operations
- Duplicate detection

### 3. Campaign Management
- **Contact-based Campaigns**: Send to selected contacts
- **CSV-based Campaigns**: Upload recipient list
- **API Campaigns**: Integrate with external systems
- Template message support
- Scheduling and automation
- Delivery tracking

### 4. Template Management
- Create and manage WhatsApp templates
- Support for text, media, and button templates
- Template approval status tracking
- Multi-language support
- Real-time preview

### 5. Team Inbox
- Real-time message management
- Conversation assignment
- 24-hour messaging window
- Quick replies
- Message status tracking

### 6. Automation Builder
- Visual drag-drop interface
- Trigger-based workflows
- Conditional logic
- Time delays
- Template and custom messages
- Keyword detection

### 7. Team Management
- Role-based access control (Admin, Manager, Agent)
- Activity logging
- Performance tracking
- Section-wise permissions

### 8. Multi-Channel Support
- Manage multiple WhatsApp numbers
- Channel-specific data isolation
- Independent configuration

## User Guide

### First Time Setup

1. **Login**
   - Default credentials:
   - Username: `whatsway`
   - Password: `Admin@123`
   - **Important**: Change password immediately

2. **Add WhatsApp Channel**
   - Go to Settings > Channels
   - Click "Add Channel"
   - Enter WhatsApp details
   - Configure webhook

3. **Import Contacts**
   - Navigate to Contacts
   - Click "Import"
   - Upload CSV file
   - Map fields

4. **Create Templates**
   - Go to Templates
   - Click "Create Template"
   - Design your message
   - Submit for approval

### Daily Operations

#### Sending Messages
1. Create a campaign
2. Select template
3. Choose recipients
4. Schedule or send immediately

#### Managing Inbox
1. View conversations
2. Assign to team members
3. Reply within 24-hour window
4. Use quick replies

#### Creating Automations
1. Go to Automations
2. Click "Create New"
3. Design workflow
4. Configure triggers
5. Activate automation

## API Documentation

### Authentication
All API requests require authentication using session cookies.

### Key Endpoints

#### Campaigns
```
POST /api/campaigns
GET /api/campaigns
GET /api/campaigns/:id
PUT /api/campaigns/:id
DELETE /api/campaigns/:id
```

#### Contacts
```
POST /api/contacts
GET /api/contacts
POST /api/contacts/import
PUT /api/contacts/:id
DELETE /api/contacts/:id
```

#### Messages
```
POST /api/messages/send
GET /api/conversations
GET /api/conversations/:id/messages
POST /api/conversations/:id/reply
```

### Webhook Integration
```
POST /api/webhook
```

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Messages
- Verify SSL certificate
- Check webhook URL in Meta dashboard
- Ensure verify token matches
- Check server logs

#### 2. Messages Not Sending
- Verify WhatsApp API credentials
- Check phone number status
- Ensure template is approved
- Check API rate limits

#### 3. Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure user permissions

#### 4. Session Errors
- Clear browser cookies
- Restart application
- Check SESSION_SECRET configuration

### Debug Mode
Enable debug logging:
```env
DEBUG=true
LOG_LEVEL=debug
```

## Security Best Practices

1. **Change Default Credentials**
   - Update admin password immediately
   - Use strong passwords

2. **SSL/TLS Configuration**
   - Always use HTTPS
   - Keep certificates updated

3. **Database Security**
   - Use strong database passwords
   - Limit database access
   - Regular backups

4. **API Security**
   - Rotate access tokens regularly
   - Monitor API usage
   - Implement rate limiting

5. **Environment Variables**
   - Never commit .env files
   - Use secure secret management
   - Rotate secrets regularly

## Support

### Getting Help
- Documentation: Check this guide first
- Logs: Review application logs in `logs/` directory
- Community: Join our support forum
- Email: support@whatsway.com

### Reporting Issues
When reporting issues, include:
- Error messages
- Steps to reproduce
- Environment details
- Log files (sanitized)

### Updates
- Check for updates regularly
- Review changelog before updating
- Backup before major updates
- Test in staging environment



# WhatsWay Project Structure

## 📁 Directory Structure

```
whatsway/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable UI components
│       │   ├── ui/             # Base UI components (shadcn)
│       │   ├── automation-flow-builder-new.tsx
│       │   ├── campaign-form.tsx
│       │   ├── channel-settings.tsx
│       │   ├── contact-form.tsx
│       │   ├── contact-import.tsx
│       │   ├── inbox-chat.tsx
│       │   ├── sidebar.tsx
│       │   ├── template-dialog.tsx
│       │   ├── template-preview.tsx
│       │   └── templates-table.tsx
│       ├── hooks/              # Custom React hooks
│       │   ├── use-auth.tsx
│       │   └── use-toast.ts
│       ├── lib/                # Utility libraries
│       │   ├── queryClient.ts
│       │   └── utils.ts
│       ├── pages/              # Application pages
│       │   ├── analytics.tsx
│       │   ├── auth.tsx
│       │   ├── automations.tsx
│       │   ├── campaigns.tsx
│       │   ├── contacts.tsx
│       │   ├── dashboard.tsx
│       │   ├── home-page.tsx
│       │   ├── inbox.tsx
│       │   ├── message-logs.tsx
│       │   ├── not-found.tsx
│       │   ├── settings.tsx
│       │   ├── team.tsx
│       │   └── templates.tsx
│       ├── App.tsx             # Main application component
│       ├── index.css           # Global styles
│       └── main.tsx            # Application entry point
│
├── server/                     # Backend Node.js application
│   ├── controllers/            # Request handlers
│   │   ├── analytics.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── automations.controller.ts
│   │   ├── campaigns.controller.ts
│   │   ├── channels.controller.ts
│   │   ├── contacts.controller.ts
│   │   ├── conversations.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── message-logs.controller.ts
│   │   ├── templates.controller.ts
│   │   └── users.controller.ts
│   ├── cron/                   # Scheduled jobs
│   │   ├── channel-health-monitor.ts
│   │   └── message-status-updater.ts
│   ├── middleware/             # Express middleware
│   │   └── auth.middleware.ts
│   ├── repositories/           # Database access layer
│   │   ├── analytics.repository.ts
│   │   ├── api-log.repository.ts
│   │   ├── automation.repository.ts
│   │   ├── campaign.repository.ts
│   │   ├── channel.repository.ts
│   │   ├── contact.repository.ts
│   │   ├── conversation.repository.ts
│   │   ├── message-queue.repository.ts
│   │   ├── message.repository.ts
│   │   ├── template.repository.ts
│   │   ├── user.repository.ts
│   │   ├── webhook-config.repository.ts
│   │   └── whatsapp-channel.repository.ts
│   ├── routes/                 # API route definitions
│   │   ├── analytics.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── automation.routes.ts
│   │   ├── campaigns.routes.ts
│   │   ├── channels.routes.ts
│   │   ├── contacts.routes.ts
│   │   ├── conversations.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── index.ts
│   │   ├── message-logs.routes.ts
│   │   ├── templates.routes.ts
│   │   └── users.routes.ts
│   ├── services/               # Business logic layer
│   │   ├── mm-lite-api.service.ts
│   │   └── whatsapp-api.service.ts
│   ├── utils/                  # Utility functions
│   │   └── phone-formatter.ts
│   ├── database-storage.ts     # Storage interface implementation
│   ├── db.ts                   # Database connection
│   ├── index.ts                # Server entry point
│   ├── routes.ts              # Main route registration
│   ├── storage.ts             # Storage interface definition
│   └── vite.ts                # Vite dev server integration
│
├── shared/                     # Shared code between client/server
│   └── schema.ts              # Database schema & types
│
├── attached_assets/           # User uploaded assets
├── logs/                      # Application logs
│
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── CODECANYON_README.md     # CodeCanyon listing info
├── DOCUMENTATION.md         # Full documentation
├── INSTALL_README.md        # Installation guide
├── PROJECT_STRUCTURE.md     # This file
├── QUICK_START_GUIDE.md     # Quick start guide
├── README.md                # Main readme
├── TECHNICAL_COMPLIANCE_REPORT.md
├── WEBHOOK_FACEBOOK_ERROR_FIX.md
├── WEBHOOK_SETUP_GUIDE.md
├── components.json          # Shadcn UI config
├── docker-compose.yml       # Docker configuration
├── Dockerfile              # Docker image
├── drizzle.config.ts       # Drizzle ORM config
├── install.bat             # Windows installer
├── install.js              # Universal installer
├── install.sh              # Linux/Mac installer
├── package.json            # Node dependencies
├── postcss.config.js       # PostCSS config
├── replit.md              # Replit configuration
├── run-cron.bat           # Windows cron runner
├── run-cron.sh            # Linux cron runner
├── setup-env.js           # Environment setup helper
├── tailwind.config.ts     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite build config
```

## 🏗 Architecture Overview

### Frontend Architecture
- **React Components**: Modular, reusable UI components
- **Pages**: Route-based page components
- **State Management**: TanStack Query for server state
- **Styling**: Tailwind CSS with Shadcn UI components
- **Type Safety**: Full TypeScript coverage

### Backend Architecture
- **MVC Pattern**: Clear separation of concerns
- **Repository Pattern**: Database abstraction layer
- **Service Layer**: Business logic encapsulation
- **Middleware**: Authentication and request processing
- **Controllers**: Request/response handling

### Database Design
- **PostgreSQL**: Relational database
- **Drizzle ORM**: Type-safe database queries
- **Schema**: Normalized tables with proper relations
- **Migrations**: Automated schema updates

## 📝 Key Files

### Configuration Files
- `.env`: Environment variables (create from .env.example)
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `vite.config.ts`: Build configuration
- `tailwind.config.ts`: Styling configuration

### Entry Points
- `client/src/main.tsx`: Frontend entry
- `server/index.ts`: Backend entry
- `install.js`: Installation script

### Core Business Logic
- `server/services/whatsapp-api.service.ts`: WhatsApp integration
- `server/services/mm-lite-api.service.ts`: MM Lite integration
- `server/cron/`: Background jobs
- `client/src/pages/`: Main application features

## 🔧 Development Guidelines

### Code Organization
1. Keep components small and focused
2. Use TypeScript for type safety
3. Follow repository pattern for data access
4. Implement proper error handling
5. Write clean, documented code

### Naming Conventions
- Components: PascalCase (e.g., `ContactForm.tsx`)
- Files: kebab-case (e.g., `auth-middleware.ts`)
- Variables: camelCase (e.g., `userId`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_VERSION`)

### Best Practices
1. Use environment variables for configuration
2. Implement proper validation
3. Handle errors gracefully
4. Log important events
5. Write maintainable code

## 🚀 Deployment Structure

### Production Files
```
dist/                  # Built application
├── client/           # Frontend build
└── server/           # Backend build
```

### Required Services
- Node.js process (PM2 recommended)
- PostgreSQL database
- Nginx (reverse proxy)
- SSL certificate
- Cron jobs

### Environment Setup
1. Production environment variables
2. Database migrations
3. SSL configuration
4. Webhook setup
5. Monitoring tools



# WhatsWay Database Export

## Export Information
- **Export Date**: January 6, 2025
- **Database Type**: PostgreSQL (Neon Database)
- **Export Files**:
  - `complete_database_export.sql` - Full database export with schema and data
  - `database_schema.sql` - Schema only (table structures, indexes, constraints)
  - `database_export.sql` - Data only (INSERT statements)

## How to Import

### Option 1: Import Complete Database
```bash
# For a new database
psql -U username -d database_name < complete_database_export.sql

# Or using connection string
psql "postgresql://username:password@host:port/database" < complete_database_export.sql
```

### Option 2: Import Schema First, Then Data
```bash
# Import schema
psql -U username -d database_name < database_schema.sql

# Import data
psql -U username -d database_name < database_export.sql
```

## Database Tables

The export includes the following tables:
1. **users** - System users and authentication
2. **contacts** - WhatsApp contacts
3. **contact_groups** - Contact grouping
4. **campaigns** - Campaign management
5. **campaign_messages** - Campaign message tracking
6. **whatsapp_channels** - WhatsApp Business channels
7. **templates** - Message templates
8. **template_categories** - Template categories
9. **conversations** - Chat conversations
10. **messages** - Individual messages
11. **message_queue** - Message queue for sending
12. **webhook_configs** - Webhook configurations
13. **api_logs** - API call logging
14. **sessions** - User sessions

## Default Admin Credentials
- **Username**: whatsway
- **Password**: Admin@123

## Notes
- The export preserves all relationships and constraints
- Passwords are hashed using scrypt algorithm
- All timestamps are in UTC
- The export is compatible with PostgreSQL 12+

## Restoration Tips
1. Create a new database before importing
2. Ensure the database user has sufficient privileges
3. Check for any existing data conflicts before importing
4. The export includes INSERT statements with explicit values
5. No ownership or ACL information is included for portability

---

© 2025 WhatsWay. All rights reserved.