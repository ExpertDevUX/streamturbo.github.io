import { sql } from 'drizzle-orm';
import {
  text,
  integer,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  email: text("email").unique(),
  password: text("password"), // for email/password auth
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  username: text("username").unique(),
  bio: text("bio"),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  streamKey: text("stream_key").unique(),
  isStreaming: integer("is_streaming", { mode: 'boolean' }).default(false),
  role: text("role").default("user"), // user, moderator, admin
  lastLoginAt: integer("last_login_at"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
  streamCount: integer("stream_count").default(0),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Streams table
export const streams = sqliteTable("streams", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  userId: text("user_id").notNull().references(() => users.id),
  categoryId: text("category_id").references(() => categories.id),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  viewerCount: integer("viewer_count").default(0),
  isLive: integer("is_live", { mode: 'boolean' }).default(false),
  language: text("language").default('en'),
  tags: text("tags").default('[]'), // JSON string array
  startedAt: integer("started_at"),
  endedAt: integer("ended_at"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Follows table
export const follows = sqliteTable("follows", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  followerId: text("follower_id").notNull().references(() => users.id),
  followedId: text("followed_id").notNull().references(() => users.id),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Chat messages table
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  streamId: text("stream_id").notNull().references(() => streams.id),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  isModerator: integer("is_moderator", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  streams: many(streams),
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  chatMessages: many(chatMessages),
}));

export const streamsRelations = relations(streams, ({ one, many }) => ({
  user: one(users, {
    fields: [streams.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [streams.categoryId],
    references: [categories.id],
  }),
  chatMessages: many(chatMessages),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  streams: many(streams),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  followed: one(users, {
    fields: [follows.followedId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  stream: one(streams, {
    fields: [chatMessages.streamId],
    references: [streams.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  username: true,
  bio: true,
});

export const registerSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  username: true,
  firstName: true,
  lastName: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertStreamSchema = createInsertSchema(streams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.array(z.string()).default([]),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Stream = typeof streams.$inferSelect;
export type InsertStream = z.infer<typeof insertStreamSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;