import json
import re
import sys
import zipfile
from pathlib import Path

TEXT_EXTENSIONS = {".xml", ".json", ".txt", ".properties", ".gradle", ".js", ".kt", ".java", ".smali"}
HTTP_PATTERN = re.compile(r"http://[a-zA-Z0-9_.:/-]+", re.IGNORECASE)
TRUST_ALL_PATTERN = re.compile(r"TrustAll|AllowAllHostnameVerifier|HostnameVerifier\s*\(\s*\)\s*->\s*true", re.IGNORECASE)


def scan_entry(entry_name: str, content: str, seen: set[str]):
    findings = []

    for match in HTTP_PATTERN.findall(content):
        key = f"{entry_name}-{match}"
        if key in seen:
            continue
        seen.add(key)
        findings.append(
            {
                "microservice": "network-inspector",
                "title": "Cleartext Endpoint Detected",
                "severity": "high",
                "cwe": "CWE-319",
                "description": f"Endpoint {match} uses HTTP. Cleartext traffic can be intercepted or modified.",
                "affectedFiles": [entry_name],
                "fixSuggestion": "Migrate endpoints to HTTPS and enable network security config to block cleartext traffic.",
                "codeSnippet": f"Found reference to {match}",
            }
        )

    if TRUST_ALL_PATTERN.search(content):
        key = f"{entry_name}-trust-all"
        if key not in seen:
            seen.add(key)
            findings.append(
                {
                    "microservice": "network-inspector",
                    "title": "Permissive Hostname Verification",
                    "severity": "medium",
                    "cwe": "CWE-295",
                    "description": "Custom TrustManager or HostnameVerifier accepts all certificates, weakening TLS validation.",
                    "affectedFiles": [entry_name],
                    "fixSuggestion": "Use default hostname verification and pin expected certificates where appropriate.",
                }
            )

    return findings


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    findings = []
    seen: set[str] = set()

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
                        findings.extend(scan_entry(name, content, seen))
                except Exception:
                    continue
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"NetworkInspector error: {exc}", file=sys.stderr)

    print(json.dumps({"findings": findings}))


if __name__ == "__main__":
    main()
