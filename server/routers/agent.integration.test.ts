import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

describe("Agent Integration Tests", () => {
  const createMockContext = (): TrpcContext => {
    return {
      user: {
        id: 999,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "test",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };
  };

  it("should successfully analyze a property with Manus LLM", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agent.analyze({
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
    });

    // Verify response structure
    expect(result).toBeDefined();
    expect(result.property_summary).toBeDefined();
    expect(result.retrieved_context).toBeDefined();
    expect(result.pricing_recommendation).toBeDefined();
    expect(result.launch_readiness).toBeDefined();
    expect(result.risk_assessment).toBeDefined();
    expect(result.next_steps).toBeDefined();

    // Verify pricing recommendation
    expect(result.pricing_recommendation.recommended_price_egp).toBeGreaterThan(0);
    expect(result.pricing_recommendation.price_range_min).toBeGreaterThan(0);
    expect(result.pricing_recommendation.price_range_max).toBeGreaterThan(
      result.pricing_recommendation.price_range_min
    );
    expect(["high", "medium", "low"]).toContain(
      result.pricing_recommendation.confidence
    );

    // Verify launch readiness
    expect(result.launch_readiness.readiness_score).toBeGreaterThanOrEqual(0);
    expect(result.launch_readiness.readiness_score).toBeLessThanOrEqual(100);
    expect(["ready", "needs_work", "not_ready"]).toContain(
      result.launch_readiness.status
    );
    expect(Array.isArray(result.launch_readiness.checklist_completed)).toBe(true);
    expect(Array.isArray(result.launch_readiness.checklist_pending)).toBe(true);

    // Verify risk assessment
    expect(["low", "medium", "high"]).toContain(result.risk_assessment.risk_level);
    expect(Array.isArray(result.risk_assessment.key_risks)).toBe(true);
    expect(Array.isArray(result.risk_assessment.mitigation_strategies)).toBe(true);

    // Verify next steps
    expect(Array.isArray(result.next_steps)).toBe(true);
    expect(result.next_steps.length).toBeGreaterThan(0);

    // Verify retrieved context
    expect(Array.isArray(result.retrieved_context)).toBe(true);
    expect(result.retrieved_context.length).toBeGreaterThan(0);
  }, 60000); // 60 second timeout for LLM call

  it("should handle different property types", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.agent.analyze({
      location: "New Cairo",
      size_sqm: 250,
      bedrooms: 3,
      bathrooms: 2,
      floor: 5,
      has_elevator: true,
      has_parking: true,
      finishing_quality: "premium",
      near_beach: false,
      property_value_egp: 3000000,
    });

    expect(result).toBeDefined();
    expect(result.pricing_recommendation.recommended_price_egp).toBeGreaterThan(0);
    expect(result.launch_readiness.readiness_score).toBeGreaterThanOrEqual(0);
  }, 60000);

  it("should retrieve past analyses", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const analyses = await caller.agent.getAnalyses();
    expect(Array.isArray(analyses)).toBe(true);
  });
});
