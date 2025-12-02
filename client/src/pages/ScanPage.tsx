import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, PlayCircle } from "lucide-react";
import ScanUpload from "@/components/ScanUpload";
import ScanProgress from "@/components/ScanProgress";
import ThemeToggle from "@/components/ThemeToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Scan } from "@shared/schema";
import { microservices } from "@shared/microservices";

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("apk", file);
      
      const res = await fetch("/api/scans/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Upload failed");
      }

      return await res.json();
    },
    onSuccess: (data: { scanId: string }) => {
      setScanId(data.scanId);
      startScanMutation.mutate(data.scanId);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startScanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/scans/${id}/start`);
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Scan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: scanData } = useQuery<Scan>({
    queryKey: ["/api/scans", scanId],
    queryFn: async () => {
      const res = await fetch(`/api/scans/${scanId}`);
      if (!res.ok) throw new Error("Failed to fetch scan");
      return res.json();
    },
    enabled: !!scanId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return data.status === "running" ? 2000 : false;
    },
  });

  useEffect(() => {
    if (scanData?.status === "complete") {
      setLocation(`/report/${scanId}`);
    }
  }, [scanData?.status, scanId, setLocation]);

  const isScanning = scanId !== null;
  const isUploading = uploadMutation.isPending;
  const scanStatus = scanData?.status || "pending";

  const steps = microservices.map((ms, index) => {
    let status: "pending" | "running" | "complete" = "pending";

    if (scanStatus === "complete") {
      status = "complete";
    } else if (scanStatus === "running") {
      if (index === 0) status = "running";
    }

    return { id: ms.id, name: ms.name, status };
  });

  const runningProgress = Math.round((1 / microservices.length) * 100);
  const scanProgress =
    scanStatus === "complete" ? 100 : scanStatus === "running" ? runningProgress : 0;

  const handleStartScan = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
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
                      {microservices.map((ms) => (
                        <div key={ms.id} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{ms.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleStartScan}
                    className="w-full"
                    size="lg"
                    disabled={isUploading}
                    data-testid="button-start-scan"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {isUploading ? "Uploading..." : "Start Security Analysis"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <ScanProgress steps={steps} progress={scanProgress} />
        )}
      </main>
    </div>
  );
}
