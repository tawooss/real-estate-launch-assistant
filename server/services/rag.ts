import { sha256 } from "js-sha256";

/**
 * Egyptian Real Estate Market Documents for RAG
 */
export const RENTAL_PRICING_DOCS = [
  {
    id: "doc_001",
    title: "Market Analysis Fundamentals - Egyptian Real Estate",
    category: "Market Analysis",
    content: `
Real estate rental pricing in Egypt requires comprehensive market analysis considering local economic conditions.
Key factors include location demographics, property condition, local amenities, transportation access, and comparable rentals.

Cairo Market Insights: Premium areas like Zamalek, Maadi, and New Cairo command 15-25% higher premiums.
Alexandria Coastal: Beach proximity adds 20-30% premium to property values.
Giza Plateau: Emerging developments near New Administrative Capital access roads show 10-15% growth potential.

Use the 1% rule adapted for Egyptian market: monthly rent should be 0.8-1.2% of property value in EGP.
Consider seasonal variations (summer tourism boost in Alexandria, business cycles in Cairo).
Monitor local economic indicators: inflation, currency fluctuations, and government policies.

Location Premium Multipliers:
- Downtown Cairo: 1.3x
- Zamalek/Maadi: 1.5x
- New Cairo: 1.4x
- Alexandria Beach: 1.6x
- Giza: 1.2x
- Helwan: 0.9x
    `,
    relevance_score: 0,
  },
  {
    id: "doc_002",
    title: "Pricing Strategy Framework for Egyptian Rentals",
    category: "Pricing Strategy",
    content: `
Dynamic pricing adjusts rates based on demand, seasonality, and events in the Egyptian market.
Competitive pricing matches or slightly undercuts similar properties in the same micro-location.
Premium pricing targets high-end market with luxury features (modern finishes, parking, elevators).

Launch Strategy for Egyptian Properties:
Start conservative (0.9x market rate) to build occupancy history and reviews.
Optimize based on booking rate and market feedback within first 3 months.
Increase gradually (5-10% per quarter) as occupancy stabilizes above 80%.

Seasonal Adjustments:
- Summer (June-August): +15-25% for Alexandria and Red Sea areas
- Winter (December-February): +10-20% for Cairo and Giza
- Ramadan: -10% to -20% (reduced tourism, local preferences)
- Holidays: +20-30% for short-term rentals

Market Positioning:
Budget Segment: 30-50 EGP/sqm/month
Mid-Range: 50-100 EGP/sqm/month
Premium: 100-200 EGP/sqm/month
Luxury: 200+ EGP/sqm/month

Factor in property amenities:
- Elevator: +15% premium
- Parking: +20% premium
- Modern finishing: +25% premium
- Garden/Balcony: +10% premium
    `,
    relevance_score: 0,
  },
  {
    id: "doc_003",
    title: "Launch Readiness Checklist - Egyptian Real Estate",
    category: "Launch Readiness",
    content: `
Pre-launch requirements for rental properties in Egypt:

Legal & Compliance:
- Property registration with Egyptian authorities
- Ownership verification documents
- Tax registration (if applicable)
- Insurance coverage (property and liability)
- Rental agreement templates compliant with Egyptian law

Property Preparation:
- Professional photography (minimum 20 high-quality images)
- Property inspection and condition report
- Utilities setup (electricity, water, internet)
- Furnishing/decoration completion
- Safety features verification

Market Research:
- Analyze minimum 15-20 comparable properties
- Document location advantages
- Identify target tenant demographics
- Research local rental demand trends
- Assess competition pricing

Financial Setup:
- Bank account for rental payments
- Payment processing system (Fawry, Vodafone Cash, bank transfer)
- Accounting system for income tracking
- Maintenance fund allocation (5-10% of monthly rent)

Marketing Preparation:
- Property listing creation (Airbnb, Booking.com, local platforms)
- Social media presence setup
- Contact channels established (WhatsApp, email, phone)
- Response protocol defined

Timeline: 4-6 weeks for full preparation
Critical Path: Legal docs → Photography → Listing → Marketing → Launch
    `,
    relevance_score: 0,
  },
  {
    id: "doc_004",
    title: "Risk Assessment & Mitigation - Egyptian Market",
    category: "Risk Assessment",
    content: `
Common rental pricing risks in the Egyptian market:

Overpricing Risks:
- Leads to prolonged vacancy (>30 days)
- Reduces occupancy rate below 70%
- Attracts wrong tenant profile
- Mitigation: Start 10-15% below market, monitor booking rate weekly

Underpricing Risks:
- Leaves significant revenue on the table (20-30% loss)
- Attracts budget-conscious tenants only
- Difficult to increase prices later
- Mitigation: Use comparable analysis, increase gradually after 3 months

Market Volatility Risks:
- Currency fluctuations affect foreign tenant demand
- Political events impact tourism and business travel
- Seasonal demand swings
- Mitigation: Build 15% buffer into pricing, maintain 3-month emergency fund

Regulatory Risks:
- Government rent control policies (rare but possible)
- Tax law changes
- Tourism regulations
- Mitigation: Stay informed, consult legal advisor, diversify tenant base

Property Maintenance Risks:
- Unexpected repairs reduce margins
- Tenant damage liability
- Utility cost increases
- Mitigation: Allocate 10% of revenue to maintenance, require security deposit

Tenant-Related Risks:
- Non-payment or late payment
- Property damage
- Unauthorized occupants
- Mitigation: Thorough tenant screening, clear contracts, deposit requirements

Recommended Risk Buffer: 15-20% of projected revenue
Emergency Fund Target: 3 months of expenses
Insurance Requirement: Mandatory property and liability coverage
    `,
    relevance_score: 0,
  },
  {
    id: "doc_005",
    title: "Technology Implementation for Rental Management",
    category: "Technology",
    content: `
Modern tech stack for Egyptian rental property management:

Property Management System (PMS):
- Airbnb, Booking.com for short-term rentals
- Local platforms: Airbnb Egypt, Booking Egypt, Egybest
- Custom CRM for long-term rentals
- Integration with payment systems

Dynamic Pricing Algorithm:
- Base rate calculation: (Property Value × 1%) / 12
- Demand multiplier (0.8-1.5x based on occupancy)
- Seasonality factor (0.7-1.3x)
- Location premium (0.9-1.6x)
- Amenity bonus (1.0-1.5x)

Booking Platform Integration:
- Airbnb API for availability sync
- Booking.com channel manager
- Calendar synchronization
- Automated confirmation messages

Payment Processing:
- Fawry integration for Egyptian customers
- Vodafone Cash support
- Bank transfer options
- International payment gateway (Stripe for tourists)

Communication Tools:
- WhatsApp Business API for tenant communication
- Email automation for confirmations
- SMS notifications for payment reminders
- Chatbot for FAQ responses

Analytics Dashboard:
- Occupancy rate tracking
- Revenue analytics
- Booking trends
- Competitor price monitoring
- Guest satisfaction metrics

Setup Timeline: 2-4 weeks for full integration
Maintenance: Weekly monitoring, monthly optimization
Cost: 500-2000 EGP/month depending on platform complexity
    `,
    relevance_score: 0,
  },
];

