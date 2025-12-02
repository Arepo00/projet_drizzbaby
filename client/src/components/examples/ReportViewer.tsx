import { microservices } from "@shared/microservices";
import ReportViewer from "../ReportViewer";

export default function ReportViewerExample() {
  const mockReport = {
    appName: "MyBankingApp",
    packageName: "com.example.banking",
    version: "2.1.0",
    scanDate: "Jan 15, 2024 2:30 PM",
    duration: "3m 42s",
    overallScore: "C",
    microservices: microservices.map((ms, index) => ({
      id: ms.id,
      name: ms.name,
      findings:
        index === 0
          ? [
              {
                title: "Debuggable Flag Enabled",
                severity: "high" as const,
                cwe: "CWE-489",
                description:
                  "Application is set to debuggable mode in production, allowing attackers to inspect runtime behavior.",
                affectedFiles: ["AndroidManifest.xml:12"],
                fixSuggestion: 'Set android:debuggable="false" in your production builds.',
                codeSnippet: '<application\\n  android:debuggable="false"\\n  ...>',
              },
            ]
          : index === 1
            ? [
                {
                  title: "Hardcoded API Key",
                  severity: "critical" as const,
                  cwe: "CWE-798",
                  description: "API key found hardcoded in source code.",
                  affectedFiles: ["ApiClient.java:42"],
                },
              ]
            : [],
    })),
  };

  return (
    <ReportViewer
      report={mockReport}
      onDownload={() => console.log('Download PDF')}
      onShare={() => console.log('Share report')}
    />
  );
}
