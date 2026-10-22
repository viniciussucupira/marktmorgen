"""Strict npm audit gate, with one expiring development-only advisory review."""
import datetime
import json
import sys
from pathlib import Path

ADVISORY = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm"
EXPIRES = datetime.date(2026, 11, 18)
REVIEWED = {
    "@next/eslint-plugin-next": "16.4.2",
    "braces": "3.0.3",
    "eslint-config-next": "16.4.2",
    "fast-glob": "3.3.1",
    "micromatch": "4.0.8",
}


def findings(report):
    if not isinstance(report, dict) or report.get("error") or report.get("auditReportVersion") != 2:
        raise ValueError("Audit unavailable or unsupported; no approval")
    values = report.get("vulnerabilities")
    counts = report.get("metadata", {}).get("vulnerabilities", {})
    if not isinstance(values, dict):
        raise ValueError("Missing audit findings")
    for severity in ["high", "critical"]:
        actual = sum(1 for value in values.values() if value.get("severity") == severity)
        if counts.get(severity) != actual:
            raise ValueError("Audit severity totals do not match")
    return values


def review(all_report, production_report, lock, today):
    all_findings = findings(all_report)
    production = findings(production_report)
    blocked = {name: {"severity": item.get("severity"), "range": item.get("range"),
                      "via": item.get("via"), "fixAvailable": item.get("fixAvailable")}
               for name, item in production.items() if item.get("severity") in ["high", "critical"]}
    if blocked:
        raise ValueError("High or critical production dependency finding: " + json.dumps(blocked, sort_keys=True))
    packages = lock.get("packages", {})

    def reviewed_chain(name, seen=()):
        if name not in REVIEWED or name in seen:
            return False
        item = all_findings.get(name, {})
        if item.get("severity") != "high":
            return False
        nodes = item.get("nodes")
        if not isinstance(nodes, list) or not nodes:
            return False
        for node in nodes:
            package = packages.get(node, {})
            if package.get("dev") is not True or package.get("version") != REVIEWED[name]:
                return False
        via = item.get("via")
        if not isinstance(via, list) or not via:
            return False
        for cause in via:
            if isinstance(cause, str):
                if not reviewed_chain(cause, seen + (name,)):
                    return False
            elif not (name == "braces" and isinstance(cause, dict) and
                      cause.get("url") == ADVISORY and cause.get("name") == "braces" and
                      cause.get("severity") == "high" and cause.get("range") == "<=3.0.3"):
                return False
        return True

    retained = []
    for name, item in all_findings.items():
        if item.get("severity") not in ["high", "critical"]:
            continue
        if today >= EXPIRES or not reviewed_chain(name):
            raise ValueError("Unreviewed, changed or expired dependency finding: " + name)
        retained.append(name)
    return sorted(retained)


def main():
    root = Path(__file__).resolve().parents[1]
    all_report = json.loads(Path(sys.argv[1]).read_text())
    production = json.loads(Path(sys.argv[2]).read_text())
    lock = json.loads((root / "package-lock.json").read_text())
    retained = review(all_report, production, lock, datetime.datetime.now(datetime.timezone.utc).date())
    print("Production high/critical findings: 0")
    print("Full dependency high/critical findings retained: " + str(len(retained)))
    if retained:
        print("Development-only, unchanged reviewed chain: " + ", ".join(retained))
        print("Unpatched advisory " + ADVISORY + "; review expires " + EXPIRES.isoformat())
    print("Audit gate passed; no claim of complete vulnerability absence.")


if __name__ == "__main__":
    main()
