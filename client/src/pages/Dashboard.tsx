import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import ScanResultsTable from "@/components/ScanResultsTable";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const [, setLocation] = useState<string>("");

  // todo: remove mock functionality
  const mockResults = [
    {
      id: '1',
      appName: 'MyBankingApp',
      packageName: 'com.example.banking',
      scanDate: '2 hours ago',
      status: 'complete' as const,
      vulnerabilities: { critical: 2, high: 5, medium: 8, low: 12 },
    },
    {
      id: '2',
      appName: 'ShoppingCart Pro',
      packageName: 'com.shop.cart',
      scanDate: '5 hours ago',
      status: 'complete' as const,
      vulnerabilities: { critical: 0, high: 3, medium: 4, low: 7 },
    },
    {
      id: '3',
      appName: 'SocialConnect',
      packageName: 'com.social.connect',
      scanDate: 'Yesterday',
      status: 'complete' as const,
      vulnerabilities: { critical: 1, high: 2, medium: 6, low: 9 },
    },
    {
      id: '4',
      appName: 'FitnessTracker',
      packageName: 'com.fitness.tracker',
      scanDate: '2 days ago',
      status: 'failed' as const,
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    },
  ];

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

        <DashboardStats
          totalScans={127}
          criticalIssues={8}
          lastScanDate="2 hours ago"
          successRate="94%"
        />

        <ScanResultsTable
          results={mockResults}
          onViewReport={(id) => {
            console.log('View report:', id);
            window.location.href = `/report/${id}`;
          }}
          onDownloadReport={(id) => console.log('Download report:', id)}
        />
      </main>
    </div>
  );
}
