import json
import sys
import zipfile
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    findings = []

    try:
        size_mb = apk_path.stat().st_size / (1024 * 1024)
        if size_mb > 50:
            findings.append(
                {
                    "microservice": "report-gen",
                    "title": "Large Application Package",
                    "severity": "low",
                    "description": f"APK size is {size_mb:.1f}MB which may indicate unoptimized assets or debugging symbols.",
                    "fixSuggestion": "Enable resource shrinking and remove unused assets before release builds.",
                }
            )
    except FileNotFoundError:
        print(json.dumps({"findings": []}))
        return

    try:
        with zipfile.ZipFile(apk_path) as zip_file:
            if not any(name.startswith("META-INF/") for name in zip_file.namelist()):
                findings.append(
                    {
                        "microservice": "report-gen",
                        "title": "Missing Signature Metadata",
                        "severity": "medium",
                        "description": "APK does not contain META-INF signature entries. Ensure release builds are properly signed.",
                        "fixSuggestion": "Sign the application with your release keystore and enable signature v2/v3.",
                    }
                )
    except Exception:
        pass

    print(json.dumps({"findings": findings}))


if __name__ == "__main__":
    main()
