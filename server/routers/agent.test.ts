import { describe, it, expect } from "vitest";
import { GoogleGenerativeAI } from "@google/generative-ai";

describe("Gemini API Authentication", () => {
  it("should authenticate with valid API key", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it("should initialize GoogleGenerativeAI client", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    const genai = new GoogleGenerativeAI(apiKey);
    expect(genai).toBeDefined();
  });

  it("should be able to get model instance", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    expect(model).toBeDefined();
  });

  it("should successfully call Gemini API with test prompt", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    const genai = new GoogleGenerativeAI(apiKey);
    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash-lite",
    });

    const response = await model.generateContent(
      "Reply with only the word 'success' if you receive this message."
    );

    expect(response).toBeDefined();
    expect(response.response).toBeDefined();
    const text = response.response.text();
    expect(text).toBeDefined();
    expect(text.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for API call
});
