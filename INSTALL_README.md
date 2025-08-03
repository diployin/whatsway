# WhatsWay Installation Guide

## 🚀 Quick Installation

WhatsWay provides easy installation scripts for users with no coding experience. Choose your operating system below:

### For Linux/Mac Users
```bash
chmod +x install.sh
./install.sh
```

### For Windows Users
```batch
install.bat
```

## 📋 Prerequisites

Before running the installer, ensure you have:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL Database** - [Download here](https://www.postgresql.org/download/)
3. **WhatsApp Business Account** - [Set up here](https://business.facebook.com/business/help/2087193751603668)
4. **Meta App with WhatsApp Product** - [Create here](https://developers.facebook.com/)

## 🔧 What the Installer Does

The installer automatically:

1. ✅ Checks all prerequisites
2. ✅ Installs all dependencies
3. ✅ Creates environment configuration
4. ✅ Sets up the database
5. ✅ Creates default admin user
6. ✅ Builds the application
7. ✅ Configures automated tasks (cron jobs)
8. ✅ Provides webhook setup instructions

## 📝 Required Information

During installation, you'll need:

### WhatsApp API Credentials
- **WhatsApp Business Account ID**: Found in Meta Business Manager
- **WhatsApp Access Token**: Generated in Meta App Dashboard
- **WhatsApp Phone Number ID**: Your WhatsApp business phone number ID
- **Webhook Verify Token**: Any secret string you choose

### Database Configuration
- **PostgreSQL Connection URL**: Format: `postgresql://username:password@host:port/database`
- Or leave blank to use local default: `postgresql://postgres:postgres@localhost:5432/whatsway`

## 🌐 Webhook Configuration

After installation, configure webhooks in Meta Developer Console:

1. Go to your Meta App Dashboard
2. Navigate to **WhatsApp > Configuration**
3. Set webhook URL: `https://YOUR_DOMAIN/api/webhook`
4. Use the verify token you provided during installation
5. Subscribe to these webhook fields:
   - `messages`
   - `message_status`
   - `message_template_status_update`

## 🖥️ Starting the Application

### Development Mode
```bash
# Linux/Mac
npm run dev

# Windows
start-dev.bat
```

### Production Mode
```bash
# Linux/Mac
npm run start

# Windows
start-prod.bat
```

## 🔐 Default Login Credentials

- **URL**: http://localhost:5173
- **Username**: whatsway
- **Password**: Admin@123

⚠️ **Important**: Change the default password immediately after first login!

## ⏰ Automated Tasks

The installer sets up these automated tasks:

| Task | Frequency | Purpose |
|------|-----------|---------|
| Message Status Updater | Every 5 minutes | Updates message delivery status |
| Channel Health Monitor | Every hour | Monitors WhatsApp channel health |
| Campaign Processor | Every 10 minutes | Processes scheduled campaigns |

### Managing Tasks

**Linux/Mac**: View cron jobs with `crontab -l`

**Windows**: Open Task Scheduler (`taskschd.msc`)

## 🚨 Troubleshooting

### Database Connection Failed
1. Ensure PostgreSQL is running
2. Check your DATABASE_URL is correct
3. Create the database manually if needed:
   ```sql
   CREATE DATABASE whatsway;
   ```

### Port Already in Use
If port 5173 is busy, change it in `.env`:
```
APP_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Webhook Not Working
1. Ensure your server is publicly accessible
2. Use ngrok for testing: `ngrok http 5173`
3. Update webhook URL in Meta Console
4. Check webhook verify token matches

### Permission Errors (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
chmod -R 755 .
```

## 📁 Project Structure

```
whatsway/
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types and schemas
├── .env             # Environment configuration
├── install.sh       # Linux/Mac installer
├── install.bat      # Windows installer
├── start-dev.bat    # Windows dev starter
├── start-prod.bat   # Windows production starter
└── cron-setup.sh    # Linux/Mac cron setup
```

## 🔄 Updating WhatsWay

To update to the latest version:

```bash
git pull origin main
npm install
npm run db:push
npm run build
```

## 🛟 Getting Help

- **Documentation**: [GitHub Wiki](https://github.com/yourusername/whatsway/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/whatsway/issues)
- **Community**: [Discord Server](https://discord.gg/whatsway)

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 10GB
- **OS**: Ubuntu 20.04+, Windows 10+, macOS 10.15+

### Recommended for Production
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **Database**: PostgreSQL on separate server
- **SSL**: Required for webhooks

## 🔒 Security Best Practices

1. **Change default password** immediately
2. **Use HTTPS** in production
3. **Secure your database** with strong passwords
4. **Keep API tokens secret** - never commit to git
5. **Regular backups** of database
6. **Update regularly** for security patches

## 📝 License

WhatsWay is licensed under the MIT License. See LICENSE file for details.