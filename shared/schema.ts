import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const botLogs = pgTable("bot_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  component: text("component"),
  details: text("details"),
});

export const botStatus = pgTable("bot_status", {
  id: serial("id").primaryKey(),
  isOnline: boolean("is_online").default(false).notNull(),
  lastUpdate: timestamp("last_update").defaultNow().notNull(),
  uptime: integer("uptime").default(0).notNull(),
  apiStatus: text("api_status").default("unknown").notNull(),
  apiResponseTime: integer("api_response_time").default(0).notNull(),
  postsToday: integer("posts_today").default(0).notNull(),
  lastCreaturePost: text("last_creature_post"),
  lastBossPost: text("last_boss_post"),
});

export const creatures = pgTable("creatures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  race: text("race").notNull(),
  hitpoints: integer("hitpoints").default(0).notNull(),
  experience: integer("experience").default(0).notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  level: integer("level"),
  armor: integer("armor"),
  speed: integer("speed"),
  isBoosted: boolean("is_boosted").default(false).notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

export const apiTests = pgTable("api_tests", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  status: text("status").notNull(),
  responseTime: integer("response_time").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  error: text("error"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBotLogSchema = createInsertSchema(botLogs).pick({
  level: true,
  message: true,
  component: true,
  details: true,
});

export const insertBotStatusSchema = createInsertSchema(botStatus).pick({
  isOnline: true,
  uptime: true,
  apiStatus: true,
  apiResponseTime: true,
  postsToday: true,
  lastCreaturePost: true,
  lastBossPost: true,
});

export const insertCreatureSchema = createInsertSchema(creatures).pick({
  name: true,
  race: true,
  hitpoints: true,
  experience: true,
  imageUrl: true,
  description: true,
  level: true,
  armor: true,
  speed: true,
  isBoosted: true,
});

export const insertApiTestSchema = createInsertSchema(apiTests).pick({
  endpoint: true,
  status: true,
  responseTime: true,
  error: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBotLog = z.infer<typeof insertBotLogSchema>;
export type BotLog = typeof botLogs.$inferSelect;

export type InsertBotStatus = z.infer<typeof insertBotStatusSchema>;
export type BotStatus = typeof botStatus.$inferSelect;

export type InsertCreature = z.infer<typeof insertCreatureSchema>;
export type Creature = typeof creatures.$inferSelect;

export type InsertApiTest = z.infer<typeof insertApiTestSchema>;
export type ApiTest = typeof apiTests.$inferSelect;
