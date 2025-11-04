import AdmZip from "adm-zip";
import type { InsertFinding } from "@shared/schema";

export interface SecretHunterResult {
  findings: Omit<InsertFinding, "scanId">[];
}

// Common secret patterns
const secretPatterns = [
  {
    name: "AWS Access Key",
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: "critical" as const,
    cwe: "CWE-798",
    description: "AWS credentials found in source code, providing full access to cloud resources.",
  },
  {
    name: "Generic API Key",
    pattern: /[aA][pP][iI][-_]?[kK][eE][yY][\s]*[:=][\s]*['"]([a-zA-Z0-9_\-]{20,})['"]/g,
    severity: "critical" as const,
    cwe: "CWE-798",
    description: "API key found hardcoded in source code.",
  },
  {
    name: "Private Key",
    pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g,
    severity: "critical" as const,
    cwe: "CWE-798",
    description: "Private cryptographic key found in application resources.",
  },
  {
    name: "OAuth Token",
    pattern: /[oO][aA][uU][tT][hH].*['"]([a-zA-Z0-9_\-]{20,})['"]/g,
    severity: "critical" as const,
    cwe: "CWE-798",
    description: "OAuth token or secret found hardcoded in code.",
  },
  {
    name: "Database Password",
    pattern: /[pP][aA][sS][sS][wW][oO][rR][dD][\s]*[:=][\s]*['"]([^'"]{3,})['"]/g,
    severity: "high" as const,
    cwe: "CWE-798",
    description: "Database password found hardcoded in source code.",
  },
  {
    name: "JWT Token",
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    severity: "high" as const,
    cwe: "CWE-798",
    description: "JWT token found in application code or resources.",
  },
];

export async function scanSecrets(apkPath: string): Promise<SecretHunterResult> {
  const findings: Omit<InsertFinding, "scanId">[] = [];
  const foundSecrets = new Set<string>();

  try {
    const zip = new AdmZip(apkPath);
    const entries = zip.getEntries();

    for (const entry of entries) {
      // Only scan text-based files
      if (
        entry.isDirectory ||
        entry.name.endsWith(".png") ||
        entry.name.endsWith(".jpg") ||
        entry.name.endsWith(".dex") ||
        entry.name.endsWith(".so")
      ) {
        continue;
      }

      try {
        const content = entry.getData().toString("utf8");

        // Check each pattern
        for (const { name, pattern, severity, cwe, description } of secretPatterns) {
          const matches = content.match(pattern);
          if (matches && matches.length > 0) {
            const key = `${name}-${entry.entryName}`;
            if (!foundSecrets.has(key)) {
              foundSecrets.add(key);
              findings.push({
                microservice: "secret-hunter",
                title: `Hardcoded ${name} Detected`,
                severity,
                cwe,
                description,
                affectedFiles: [entry.entryName],
                fixSuggestion:
                  "Store secrets in BuildConfig, environment variables, or use Android Keystore for secure storage. Never commit secrets to version control.",
                codeSnippet:
                  '// Instead of:\nString API_KEY = "sk_live_12345";\n\n// Use:\nString API_KEY = BuildConfig.API_KEY;',
              });
            }
          }
        }
      } catch (err) {
        // Skip files that can't be read as text
        continue;
      }
    }
  } catch (error) {
    console.error("SecretHunter error:", error);
  }

  return { findings };
}
