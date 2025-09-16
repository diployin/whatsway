# WhatsWay - Complete User Guide

## 📋 What is WhatsWay?
WhatsWay is a powerful WhatsApp Business platform that helps businesses manage WhatsApp communications efficiently. Send campaigns, manage inbox, create automations, and track performance - all in one place.

## 📁 Project Structure

```
whatsway/
├── client/                      # Frontend React application
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable UI components
│       │   ├── ui/             # Base UI components
│       │   ├── automation-flow-builder-new.tsx
│       │   ├── campaign-form.tsx
│       │   ├── channel-settings.tsx
│       │   ├── contact-form.tsx
│       │   ├── contact-import.tsx
│       │   ├── inbox-chat.tsx
│       │   ├── sidebar.tsx
│       │   ├── template-dialog.tsx
│       │   └── templates-table.tsx
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utility libraries
│       ├── pages/              # Application pages
│       │   ├── analytics.tsx
│       │   ├── auth.tsx
│       │   ├── automations.tsx
│       │   ├── campaigns.tsx
│       │   ├── contacts.tsx
│       │   ├── dashboard.tsx
│       │   ├── inbox.tsx
│       │   ├── settings.tsx
│       │   ├── team.tsx
│       │   └── templates.tsx
│       └── App.tsx             # Main application component
│
├── server/                     # Backend Node.js application
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── campaigns.controller.ts
│   │   ├── contacts.controller.ts
│   │   ├── templates.controller.ts
│   │   └── [other controllers]
│   ├── services/               # Business logic
│   │   ├── whatsapp-api.service.ts
│   │   └── mm-lite-api.service.ts
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── repositories/           # Database access
│   ├── cron/                   # Background jobs
│   └── utils/                  # Helper functions
│
├── prisma/                     # Database schema
│   └── schema.prisma
│
├── shared/                     # Shared code
│   └── schema.ts              # Types & schemas
│
├── attached_assets/           # User uploads
├── logs/                      # Application logs
│
├── .env.example              # Environment template
├── package.json              # Dependencies
├── README.md                 # Project readme
├── install.js                # Installation script
├── docker-compose.yml        # Docker config
└── [config files]           # Various config files
```

### Key Files Explained
- **`.env`**: Your configuration file (create from .env.example)
- **`install.js`**: Automated installation script
- **`package.json`**: Project dependencies and scripts
- **`client/src/pages/`**: Main application features
- **`server/controllers/`**: API request handlers
- **`server/services/`**: WhatsApp integration logic
- **`prisma/schema.prisma`**: Database structure

## 🚀 Quick Installation

### System Requirements
- **OS**: Ubuntu 20.04+ / Windows Server 2019+ / macOS 10.15+
- **Node.js**: Version 18+
- **PostgreSQL**: Version 14+
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 10GB minimum
- **CPU**: 2 cores minimum
- **SSL Certificate**: Required for webhooks

### Required Accounts
- WhatsApp Business Account
- Meta Business Account  
- Facebook Developer Account
- Domain with SSL certificate

### Installation Steps
```bash
# 1. Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (Process Manager)
sudo npm install -g pm2

# 2. Clone/Extract WhatsWay
cd /path/to/your/directory
# Extract your WhatsWay package here

# 3. Install dependencies
npm install

# 4. Setup database
sudo -u postgres psql
CREATE DATABASE whatsway;
CREATE USER whatsway_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE whatsway TO whatsway_user;
\q

# 5. Configure environment
cp .env.example .env
# Edit .env with your details

# 6. Setup database
npm run db:push

# 7. Build application
npm run build

# 8. Start application
npm run dev    # Development
npm start      # Production
```

### Environment Configuration (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://whatsway_user:password@localhost:5432/whatsway

# Session Configuration
SESSION_SECRET=your_32_character_secret_key

# WhatsApp Configuration
WHATSAPP_API_VERSION=v23.0
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token

# MM Lite Configuration (Auto-enabled for marketing campaigns)
# Uses same WhatsApp Cloud API with /marketing_messages endpoint

# Application Configuration
APP_URL=https://your-domain.com
PORT=5000

# Debug Configuration (optional)
DEBUG=false
LOG_LEVEL=info
```

## 🔧 WhatsApp Setup

### 1. Facebook Developer Account
- Go to https://developers.facebook.com
- Create new app → Business → WhatsApp
- Get Access Token and Business Account ID

### 2. Webhook Configuration
- URL: `https://your-domain.com/api/webhook`
- Verify Token: Same as in .env file
- Subscribe to: messages, message_status

### 3. Add Phone Number
- Add your business phone number
- Verify ownership
- Complete business verification

## 👤 First Login
- **URL**: https://your-domain.com
- **Username**: `whatsway`
- **Password**: `Admin@123`
- **⚠️ Change password immediately after login**

## 📱 Core Features

### 1. Dashboard
View real-time statistics, campaign performance, and system health.

### 2. Contacts Management
- **Import**: Upload CSV files
- **Add Individual**: Manual contact creation
- **Groups**: Organize contacts into groups
- **Search**: Advanced filtering options

### 3. Campaign Types
- **Contact Campaigns**: Send to selected contacts
- **CSV Campaigns**: Upload recipient list
- **API Campaigns**: Programmatic sending
- **Scheduled**: Set delivery time

### 4. Templates
- Create WhatsApp message templates
- Support text, images, buttons
- Submit for WhatsApp approval
- Multi-language support

