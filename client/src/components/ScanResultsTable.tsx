import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Download } from "lucide-react";
import SeverityBadge from "./SeverityBadge";

interface ScanResult {
  id: string;
  appName: string;
  packageName: string;
  scanDate: string;
  status: "complete" | "running" | "failed" | "pending";
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface ScanResultsTableProps {
  results: ScanResult[];
  onViewReport?: (id: string) => void;
  onDownloadReport?: (id: string) => void;
}

const statusConfig = {
  complete: { label: "Complete", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  running: { label: "Running", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
};

export default function ScanResultsTable({
  results,
  onViewReport,
  onDownloadReport,
}: ScanResultsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">
                  Application
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">
                  Scan Date
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">
                  Vulnerabilities
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr
                  key={result.id}
                  className="border-b hover-elevate"
                  data-testid={`row-scan-${result.id}`}
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-sm" data-testid={`text-app-name-${result.id}`}>
                        {result.appName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {result.packageName}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">{result.scanDate}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={statusConfig[result.status].className}>
                      {statusConfig[result.status].label}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 flex-wrap">
                      {result.vulnerabilities.critical > 0 && (
                        <span className="text-xs font-medium">
                          <span className="text-destructive">{result.vulnerabilities.critical}</span>
                          <span className="text-muted-foreground"> Critical</span>
                        </span>
                      )}
                      {result.vulnerabilities.high > 0 && (
                        <span className="text-xs font-medium">
                          <span className="text-orange-600 dark:text-orange-400">{result.vulnerabilities.high}</span>
                          <span className="text-muted-foreground"> High</span>
                        </span>
                      )}
                      {result.vulnerabilities.medium > 0 && (
                        <span className="text-xs font-medium">
                          <span className="text-yellow-600 dark:text-yellow-400">{result.vulnerabilities.medium}</span>
                          <span className="text-muted-foreground"> Medium</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewReport?.(result.id)}
                        data-testid={`button-view-${result.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadReport?.(result.id)}
                        data-testid={`button-download-${result.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
