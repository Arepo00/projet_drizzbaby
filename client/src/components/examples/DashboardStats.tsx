import DashboardStats from '../DashboardStats';

export default function DashboardStatsExample() {
  return (
    <DashboardStats
      totalScans={127}
      criticalIssues={8}
      lastScanDate="2 hours ago"
      successRate="94%"
    />
  );
}
