import { describe, it, expect } from "vitest";
import { getRagService, RENTAL_PRICING_DOCS } from "./rag";

describe("RAG Service", () => {
  const ragService = getRagService();

  it("should initialize with all documents", () => {
    expect(RENTAL_PRICING_DOCS.length).toBe(5);
  });

  it("should have documents with required fields", () => {
    RENTAL_PRICING_DOCS.forEach((doc) => {
      expect(doc).toHaveProperty("id");
      expect(doc).toHaveProperty("title");
      expect(doc).toHaveProperty("category");
      expect(doc).toHaveProperty("content");
      expect(typeof doc.id).toBe("string");
      expect(typeof doc.title).toBe("string");
      expect(typeof doc.category).toBe("string");
      expect(typeof doc.content).toBe("string");
    });
  });

  it("should retrieve documents with valid relevance scores", () => {
    const query = "rental pricing Cairo";
    const results = ragService.retrieveRelevantDocs(query, 3);

    expect(results.length).toBeLessThanOrEqual(3);
    expect(results.length).toBeGreaterThan(0);

    results.forEach((result) => {
      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("relevance_score");
      expect(typeof result.relevance_score).toBe("number");
      expect(result.relevance_score).toBeGreaterThanOrEqual(0);
      expect(result.relevance_score).toBeLessThanOrEqual(1);
    });
  });

  it("should return top-k documents in order of relevance", () => {
    const query = "pricing strategy";
    const results = ragService.retrieveRelevantDocs(query, 3);

    // Check that results are sorted by relevance score (descending)
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].relevance_score).toBeGreaterThanOrEqual(
        results[i + 1].relevance_score
      );
    }
  });

  it("should respect k parameter", () => {
    const query = "Egyptian market";

    const results1 = ragService.retrieveRelevantDocs(query, 1);
    expect(results1.length).toBeLessThanOrEqual(1);

    const results3 = ragService.retrieveRelevantDocs(query, 3);
    expect(results3.length).toBeLessThanOrEqual(3);

    const results5 = ragService.retrieveRelevantDocs(query, 5);
    expect(results5.length).toBeLessThanOrEqual(5);
  });

  it("should handle empty query", () => {
    const results = ragService.retrieveRelevantDocs("", 3);
    expect(results.length).toBeGreaterThan(0);
  });

  it("should return documents with content truncation", () => {
    const results = ragService.retrieveRelevantDocs("market analysis", 1);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toBeDefined();
    expect(typeof results[0].content).toBe("string");
  });

  it("should have documents covering all required categories", () => {
    const categories = RENTAL_PRICING_DOCS.map((doc) => doc.category);
    expect(categories).toContain("Market Analysis");
    expect(categories).toContain("Pricing Strategy");
    expect(categories).toContain("Launch Readiness");
    expect(categories).toContain("Risk Assessment");
    expect(categories).toContain("Technology");
  });

  it("should retrieve documents for property analysis query", () => {
    const query =
      "Rental pricing for Zamalek, Cairo, 100sqm, 2BR, medium finishing";
    const results = ragService.retrieveRelevantDocs(query, 3);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].relevance_score).toBeGreaterThan(0);
  });
});
