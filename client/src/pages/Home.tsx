import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import PropertyForm from "./PropertyForm";
import AgentDashboard from "./AgentDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("analyze");

  const { data: analyses } = trpc.agent.getAnalyses.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Real Estate Launch Assistant</CardTitle>
            <CardDescription>
              AI-powered pricing and launch readiness analysis for Egyptian rental properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get instant recommendations on property pricing, launch readiness, and risk assessment using advanced AI analysis.
            </p>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full"
              size="lg"
            >
              Sign In to Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Real Estate Launch Assistant</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.name}! Analyze properties and get AI-powered recommendations.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze">New Analysis</TabsTrigger>
            <TabsTrigger value="history">
              History ({analyses?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PropertyForm onAnalysisComplete={setAnalysisResult} />
              </div>
              <div className="lg:col-span-2">
                {analysisResult ? (
                  <AgentDashboard result={analysisResult} />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg mb-2">No analysis yet</p>
                        <p className="text-sm">
                          Fill in the property details on the left and click "Analyze Property" to get started.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {analyses && analyses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyses.map((analysis: any) => (
                  <Card
                    key={analysis.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setAnalysisResult(analysis);
                      setActiveTab("analyze");
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{analysis.location}</CardTitle>
                      <CardDescription>
                        {analysis.bedrooms}BR • {analysis.size_sqm}sqm
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Recommended Price</p>
                        <p className="text-xl font-semibold">
                          {analysis.recommended_price_egp?.toLocaleString()} EGP
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Readiness Score</p>
                        <p className="text-xl font-semibold">
                          {analysis.readiness_score}%
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">No analyses yet</p>
                    <p className="text-sm">
                      Create your first property analysis to see it here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
