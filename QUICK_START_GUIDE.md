# WhatsWay Quick Start Guide

## 🚀 Getting Started in 15 Minutes

### Step 1: Quick Installation (5 minutes)

#### Option A: Automated Installer (Recommended)
```bash
# Run the automated installer
node install.js
```

The installer will:
- Check all prerequisites
- Install dependencies
- Setup database
- Configure environment
- Create admin user
- Setup cron jobs

#### Option B: Docker Installation
```bash
# Using Docker Compose
docker-compose up -d
```

### Step 2: Initial Configuration (5 minutes)

1. **Access the Application**
   - Open browser: `http://localhost:5000`
   - Login with default credentials:
     - Username: `whatsway`
     - Password: `Admin@123`

2. **Change Admin Password**
   - Click on your profile
   - Go to Settings
   - Change password immediately

3. **Add WhatsApp Channel**
   - Navigate to Settings > Channels
   - Click "Add New Channel"
   - Enter:
     - Channel Name
     - WhatsApp Phone Number
     - Access Token (from Meta)
     - Phone Number ID
     - Business Account ID

### Step 3: Configure Webhook (3 minutes)

1. **In Meta Dashboard**:
   - Go to your Facebook App
   - WhatsApp > Configuration
   - Set Webhook URL: `https://your-domain.com/api/webhook`
   - Verify Token: `your_webhook_verify_token`
   - Subscribe to: messages, message_status

2. **Test Webhook**:
   - Send a test message
   - Check Inbox in WhatsWay

### Step 4: Send Your First Message (2 minutes)

1. **Add a Contact**:
   - Go to Contacts
   - Click "Add Contact"
   - Enter phone number with country code

2. **Create a Template** (if needed):
   - Go to Templates
   - Create simple "Hello {{1}}" template
   - Wait for approval (or use existing)

3. **Send Message**:
   - Go to Campaigns
   - Create "Contact Campaign"
   - Select template and contact
   - Send immediately

## 🎉 Congratulations!
You've successfully set up WhatsWay and sent your first message!

## 📚 Next Steps

### Essential Tasks
- [ ] Import your contacts (CSV)
- [ ] Create message templates
- [ ] Set up team members
- [ ] Configure automations
- [ ] Review security settings

### Explore Features
1. **Dashboard** - Monitor performance
2. **Inbox** - Manage conversations
3. **Campaigns** - Bulk messaging
4. **Automations** - Build workflows
5. **Analytics** - Track metrics

## 🆘 Quick Troubleshooting

### Can't receive messages?
- Check webhook URL is HTTPS
- Verify token matches
- Check server logs

### Can't send messages?
- Verify phone number is active
- Check access token validity
- Ensure template is approved

### Database errors?
- Run: `npm run db:push`
- Check DATABASE_URL in .env

## 💡 Pro Tips

1. **Performance**
   - Use PM2 for production
   - Enable Redis caching
   - Set up CDN for assets

2. **Security**
   - Enable 2FA for admin
   - Use environment variables
   - Regular backups

3. **Scaling**
   - Use load balancer
   - Separate database server
   - Monitor with tools

## 📞 Need Help?
- Documentation: `/DOCUMENTATION.md`
- Support: support@whatsway.com
- Community: forum.whatsway.com

---
Happy messaging with WhatsWay! 🚀