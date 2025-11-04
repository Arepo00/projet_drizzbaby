import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VulnerabilityCard from "./VulnerabilityCard";
import SeverityBadge from "./SeverityBadge";

interface ReportData {
  appName: string;
  packageName: string;
  version: string;
  scanDate: string;
  duration: string;
  overallScore: string;
  microservices: {
    id: string;
    name: string;
    findings: Array<{
      title: string;
      severity: "critical" | "high" | "medium" | "low" | "info";
      cwe?: string;
      description: string;
      affectedFiles?: string[];
      fixSuggestion?: string;
      codeSnippet?: string;
    }>;
  }[];
}

interface ReportViewerProps {
  report: ReportData;
  onDownload?: () => void;
  onShare?: () => void;
}

export default function ReportViewer({ report, onDownload, onShare }: ReportViewerProps) {
  const totalFindings = report.microservices.reduce(
    (acc, ms) => acc + ms.findings.length,
    0
  );

  const severityCounts = report.microservices.reduce(
    (acc, ms) => {
      ms.findings.forEach((f) => {
        acc[f.severity] = (acc[f.severity] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap space-y-0 pb-6">
          <div className="space-y-2">
            <CardTitle className="text-2xl" data-testid="text-report-app-name">{report.appName}</CardTitle>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground font-mono">
                {report.packageName} v{report.version}
              </p>
              <p className="text-sm text-muted-foreground">
                Scanned on {report.scanDate} • Duration: {report.duration}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onShare}
              data-testid="button-share-report"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={onDownload} data-testid="button-download-report">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <p className="text-2xl font-bold" data-testid="text-overall-score">{report.overallScore}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Findings</p>
              <p className="text-2xl font-bold">{totalFindings}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Critical</p>
              <p className="text-2xl font-bold text-destructive">
                {severityCounts.critical || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">High</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {severityCounts.high || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={report.microservices[0]?.id} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
          {report.microservices.map((ms) => (
            <TabsTrigger key={ms.id} value={ms.id} data-testid={`tab-${ms.id}`}>
              {ms.name}
              {ms.findings.length > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-xs">
                  {ms.findings.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {report.microservices.map((ms) => (
          <TabsContent key={ms.id} value={ms.id} className="space-y-4 mt-6">
            {ms.findings.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No issues found by {ms.name}
                  </p>
                </CardContent>
              </Card>
            ) : (
              ms.findings.map((finding, index) => (
                <VulnerabilityCard key={index} {...finding} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
