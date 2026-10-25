"""Synthetic policy regressions; run by GitHub Actions, never provider traffic."""
import unittest
from ci_documentation_scope import documentation_diff, documentation_path, requires_full

A = "a" * 40
B = "b" * 40

def change(path, before="100644", after="100644", status="M"):
    return (f":{before} {after} {A} {B} {status}\0{path}\0").encode()

class DocumentationScopeTests(unittest.TestCase):
    def test_markdown_add_modify_delete_and_unicode(self):
        raw = change("README.md") + change("docs/visão.md", "000000", status="A")
        raw += change("docs/old.md", after="000000", status="D")
        self.assertTrue(documentation_diff(raw))
        self.assertFalse(requires_full("pull_request", A, B, lambda *_: raw))

    def test_code_config_dependencies_and_policy_always_full(self):
        for path in ["app/page.tsx", "docs/example.py", "tests/notes.md",
                     "package-lock.json", ".github/workflows/ci.yml", "AGENTS.md",
                     "docs/AGENTS.md", "docs/SKILL.md", "scripts/README.md",
                     "docs/.config/readme.md", "docs/image.svg", "README.MD"]:
            with self.subTest(path=path):
                self.assertFalse(documentation_diff(change(path)))

    def test_mixed_change_and_renamed_code_cannot_hide(self):
        self.assertFalse(documentation_diff(change("docs/readme.md") + change("lib/old.ts", after="000000", status="D")))
        self.assertFalse(documentation_diff(change("docs/renamed.md", status="R100")))

    def test_symlink_executable_submodule_and_type_changes_full(self):
        for before, after, status in [("120000", "100644", "T"),
                                     ("100644", "120000", "T"),
                                     ("100755", "100755", "M"),
                                     ("160000", "160000", "M")]:
            self.assertFalse(documentation_diff(change("docs/readme.md", before, after, status)))

    def test_unknown_empty_truncated_and_invalid_encoding_full(self):
        for raw in [b"", change("README.md")[:-1], b"bad\0", b"bad\0x\0",
                    change("README.md") + b"\xff\0"]:
            with self.subTest(raw=raw):
                self.assertTrue(requires_full("pull_request", A, B, lambda *_: raw))

    def test_push_daily_manual_unknown_and_bad_refs_always_full(self):
        for event, base, head in [("push", A, B), ("schedule", A, B),
                                  ("workflow_dispatch", A, B), ("", A, B),
                                  ("pull_request", "", B), ("pull_request", "--help", B)]:
            self.assertTrue(requires_full(event, base, head, lambda *_: change("README.md")))

    def test_git_failure_cannot_skip(self):
        def failed(*_):
            raise OSError("unavailable history")
        self.assertTrue(requires_full("pull_request", A, B, failed))

    def test_special_names_are_data_not_commands(self):
        self.assertTrue(documentation_path("docs/space and newline\nname.md"))
        self.assertFalse(documentation_path("../README.md"))
        self.assertFalse(documentation_path("/README.md"))

if __name__ == "__main__":
    unittest.main()
