import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle, FileCheck } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  testId: string;
}

function StatCard({ title, value, icon, trend, testId }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={testId}>{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalScans: number;
  criticalIssues: number;
  lastScanDate?: string;
  successRate: string;
}

export default function DashboardStats({
  totalScans,
  criticalIssues,
  lastScanDate,
  successRate,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Scans"
        value={totalScans}
        icon={<Activity className="h-4 w-4" />}
        trend="+12% from last month"
        testId="stat-total-scans"
      />
      <StatCard
        title="Critical Issues"
        value={criticalIssues}
        icon={<AlertTriangle className="h-4 w-4" />}
        trend="Requires immediate attention"
        testId="stat-critical-issues"
      />
      <StatCard
        title="Last Scan"
        value={lastScanDate || "N/A"}
        icon={<FileCheck className="h-4 w-4" />}
        testId="stat-last-scan"
      />
      <StatCard
        title="Success Rate"
        value={successRate}
        icon={<CheckCircle className="h-4 w-4" />}
        trend="Scans completed successfully"
        testId="stat-success-rate"
      />
    </div>
  );
}
