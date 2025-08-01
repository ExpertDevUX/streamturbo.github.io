import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByEmail("admin@streamvibe.com");
    if (existingAdmin) {
      console.log("Admin user already exists with email: admin@streamvibe.com");
      return;
    }

    // Create admin user
    const adminUser = await storage.createUser({
      email: "admin@streamvibe.com",
      password: "admin123",
      username: "admin",
      firstName: "Stream",
      lastName: "Admin",
    });

    // Update role to admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.upsertUser({
      ...adminUser,
      role: "admin",
      password: hashedPassword,
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email: admin@streamvibe.com");
    console.log("Password: admin123");
    console.log("Role: admin");
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminUser().then(() => process.exit(0));
}

export { createAdminUser };