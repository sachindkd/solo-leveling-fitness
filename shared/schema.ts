import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Hunter Ranks
export const RANKS = ["E", "D", "C", "B", "A", "S", "SS"] as const;
export type Rank = (typeof RANKS)[number];

// Job Classes
export const JOBS = [
  "Novice Hunter",
  "Assassin",
  "Berserker",
  "Mage",
  "Tank",
  "Warlock",
  "Shadow Monarch",
] as const;
export type Job = (typeof JOBS)[number];

// Stat Types
export const STATS = ["strength", "stamina", "speed", "endurance"] as const;
export type StatType = (typeof STATS)[number];

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  rank: text("rank").notNull().default("E"),
  job: text("job").notNull().default("Novice Hunter"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(100),
  stats: json("stats")
    .$type<Record<StatType, number>>()
    .notNull()
    .default({ strength: 10, stamina: 10, speed: 10, endurance: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Quest schema
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "daily" or "weekly"
  xpReward: integer("xp_reward").notNull(),
  coinReward: integer("coin_reward").notNull(),
  targetStat: text("target_stat").notNull(), // one of the stat types
  requiredAmount: integer("required_amount").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Quest progress schema
export const userQuests = pgTable("user_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout schema
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  exercises: json("exercises")
    .$type<{ name: string; sets: number; reps: string }[]>()
    .notNull(),
  targetStat: text("target_stat").notNull(),
  targetRank: text("target_rank").notNull(),
  targetJob: text("target_job").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Shop items schema
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull(), // "booster", "cosmetic", "gear"
  effectValue: integer("effect_value").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User purchased items
export const userItems = pgTable("user_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: integer("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  type: text("type").notNull(), // "rankup", "doublexp", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertQuestSchema = createInsertSchema(quests).pick({
  title: true,
  description: true,
  type: true,
  xpReward: true,
  coinReward: true,
  targetStat: true,
  requiredAmount: true,
  expiresAt: true,
});

export const insertUserQuestSchema = createInsertSchema(userQuests).pick({
  userId: true,
  questId: true,
  progress: true,
  completed: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  title: true,
  description: true,
  exercises: true,
  targetStat: true,
  targetRank: true,
  targetJob: true,
});

export const insertShopItemSchema = createInsertSchema(shopItems).pick({
  name: true,
  description: true,
  price: true,
  type: true,
  effectValue: true,
});

export const insertUserItemSchema = createInsertSchema(userItems).pick({
  userId: true,
  itemId: true,
  quantity: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  type: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof quests.$inferSelect;

export type InsertUserQuest = z.infer<typeof insertUserQuestSchema>;
export type UserQuest = typeof userQuests.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertShopItem = z.infer<typeof insertShopItemSchema>;
export type ShopItem = typeof shopItems.$inferSelect;

export type InsertUserItem = z.infer<typeof insertUserItemSchema>;
export type UserItem = typeof userItems.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
