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