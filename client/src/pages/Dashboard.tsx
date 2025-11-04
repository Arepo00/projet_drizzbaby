import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/DashboardStats";
import ScanResultsTable from "@/components/ScanResultsTable";
import ThemeToggle from "@/components/ThemeToggle";
import type { Scan, Finding } from "@shared/schema";

interface ScanWithFindings extends Scan {
  findings?: Finding[];
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function Dashboard() {
  const { data: scans = [], isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  // Calculate stats from real data
  const totalScans = scans.length;
  const completedScans = scans.filter((s) => s.status === "complete");
  const successRate = totalScans > 0
    ? `${Math.round((completedScans.length / totalScans) * 100)}%`
    : "N/A";
  
  const lastScan = scans.length > 0 ? formatTimeAgo(scans[0].scanDate) : "N/A";

  // Format scans for table
  const tableResults = scans.map((scan) => ({
    id: scan.id,
    appName: scan.appName,
    packageName: scan.packageName,
    scanDate: formatTimeAgo(scan.scanDate),
    status: scan.status as "pending" | "running" | "complete" | "failed",
    vulnerabilities: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  }));

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
              <Link href="/scan">
                <Button data-testid="button-new-scan">
                  <Plus className="h-4 w-4 mr-2" />
                  New Scan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your mobile application security scans
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading scans...
          </div>
        ) : (
          <>
            <DashboardStats
              totalScans={totalScans}
              criticalIssues={0}
              lastScanDate={lastScan}
              successRate={successRate}
            />

            <ScanResultsTable
              results={tableResults}
              onViewReport={(id) => {
                window.location.href = `/report/${id}`;
              }}
              onDownloadReport={(id) => console.log("Download report:", id)}
            />
          </>
        )}
      </main>
    </div>
  );
}
