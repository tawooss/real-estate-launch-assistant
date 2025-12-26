import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Property Analysis table
export const propertyAnalyses = mysqlTable("propertyAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  size_sqm: int("size_sqm").notNull(),
  bedrooms: int("bedrooms").notNull(),
  bathrooms: int("bathrooms").notNull(),
  floor: int("floor").notNull(),
  has_elevator: boolean("has_elevator").notNull(),
  has_parking: boolean("has_parking").notNull(),
  finishing_quality: varchar("finishing_quality", { length: 50 }).notNull(),
  near_beach: boolean("near_beach").notNull(),
  property_value_egp: int("property_value_egp"),
  // Agent response fields
  recommended_price_egp: int("recommended_price_egp"),
  price_range_min: int("price_range_min"),
  price_range_max: int("price_range_max"),
  pricing_strategy: varchar("pricing_strategy", { length: 100 }),
  confidence: varchar("confidence", { length: 50 }),
  pricing_reasoning: text("pricing_reasoning"),
  readiness_score: int("readiness_score"),
  readiness_status: varchar("readiness_status", { length: 50 }),
  checklist_completed: json("checklist_completed"),
  checklist_pending: json("checklist_pending"),
  estimated_days_to_launch: int("estimated_days_to_launch"),
  risk_level: varchar("risk_level", { length: 50 }),
  key_risks: json("key_risks"),
  mitigation_strategies: json("mitigation_strategies"),
  next_steps: json("next_steps"),
  retrieved_documents: json("retrieved_documents"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyAnalysis = typeof propertyAnalyses.$inferSelect;
export type InsertPropertyAnalysis = typeof propertyAnalyses.$inferInsert;

// Conversation table for chat history
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  analysisId: int("analysisId"),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Message table for storing individual messages
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: varchar("role", { length: 50 }).notNull(), // 'user' or 'agent'
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
