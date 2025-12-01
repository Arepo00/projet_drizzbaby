import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"findings": []}))
        return

    apk_path = Path(sys.argv[1])
    app_name = apk_path.stem

    findings = [
        {
            "microservice": "fix-suggest",
            "title": "Enable Network Security Config",
            "severity": "low",
            "description": "Define a networkSecurityConfig to block cleartext traffic and pin trusted certificates.",
            "fixSuggestion": "Add <network-security-config> with cleartextTrafficPermitted='false' and certificate pinning rules.",
        },
        {
            "microservice": "fix-suggest",
            "title": "Harden Release Build",
            "severity": "low",
            "description": "ProGuard/R8 and shrinker settings are often missing. Ensure release builds strip debugging artifacts.",
            "fixSuggestion": "Enable minifyEnabled true, shrinkResources true, and configure proguard-rules.pro for release.",
            "codeSnippet": "buildTypes {\n  release {\n    minifyEnabled true\n    shrinkResources true\n  }\n}",
        },
        {
            "microservice": "fix-suggest",
            "title": "Validate Exported Components",
            "severity": "medium",
            "description": "Review exported activities, services, and receivers to ensure least-privilege defaults.",
            "fixSuggestion": "Set android:exported=\"false\" by default and add permissions for components needing external access.",
        },
    ]

    print(json.dumps({"findings": findings, "app": app_name}))


if __name__ == "__main__":
    main()
