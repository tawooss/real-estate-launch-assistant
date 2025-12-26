import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createPropertyAnalysis,
  getPropertyAnalysis,
  getUserPropertyAnalyses,
  updatePropertyAnalysis,
  createConversation,
  getConversation,
  getUserConversations,
  addMessage,
  getConversationMessages,
} from "./db.crud";

describe("Database CRUD Operations", () => {
  let analysisId: number;
  let conversationId: number;
  const testUserId = 1;

  describe("Property Analysis CRUD", () => {
    it("should create a property analysis", async () => {
      const result = await createPropertyAnalysis({
        userId: testUserId,
        location: "Zamalek, Cairo",
        size_sqm: 100,
        bedrooms: 2,
        bathrooms: 1,
        floor: 3,
        has_elevator: true,
        has_parking: true,
        finishing_quality: "medium",
        near_beach: false,
        property_value_egp: 1500000,
        recommended_price_egp: 7500,
        price_range_min: 6500,
        price_range_max: 8500,
        pricing_strategy: "competitive",
        confidence: "high",
        pricing_reasoning: "Based on market analysis",
        readiness_score: 75,
        readiness_status: "ready",
        checklist_completed: JSON.stringify(["Photography", "Legal docs"]),
        checklist_pending: JSON.stringify(["Marketing", "Setup"]),
        estimated_days_to_launch: 14,
        risk_level: "medium",
        key_risks: JSON.stringify(["Overpricing", "Market volatility"]),
        mitigation_strategies: JSON.stringify(["Monitor market", "Adjust pricing"]),
        next_steps: JSON.stringify(["Step 1", "Step 2"]),
        retrieved_documents: JSON.stringify([]),
      });

      expect(result).toBeGreaterThan(0);
      analysisId = result;
    });

    it("should retrieve a property analysis", async () => {
      const analysis = await getPropertyAnalysis(analysisId);
      expect(analysis).toBeDefined();
      expect(analysis?.location).toBe("Zamalek, Cairo");
      expect(analysis?.size_sqm).toBe(100);
      expect(analysis?.bedrooms).toBe(2);
      expect(analysis?.recommended_price_egp).toBe(7500);
    });

    it("should get user property analyses", async () => {
      const analyses = await getUserPropertyAnalyses(testUserId);
      expect(Array.isArray(analyses)).toBe(true);
      expect(analyses.length).toBeGreaterThan(0);
      expect(analyses[0].userId).toBe(testUserId);
    });

    it("should update a property analysis", async () => {
      await updatePropertyAnalysis(analysisId, {
        recommended_price_egp: 8000,
        readiness_score: 80,
      });

      const updated = await getPropertyAnalysis(analysisId);
      expect(updated?.recommended_price_egp).toBe(8000);
      expect(updated?.readiness_score).toBe(80);
    });
  });

  describe("Conversation CRUD", () => {
    it("should create a conversation", async () => {
      const result = await createConversation({
        userId: testUserId,
        analysisId,
        title: "Analysis: Zamalek, Cairo",
      });

      expect(result).toBeGreaterThan(0);
      conversationId = result;
    });

    it("should retrieve a conversation", async () => {
      const conversation = await getConversation(conversationId);
      expect(conversation).toBeDefined();
      expect(conversation?.userId).toBe(testUserId);
      expect(conversation?.title).toBe("Analysis: Zamalek, Cairo");
    });

    it("should get user conversations", async () => {
      const conversations = await getUserConversations(testUserId);
      expect(Array.isArray(conversations)).toBe(true);
      expect(conversations.length).toBeGreaterThan(0);
      expect(conversations[0].userId).toBe(testUserId);
    });
  });

  describe("Message CRUD", () => {
    let messageId: number;

    it("should add a message to conversation", async () => {
      const result = await addMessage({
        conversationId,
        role: "user",
        content: '{"location": "Zamalek, Cairo"}',
      });

      expect(result).toBeGreaterThan(0);
      messageId = result;
    });

    it("should get conversation messages", async () => {
      const messages = await getConversationMessages(conversationId);
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].role).toBe("user");
    });

    it("should add agent message", async () => {
      const result = await addMessage({
        conversationId,
        role: "agent",
        content: '{"recommended_price": 7500}',
      });

      expect(result).toBeGreaterThan(0);
    });

    it("should retrieve messages in order", async () => {
      const messages = await getConversationMessages(conversationId);
      expect(messages.length).toBeGreaterThanOrEqual(2);

      // Messages should be ordered by creation time
      for (let i = 0; i < messages.length - 1; i++) {
        expect(
          new Date(messages[i].createdAt).getTime() <=
            new Date(messages[i + 1].createdAt).getTime()
        ).toBe(true);
      }
    });
  });

  describe("Data Integrity", () => {
    it("should handle JSON serialization in database", async () => {
      const analysis = await getPropertyAnalysis(analysisId);
      expect(analysis?.checklist_completed).toBeDefined();
      expect(typeof analysis?.checklist_completed).toBe("string");

      // Verify it can be parsed back
      const parsed = JSON.parse(analysis?.checklist_completed as string);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it("should preserve timestamps", async () => {
      const analysis = await getPropertyAnalysis(analysisId);
      expect(analysis?.createdAt).toBeDefined();
      expect(analysis?.updatedAt).toBeDefined();
      expect(analysis?.createdAt instanceof Date).toBe(true);
    });
  });
});
