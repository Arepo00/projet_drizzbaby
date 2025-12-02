import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    project_hint = apk_path.stem

    findings = [
        {
          "microservice": "ci-connector",
          "title": "Add CI Scan Stage",
          "severity": "info",
          "description": "Automate mobile security analysis inside your pipeline to prevent regressions.",
          "fixSuggestion": "Add a CI job that uploads APK artifacts to the MobileSec-MS scanner for every build.",
          "codeSnippet": "- name: Mobile security scan\n  run: curl -F 'apk=@app-release.apk' https://scanner.example.com/api/scans/upload",
        },
        {
          "microservice": "ci-connector",
          "title": "Cache Tooling for Faster Scans",
          "severity": "info",
          "description": "Cache Python dependencies and analysis rules so CI jobs complete quickly.",
          "fixSuggestion": "Use actions/cache or GitLab cache to persist ~/.cache/pip and rule sets between runs.",
        },
        {
          "microservice": "ci-connector",
          "title": "Gate Releases on Critical Findings",
          "severity": "medium",
          "description": "Fail builds when critical or high findings are introduced to maintain baseline security.",
          "fixSuggestion": "Add a policy step that queries scan results and blocks deployment if severity >= high exists.",
        }
    ]

    print(json.dumps({"findings": findings, "project": project_hint}))


if __name__ == "__main__":
    main()
