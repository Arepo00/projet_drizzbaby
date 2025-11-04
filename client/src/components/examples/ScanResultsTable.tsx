import ScanResultsTable from '../ScanResultsTable';

export default function ScanResultsTableExample() {
  const mockResults = [
    {
      id: '1',
      appName: 'MyBankingApp',
      packageName: 'com.example.banking',
      scanDate: '2024-01-15 14:30',
      status: 'complete' as const,
      vulnerabilities: { critical: 2, high: 5, medium: 8, low: 12 },
    },
    {
      id: '2',
      appName: 'ShoppingCart Pro',
      packageName: 'com.shop.cart',
      scanDate: '2024-01-15 10:15',
      status: 'complete' as const,
      vulnerabilities: { critical: 0, high: 3, medium: 4, low: 7 },
    },
    {
      id: '3',
      appName: 'SocialConnect',
      packageName: 'com.social.connect',
      scanDate: '2024-01-14 16:45',
      status: 'running' as const,
      vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    },
  ];

  return (
    <ScanResultsTable
      results={mockResults}
      onViewReport={(id) => console.log('View report:', id)}
      onDownloadReport={(id) => console.log('Download report:', id)}
    />
  );
}
