export type MicroserviceId =
  | "apk-scanner"
  | "secret-hunter"
  | "crypto-check"
  | "network-inspector"
  | "report-gen"
  | "fix-suggest"
  | "ci-connector";

export interface MicroserviceDefinition {
  id: MicroserviceId;
  name: string;
  script: string;
  description: string;
}

export const microservices: MicroserviceDefinition[] = [
  {
    id: "apk-scanner",
    name: "APKScanner",
    script: "apk_scanner.py",
    description:
      "Disassembles APKs to inspect the manifest for exported components, cleartext traffic, and backup/debug flags.",
  },
  {
    id: "secret-hunter",
    name: "SecretHunter",
    script: "secret_hunter.py",
    description: "Searches application resources for embedded secrets such as API keys, tokens, or private keys.",
  },
  {
    id: "crypto-check",
    name: "CryptoCheck",
    script: "crypto_check.py",
    description: "Flags insecure cryptographic primitives like MD5, SHA1, DES, ECB mode, or weak random number generators.",
  },
  {
    id: "network-inspector",
    name: "NetworkInspector",
    script: "network_inspector.py",
    description: "Highlights insecure network endpoints, plaintext communications, and permissive hostname verification.",
  },
  {
    id: "report-gen",
    name: "ReportGen",
    script: "report_gen.py",
    description: "Produces summary metadata about the scanned package and highlights missing hardening controls.",
  },
  {
    id: "fix-suggest",
    name: "FixSuggest",
    script: "fix_suggest.py",
    description: "Suggests remediation steps aligned with MASVS and common hardening practices for mobile apps.",
  },
  {
    id: "ci-connector",
    name: "CIConnector",
    script: "ci_connector.py",
    description: "Checks readiness for CI/CD integration and recommends pipeline hooks for automated scanning.",
  },
];