### 5. Team Inbox
- Real-time message management
- Assign conversations to team members
- 24-hour response window
- Quick reply templates

### 6. Automation Builder
- Visual drag-and-drop interface
- Trigger-based workflows
- Conditional logic and delays
- Keyword-based responses

### 7. Team Management
- **Admin**: Full system access
- **Manager**: Campaign and team management
- **Agent**: Inbox and basic features

### 8. Multi-Channel
- Manage multiple WhatsApp numbers
- Channel-specific data separation
- Independent configurations

## 📊 How to Use

### Initial Setup Process
1. **First Login & Security**
   - Login with default credentials
   - **Immediately change password**
   - Review user settings

2. **System Configuration**
   - Configure webhook endpoints
   - Test database connection
   - Verify all services running

### Setup Your First Channel
1. Go to **Settings → Channels**
2. Click **Add Channel**
3. Enter WhatsApp details:
   - Phone number
   - Access token
   - Business account ID
4. Test connection
5. Configure webhook URL

### Import Contacts
1. Go to **Contacts**
2. Click **Import**
3. Download CSV template (if needed)
4. Upload CSV file (Name, Phone columns required)
5. Map fields and validate
6. Complete import and review

### Create Template
1. Go to **Templates**
2. Click **Create Template**
3. Choose category and type:
   - **Text**: Simple text messages
   - **Media**: Images, videos, documents
   - **Interactive**: Buttons, lists, flows
4. Design message with variables
5. Submit for WhatsApp approval
6. Monitor approval status

### Send Campaign
1. Go to **Campaigns**
2. Click **Create Campaign**
3. Choose campaign type:
   - **Contact-based**: Select from contacts
   - **CSV-based**: Upload recipient list
   - **API**: Programmatic integration
4. Select approved template
5. Choose recipients/upload CSV
6. Configure delivery:
   - Send immediately
   - Schedule for later
   - Set time zones
7. Review and launch

### Manage Inbox
1. Go to **Inbox**
2. View real-time conversations
3. Select conversation to reply
4. Important: Reply within 24-hour window
5. Use features:
   - Quick replies
   - File attachments
   - Message assignment
   - Conversation notes

### Build Automation
1. Go to **Automations**
2. Click **Create New**
3. Configure trigger:
   - Keywords
   - Webhooks
   - Time-based
   - Contact actions
4. Design workflow:
   - Add conditions
   - Set time delays
   - Configure actions
   - Test logic flow
5. Activate automation
6. Monitor performance

## 🔧 Advanced Configuration

### Nginx Setup (Recommended)
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Production with PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "whatsway" -- start

# Auto-restart on reboot
pm2 startup
pm2 save
```

## 🛠 Troubleshooting

### Common Issues

**Messages not sending?**
- Check WhatsApp API credentials
- Verify phone number status
- Ensure template is approved

**Webhook not receiving?**
- Verify SSL certificate
- Check webhook URL in Meta dashboard
- Ensure verify token matches

**Login issues?**
- Clear browser cookies
- Check session configuration
- Restart application

### Debug Mode
Add to .env:
```env
DEBUG=true
LOG_LEVEL=debug
```

### Check Logs
```bash
# Application logs
tail -f logs/app.log

# PM2 logs
pm2 logs whatsway
```

## 🔒 Security Best Practices

1. **Change default password** immediately
2. **Use HTTPS** for all connections
3. **Strong database passwords**
4. **Regular backups**
5. **Keep software updated**
6. **Rotate API tokens** regularly

## 📞 Support

### Getting Help
- **Documentation**: Check this guide
- **Logs**: Review application logs
- **Email**: nb@diploy.in

### Reporting Issues
Include:
- Error messages
- Steps to reproduce
- Environment details
- Log files (remove sensitive info)

## 🔄 Updates

### Update Process
1. **Backup First**: Always backup database before updating
2. **Stop Application**: Safely stop the running instance
3. **Update Code**: Pull/download latest version
4. **Install Dependencies**: Run npm install for new packages
5. **Database Migration**: Apply any schema changes
6. **Restart Application**: Start with new version

```bash
# Standard update process
pm2 stop whatsway
git pull origin main    # or extract new package
npm install
npm run db:push        # Apply database changes
pm2 start whatsway

# Verify update
pm2 logs whatsway      # Check for errors
```

### Database Management
- **Export Database**: Use provided export tools
- **Import Database**: Follow import instructions
- **Default Admin**: Username: `whatsway`, Password: `Admin@123`
- **Database Tables**: 14 core tables including users, contacts, campaigns, messages

---

## 🎯 Quick Checklist

✅ **Installation**
- [ ] Node.js and PostgreSQL installed
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Application started successfully

✅ **WhatsApp Setup**
- [ ] Facebook Developer app created
- [ ] WhatsApp Business Account connected
- [ ] Webhook configured and verified
- [ ] Phone number added and verified

✅ **First Steps**
- [ ] Logged in and changed password
- [ ] Added first WhatsApp channel
- [ ] Imported contacts
- [ ] Created first template
- [ ] Sent test campaign

✅ **Production Ready**
- [ ] SSL certificate configured
- [ ] Nginx/reverse proxy setup
- [ ] PM2 process manager
- [ ] Regular backups scheduled
- [ ] Monitoring in place

---

*© 2025 WhatsWay. Need help? Contact nb@diploy.in*