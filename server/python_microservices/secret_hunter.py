import json
import re
import sys
import zipfile
from pathlib import Path

SECRET_PATTERNS = [
    {
        "name": "AWS Access Key",
        "pattern": re.compile(r"AKIA[0-9A-Z]{16}"),
        "severity": "critical",
        "cwe": "CWE-798",
        "description": "AWS credentials found in source code, providing full access to cloud resources.",
    },
    {
        "name": "Generic API Key",
        "pattern": re.compile(r"[aA][pP][iI][-_]?[kK][eE][yY][\s]*[:=][\s]*['\"]([a-zA-Z0-9_\-]{20,})['\"]"),
        "severity": "critical",
        "cwe": "CWE-798",
        "description": "API key found hardcoded in source code.",
    },
    {
        "name": "Private Key",
        "pattern": re.compile(r"-----BEGIN (RSA |EC )?PRIVATE KEY-----"),
        "severity": "critical",
        "cwe": "CWE-798",
        "description": "Private cryptographic key found in application resources.",
    },
    {
        "name": "OAuth Token",
        "pattern": re.compile(r"[oO][aA][uU][tT][hH].*['\"]([a-zA-Z0-9_\-]{20,})['\"]"),
        "severity": "critical",
        "cwe": "CWE-798",
        "description": "OAuth token or secret found hardcoded in code.",
    },
    {
        "name": "Database Password",
        "pattern": re.compile(r"[pP][aA][sS][sS][wW][oO][rR][dD][\s]*[:=][\s]*['\"]([^'\"]{3,})['\"]"),
        "severity": "high",
        "cwe": "CWE-798",
        "description": "Database password found hardcoded in source code.",
    },
    {
        "name": "JWT Token",
        "pattern": re.compile(r"eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*"),
        "severity": "high",
        "cwe": "CWE-798",
        "description": "JWT token found in application code or resources.",
    },
]


def scan_entry(entry_name: str, content: str, found_secrets: set):
    findings = []
    for pattern in SECRET_PATTERNS:
        matches = list(pattern["pattern"].finditer(content))
        if matches:
            key = f"{pattern['name']}-{entry_name}"
            if key in found_secrets:
                continue
            found_secrets.add(key)
            findings.append(
                {
                    "microservice": "secret-hunter",
                    "title": f"Hardcoded {pattern['name']} Detected",
                    "severity": pattern["severity"],
                    "cwe": pattern["cwe"],
                    "description": pattern["description"],
                    "affectedFiles": [entry_name],
                    "fixSuggestion": "Store secrets in BuildConfig, environment variables, or use Android Keystore for secure storage. Never commit secrets to version control.",
                    "codeSnippet": '// Instead of:\nString API_KEY = "sk_live_12345";\n\n// Use:\nString API_KEY = BuildConfig.API_KEY;',
                }
            )
    return findings


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    findings = []
    found_secrets: set[str] = set()

    try:
        with zipfile.ZipFile(apk_path) as zip_file:
            for entry in zip_file.infolist():
                if entry.is_dir():
                    continue
                name = entry.filename
                if any(name.endswith(ext) for ext in [".png", ".jpg", ".dex", ".so"]):
                    continue

                try:
                    with zip_file.open(entry) as file_obj:
                        content = file_obj.read().decode("utf-8", errors="ignore")
                        findings.extend(scan_entry(name, content, found_secrets))
                except Exception:
                    continue
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"SecretHunter error: {exc}", file=sys.stderr)

    print(json.dumps({"findings": findings}))


if __name__ == "__main__":
    main()
