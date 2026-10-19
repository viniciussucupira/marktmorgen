"""Synthetic gate failures must never be mistaken for a clean audit."""
import datetime
import json
import tempfile
import unittest
from pathlib import Path
from check_dependency_audit import ADVISORY, EXPIRES, review
from check_dependency_runtime import check_traces

TODAY = datetime.date(2026, 10, 19)


def report(values=None):
    values = values or {}
    return {"auditReportVersion": 2, "vulnerabilities": values, "metadata": {"vulnerabilities": {
        "high": sum(v["severity"] == "high" for v in values.values()),
        "critical": sum(v["severity"] == "critical" for v in values.values()),
    }}}


def fixture():
    item = {"severity": "high", "nodes": ["node_modules/braces"], "via": [{
        "name": "braces", "url": ADVISORY, "severity": "high", "range": "<=3.0.3"}]}
    return report({"braces": item}), {"packages": {"node_modules/braces": {"version": "3.0.3", "dev": True}}}


class GateTests(unittest.TestCase):
    def test_clean_does_not_need_exception_even_after_expiry(self):
        self.assertEqual(review(report(), report(), {}, EXPIRES), [])

    def test_exact_development_finding_is_reported(self):
        audit, lock = fixture()
        self.assertEqual(review(audit, report(), lock, TODAY), ["braces"])

    def test_production_never_gets_exception(self):
        audit, lock = fixture()
        with self.assertRaises(ValueError):
            review(audit, audit, lock, TODAY)

    def test_exception_expires_and_never_rolls_forward(self):
        audit, lock = fixture()
        with self.assertRaises(ValueError):
            review(audit, report(), lock, EXPIRES)

    def test_changed_version_or_production_classification_refuses(self):
        for change in [{"version": "3.0.2"}, {"dev": False}]:
            audit, lock = fixture()
            lock["packages"]["node_modules/braces"].update(change)
            with self.assertRaises(ValueError):
                review(audit, report(), lock, TODAY)

    def test_new_advisory_and_critical_finding_refuse(self):
        for change in [{"url": "https://github.com/advisories/new"}, {"severity": "critical"}]:
            audit, lock = fixture()
            audit["vulnerabilities"]["braces"]["via"][0].update(change)
            with self.assertRaises(ValueError):
                review(audit, report(), lock, TODAY)

    def test_unavailable_and_inconsistent_reports_refuse(self):
        for audit in [{}, {"error": {"message": "Registry unavailable"}}, report({"unknown": {"severity": "high"}})]:
            with self.assertRaises(ValueError):
                review(audit, report(), {}, TODAY)

    def test_runtime_trace_is_mandatory_and_catches_the_chain(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(ValueError):
                check_traces(folder)
            trace = Path(folder) / "route.js.nft.json"
            trace.write_text(json.dumps({"files": ["../node_modules/next/dist/server.js"]}))
            self.assertEqual(check_traces(folder), 1)
            trace.write_text(json.dumps({"files": ["../node_modules/braces/index.js"]}))
            with self.assertRaises(ValueError):
                check_traces(folder)


if __name__ == "__main__":
    unittest.main()
