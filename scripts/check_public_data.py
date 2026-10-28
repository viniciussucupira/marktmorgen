"""Reject personal contact/tax/residential and provider-account data without printing values."""
import re
import subprocess
import sys
from pathlib import Path

PERSONAL = re.compile(r"(?i)(?<![\w.+-])[a-z0-9.!#$%&'*+/=?^_\x60{|}~-]+@(?:gmail|googlemail|hotmail|outlook|live|msn|yahoo|ymail|icloud|me|aol|protonmail|proton|uol|bol|terra)\.(?:com(?:\.br)?|net|br|me|co\.uk)\b")
ACCOUNT = re.compile(r"\b(?:acct|prj|team)_[A-Za-z0-9]{16,}\b")
CPF = re.compile(r"(?<!\d)(?:\d{3}\.\d{3}\.\d{3}-\d{2})(?!\d)")
PHONE = re.compile(r"(?<![\w])\+\d{1,3}[ (.-]*(?:\d[ ().-]*){8,13}\d(?!\d)")
HOME = re.compile(r"(?im)\b(?:residential address|home address|endere[cç]o residencial)\s*[:=]\s*[^\r\n]{5,}")
STREET = re.compile(r"(?im)\b(?:Rua|Avenida|Travessa|Alameda)\s+[A-ZÀ-Ý][^\r\n]{2,70},?\s+(?:n[ºo.]?\s*)?\d{1,6}\b")

def valid_cpf(value):
    digits = [int(c) for c in value if c.isdigit()]
    if len(set(digits)) == 1:
        return False
    for size in (9, 10):
        check = (sum(digits[i] * (size + 1 - i) for i in range(size)) * 10 % 11) % 10
        if digits[size] != check:
            return False
    return True

def findings(text):
    kinds = set()
    for label, pattern in (("personal-email", PERSONAL), ("provider-account", ACCOUNT),
                           ("phone", PHONE), ("residential-address", HOME), ("street-address", STREET)):
        if pattern.search(text):
            kinds.add(label)
    if any(valid_cpf(m.group()) for m in CPF.finditer(text)):
        kinds.add("cpf")
    return sorted(kinds)

def main():
    root = Path(__file__).resolve().parents[1]
    listing = subprocess.run(["git", "ls-files", "-z"], cwd=root, check=True, capture_output=True).stdout
    failures = []
    checked = 0
    for raw in listing.split(b"\0"):
        if not raw:
            continue
        relative = raw.decode("utf-8", errors="strict")
        path = root / relative
        if path.is_symlink():
            failures.append((relative, ["tracked-symlink-review"]))
            continue
        text = path.read_bytes().decode("utf-8", errors="replace")
        checked += 1
        kinds = findings(text)
        if kinds:
            failures.append((relative, kinds))
    for relative, kinds in failures:
        print("Public data check: " + relative + " [" + ", ".join(kinds) + "]", file=sys.stderr)
    print(f"Public data check: {checked} tracked files; {len(failures)} file(s) require correction.")
    return 1 if failures else 0

if __name__ == "__main__":
    raise SystemExit(main())
