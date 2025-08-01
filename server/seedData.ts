import { db, initializeDatabase } from "./db-new";
import { users, categories, streams } from "@shared/schema-sqlite";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  try {
    console.log("Seeding database with initial data...");

    // Create admin user
    const adminStreamKey = `sk_live_${nanoid(32)}`;
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const adminUser = await db
      .insert(users)
      .values({
        id: "admin-user-" + nanoid(),
        email: "admin@streamvibe.com",
        password: hashedPassword,
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        bio: "Platform Administrator",
        role: "admin",
        streamKey: adminStreamKey,
        followerCount: 1000,
        followingCount: 50,
      })
      .returning()
      .then(result => result[0]);

    // Create sample categories
    const categories_data = [
      {
        name: "Gaming",
        icon: "🎮",
        description: "Video games, esports, and gaming content",
      },
      {
        name: "Just Chatting",
        icon: "💬",
        description: "Conversations, Q&A, and interactive streams",
      },
      {
        name: "Music",
        icon: "🎵",
        description: "Live music performances and DJ sets",
      },
      {
        name: "Art",
        icon: "🎨",
        description: "Digital art, drawing, and creative content",
      },
      {
        name: "Coding",
        icon: "💻",
        description: "Programming, software development, and tech",
      },
      {
        name: "Sports",
        icon: "⚽",
        description: "Sports discussions, fitness, and competitions",
      },
    ];

    const createdCategories = [];
    for (const categoryData of categories_data) {
      const [category] = await db
        .insert(categories)
        .values({
          ...categoryData,
          streamCount: Math.floor(Math.random() * 100),
        })
        .returning();
      createdCategories.push(category);
    }

    // Create sample users
    const sampleUsers = [];
    for (let i = 1; i <= 5; i++) {
      const streamKey = `sk_live_${nanoid(32)}`;
      const [user] = await db
        .insert(users)
        .values({
          email: `user${i}@example.com`,
          username: `streamer${i}`,
          firstName: `Streamer`,
          lastName: `${i}`,
          profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
          bio: `Content creator and streamer #${i}`,
          streamKey,
          followerCount: Math.floor(Math.random() * 1000),
          followingCount: Math.floor(Math.random() * 100),
        })
        .returning();
      sampleUsers.push(user);
    }

    // Create sample streams
    const streamTitles = [
      "Morning Coffee and Code",
      "Epic Gaming Session",
      "Live Music Performance",
      "Art Creation Stream",
      "Just Chatting with Viewers",
      "Fitness and Wellness Talk",
    ];

    for (let i = 0; i < Math.min(streamTitles.length, sampleUsers.length); i++) {
      const user = sampleUsers[i];
      const category = createdCategories[i % createdCategories.length];
      
      await db.insert(streams).values({
        userId: user.id,
        categoryId: category.id,
        title: streamTitles[i],
        description: `Live ${category.name.toLowerCase()} stream with ${user.username}`,
        language: "en",
        tags: JSON.stringify(["live", category.name.toLowerCase(), "interactive"]),
        viewerCount: Math.floor(Math.random() * 500),
        isLive: i < 2, // Make first 2 streams live
        thumbnailUrl: `https://picsum.photos/400/225?random=${i}`,
        startedAt: i < 2 ? Math.floor(Date.now() / 1000) - 3600 : null, // Started 1 hour ago if live
      });
    }

    console.log("Database seeded successfully!");
    console.log(`Admin user created: admin@streamvibe.com / admin123`);
    console.log(`Created ${createdCategories.length} categories`);
    console.log(`Created ${sampleUsers.length} sample users`);
    console.log(`Created ${streamTitles.length} sample streams`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await initializeDatabase();
  await seedDatabase();
  process.exit(0);
}