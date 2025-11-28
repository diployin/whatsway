import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

interface User {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user" | "superadmin";
  status: "active" | "inactive";
  permissions: string[];
  isEmailVerified?: boolean;
}

async function seed() {
  try {
    console.log("Seeding database...");

    // Helper to create user if not exists
    async function createUserIfNotExists({ username, password, email, firstName, lastName, role, status, permissions }: User) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (existingUser) {
        console.log(`User '${username}' already exists`);
        return existingUser;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          email,
          firstName,
          lastName,
          role,
          status,
          permissions,
          isEmailVerified: true
        })
        .returning();

      console.log(`✅ User '${username}' created successfully`);
      return newUser;
    }


    // Default superadmin permission 


    const DefaultsuperAdminPermissions = [
  // Core Features – Dashboard, Campaigns, Templates, Contacts, ChatHub
  'dashboard:view',

  'campaigns:view',
  'campaigns:create',
  'campaigns:edit',
  'campaigns:delete',
  'campaigns:export',

  'templates:view',
  'templates:create',
  'templates:edit',
  'templates:delete',
  'templates:export',

  'contacts:view',
  'contacts:create',
  'contacts:edit',
  'contacts:delete',
  'contacts:export',

  'chathub:view',
  'chathub:send',
  'chathub:assign',
  'chathub:delete',

  // Automation & AI – Bot Flow Builder, Workflows, AI Assistant, Auto Responses
  'botflow:view',
  'botflow:create',
  'botflow:edit',
  'botflow:delete',

  'workflows:view',
  'workflows:create',
  'workflows:edit',
  'workflows:delete',

  'aiassistant:use',
  'aiassistant:configure',

  'autoresponses:view',
  'autoresponses:create',
  'autoresponses:edit',
  'autoresponses:delete',

  // WhatsApp Management – WABA Connection, Multi-Number, Webhooks, QR Codes
  'waba:view',
  'waba:connect',
  'waba:disconnect',
  'multi_number:view',
  'multi_number:add',
  'multi_number:edit',
  'multi_number:delete',
  'webhooks:view',
  'webhooks:create',
  'webhooks:edit',
  'webhooks:delete',
  'qrcodes:view',
  'qrcodes:generate',
  'qrcodes:delete',

  // CRM & Leads – CRM Systems, Lead Management, Bulk Import, Segmentation
  'crm:view',
  'leads:view',
  'leads:create',
  'leads:edit',
  'leads:delete',
  'bulk_import:leads',
  'segmentation:view',
  'segmentation:create',
  'segmentation:edit',
  'segmentation:delete',

  // Analytics & Reports – Analytics, Message Logs, Health Monitor, Reports
  'analytics:view',
  'message_logs:view',
  'health_monitor:view',
  'reports:view',
  'reports:export',

  // Team & Support – Team Members, Support Tickets, Settings, Notifications
  'team:view',
  'team:create',
  'team:edit',
  'team:delete',
  'support_tickets:view',
  'support_tickets:create',
  'support_tickets:edit',
  'support_tickets:close',
  'notifications:view',
  'notifications:send',

  // Settings (global)
  'settings:view',
  'settings:edit'
];


    // Default permissions 
    const defaultPermissions = [
      // Contacts
      'contacts:view',
      'contacts:create',
      'contacts:edit',
      'contacts:delete',
      'contacts:export',

      // Campaigns
      'campaigns:view',
      'campaigns:create',
      'campaigns:edit',
      'campaigns:delete',

      // Templates
      'templates:view',
      'templates:create',
      'templates:edit',
      'templates:delete',
      'templates:sync',

      // Analytics
      'analytics:view',

      // Team
      'team:view',
      'team:create',
      'team:edit',
      'team:delete',

      // Settings
      'settings:view',

      // Inbox
      'inbox:view',
      'inbox:send',
      'inbox:assign',

      // Automations
      'automations:view',
      'automations:create',
      'automations:edit',
      'automations:delete',
    ];



    // Create Super Admin
    const SuperAdmin = await createUserIfNotExists({
      username: "superadmin",
      password: "Superadmin@123",
      email: "superadmin@whatsway.com",
      firstName: "Super",
      lastName: "Admin",
      role: "superadmin",
      status: "active",
      isEmailVerified: true,
      permissions: DefaultsuperAdminPermissions,
    });


     const demoAdmin = await createUserIfNotExists({
      username: "demoadmin",
      password: "Admin@123",
      email: "demoadmin@whatsway.com",
      firstName: "Demo",
      lastName: "Admin",
      role: "superadmin",
      status: "active",
      permissions: defaultPermissions,
      isEmailVerified: true,
    });

    // Create Demo User
    const demoUser = await createUserIfNotExists({
      username: "demouser",
      password: "Demo@12345",
      email: "demouser@whatsway.com",
      firstName: "Demo",
      lastName: "User",
      role: "user",
      status: "active",
      isEmailVerified: true,
      permissions: ['contacts:view', 'campaigns:view', 'templates:view', 'analytics:view', 'inbox:view'],
    });

    console.log("\n=== Default Users Created ===");
    console.log("Demo Admin:");
    console.log("  Username: demoadmin");
    console.log("  Password: Admin@123");
    
    console.log("Demo User:");
    console.log("  Username: demouser");
    console.log("  Password: Demo@12345");

    console.log("superadmin:");
    console.log("Username: superadmin");
    console.log("Password: Superadmin@123")
    console.log("\n⚠️  Please change passwords after first login!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed function
seed()
  .then(() => {
    console.log("✅ Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
