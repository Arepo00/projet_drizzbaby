import AdmZip from "adm-zip";
import type { InsertFinding } from "@shared/schema";

export interface APKScannerResult {
  findings: Omit<InsertFinding, "scanId">[];
}

export async function scanAPK(apkPath: string): Promise<APKScannerResult> {
  const findings: Omit<InsertFinding, "scanId">[] = [];

  try {
    const zip = new AdmZip(apkPath);
    const manifestEntry = zip.getEntry("AndroidManifest.xml");

    if (!manifestEntry) {
      return { findings };
    }

    // Extract manifest content as string (simplified - real APK parsing would need AXML decoder)
    const manifestContent = manifestEntry.getData().toString("utf8");

    // Check for debuggable flag
    if (manifestContent.includes("debuggable") && manifestContent.includes("true")) {
      findings.push({
        microservice: "apk-scanner",
        title: "Debuggable Flag Enabled",
        severity: "high",
        cwe: "CWE-489",
        description:
          "Application is set to debuggable mode in production, allowing attackers to inspect runtime behavior and potentially extract sensitive information.",
        affectedFiles: ["AndroidManifest.xml"],
        fixSuggestion:
          'Set android:debuggable="false" in your production builds. This flag should only be enabled during development.',
        codeSnippet:
          '<application\n  android:debuggable="false"\n  android:allowBackup="false"\n  ...>',
      });
    }

    // Check for allowBackup
    if (
      !manifestContent.includes("allowBackup") ||
      manifestContent.includes('allowBackup="true"')
    ) {
      findings.push({
        microservice: "apk-scanner",
        title: "Backup Enabled",
        severity: "medium",
        cwe: "CWE-200",
        description:
          "Application allows Android backups which could expose sensitive data if the device is compromised.",
        affectedFiles: ["AndroidManifest.xml"],
        fixSuggestion:
          'Set android:allowBackup="false" to prevent automatic backups of your app data.',
        codeSnippet: '<application\n  android:allowBackup="false"\n  ...>',
      });
    }

    // Check for cleartext traffic
    if (
      manifestContent.includes("usesCleartextTraffic") &&
      manifestContent.includes("true")
    ) {
      findings.push({
        microservice: "apk-scanner",
        title: "Cleartext Traffic Permitted",
        severity: "medium",
        cwe: "CWE-319",
        description:
          "Application allows cleartext HTTP traffic which can be intercepted by attackers on the network.",
        affectedFiles: ["AndroidManifest.xml"],
        fixSuggestion:
          'Use HTTPS for all network communications or set android:usesCleartextTraffic="false".',
        codeSnippet:
          '<application\n  android:usesCleartextTraffic="false"\n  ...>',
      });
    }

    // Check for dangerous permissions
    const dangerousPermissions = [
      "READ_SMS",
      "SEND_SMS",
      "READ_CONTACTS",
      "WRITE_CONTACTS",
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "RECORD_AUDIO",
    ];

    for (const permission of dangerousPermissions) {
      if (manifestContent.includes(permission)) {
        findings.push({
          microservice: "apk-scanner",
          title: `Potentially Excessive Permission: ${permission}`,
          severity: "low",
          cwe: "CWE-250",
          description: `Application requests ${permission} permission. Ensure this is necessary for core functionality.`,
          affectedFiles: ["AndroidManifest.xml"],
          fixSuggestion:
            "Only request permissions that are essential for your app's functionality. Request permissions at runtime when needed.",
        });
      }
    }

    // Check for exported components without permissions
    if (
      manifestContent.includes('exported="true"') &&
      !manifestContent.includes("permission")
    ) {
      findings.push({
        microservice: "apk-scanner",
        title: "Exported Component Without Permission",
        severity: "high",
        cwe: "CWE-927",
        description:
          "Application has exported components without proper permission protection, allowing other apps to invoke them.",
        affectedFiles: ["AndroidManifest.xml"],
        fixSuggestion:
          'Set android:exported="false" for components that should not be accessible by other apps, or add permission requirements.',
        codeSnippet:
          '<activity\n  android:name=".MyActivity"\n  android:exported="false"\n  ...>',
      });
    }
  } catch (error) {
    console.error("APKScanner error:", error);
  }

  return { findings };
}
