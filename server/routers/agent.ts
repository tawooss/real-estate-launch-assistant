import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRagService } from "../services/rag";
import {
  createPropertyAnalysis,
  getPropertyAnalysis,
  getUserPropertyAnalyses,
  createConversation,
  addMessage,
  getConversationWithMessages,
  getUserConversations,
} from "../db.crud";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Input schema for property analysis
const PropertyInputSchema = z.object({
  location: z.string().min(1, "Location is required"),
  size_sqm: z.number().int().positive("Size must be positive"),
  bedrooms: z.number().int().nonnegative("Bedrooms must be non-negative"),
  bathrooms: z.number().int().nonnegative("Bathrooms must be non-negative"),
  floor: z.number().int().nonnegative("Floor must be non-negative"),
  has_elevator: z.boolean(),
  has_parking: z.boolean(),
  finishing_quality: z.enum(["basic", "standard", "medium", "premium", "luxury"]),
  near_beach: z.boolean(),
  property_value_egp: z.number().int().positive().optional(),
});

// Response schema
const PricingRecommendationSchema = z.object({
  recommended_price_egp: z.number().int(),
  price_range_min: z.number().int(),
  price_range_max: z.number().int(),
  strategy: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
});

const LaunchReadinessSchema = z.object({
  readiness_score: z.number().int().min(0).max(100),
  status: z.enum(["ready", "needs_work", "not_ready"]),
  checklist_completed: z.array(z.string()),
  checklist_pending: z.array(z.string()),
  estimated_days_to_launch: z.number().int(),
});

const RiskAssessmentSchema = z.object({
  risk_level: z.enum(["low", "medium", "high"]),
  key_risks: z.array(z.string()),
  mitigation_strategies: z.array(z.string()),
});

const AgentResponseSchema = z.object({
  property_summary: z.string(),
  retrieved_context: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      content: z.string(),
      relevance_score: z.number(),
    })
  ),
  pricing_recommendation: PricingRecommendationSchema,
  launch_readiness: LaunchReadinessSchema,
  risk_assessment: RiskAssessmentSchema,
  next_steps: z.array(z.string()),
});

