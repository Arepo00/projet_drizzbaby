import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import ReportViewer from "@/components/ReportViewer";
import ThemeToggle from "@/components/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface ReportData {
  id: string;
  appName: string;
  packageName: string;
  version: string;
  scanDate: Date;
  duration: string | null;
  overallScore: string | null;
  microservices: Array<{
    id: string;
    name: string;
    findings: Array<{
      title: string;
      severity: "critical" | "high" | "medium" | "low" | "info";
      cwe?: string | null;
      description: string;
      affectedFiles?: string[] | null;
      fixSuggestion?: string | null;
      codeSnippet?: string | null;
    }>;
  }>;
}

export default function ReportPage() {
  const [, params] = useRoute("/report/:id");
  const scanId = params?.id;

  const { data: reportData, isLoading, error } = useQuery<ReportData>({
    queryKey: ["/api/scans", scanId, "report"],
    queryFn: async () => {
      const res = await fetch(`/api/scans/${scanId}/report`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return res.json();
    },
    enabled: !!scanId,
  });

  if (!scanId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Invalid scan ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">MobileSec-MS</h1>
                  <p className="text-xs text-muted-foreground">
                    Mobile Application Security Analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/">
                  <Button variant="ghost" data-testid="button-back-dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading report...</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">MobileSec-MS</h1>
                  <p className="text-xs text-muted-foreground">
                    Mobile Application Security Analysis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/">
                  <Button variant="ghost" data-testid="button-back-dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Error Loading Report
              </h3>
              <p className="text-muted-foreground">
                {error instanceof Error ? error.message : "Scan not found or failed to load"}
              </p>
              <Link href="/">
                <Button className="mt-4" data-testid="button-back-home">
                  Return to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  const formattedReport = {
    appName: reportData.appName,
    packageName: reportData.packageName,
    version: reportData.version,
    scanDate: format(new Date(reportData.scanDate), "MMM dd, yyyy h:mm a"),
    duration: reportData.duration || "N/A",
    overallScore: reportData.overallScore || "N/A",
    microservices: reportData.microservices.map((ms) => ({
      id: ms.id,
      name: ms.name,
      findings: ms.findings.map((f) => ({
        title: f.title,
        severity: f.severity,
        cwe: f.cwe || undefined,
        description: f.description,
        affectedFiles: f.affectedFiles || undefined,
        fixSuggestion: f.fixSuggestion || undefined,
        codeSnippet: f.codeSnippet || undefined,
      })),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">MobileSec-MS</h1>
                <p className="text-xs text-muted-foreground">
                  Mobile Application Security Analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/">
                <Button variant="ghost" data-testid="button-back-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ReportViewer
          report={formattedReport}
          onDownload={() => console.log('Download PDF')}
          onShare={() => console.log('Share report')}
        />
      </main>
    </div>
  );
}
