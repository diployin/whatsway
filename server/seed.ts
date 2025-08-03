import { db } from "./db";
import { users } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");

    // Check if admin user already exists
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, "whatsway"));

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "whatsway",
        password: hashedPassword,
        email: "admin@whatsway.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        status: "active",
        permissions: [
          "contacts.view",
          "contacts.create",
          "contacts.update",
          "contacts.delete",
          "contacts.export",
          "campaigns.view",
          "campaigns.create",
          "campaigns.update",
          "campaigns.delete",
          "templates.view",
          "templates.create",
          "templates.update",
          "templates.delete",
          "analytics.view",
          "team.view",
          "team.create",
          "team.update",
          "team.delete",
          "settings.view",
          "settings.update",
          "inbox.view",
          "inbox.send",
          "inbox.assign",
          "automations.view",
          "automations.create",
          "automations.update",
          "automations.delete",
        ],
      })
      .returning();

    console.log("Admin user created successfully:", {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
    });

    console.log("\nDefault admin credentials:");
    console.log("Username: whatsway");
    console.log("Password: Admin@123");
    console.log("\nPlease change the password after first login!");

  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed function
seed()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });