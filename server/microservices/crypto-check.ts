import AdmZip from "adm-zip";
import type { InsertFinding } from "@shared/schema";

export interface CryptoCheckResult {
  findings: Omit<InsertFinding, "scanId">[];
}

// Crypto vulnerability patterns
const cryptoPatterns = [
  {
    name: "AES/ECB Mode",
    pattern: /AES\/ECB/gi,
    severity: "high" as const,
    cwe: "CWE-327",
    title: "Insecure AES/ECB Encryption",
    description:
      "Application uses AES in ECB mode which is cryptographically weak and can leak patterns in encrypted data.",
    fixSuggestion: "Use AES/GCM or AES/CBC mode with proper initialization vectors.",
    codeSnippet:
      '// Use:\nCipher cipher = Cipher.getInstance("AES/GCM/NoPadding");\n// Instead of:\n// Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");',
  },
  {
    name: "MD5 Hash",
    pattern: /MessageDigest\.getInstance\s*\(\s*["']MD5["']\s*\)/gi,
    severity: "high" as const,
    cwe: "CWE-327",
    title: "Weak Hashing Algorithm (MD5)",
    description:
      "Application uses MD5 hashing which is cryptographically broken and vulnerable to collisions.",
    fixSuggestion: "Use SHA-256 or SHA-3 for hashing instead of MD5.",
    codeSnippet:
      'MessageDigest digest = MessageDigest.getInstance("SHA-256");',
  },
  {
    name: "SHA1 Hash",
    pattern: /MessageDigest\.getInstance\s*\(\s*["']SHA-?1["']\s*\)/gi,
    severity: "medium" as const,
    cwe: "CWE-327",
    title: "Weak Hashing Algorithm (SHA1)",
    description:
      "Application uses SHA1 hashing which is considered weak and should be avoided for security-sensitive operations.",
    fixSuggestion: "Use SHA-256 or SHA-3 for secure hashing.",
    codeSnippet:
      'MessageDigest digest = MessageDigest.getInstance("SHA-256");',
  },
  {
    name: "Weak Random",
    pattern: /new\s+Random\s*\(\s*\)|Math\.random\s*\(\s*\)/gi,
    severity: "medium" as const,
    cwe: "CWE-338",
    title: "Weak Random Number Generation",
    description:
      "Application uses java.util.Random or Math.random for security-sensitive operations. These are not cryptographically secure.",
    fixSuggestion:
      "Use SecureRandom instead of Random for generating security tokens, IVs, or cryptographic keys.",
    codeSnippet:
      'import java.security.SecureRandom;\n\nSecureRandom random = new SecureRandom();\nbyte[] token = new byte[32];\nrandom.nextBytes(token);',
  },
  {
    name: "DES Encryption",
    pattern: /DES/gi,
    severity: "critical" as const,
    cwe: "CWE-327",
    title: "Obsolete DES Encryption",
    description:
      "Application uses DES encryption which has a very small key size and is completely insecure.",
    fixSuggestion: "Replace DES with AES-256 encryption.",
    codeSnippet: 'Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");',
  },
  {
    name: "Hardcoded IV",
    pattern: /IvParameterSpec\s*\(\s*new\s+byte\s*\[\s*\d+\s*\]\s*\)/gi,
    severity: "high" as const,
    cwe: "CWE-329",
    title: "Hardcoded Initialization Vector",
    description:
      "Application uses a hardcoded or zero initialization vector, which weakens encryption.",
    fixSuggestion:
      "Generate random IVs using SecureRandom for each encryption operation.",
    codeSnippet:
      'SecureRandom random = new SecureRandom();\nbyte[] iv = new byte[16];\nrandom.nextBytes(iv);\nIvParameterSpec ivSpec = new IvParameterSpec(iv);',
  },
];

export async function scanCrypto(apkPath: string): Promise<CryptoCheckResult> {
  const findings: Omit<InsertFinding, "scanId">[] = [];
  const foundIssues = new Set<string>();

  try {
    const zip = new AdmZip(apkPath);
    const entries = zip.getEntries();

    for (const entry of entries) {
      // Focus on Java/Kotlin source files and resources
      if (
        entry.isDirectory ||
        !(
          entry.name.endsWith(".java") ||
          entry.name.endsWith(".kt") ||
          entry.name.endsWith(".smali") ||
          entry.name.endsWith(".xml")
        )
      ) {
        continue;
      }

      try {
        const content = entry.getData().toString("utf8");

        // Check each crypto pattern
        for (const pattern of cryptoPatterns) {
          const matches = content.match(pattern.pattern);
          if (matches && matches.length > 0) {
            const key = `${pattern.name}-${entry.entryName}`;
            if (!foundIssues.has(key)) {
              foundIssues.add(key);
              findings.push({
                microservice: "crypto-check",
                title: pattern.title,
                severity: pattern.severity,
                cwe: pattern.cwe,
                description: pattern.description,
                affectedFiles: [entry.entryName],
                fixSuggestion: pattern.fixSuggestion,
                codeSnippet: pattern.codeSnippet,
              });
            }
          }
        }
      } catch (err) {
        // Skip files that can't be read
        continue;
      }
    }
  } catch (error) {
    console.error("CryptoCheck error:", error);
  }

  return { findings };
}
