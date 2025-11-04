import ScanProgress from '../ScanProgress';

export default function ScanProgressExample() {
  const steps = [
    { id: 'apk-scanner', name: 'APKScanner', status: 'complete' as const },
    { id: 'secret-hunter', name: 'SecretHunter', status: 'complete' as const },
    { id: 'crypto-check', name: 'CryptoCheck', status: 'running' as const },
    { id: 'network-inspector', name: 'NetworkInspector', status: 'pending' as const },
    { id: 'report-gen', name: 'ReportGen', status: 'pending' as const },
  ];

  return (
    <ScanProgress
      steps={steps}
      currentStep="crypto-check"
      progress={45}
    />
  );
}
