# WhatsWay Technical Documentation
*Version 1.0 - January 2025*

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Database Design](#database-design)
7. [API Documentation](#api-documentation)
8. [Frontend Guide](#frontend-guide)
9. [Backend Guide](#backend-guide)
10. [Customization Guide](#customization-guide)
11. [File Reference](#file-reference)
12. [Common Modifications](#common-modifications)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is WhatsWay?
WhatsWay is a comprehensive WhatsApp Business messaging platform that helps businesses manage their WhatsApp communications efficiently. It provides tools for:
- 📊 Dashboard analytics and real-time statistics
- 👥 Contact and group management
- 📢 Campaign creation and management
- 💬 Team inbox for customer conversations
- 🤖 Automation workflows
- 📝 Template management
- 👨‍👩‍👧‍👦 Team collaboration

### Who is this for?
- **Business Owners**: Manage customer communications
- **Marketing Teams**: Run WhatsApp campaigns
- **Support Teams**: Handle customer inquiries
- **Developers**: Customize and extend the platform

---

## Architecture Overview

### System Design
```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │Dashboard │  │Campaigns │  │   Inbox   │  │Templates ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                    API Requests
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │  Routes  │  │Controllers│  │ Services │  │Middleware││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                    Database Queries
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Channels │  │ Contacts │  │Campaigns │  │ Messages ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                   WhatsApp Cloud API
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    WHATSAPP BUSINESS                     │
└─────────────────────────────────────────────────────────┘
```

### Key Design Patterns
- **MVC Architecture**: Model-View-Controller for code organization
- **Service Layer**: Business logic separated from controllers
- **Repository Pattern**: Database operations abstracted
- **Middleware Pattern**: Request processing pipeline
- **Component-Based UI**: Reusable React components

---

## Technology Stack

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **TypeScript** | Type Safety | 5.x |
| **Vite** | Build Tool | Latest |
| **Tailwind CSS** | Styling | 3.x |
| **Shadcn/UI** | Component Library | Latest |
| **TanStack Query** | Server State | 5.x |
| **Wouter** | Routing | Latest |
| **Lucide Icons** | Icons | Latest |

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime | 18+ |
| **Express.js** | Web Framework | 4.x |
| **TypeScript** | Type Safety | 5.x |
| **PostgreSQL** | Database | Latest |
| **Drizzle ORM** | Database ORM | Latest |
| **Zod** | Validation | Latest |
| **Passport** | Authentication | Latest |

### External Services
- **WhatsApp Business Cloud API**: Messaging service
- **Neon Database**: Serverless PostgreSQL hosting
- **Meta/Facebook**: OAuth and API integration

---

## Project Structure

### Directory Layout
```
whatsway/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   └── App.tsx          # Main application file
│   └── index.html           # HTML entry point
│
├── server/                   # Backend application
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Database operations
│   ├── routes/            # API endpoints
│   ├── middlewares/       # Request processing
│   ├── utils/            # Helper functions
│   ├── cron/             # Scheduled tasks
│   └── index.ts          # Server entry point
│
├── shared/                  # Shared code
│   └── schema.ts           # Database schema & types
│
├── scripts/                 # Utility scripts
│   ├── installer.sh        # Installation script
│   └── seed.ts            # Database seeding
│
├── attached_assets/         # Static assets
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS config
├── drizzle.config.ts      # Database config
└── .env.example           # Environment variables
```

---

## Core Components

### 1. Dashboard System
**Purpose**: Provides real-time analytics and insights

**Key Files**:
- `client/src/pages/dashboard.tsx` - Dashboard UI
- `server/controllers/dashboard.controller.ts` - Data processing
- `server/services/analytics.service.ts` - Analytics logic

**Features**:
- Message statistics
- Campaign performance
- Contact growth
- Channel health monitoring

### 2. Contact Management
**Purpose**: Manage customer contacts and groups

**Key Files**:
- `client/src/pages/contacts.tsx` - Contacts UI
- `server/controllers/contacts.controller.ts` - Contact operations
- `server/repositories/contact.repository.ts` - Database operations

**Features**:
- Import/export contacts
- Group management
- Contact tagging
- Duplicate prevention

### 3. Campaign System
**Purpose**: Create and manage marketing campaigns

**Key Files**:
- `client/src/pages/campaigns/` - Campaign UI components
- `server/controllers/campaigns.controller.ts` - Campaign logic
- `server/services/campaign.service.ts` - Campaign processing

**Campaign Types**:
- **Instant**: Send immediately
- **Scheduled**: Send at specific time
- **API-Based**: Trigger via API

### 4. Team Inbox
**Purpose**: Manage customer conversations

**Key Files**:
- `client/src/pages/inbox.tsx` - Inbox UI
- `server/controllers/conversations.controller.ts` - Message handling
- `server/services/whatsapp-api.ts` - WhatsApp integration

**Features**:
- Real-time messaging
- Conversation assignment
- Message templates
- 24-hour window enforcement

### 5. Template Management
**Purpose**: Create and manage message templates

**Key Files**:
- `client/src/pages/templates.tsx` - Template UI
- `server/controllers/templates.controller.ts` - Template operations

**Template Types**:
- Text templates
- Media templates (images, documents)
- Interactive templates (buttons, lists)

### 6. Automation Flows
**Purpose**: Create automated conversation workflows

**Key Files**:
- `client/src/pages/flows.tsx` - Flow builder UI
- `server/controllers/flows.controller.ts` - Flow execution

**Node Types**:
- Start node
- Send message
- Wait for reply
- Conditional logic
- Time delays

---

## Database Design

### Core Tables

#### 1. Users Table
```sql
users (
  id            UUID PRIMARY KEY
  username      VARCHAR UNIQUE
  email         VARCHAR UNIQUE
  password      VARCHAR
  role          ENUM (admin, manager, agent)
  permissions   JSONB
  created_at    TIMESTAMP
)
```

#### 2. WhatsApp Channels
```sql
whatsapp_channels (
  id              UUID PRIMARY KEY
  name            VARCHAR
  phone_number    VARCHAR
  phone_number_id VARCHAR
  waba_id         VARCHAR
  access_token    VARCHAR (encrypted)
  webhook_token   VARCHAR
  status          ENUM (active, inactive, error)
)
```

#### 3. Contacts
```sql
contacts (
  id          UUID PRIMARY KEY
  phone       VARCHAR
  name        VARCHAR
  email       VARCHAR
  tags        TEXT[]
  attributes  JSONB
  channel_id  UUID REFERENCES whatsapp_channels
)
```

#### 4. Campaigns
```sql
campaigns (
  id              UUID PRIMARY KEY
  name            VARCHAR
  type            ENUM (instant, scheduled, api)
  status          ENUM (draft, active, completed)
  template_id     UUID
  recipient_count INTEGER
  sent_count      INTEGER
  delivered_count INTEGER
)
```

#### 5. Messages
```sql
messages (
  id              UUID PRIMARY KEY
  conversation_id UUID
  campaign_id     UUID
  type            ENUM (text, image, document)
  content         TEXT
  status          ENUM (sent, delivered, read, failed)
  created_at      TIMESTAMP
)
```

### Relationships
- One channel → Many contacts
- One campaign → Many messages
- One conversation → Many messages
- One user → Many assigned conversations

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
**Purpose**: User login
```json
Request:
{
  "username": "admin",
  "password": "password123"
}

Response:
{
  "token": "jwt-token",
  "user": { "id": "...", "role": "admin" }
}
```

#### POST /api/auth/logout
**Purpose**: User logout

### Channel Management

#### GET /api/channels
**Purpose**: List all WhatsApp channels

#### POST /api/channels
**Purpose**: Add new WhatsApp channel
```json
Request:
{
  "name": "Business Channel",
  "phoneNumber": "+1234567890",
  "accessToken": "EAAI...",
  "phoneNumberId": "123456"
}
```

### Contact Operations

#### GET /api/contacts
**Purpose**: List contacts with pagination

#### POST /api/contacts/import
**Purpose**: Import contacts from CSV

### Campaign Management

#### POST /api/campaigns
**Purpose**: Create new campaign

#### GET /api/campaigns/:id
**Purpose**: Get campaign details

#### POST /api/campaigns/:id/send
**Purpose**: Send campaign messages

### Message Operations

#### POST /api/messages/send
**Purpose**: Send individual message

#### GET /api/conversations
**Purpose**: List conversations

### Template Management

#### GET /api/templates
**Purpose**: List message templates

#### POST /api/templates/sync
**Purpose**: Sync templates from WhatsApp

---

## Frontend Guide

### Component Structure

#### Layout Components
- `MainLayout.tsx` - Main application layout
- `Sidebar.tsx` - Navigation sidebar
- `Header.tsx` - Top header bar

#### Page Components
Located in `client/src/pages/`:
- `dashboard.tsx` - Analytics dashboard
- `contacts.tsx` - Contact management
- `campaigns/` - Campaign pages
- `inbox.tsx` - Team inbox
- `templates.tsx` - Template management
- `flows.tsx` - Automation flows
- `settings.tsx` - Application settings

#### Reusable Components
Located in `client/src/components/`:
- `ui/` - Basic UI components (buttons, inputs, etc.)
- `DataTable.tsx` - Reusable data table
- `FileUpload.tsx` - File upload component
- `PhoneInput.tsx` - Phone number input

### State Management

#### Server State (TanStack Query)
```typescript
// Fetching data
const { data, isLoading } = useQuery({
  queryKey: ['/api/contacts'],
});

// Mutations
const mutation = useMutation({
  mutationFn: createContact,
  onSuccess: () => {
    queryClient.invalidateQueries(['/api/contacts']);
  },
});
```

#### Local State (Zustand)
Used for:
- Active channel selection
- UI preferences
- Temporary form data

### Styling System

#### Tailwind CSS Classes
```jsx
// Example component styling
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold">Title</h2>
  <Button variant="primary">Action</Button>
</div>
```

#### Theme Customization
Edit `tailwind.config.ts`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#25D366',  // WhatsApp green
      secondary: '#075E54',
    }
  }
}
```

---

## Backend Guide

### Controller Pattern
Controllers handle HTTP requests and responses:

```typescript
// server/controllers/example.controller.ts
export const getItems = asyncHandler(async (req, res) => {
  const items = await itemService.findAll();
  res.json(items);
});
```

### Service Layer
Services contain business logic:

```typescript
// server/services/example.service.ts
export class ExampleService {
  async processData(data: any) {
    // Business logic here
    return processedData;
  }
}
```

### Repository Pattern
Repositories handle database operations:

```typescript
// server/repositories/example.repository.ts
export class ExampleRepository {
  async findById(id: string) {
    return await db.select()
      .from(table)
      .where(eq(table.id, id));
  }
}
```

### Middleware
Request processing pipeline:

```typescript
// Authentication middleware
export const authenticate = (req, res, next) => {
  // Verify token
  next();
};

// Validation middleware
export const validate = (schema) => (req, res, next) => {
  // Validate request
  next();
};
```

### Background Jobs
Located in `server/cron/`:
- `message-status-updater.ts` - Updates message delivery status
- `channel-health-monitor.ts` - Monitors channel health
- `campaign-scheduler.ts` - Schedules campaign sending

---

## Customization Guide

### 1. Changing Brand Colors

Edit `client/src/index.css`:
```css
:root {
  --primary: 37 211 102;     /* Change primary color */
  --primary-foreground: 255 255 255;
  --secondary: 7 94 84;       /* Change secondary color */
}
```

### 2. Adding New Pages

**Step 1**: Create page component
```typescript
// client/src/pages/custom-page.tsx
export default function CustomPage() {
  return <div>Your content</div>;
}
```

**Step 2**: Add route in `App.tsx`
```typescript
<Route path="/custom" component={CustomPage} />
```

**Step 3**: Add navigation in sidebar
```typescript
{ label: 'Custom Page', href: '/custom', icon: IconName }
```

### 3. Adding API Endpoints

**Step 1**: Create controller
```typescript
// server/controllers/custom.controller.ts
export const customAction = asyncHandler(async (req, res) => {
  // Your logic
  res.json({ success: true });
});
```

**Step 2**: Add route
```typescript
// server/routes/custom.routes.ts
router.post('/custom', authenticate, customAction);
```

**Step 3**: Register route
```typescript
// server/routes/index.ts
app.use('/api', customRoutes);
```

### 4. Modifying Database Schema

**Step 1**: Update schema
```typescript
// shared/schema.ts
export const customTable = pgTable('custom', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 255 }),
});
```

**Step 2**: Run migration
```bash
npm run db:push
```

### 5. Customizing WhatsApp Integration

Edit `server/services/whatsapp-api.ts`:
- Modify message formatting
- Add custom headers
- Change API endpoints
- Implement custom webhooks

### 6. Adding Custom Reports

**Step 1**: Create analytics service
```typescript
// server/services/custom-analytics.service.ts
export async function getCustomReport(filters) {
  // Query database
  return data;
}
```

**Step 2**: Add controller endpoint
**Step 3**: Create frontend component

---

## File Reference

### Critical Configuration Files

#### `.env` - Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# WhatsApp API
WHATSAPP_API_VERSION=v21.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-token

# Authentication
SESSION_SECRET=your-secret-key

# Server
PORT=5000
NODE_ENV=production
```

#### `package.json` - Dependencies
Contains all project dependencies and scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Update database schema
- `npm run seed` - Seed database

#### `tsconfig.json` - TypeScript Configuration
TypeScript compiler options and path aliases

#### `vite.config.ts` - Build Configuration
Frontend build settings and optimizations

### Frontend Files

#### Core Application Files
- `client/src/App.tsx` - Main app component with routing
- `client/src/main.tsx` - Application entry point
- `client/src/index.css` - Global styles

#### Hooks (`client/src/hooks/`)
- `use-auth.tsx` - Authentication hook
- `use-toast.tsx` - Toast notifications
- `use-channel.tsx` - Active channel management

#### Libraries (`client/src/lib/`)
- `queryClient.ts` - API client configuration
- `utils.ts` - Utility functions
- `constants.ts` - Application constants

### Backend Files

#### Controllers (`server/controllers/`)
- `auth.controller.ts` - Authentication
- `channels.controller.ts` - Channel management
- `contacts.controller.ts` - Contact operations
- `campaigns.controller.ts` - Campaign management
- `conversations.controller.ts` - Messaging
- `templates.controller.ts` - Template operations
- `dashboard.controller.ts` - Analytics
- `webhook.controller.ts` - WhatsApp webhooks

#### Services (`server/services/`)
- `whatsapp-api.ts` - WhatsApp API integration
- `campaign.service.ts` - Campaign processing
- `analytics.service.ts` - Analytics calculations
- `export.service.ts` - Data export

#### Middleware (`server/middlewares/`)
- `auth.middleware.ts` - Authentication checks
- `error.middleware.ts` - Error handling
- `validateRequest.middleware.ts` - Input validation

#### Database (`server/db/`)
- `index.ts` - Database connection
- `migrate.ts` - Migration runner

---

## Common Modifications

### 1. Change Login Credentials
Default: `username: whatsway, password: Admin@123`

To change:
1. Login with default credentials
2. Go to Settings → Profile
3. Update username/password
4. Or modify in database directly

### 2. Add Custom Fields to Contacts
```typescript
// shared/schema.ts
export const contacts = pgTable('contacts', {
  // ... existing fields
  customField: varchar('custom_field', { length: 255 }),
});
```

### 3. Modify Message Templates
1. Go to Templates page
2. Click "Create Template"
3. Design your template
4. Submit for WhatsApp approval

### 4. Customize Dashboard Widgets
Edit `client/src/pages/dashboard.tsx`:
```typescript
const widgets = [
  { title: 'Custom Metric', value: customValue },
  // Add more widgets
];
```

### 5. Change API Rate Limits
Edit `server/middlewares/rateLimiter.ts`:
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit requests
});
```

### 6. Add Email Notifications
```typescript
// server/services/notification.service.ts
export async function sendEmail(to, subject, body) {
  // Implement email sending
}
```

### 7. Implement Custom Webhooks
```typescript
// server/controllers/webhook.controller.ts
export const customWebhook = async (req, res) => {
  const event = req.body;
  // Process custom webhook
};
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error
**Problem**: Cannot connect to database
**Solution**:
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify network connectivity

