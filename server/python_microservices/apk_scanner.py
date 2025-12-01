import json
import sys
import zipfile
from pathlib import Path


def read_manifest(zip_file: zipfile.ZipFile):
    try:
        with zip_file.open("AndroidManifest.xml") as manifest_file:
            return manifest_file.read().decode("utf-8", errors="ignore")
    except KeyError:
        return None
    except Exception:
        return None


def scan_manifest(manifest_content: str):
    findings = []

    if "debuggable" in manifest_content and "true" in manifest_content:
        findings.append(
            {
                "microservice": "apk-scanner",
                "title": "Debuggable Flag Enabled",
                "severity": "high",
                "cwe": "CWE-489",
                "description": "Application is set to debuggable mode in production, allowing attackers to inspect runtime behavior and potentially extract sensitive information.",
                "affectedFiles": ["AndroidManifest.xml"],
                "fixSuggestion": 'Set android:debuggable="false" in your production builds. This flag should only be enabled during development.',
                "codeSnippet": '<application\n  android:debuggable="false"\n  android:allowBackup="false"\n  ...>',
            }
        )

    if "allowBackup" not in manifest_content or 'allowBackup="true"' in manifest_content:
        findings.append(
            {
                "microservice": "apk-scanner",
                "title": "Backup Enabled",
                "severity": "medium",
                "cwe": "CWE-200",
                "description": "Application allows Android backups which could expose sensitive data if the device is compromised.",
                "affectedFiles": ["AndroidManifest.xml"],
                "fixSuggestion": 'Set android:allowBackup="false" to prevent automatic backups of your app data.',
                "codeSnippet": '<application\n  android:allowBackup="false"\n  ...>',
            }
        )

    if "usesCleartextTraffic" in manifest_content and "true" in manifest_content:
        findings.append(
            {
                "microservice": "apk-scanner",
                "title": "Cleartext Traffic Permitted",
                "severity": "medium",
                "cwe": "CWE-319",
                "description": "Application allows cleartext HTTP traffic which can be intercepted by attackers on the network.",
                "affectedFiles": ["AndroidManifest.xml"],
                "fixSuggestion": 'Use HTTPS for all network communications or set android:usesCleartextTraffic="false".',
                "codeSnippet": '<application\n  android:usesCleartextTraffic="false"\n  ...>',
            }
        )

    dangerous_permissions = [
        "READ_SMS",
        "SEND_SMS",
        "READ_CONTACTS",
        "WRITE_CONTACTS",
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "RECORD_AUDIO",
    ]

    for permission in dangerous_permissions:
        if permission in manifest_content:
            findings.append(
                {
                    "microservice": "apk-scanner",
                    "title": f"Potentially Excessive Permission: {permission}",
                    "severity": "low",
                    "cwe": "CWE-250",
                    "description": f"Application requests {permission} permission. Ensure this is necessary for core functionality.",
                    "affectedFiles": ["AndroidManifest.xml"],
                    "fixSuggestion": "Only request permissions that are essential for your app's functionality. Request permissions at runtime when needed.",
                }
            )

    if 'exported="true"' in manifest_content and "permission" not in manifest_content:
        findings.append(
            {
                "microservice": "apk-scanner",
                "title": "Exported Component Without Permission",
                "severity": "high",
                "cwe": "CWE-927",
                "description": "Application has exported components without proper permission protection, allowing other apps to invoke them.",
                "affectedFiles": ["AndroidManifest.xml"],
                "fixSuggestion": 'Set android:exported="false" for components that should not be accessible by other apps, or add permission requirements.',
                "codeSnippet": '<activity\n  android:name=".MyActivity"\n  android:exported="false"\n  ...>',
            }
        )

    return findings


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    findings = []

    try:
        with zipfile.ZipFile(apk_path) as zip_file:
            manifest_content = read_manifest(zip_file)
            if manifest_content:
                findings.extend(scan_manifest(manifest_content))
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"APKScanner error: {exc}", file=sys.stderr)

    print(json.dumps({"findings": findings}))


if __name__ == "__main__":
    main()
