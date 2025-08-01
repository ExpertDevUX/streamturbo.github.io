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
import { db } from "./db";
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
  getFollowedStreamers(userId: string): Promise<(User & { isLive: boolean; category: string })[]>;
  
  // Chat operations
  getChatMessages(streamId: string): Promise<(ChatMessage & { user: User })[]>;
  sendChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  
  // Admin user management operations
  getAllUsers(): Promise<User[]>;
  getAllStreams(): Promise<Stream[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  resetUserPassword(id: string, newPassword: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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
    // End any existing active stream
    await db
      .update(streams)
      .set({ 
        isLive: false, 
        endedAt: new Date() 
      })
      .where(and(eq(streams.userId, userId), eq(streams.isLive, true)));

    // Update user streaming status
    await db
      .update(users)
      .set({ isStreaming: true })
      .where(eq(users.id, userId));

    // Create new stream
    const [stream] = await db
      .insert(streams)
      .values({
        ...streamData,
        userId,
        isLive: true,
        startedAt: new Date(),
      })
      .returning();

    return stream;
  }

  async endStream(userId: string): Promise<void> {
    await db
      .update(streams)
      .set({ 
        isLive: false, 
        endedAt: new Date() 
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
      .orderBy(desc(streams.viewerCount));

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
    return await db.select().from(categories);
  }

  // Follow operations
  async followUser(followerId: string, followedId: string): Promise<void> {
    await db.insert(follows).values({
      followerId,
      followedId,
    });

    // Update follower counts
    await db
      .update(users)
      .set({ 
        followerCount: sql`${users.followerCount} + 1` 
      })
      .where(eq(users.id, followedId));

    await db
      .update(users)
      .set({ 
        followingCount: sql`${users.followingCount} + 1` 
      })
      .where(eq(users.id, followerId));
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followedId, followedId)
      ));

    // Update follower counts
    await db
      .update(users)
      .set({ 
        followerCount: sql`${users.followerCount} - 1` 
      })
      .where(eq(users.id, followedId));

    await db
      .update(users)
      .set({ 
        followingCount: sql`${users.followingCount} - 1` 
      })
      .where(eq(users.id, followerId));
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followedId, followedId)
      ));
    
    return !!follow;
  }

  async getFollowedStreamers(userId: string): Promise<(User & { isLive: boolean; category: string })[]> {
    const result = await db
      .select({
        user: users,
        stream: streams,
        category: categories,
      })
      .from(follows)
      .leftJoin(users, eq(follows.followedId, users.id))
      .leftJoin(streams, and(eq(users.id, streams.userId), eq(streams.isLive, true)))
      .leftJoin(categories, eq(streams.categoryId, categories.id))
      .where(eq(follows.followerId, userId));

    return result.map(({ user, stream, category }) => ({
      ...user!,
      isLive: !!stream,
      category: category?.name || 'Just Chatting',
    }));
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
      .set({ ...updates, updatedAt: new Date() })
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
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }
}

export const storage = new DatabaseStorage();