#!/usr/bin/env python3
"""Inject or update the <meta http-equiv="Content-Security-Policy"> tag in docs/*.html."""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
HTML_DIR = ROOT / "docs"
CONFIG = Path(__file__).resolve().parent / "csp.json"

CSP_RE = re.compile(
    r"([ \t]*)<meta\s+http-equiv=[\"']Content-Security-Policy[\"']\s+content=([\"'])(.*?)\2\s*/?>",
    re.IGNORECASE,
)
CHARSET_RE = re.compile(r'(<meta\s+charset=(["\'])UTF-8\2\s*/?>)', re.IGNORECASE)


def load_csp(config_path: Path) -> str:
    data = json.loads(config_path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or "policy" not in data or not isinstance(data["policy"], str):
        raise SystemExit("Config must be a JSON object with a 'policy' string.")
    return data["policy"].strip()


def build_tag(csp: str) -> str:
    return f'<meta http-equiv="Content-Security-Policy" content="{csp}">'


def process_file(path: Path, csp: str, dry_run: bool) -> bool:
    text = path.read_text(encoding="utf-8")
    tag = build_tag(csp)
    new_text, count = CSP_RE.subn(lambda m: m.group(1) + tag, text)
    if count == 0:
        new_text, count = CHARSET_RE.subn(lambda m: m.group(1) + "\n  " + tag, text, count=1)
        if count == 0:
            print(f"  skip {path.relative_to(ROOT)}: no CSP meta and no <meta charset> found")
            return False
    if new_text == text:
        print(f"  unchanged {path.relative_to(ROOT)}")
        return False
    if dry_run:
        print(f"  would update {path.relative_to(ROOT)}")
        return True
    path.write_text(new_text, encoding="utf-8")
    print(f"  updated {path.relative_to(ROOT)}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Inject/update CSP <meta> tags in docs/*.html")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing files.")
    parser.add_argument("--config", type=Path, default=CONFIG, help="Path to csp.json")
    args = parser.parse_args()

    csp = load_csp(args.config)
    if not csp:
        raise SystemExit("CSP policy is empty.")

    print(f"Using CSP from {args.config}: {csp[:60]}...")
    updated = 0
    for html_path in sorted(HTML_DIR.rglob("*.html")):
        updated += process_file(html_path, csp, args.dry_run)
    print(f"{'Would update' if args.dry_run else 'Updated'} {updated} file(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