export const agentRouter = router({
  /**
   * Analyze property and generate recommendations
   */
  analyze: protectedProcedure
    .input(PropertyInputSchema)
    .output(AgentResponseSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Get RAG service and retrieve relevant documents
        const ragService = getRagService();
        const query = `Rental pricing for ${input.location}, ${input.size_sqm}sqm, ${input.bedrooms}BR, ${input.finishing_quality} finishing, property value ${input.property_value_egp || "unknown"} EGP`;
        const retrievedDocs = ragService.retrieveRelevantDocs(query, 3);

        // Format context for agent
        const context = retrievedDocs
          .map(
            (doc) =>
              `Document: ${doc.title}\nCategory: ${doc.category}\nContent: ${doc.content}`
          )
          .join("\n\n");

        // Build agent prompt
        const agentPrompt = `You are a Real Estate Rental Pricing Launch Assistant for the Egyptian market.

PROPERTY DETAILS:
- Location: ${input.location}
- Size: ${input.size_sqm} square meters
- Bedrooms: ${input.bedrooms}
- Bathrooms: ${input.bathrooms}
- Floor: ${input.floor}
- Elevator: ${input.has_elevator ? "Yes" : "No"}
- Parking: ${input.has_parking ? "Yes" : "No"}
- Finishing: ${input.finishing_quality}
- Near Beach: ${input.near_beach ? "Yes" : "No"}
${input.property_value_egp ? `- Property Value: ${input.property_value_egp} EGP` : ""}

RETRIEVED KNOWLEDGE BASE:
${context}

Based on the property details and the retrieved market knowledge, provide a comprehensive launch analysis in JSON format with these exact fields:

{
  "recommended_price_egp": <integer monthly rent in EGP>,
  "price_range_min": <integer minimum monthly rent>,
  "price_range_max": <integer maximum monthly rent>,
  "strategy": "<penetration/competitive/premium pricing strategy>",
  "confidence": "<high/medium/low>",
  "reasoning": "<2-3 sentences explaining the price>",
  "readiness_score": <0-100 integer>,
  "status": "<ready/needs_work/not_ready>",
  "checklist_completed": ["item1", "item2"],
  "checklist_pending": ["item1", "item2"],
  "estimated_days_to_launch": <integer>,
  "risk_level": "<low/medium/high>",
  "key_risks": ["risk1", "risk2", "risk3"],
  "mitigation_strategies": ["strategy1", "strategy2"],
  "next_steps": ["step1", "step2", "step3"]
}

Provide ONLY valid JSON, no markdown or extra text.`;

        // Call Gemini API with gemini-2.0-flash-lite
        const model = genai.getGenerativeModel({
          model: process.env.GEMINI_MODEL || "gemini-2.0-flash-lite",
        });

        const response = await model.generateContent(agentPrompt);
        const responseText = response.response.text().trim();

        // Parse JSON response
        let agentData;
        try {
          agentData = JSON.parse(responseText);
        } catch {
          // If response contains markdown code blocks, extract JSON
          const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            agentData = JSON.parse(jsonMatch[1]);
          } else {
            throw new Error("Failed to parse agent response as JSON");
          }
        }

        // Build result
        const result = {
          property_summary: `${input.bedrooms}BR in ${input.location}, ${input.size_sqm}sqm, ${input.finishing_quality}`,
          retrieved_context: retrievedDocs,
          pricing_recommendation: {
            recommended_price_egp: agentData.recommended_price_egp,
            price_range_min: agentData.price_range_min,
            price_range_max: agentData.price_range_max,
            strategy: agentData.strategy,
            confidence: agentData.confidence,
            reasoning: agentData.reasoning,
          },
          launch_readiness: {
            readiness_score: agentData.readiness_score,
            status: agentData.status,
            checklist_completed: agentData.checklist_completed,
            checklist_pending: agentData.checklist_pending,
            estimated_days_to_launch: agentData.estimated_days_to_launch,
          },
          risk_assessment: {
            risk_level: agentData.risk_level,
            key_risks: agentData.key_risks,
            mitigation_strategies: agentData.mitigation_strategies,
          },
          next_steps: agentData.next_steps,
        };

        // Validate response
        const validatedResult = AgentResponseSchema.parse(result);

        // Save to database
        const analysisId = await createPropertyAnalysis({
          userId: ctx.user.id,
          location: input.location,
          size_sqm: input.size_sqm,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          floor: input.floor,
          has_elevator: input.has_elevator,
          has_parking: input.has_parking,
          finishing_quality: input.finishing_quality,
          near_beach: input.near_beach,
          property_value_egp: input.property_value_egp,
          recommended_price_egp: validatedResult.pricing_recommendation.recommended_price_egp,
          price_range_min: validatedResult.pricing_recommendation.price_range_min,
          price_range_max: validatedResult.pricing_recommendation.price_range_max,
          pricing_strategy: validatedResult.pricing_recommendation.strategy,
          confidence: validatedResult.pricing_recommendation.confidence,
          pricing_reasoning: validatedResult.pricing_recommendation.reasoning,
          readiness_score: validatedResult.launch_readiness.readiness_score,
          readiness_status: validatedResult.launch_readiness.status,
          checklist_completed: JSON.stringify(
            validatedResult.launch_readiness.checklist_completed
          ),
          checklist_pending: JSON.stringify(
            validatedResult.launch_readiness.checklist_pending
          ),
          estimated_days_to_launch:
            validatedResult.launch_readiness.estimated_days_to_launch,
          risk_level: validatedResult.risk_assessment.risk_level,
          key_risks: JSON.stringify(validatedResult.risk_assessment.key_risks),
          mitigation_strategies: JSON.stringify(
            validatedResult.risk_assessment.mitigation_strategies
          ),
          next_steps: JSON.stringify(validatedResult.next_steps),
          retrieved_documents: JSON.stringify(retrievedDocs),
        });

        // Create conversation for this analysis
        const conversationId = await createConversation({
          userId: ctx.user.id,
          analysisId,
          title: `Analysis: ${input.location}`,
        });

        // Log the analysis
        await addMessage({
          conversationId,
          role: "user",
          content: JSON.stringify(input),
        });

        await addMessage({
          conversationId,
          role: "agent",
          content: JSON.stringify(validatedResult),
        });

        return validatedResult;
      } catch (error) {
        console.error("Agent analysis failed:", error);
        throw new Error(
          `Agent analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Get past analyses for the user
   */
  getAnalyses: protectedProcedure.query(async ({ ctx }) => {
    const analyses = await getUserPropertyAnalyses(ctx.user.id);
    return analyses.map((analysis) => ({
      ...analysis,
      checklist_completed: JSON.parse(
        analysis.checklist_completed as unknown as string
      ),
      checklist_pending: JSON.parse(
        analysis.checklist_pending as unknown as string
      ),
      key_risks: JSON.parse(analysis.key_risks as unknown as string),
      mitigation_strategies: JSON.parse(
        analysis.mitigation_strategies as unknown as string
      ),
      next_steps: JSON.parse(analysis.next_steps as unknown as string),
      retrieved_documents: JSON.parse(
        analysis.retrieved_documents as unknown as string
      ),
    }));
  }),

  /**
   * Get a specific analysis
   */
  getAnalysis: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const analysis = await getPropertyAnalysis(input.id);
      if (!analysis || analysis.userId !== ctx.user.id) {
        throw new Error("Analysis not found");
      }
      return {
        ...analysis,
        checklist_completed: JSON.parse(
          analysis.checklist_completed as unknown as string
        ),
        checklist_pending: JSON.parse(
          analysis.checklist_pending as unknown as string
        ),
        key_risks: JSON.parse(analysis.key_risks as unknown as string),
        mitigation_strategies: JSON.parse(
          analysis.mitigation_strategies as unknown as string
        ),
        next_steps: JSON.parse(analysis.next_steps as unknown as string),
        retrieved_documents: JSON.parse(
          analysis.retrieved_documents as unknown as string
        ),
      };
    }),

  /**
   * Get conversation with messages
   */
  getConversation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const conversation = await getConversationWithMessages(input.id);
      if (!conversation || conversation.userId !== ctx.user.id) {
        throw new Error("Conversation not found");
      }
      return conversation;
    }),

  /**
   * Get user's conversations
   */
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return await getUserConversations(ctx.user.id);
  }),
});
