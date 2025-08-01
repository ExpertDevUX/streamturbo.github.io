import { storage } from "./storage";
import { nanoid } from "nanoid";

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create admin user
    const adminUser = await storage.upsertUser({
      id: "admin-user-" + nanoid(),
      email: "admin@streamvibe.com",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      bio: "Platform Administrator",
      role: "admin",
      streamKey: nanoid(32),
    });

    console.log("Created admin user:", adminUser.username);

    // Create sample categories
    const categories = [
      { name: "Gaming", description: "Video game streaming and gameplay" },
      { name: "Music", description: "Live music performances and DJ sets" },
      { name: "Talk Shows", description: "Discussions and interviews" },
      { name: "Creative", description: "Art, design, and creative content" },
      { name: "Tech", description: "Technology and programming streams" },
      { name: "Fitness", description: "Workout sessions and health content" },
    ];

    for (const category of categories) {
      try {
        await storage.createCategory(category);
      } catch (error) {
        // Category might already exist, skip
        console.log(`Category "${category.name}" might already exist`);
      }
    }

    console.log("Created sample categories");
    console.log("Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}