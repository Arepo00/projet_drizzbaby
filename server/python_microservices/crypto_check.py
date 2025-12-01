import json
import re
import sys
import zipfile
from pathlib import Path

CRYPTO_PATTERNS = [
    {
        "name": "AES/ECB Mode",
        "pattern": re.compile(r"AES/ECB", re.IGNORECASE),
        "severity": "high",
        "cwe": "CWE-327",
        "title": "Insecure AES/ECB Encryption",
        "description": "Application uses AES in ECB mode which is cryptographically weak and can leak patterns in encrypted data.",
        "fixSuggestion": "Use AES/GCM or AES/CBC mode with proper initialization vectors.",
        "codeSnippet": "// Use:\nCipher cipher = Cipher.getInstance(\"AES/GCM/NoPadding\");\n// Instead of:\n// Cipher cipher = Cipher.getInstance(\"AES/ECB/PKCS5Padding\");",
    },
    {
        "name": "MD5 Hash",
        "pattern": re.compile(r"MessageDigest\.getInstance\s*\(\s*[\"']MD5[\"']\s*\)", re.IGNORECASE),
        "severity": "high",
        "cwe": "CWE-327",
        "title": "Weak Hashing Algorithm (MD5)",
        "description": "Application uses MD5 hashing which is cryptographically broken and vulnerable to collisions.",
        "fixSuggestion": "Use SHA-256 or SHA-3 for hashing instead of MD5.",
        "codeSnippet": 'MessageDigest digest = MessageDigest.getInstance("SHA-256");',
    },
    {
        "name": "SHA1 Hash",
        "pattern": re.compile(r"MessageDigest\.getInstance\s*\(\s*[\"']SHA-?1[\"']\s*\)", re.IGNORECASE),
        "severity": "medium",
        "cwe": "CWE-327",
        "title": "Weak Hashing Algorithm (SHA1)",
        "description": "Application uses SHA1 hashing which is considered weak and should be avoided for security-sensitive operations.",
        "fixSuggestion": "Use SHA-256 or SHA-3 for secure hashing.",
        "codeSnippet": 'MessageDigest digest = MessageDigest.getInstance("SHA-256");',
    },
    {
        "name": "Weak Random",
        "pattern": re.compile(r"new\s+Random\s*\(\s*\)|Math\.random\s*\(\s*\)", re.IGNORECASE),
        "severity": "medium",
        "cwe": "CWE-338",
        "title": "Weak Random Number Generation",
        "description": "Application uses java.util.Random or Math.random for security-sensitive operations. These are not cryptographically secure.",
        "fixSuggestion": "Use SecureRandom instead of Random for generating security tokens, IVs, or cryptographic keys.",
        "codeSnippet": 'import java.security.SecureRandom;\n\nSecureRandom random = new SecureRandom();\nbyte[] token = new byte[32];\nrandom.nextBytes(token);',
    },
    {
        "name": "DES Encryption",
        "pattern": re.compile(r"DES", re.IGNORECASE),
        "severity": "critical",
        "cwe": "CWE-327",
        "title": "Obsolete DES Encryption",
        "description": "Application uses DES encryption which has a very small key size and is completely insecure.",
        "fixSuggestion": "Replace DES with AES-256 encryption.",
        "codeSnippet": 'Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");',
    },
    {
        "name": "Hardcoded IV",
        "pattern": re.compile(r"IvParameterSpec\s*\(\s*new\s+byte\s*\[\s*\d+\s*\]\s*\)", re.IGNORECASE),
        "severity": "high",
        "cwe": "CWE-329",
        "title": "Hardcoded Initialization Vector",
        "description": "Application uses a hardcoded or zero initialization vector, which weakens encryption.",
        "fixSuggestion": "Generate random IVs using SecureRandom for each encryption operation.",
        "codeSnippet": 'SecureRandom random = new SecureRandom();\nbyte[] iv = new byte[16];\nrandom.nextBytes(iv);\nIvParameterSpec ivSpec = new IvParameterSpec(iv);',
    },
]


TEXT_EXTENSIONS = {".java", ".kt", ".smali", ".xml", ".txt", ".properties"}


def scan_entry(entry_name: str, content: str, found_issues: set):
    findings = []
    for pattern in CRYPTO_PATTERNS:
        if pattern["pattern"].search(content):
            key = f"{pattern['name']}-{entry_name}"
            if key in found_issues:
                continue
            found_issues.add(key)
            findings.append(
                {
                    "microservice": "crypto-check",
                    "title": pattern["title"],
                    "severity": pattern["severity"],
                    "cwe": pattern["cwe"],
                    "description": pattern["description"],
                    "affectedFiles": [entry_name],
                    "fixSuggestion": pattern["fixSuggestion"],
                    "codeSnippet": pattern["codeSnippet"],
                }
            )
    return findings


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    findings = []
    found_issues: set[str] = set()

    try:
        with zipfile.ZipFile(apk_path) as zip_file:
            for entry in zip_file.infolist():
                if entry.is_dir():
                    continue
                name = entry.filename
                if not any(name.endswith(ext) for ext in TEXT_EXTENSIONS):
                    continue

                try:
                    with zip_file.open(entry) as file_obj:
                        content = file_obj.read().decode("utf-8", errors="ignore")
                        findings.extend(scan_entry(name, content, found_issues))
                except Exception:
                    continue
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"CryptoCheck error: {exc}", file=sys.stderr)

    print(json.dumps({"findings": findings}))


if __name__ == "__main__":
    main()
