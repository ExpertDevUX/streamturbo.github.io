import { 
  users, 
  streams, 
  categories, 
  follows, 
  chatMessages,
  type User, 
  type UpsertUser,
  type RegisterUser,
  type Stream,
  type InsertStream,
  type Category,
  type InsertCategory,
  type Follow,
  type InsertFollow,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema-sqlite";
import { db } from "./db-new";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStreamKey(streamKey: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: RegisterUser): Promise<User>;
  
  // Stream operations
  startStream(userId: string, streamData: Omit<InsertStream, 'userId' | 'isLive' | 'startedAt'>): Promise<Stream>;
  endStream(userId: string): Promise<void>;
  getStreamById(id: string): Promise<(Stream & { user: User }) | undefined>;
  getLiveStreams(): Promise<(Stream & { user: User })[]>;
  getStreamsByUserId(userId: string): Promise<Stream[]>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  
  // Follow operations
  followUser(followerId: string, followedId: string): Promise<void>;
  unfollowUser(followerId: string, followedId: string): Promise<void>;
  isFollowing(followerId: string, followedId: string): Promise<boolean>;
  
  // Chat operations
  getChatMessages(streamId: string): Promise<(ChatMessage & { user: User })[]>;
  sendChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllStreams(): Promise<Stream[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  resetUserPassword(id: string, newPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Helper function to convert Unix timestamp to Date for API responses
  private parseTimestamp(timestamp: number | null): Date | null {
    return timestamp ? new Date(timestamp * 1000) : null;
  }

  // Helper function to convert Date to Unix timestamp for database storage
  private toTimestamp(date: Date | null): number | null {
    return date ? Math.floor(date.getTime() / 1000) : null;
  }

  // User operations (required for Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByStreamKey(streamKey: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.streamKey, streamKey));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert operation");
    }
    
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      const [user] = await db
        .update(users)
        .set({
          ...userData,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    } else {
      // Generate stream key if not provided
      const streamKey = `sk_live_${nanoid(32)}`;
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          streamKey,
        })
        .returning();
      return user;
    }
  }

  async createUser(userData: RegisterUser): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Generate stream key
    const streamKey = `sk_live_${nanoid(32)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        streamKey,
      })
      .returning();
    return user;
  }

  // Stream operations
  async startStream(userId: string, streamData: Omit<InsertStream, 'userId' | 'isLive' | 'startedAt'>): Promise<Stream> {
    const currentTime = Math.floor(Date.now() / 1000);
    
    // End any existing active stream
    await db
      .update(streams)
      .set({ 
        isLive: false, 
        endedAt: currentTime 
      })
      .where(and(eq(streams.userId, userId), eq(streams.isLive, true)));

    // Update user streaming status
    await db
      .update(users)
      .set({ isStreaming: true })
      .where(eq(users.id, userId));

    // Convert tags array to JSON string for SQLite storage
    const tagsJson = Array.isArray(streamData.tags) ? JSON.stringify(streamData.tags) : '[]';

    // Create new stream
    const [stream] = await db
      .insert(streams)
      .values({
        title: streamData.title,
        description: streamData.description,
        categoryId: streamData.categoryId,
        language: streamData.language,
        thumbnailUrl: streamData.thumbnailUrl,
        tags: tagsJson,
        userId,
        isLive: true,
        startedAt: currentTime,
      })
      .returning();

    return stream;
  }

  async endStream(userId: string): Promise<void> {
    const currentTime = Math.floor(Date.now() / 1000);
    
    await db
      .update(streams)
      .set({ 
        isLive: false, 
        endedAt: currentTime 
      })
      .where(and(eq(streams.userId, userId), eq(streams.isLive, true)));

    await db
      .update(users)
      .set({ isStreaming: false })
      .where(eq(users.id, userId));
  }

  async getStreamById(id: string): Promise<(Stream & { user: User }) | undefined> {
    const result = await db
      .select()
      .from(streams)
      .leftJoin(users, eq(streams.userId, users.id))
      .where(eq(streams.id, id));

    if (result.length === 0) return undefined;
    
    const { streams: stream, users: user } = result[0];
    return { ...stream, user: user! };
  }

  async getLiveStreams(): Promise<(Stream & { user: User })[]> {
    const result = await db
      .select()
      .from(streams)
      .leftJoin(users, eq(streams.userId, users.id))
      .where(eq(streams.isLive, true))
      .orderBy(desc(streams.startedAt));

    return result.map(({ streams: stream, users: user }) => ({ ...stream, user: user! }));
  }

  async getStreamsByUserId(userId: string): Promise<Stream[]> {
    return await db
      .select()
      .from(streams)
      .where(eq(streams.userId, userId))
      .orderBy(desc(streams.createdAt));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  // Follow operations
  async followUser(followerId: string, followedId: string): Promise<void> {
    // Check if already following
    const existing = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followedId, followedId)));

    if (existing.length === 0) {
      await db.insert(follows).values({ followerId, followedId });
      
      // Update follower counts
      await db
        .update(users)
        .set({ followingCount: sql`${users.followingCount} + 1` })
        .where(eq(users.id, followerId));
      
      await db
        .update(users)
        .set({ followerCount: sql`${users.followerCount} + 1` })
        .where(eq(users.id, followedId));
    }
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    const deleted = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followedId, followedId)));

    if (deleted) {
      // Update follower counts
      await db
        .update(users)
        .set({ followingCount: sql`${users.followingCount} - 1` })
        .where(eq(users.id, followerId));
      
      await db
        .update(users)
        .set({ followerCount: sql`${users.followerCount} - 1` })
        .where(eq(users.id, followedId));
    }
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followedId, followedId)));
    
    return result.length > 0;
  }

  // Chat operations
  async getChatMessages(streamId: string): Promise<(ChatMessage & { user: User })[]> {
    const result = await db
      .select()
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.streamId, streamId))
      .orderBy(chatMessages.createdAt);

    return result.map(({ chat_messages: message, users: user }) => ({ ...message, user: user! }));
  }

  async sendChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(data)
      .returning();
    
    return message;
  }

  // Admin user management operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getAllStreams(): Promise<Stream[]> {
    return await db.select().from(streams).orderBy(desc(streams.createdAt));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // First delete related records
    await db.delete(follows).where(eq(follows.followerId, id));
    await db.delete(follows).where(eq(follows.followedId, id));
    await db.delete(chatMessages).where(eq(chatMessages.userId, id));
    await db.delete(streams).where(eq(streams.userId, id));
    
    // Then delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();