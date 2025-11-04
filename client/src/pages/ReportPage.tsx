import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import ReportViewer from "@/components/ReportViewer";
import ThemeToggle from "@/components/ThemeToggle";

export default function ReportPage() {
  // todo: remove mock functionality
  const mockReport = {
    appName: 'MyBankingApp',
    packageName: 'com.example.banking',
    version: '2.1.0',
    scanDate: 'Jan 15, 2024 2:30 PM',
    duration: '3m 42s',
    overallScore: 'C',
    microservices: [
      {
        id: 'apk-scanner',
        name: 'APKScanner',
        findings: [
          {
            title: 'Debuggable Flag Enabled',
            severity: 'high' as const,
            cwe: 'CWE-489',
            description: 'Application is set to debuggable mode in production, allowing attackers to inspect runtime behavior and potentially extract sensitive information.',
            affectedFiles: ['AndroidManifest.xml:12'],
            fixSuggestion: 'Set android:debuggable="false" in your production builds. This flag should only be enabled during development.',
            codeSnippet: '<application\n  android:debuggable="false"\n  android:allowBackup="false"\n  ...>',
          },
          {
            title: 'Cleartext Traffic Permitted',
            severity: 'medium' as const,
            cwe: 'CWE-319',
            description: 'Application allows cleartext HTTP traffic which can be intercepted by attackers on the network.',
            affectedFiles: ['AndroidManifest.xml:8'],
            fixSuggestion: 'Use HTTPS for all network communications or set android:usesCleartextTraffic="false".',
          },
        ],
      },
      {
        id: 'secret-hunter',
        name: 'SecretHunter',
        findings: [
          {
            title: 'Hardcoded API Key Detected',
            severity: 'critical' as const,
            cwe: 'CWE-798',
            description: 'Application contains hardcoded API credentials that could be extracted by attackers through reverse engineering.',
            affectedFiles: [
              'app/src/main/java/com/example/api/ApiClient.java:42',
              'app/src/main/res/values/strings.xml:15',
            ],
            fixSuggestion: 'Store API keys in BuildConfig or use Android Keystore for secure storage. Never commit secrets to version control.',
            codeSnippet: '// Instead of:\nString API_KEY = "sk_live_51H...";\n\n// Use:\nString API_KEY = BuildConfig.API_KEY;',
          },
          {
            title: 'AWS Access Key Exposed',
            severity: 'critical' as const,
            cwe: 'CWE-798',
            description: 'AWS credentials found in source code, providing full access to cloud resources.',
            affectedFiles: ['app/src/main/java/com/example/storage/S3Manager.java:18'],
          },
        ],
      },
      {
        id: 'crypto-check',
        name: 'CryptoCheck',
        findings: [
          {
            title: 'Insecure AES/ECB Encryption',
            severity: 'high' as const,
            cwe: 'CWE-327',
            description: 'Application uses AES in ECB mode which is cryptographically weak and can leak patterns in encrypted data.',
            affectedFiles: ['app/src/main/java/com/example/crypto/Encryption.java:28'],
            fixSuggestion: 'Use AES/GCM or AES/CBC mode with proper initialization vectors.',
            codeSnippet: '// Use:\nCipher cipher = Cipher.getInstance("AES/GCM/NoPadding");\n// Instead of:\n// Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");',
          },
          {
            title: 'Weak Random Number Generation',
            severity: 'medium' as const,
            cwe: 'CWE-338',
            description: 'Application uses java.util.Random for security-sensitive operations. This is not cryptographically secure.',
            affectedFiles: ['app/src/main/java/com/example/auth/TokenGenerator.java:35'],
            fixSuggestion: 'Use SecureRandom instead of Random for generating security tokens.',
            codeSnippet: 'import java.security.SecureRandom;\n\nSecureRandom random = new SecureRandom();\nbyte[] token = new byte[32];\nrandom.nextBytes(token);',
          },
        ],
      },
      {
        id: 'network-inspector',
        name: 'NetworkInspector',
        findings: [
          {
            title: 'Certificate Pinning Not Implemented',
            severity: 'medium' as const,
            cwe: 'CWE-295',
            description: 'Application does not implement certificate pinning, making it vulnerable to man-in-the-middle attacks.',
            fixSuggestion: 'Implement certificate pinning to prevent MITM attacks on your API endpoints.',
          },
        ],
      },
      {
        id: 'report-gen',
        name: 'ReportGen',
        findings: [],
      },
    ],
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        <ReportViewer
          report={mockReport}
          onDownload={() => console.log('Download PDF')}
          onShare={() => console.log('Share report')}
        />
      </main>
    </div>
  );
}
