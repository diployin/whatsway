# WhatsWay - WhatsApp Business Platform

A comprehensive WhatsApp Business messaging platform featuring marketing automation, customer service capabilities, and advanced team collaboration.

![WhatsWay Logo](./docs/logo.png)

## 🚀 Quick Start

### One-Click Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsway.git
cd whatsway

# Run the universal installer
node install.js
```

The installer will automatically detect your operating system and guide you through the setup process.

### Manual Installation

For detailed installation instructions, see [INSTALL_README.md](./INSTALL_README.md)

## 🎯 Features

- **📊 Dashboard & Analytics**: Real-time message statistics and campaign performance tracking
- **👥 Contact Management**: Import, organize, and segment contacts with tags and groups
- **📢 Campaign Management**: Create and schedule marketing campaigns with three types:
  - Contact-based campaigns
  - CSV upload campaigns
  - API-driven campaigns
- **📝 Template Management**: Create and manage WhatsApp message templates with media support
- **💬 Team Inbox**: WhatsApp-style chat interface with conversation assignment
- **🤖 Automation**: Build automated workflows with triggers and conditions
- **👨‍👩‍👧‍👦 Team Management**: Role-based access control (Admin, Manager, Agent)
- **🔌 Webhook Integration**: Real-time message status updates and event handling
- **📱 Multi-Channel Support**: Manage multiple WhatsApp Business numbers
- **🚀 MM Lite Integration**: Support for high-volume marketing messages

## 📋 Requirements

- Node.js 18+
- PostgreSQL 12+
- WhatsApp Business Account
- Meta App with WhatsApp Product

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express.js, PostgreSQL
- **ORM**: Drizzle ORM
- **Real-time**: WebSocket for live updates
- **Authentication**: Session-based with role management

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/whatsway

# WhatsApp API
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WEBHOOK_VERIFY_TOKEN=your_verify_token

# Session
SESSION_SECRET=your_session_secret
```

### Quick Environment Setup

```bash
node setup-env.js
```

## 🌐 Webhook Configuration

1. Go to Meta Developer Console
2. Navigate to WhatsApp > Configuration
3. Set webhook URL: `https://yourdomain.com/api/webhook`
4. Subscribe to: `messages`, `message_status`, `message_template_status_update`

## 🐳 Docker Deployment

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📚 API Documentation

WhatsWay provides RESTful APIs for integration:

- **Authentication**: `/api/auth/*`
- **Contacts**: `/api/contacts/*`
- **Campaigns**: `/api/campaigns/*`
- **Templates**: `/api/templates/*`
- **Messages**: `/api/messages/*`
- **Webhooks**: `/api/webhook`

## 🔐 Default Credentials

- **Username**: whatsway
- **Password**: Admin@123

⚠️ **Important**: Change the default password immediately after first login!

## 🚦 Running the Application

### Development Mode
```bash
npm run dev
# or
./start-dev.bat (Windows)
```

### Production Mode
```bash
npm run build
npm run start
# or
./start-prod.bat (Windows)
```

## ⏰ Cron Jobs

The platform includes automated tasks:

- **Message Status Updater**: Every 5 minutes
- **Channel Health Monitor**: Every hour
- **Campaign Processor**: Every 10 minutes

### Manual Cron Execution

```bash
# Linux/Mac
./run-cron.sh message-status

# Windows
run-cron.bat message-status
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛟 Support

- Documentation: [Wiki](https://github.com/yourusername/whatsway/wiki)
- Issues: [GitHub Issues](https://github.com/yourusername/whatsway/issues)
- Community: [Discord Server](https://discord.gg/whatsway)

## 🙏 Acknowledgments

- Meta for WhatsApp Business API
- All contributors and supporters

---

Built with ❤️ by the WhatsWay team