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

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- WhatsApp Business Account
- SSL Certificate (for webhooks)

### Installation Steps
```bash
# 1. Install dependencies
npm install

# 2. Setup database
sudo -u postgres psql
CREATE DATABASE whatsway;
CREATE USER whatsway_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE whatsway TO whatsway_user;

# 3. Configure environment
cp .env.example .env
# Edit .env with your details

# 4. Setup database
npm run db:push

# 5. Start application
npm run dev    # Development
npm run build && npm start    # Production
```

### Environment Configuration (.env)
```env
DATABASE_URL=postgresql://whatsway_user:password@localhost:5432/whatsway
SESSION_SECRET=your_32_character_secret_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
APP_URL=https://your-domain.com
PORT=5000
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

### Setup Your First Channel
1. Go to **Settings → Channels**
2. Click **Add Channel**
3. Enter WhatsApp details
4. Test connection

### Import Contacts
1. Go to **Contacts**
2. Click **Import**
3. Upload CSV file (Name, Phone columns required)
4. Map fields and import

### Create Template
1. Go to **Templates**
2. Click **Create Template**
3. Choose type (Text/Media/Interactive)
4. Design message
5. Submit for approval

### Send Campaign
1. Go to **Campaigns**
2. Click **Create Campaign**
3. Select template
4. Choose recipients
5. Schedule or send immediately

### Manage Inbox
1. Go to **Inbox**
2. Select conversation
3. Reply within 24-hour window
4. Use quick replies for efficiency

### Build Automation
1. Go to **Automations**
2. Click **Create New**
3. Add trigger (keyword, webhook, etc.)
4. Design flow with actions
5. Activate automation

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
- **Email**: support@whatsway.com

### Reporting Issues
Include:
- Error messages
- Steps to reproduce
- Environment details
- Log files (remove sensitive info)

## 🔄 Updates

1. Backup your database
2. Stop application
3. Update code
4. Run migrations
5. Restart application

```bash
# Update process
git pull origin main
npm install
npm run db:push
pm2 restart whatsway
```

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

*© 2025 WhatsWay. Need help? Contact support@whatsway.com*