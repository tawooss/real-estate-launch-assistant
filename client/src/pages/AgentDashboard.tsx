import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface AgentDashboardProps {
  result: any;
}

export default function AgentDashboard({ result }: AgentDashboardProps) {
  if (!result) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analysis results to display
      </div>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Property Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Property Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{result.property_summary}</p>
        </CardContent>
      </Card>

      {/* Pricing Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pricing Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Recommended Price</p>
              <p className="text-2xl font-bold text-blue-600">
                {result.pricing_recommendation.recommended_price_egp.toLocaleString()} EGP
              </p>
              <p className="text-xs text-muted-foreground mt-1">/month</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Price Range</p>
              <p className="text-lg font-semibold">
                {result.pricing_recommendation.price_range_min.toLocaleString()} -{" "}
                {result.pricing_recommendation.price_range_max.toLocaleString()} EGP
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Strategy</p>
              <p className="text-lg font-semibold capitalize">
                {result.pricing_recommendation.strategy}
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Confidence:</span>
              <Badge className={getConfidenceColor(result.pricing_recommendation.confidence)}>
                {result.pricing_recommendation.confidence}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {result.pricing_recommendation.reasoning}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Launch Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Launch Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Readiness Score</p>
              <p className="text-3xl font-bold">
                {result.launch_readiness.readiness_score}%
              </p>
            </div>
            <Badge className={getReadinessColor(result.launch_readiness.readiness_score)}>
              {result.launch_readiness.status}
            </Badge>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">
              Estimated Days to Launch: {result.launch_readiness.estimated_days_to_launch}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2 text-green-600">Completed:</p>
              <ul className="space-y-1">
                {result.launch_readiness.checklist_completed.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-yellow-600">Pending:</p>
              <ul className="space-y-1">
                {result.launch_readiness.checklist_pending.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Risk Level:</p>
            <Badge className={getRiskColor(result.risk_assessment.risk_level)}>
              {result.risk_assessment.risk_level.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Key Risks:</p>
              <ul className="space-y-1">
                {result.risk_assessment.key_risks.map((risk: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {risk}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Mitigation Strategies:</p>
              <ul className="space-y-1">
                {result.risk_assessment.mitigation_strategies.map((strategy: string, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retrieved Context */}
      <Card>
        <CardHeader>
          <CardTitle>Retrieved Market Context</CardTitle>
          <CardDescription>
            Documents used to generate recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.retrieved_context.map((doc: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.category}</p>
                </div>
                <Badge variant="outline">
                  {(doc.relevance_score * 100).toFixed(0)}% match
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {doc.content.substring(0, 150)}...
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {result.next_steps.map((step: string, idx: number) => (
              <li key={idx} className="text-sm flex gap-3">
                <span className="font-semibold text-muted-foreground">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
