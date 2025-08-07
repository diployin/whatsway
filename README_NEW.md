# WhatsWay - Professional WhatsApp Business Platform

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0-green.svg" alt="Node">
  <img src="https://img.shields.io/badge/postgresql-%3E%3D14-blue.svg" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/license-proprietary-red.svg" alt="License">
</p>

## 🚀 Overview

WhatsWay is a comprehensive WhatsApp Business messaging platform that empowers businesses to manage their WhatsApp communications efficiently. Built with modern technologies and designed for scalability, it provides powerful tools for marketing automation, customer service, and team collaboration.

### 🎯 Key Benefits
- **Increase Engagement**: Reach customers on their preferred messaging platform
- **Automate Workflows**: Save time with intelligent automation
- **Scale Operations**: Handle thousands of conversations efficiently
- **Track Performance**: Make data-driven decisions with analytics
- **Collaborate Seamlessly**: Work as a team with role-based access

## ✨ Features

### 📊 Analytics Dashboard
- Real-time message statistics
- Campaign performance metrics
- Channel health monitoring
- Interactive charts and reports
- Export capabilities

### 👥 Contact Management
- Bulk import via CSV with duplicate detection
- Smart grouping and tagging
- Advanced search and filtering
- Contact activity history
- Custom fields support

### 📨 Campaign System
- **Contact Campaigns**: Target specific contacts
- **CSV Campaigns**: Upload recipient lists
- **API Campaigns**: Integrate with external systems
- Template-based messaging
- Automated retry mechanism
- Detailed delivery reports

### 💬 Team Inbox
- WhatsApp-style interface
- Real-time synchronization
- Conversation assignment
- 24-hour window compliance
- Quick reply templates

### 🤖 Automation Builder
- Visual drag-drop designer
- Multiple trigger types
- Conditional logic
- Time delays
- Template messages
- Keyword detection

### 👨‍💼 Team Management
- Role-based access (Admin/Manager/Agent)
- Activity logging
- Performance tracking
- Section permissions

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library
- **TanStack Query** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe queries
- **WebSocket** - Real-time updates

### Integrations
- **WhatsApp Business Cloud API**
- **MM Lite API** (Optional)
- **Meta Marketing API**
- **Webhook Support**

## 📋 Requirements

### System Requirements
- Node.js 18.0 or higher
- PostgreSQL 14 or higher
- 2GB RAM minimum (4GB recommended)
- SSL certificate (for webhooks)

### External Requirements
- WhatsApp Business Account
- Meta Business Account
- Facebook Developer Account
- Domain with SSL

## 🚀 Quick Start

### 1. Automated Installation (Recommended)
```bash
# Clone or extract the project
cd whatsway

# Run the installer
node install.js
```

### 2. Manual Installation
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:push

# Start development server
npm run dev
```

### 3. Docker Installation
```bash
# Using Docker Compose
docker-compose up -d
```

## 📚 Documentation

- 📖 [Full Documentation](DOCUMENTATION.md)
- 🚀 [Quick Start Guide](QUICK_START_GUIDE.md)
- 🔧 [Installation Guide](INSTALL_README.md)
- 🌐 [Webhook Setup](WEBHOOK_SETUP_GUIDE.md)
- 📁 [Project Structure](PROJECT_STRUCTURE.md)
- 📝 [Changelog](CHANGELOG.md)

## 🔐 Default Credentials

```
Username: whatsway
Password: Admin@123
```
**⚠️ Important**: Change the default password immediately after first login.

## 🤝 Support

### Getting Help
- 📧 Email: support@whatsway.com
- 📚 Documentation: See `/DOCUMENTATION.md`
- 🐛 Issues: Check logs in `/logs` directory

### Pre-Installation Support
For CodeCanyon customers, please use the comments section for pre-sale questions.

## 📄 License

This is proprietary software. Usage is subject to the license terms:
- **Regular License**: For single end product
- **Extended License**: For SaaS applications

## 🏆 Why Choose WhatsWay?

- ✅ **Production Ready**: Battle-tested code
- ✅ **Clean Architecture**: Maintainable and scalable
- ✅ **Regular Updates**: Continuous improvements
- ✅ **Professional Support**: Dedicated assistance
- ✅ **Easy Customization**: Well-documented code
- ✅ **Modern Stack**: Latest technologies

## 🎉 Get Started Today!

Transform your WhatsApp Business communications with WhatsWay. Whether you're a small business or a large enterprise, our platform scales with your needs.

---

<p align="center">
  Made with ❤️ by the WhatsWay Team<br>
  © 2025 WhatsWay. All rights reserved.
</p>