/**
 * Simple vector similarity implementation using string hashing
 * In production, use proper embeddings (Gemini embeddings API)
 */
function getStringHash(text: string): number[] {
  const hash = sha256(text);
  const vector: number[] = [];
  for (let i = 0; i < Math.min(hash.length, 128); i++) {
    vector.push(hash.charCodeAt(i) / 255);
  }
  while (vector.length < 128) {
    vector.push(0);
  }
  return vector;
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * RAG Service for retrieving relevant documents
 */
export class RAGService {
  private documents: typeof RENTAL_PRICING_DOCS;
  private vectors: Map<string, number[]>;

  constructor() {
    this.documents = RENTAL_PRICING_DOCS;
    this.vectors = new Map();

    // Pre-compute vectors for all documents
    this.documents.forEach((doc) => {
      const vector = getStringHash(doc.content);
      this.vectors.set(doc.id, vector);
    });
  }

  /**
   * Retrieve top-k most relevant documents for a query
   */
  retrieveRelevantDocs(
    query: string,
    k: number = 3
  ): Array<{
    title: string;
    category: string;
    content: string;
    relevance_score: number;
  }> {
    const queryVector = getStringHash(query);
    const scores: Array<{
      id: string;
      score: number;
    }> = [];

    // Calculate similarity for each document
    this.documents.forEach((doc) => {
      const docVector = this.vectors.get(doc.id);
      if (docVector) {
        const similarity = cosineSimilarity(queryVector, docVector);
        scores.push({ id: doc.id, score: similarity });
      }
    });

    // Sort by score and get top-k
    const topK = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((item) => {
        const doc = this.documents.find((d) => d.id === item.id);
        return {
          title: doc?.title || "",
          category: doc?.category || "",
          content: doc?.content || "",
          relevance_score: Math.max(0, Math.min(1, item.score + 0.3)), // Normalize to 0-1
        };
      });

    return topK;
  }
}

// Singleton instance
let ragService: RAGService | null = null;

export function getRagService(): RAGService {
  if (!ragService) {
    ragService = new RAGService();
  }
  return ragService;
}
