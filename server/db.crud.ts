import { eq, desc } from "drizzle-orm";
import {
  propertyAnalyses,
  conversations,
  messages,
  type InsertPropertyAnalysis,
  type InsertConversation,
  type InsertMessage,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Property Analysis CRUD Operations
 */
export async function createPropertyAnalysis(
  data: InsertPropertyAnalysis
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(propertyAnalyses).values(data);
  return result[0].insertId;
}

export async function getPropertyAnalysis(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(propertyAnalyses)
    .where(eq(propertyAnalyses.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserPropertyAnalyses(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(propertyAnalyses)
    .where(eq(propertyAnalyses.userId, userId))
    .orderBy(desc(propertyAnalyses.createdAt));
}

export async function updatePropertyAnalysis(
  id: number,
  data: Partial<InsertPropertyAnalysis>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(propertyAnalyses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(propertyAnalyses.id, id));
}

/**
 * Conversation CRUD Operations
 */
export async function createConversation(
  data: InsertConversation
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(conversations).values(data);
  return result[0].insertId;
}

export async function getConversation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);

  return result[0] || null;
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt));
}

/**
 * Message CRUD Operations
 */
export async function addMessage(
  data: InsertMessage
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data);
  return result[0].insertId;
}

export async function getConversationMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function getConversationWithMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conv = await getConversation(conversationId);
  if (!conv) return null;

  const msgs = await getConversationMessages(conversationId);

  return {
    ...conv,
    messages: msgs,
  };
}
