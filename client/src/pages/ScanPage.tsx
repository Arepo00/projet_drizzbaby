import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, PlayCircle } from "lucide-react";
import ScanUpload from "@/components/ScanUpload";
import ScanProgress from "@/components/ScanProgress";
import ThemeToggle from "@/components/ThemeToggle";

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // todo: remove mock functionality
  const mockSteps = [
    { id: 'apk-scanner', name: 'APKScanner', status: isScanning ? ('complete' as const) : ('pending' as const) },
    { id: 'secret-hunter', name: 'SecretHunter', status: isScanning ? ('running' as const) : ('pending' as const) },
    { id: 'crypto-check', name: 'CryptoCheck', status: 'pending' as const },
    { id: 'network-inspector', name: 'NetworkInspector', status: 'pending' as const },
    { id: 'report-gen', name: 'ReportGen', status: 'pending' as const },
  ];

  const handleStartScan = () => {
    console.log('Starting scan for file:', selectedFile?.name);
    setIsScanning(true);
    // todo: remove mock functionality - simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          window.location.href = '/report/1';
        }, 1000);
      }
    }, 500);
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">New Security Scan</h2>
          <p className="text-muted-foreground">
            Upload an APK file to analyze for OWASP MAS vulnerabilities
          </p>
        </div>

        {!isScanning ? (
          <div className="space-y-6">
            <ScanUpload onFileSelect={setSelectedFile} />

            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle>Scan Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Enabled Microservices</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>APKScanner</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>SecretHunter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>CryptoCheck</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span>NetworkInspector</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartScan}
                    className="w-full"
                    size="lg"
                    data-testid="button-start-scan"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Start Security Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <ScanProgress steps={mockSteps} progress={scanProgress} />
        )}
      </main>
    </div>
  );
}