#### 2. WhatsApp API Token Expired
**Problem**: API calls failing with 401 error
**Solution**:
- Generate new access token from Meta Business
- Update token in Channels settings
- Restart the application

#### 3. Messages Not Sending
**Problem**: Campaign messages stuck in queue
**Possible Causes**:
- Invalid phone numbers
- Template not approved
- Rate limiting
- 24-hour window expired

**Solution**:
- Check error logs in Messages tab
- Verify template approval status
- Check WhatsApp Business account status

#### 4. Webhook Not Receiving Messages
**Problem**: Incoming messages not appearing
**Solution**:
- Verify webhook URL in Meta dashboard
- Check webhook verification token
- Ensure HTTPS is enabled
- Check server logs for errors

#### 5. Import Contacts Failing
**Problem**: CSV import not working
**Solution**:
- Ensure CSV format is correct
- Check for duplicate phone numbers
- Verify phone number format (+country code)
- Check file size limits

#### 6. Frontend Not Loading
**Problem**: Blank page or loading error
**Solution**:
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
npm run dev
```

#### 7. Performance Issues
**Problem**: Slow dashboard or queries
**Solution**:
- Check database indexes
- Optimize large queries
- Enable caching
- Increase server resources

### Debug Mode
Enable debug logging:
```bash
# .env
DEBUG=true
LOG_LEVEL=debug
```

### Log Files
Check logs for errors:
- Server logs: Console output
- Database logs: PostgreSQL logs
- API logs: `api_logs` table

### Health Check Endpoint
```bash
curl http://localhost:5000/api/health
```

---

## Security Considerations

### 1. Authentication
- Session-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)

### 2. Data Protection
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)
- XSS protection (React)
- CSRF tokens

### 3. API Security
- Rate limiting
- Request validation
- Webhook signature verification
- Token encryption

### 4. Best Practices
- Keep dependencies updated
- Use HTTPS in production
- Secure environment variables
- Regular security audits
- Implement logging and monitoring

---

## Performance Optimization

### Database Optimization
- Proper indexing on frequently queried columns
- Query optimization
- Connection pooling
- Caching strategies

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size reduction

### Backend Optimization
- Async operations
- Parallel processing
- Queue management
- Memory management

---

## Deployment Guide

### Requirements
- Node.js 18+
- PostgreSQL database
- 2GB RAM minimum
- SSL certificate (for webhooks)

### Deployment Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run database migrations: `npm run db:push`
5. Build frontend: `npm run build`
6. Start server: `npm start`

### Production Checklist
- [ ] SSL certificate configured
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Monitoring configured
- [ ] Error tracking enabled
- [ ] Rate limiting configured
- [ ] Security headers added

---

## Support and Resources

### Getting Help
- Check this documentation
- Review error logs
- Search existing issues
- Contact support team

### Useful Resources
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

### Updates and Maintenance
- Regular dependency updates
- Security patches
- Feature enhancements
- Bug fixes

---

## Conclusion

WhatsWay is a powerful, customizable WhatsApp Business platform built with modern technologies. This documentation provides everything you need to understand, customize, and maintain the application.

Remember:
- Always backup before making changes
- Test in development first
- Keep dependencies updated
- Monitor application logs
- Follow security best practices

For additional support or custom development, please refer to the support channels provided with your license.

---

*Last Updated: January 2025*
*Version: 1.0*
*© WhatsWay - Professional WhatsApp Business Platform*