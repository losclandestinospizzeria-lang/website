#!/usr/bin/env python3
"""Regenerate minified assets and inline critical CSS into each HTML page."""

import re
import sys
from pathlib import Path

UTILS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(UTILS_DIR))

import minify  # noqa: E402

ROOT = UTILS_DIR.parent.parent
DOCS = ROOT / "docs"
CSS_DIR = DOCS / "css"

PRELOAD_FONT_RE = re.compile(r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']css/fonts\.css["\'][^>]*>\s*')
STYLESHEET_RE = re.compile(
    r'<link[^>]*rel=["\']stylesheet["\'][^>]*href=["\']css/(base|fonts|[^"\']+\.min)\.css["\'][^>]*>\s*',
    re.IGNORECASE,
)


STYLE_BLOCK_RE = re.compile(r"<style[^>]*>.*?</style>", re.DOTALL)


def inline_css_for(html_path: Path) -> None:
    html = html_path.read_text(encoding="utf-8")
    # Make the run idempotent: remove any previously inlined style block.
    html, removed = STYLE_BLOCK_RE.subn("", html)
    if removed:
        print(f"  removed {removed} existing inline style block(s) from {html_path.name}")

    stem = html_path.stem
    min_css_path = CSS_DIR / f"{stem}.min.css"

    if not min_css_path.exists():
        print(f"  skip {html_path.name}: {min_css_path.name} not found")
        return

    base_css = (CSS_DIR / "base.css").read_text(encoding="utf-8")
    fonts_css = (CSS_DIR / "fonts.css").read_text(encoding="utf-8")
    page_css = min_css_path.read_text(encoding="utf-8")

    combined = base_css + "\n" + fonts_css + "\n" + page_css
    # When inlined into docs/*.html, paths relative to css/ must become relative to docs/.
    combined = combined.replace("../fonts/", "fonts/")
    combined = minify.minify_css(combined)

    # Remove all matching stylesheet links (fonts, base, page.min) and replace the
    # last one with the inline <style> block so the order stays in <head>.
    style_block = f"<style>{combined}</style>\n"
    link_matches = list(STYLESHEET_RE.finditer(html))

    if not link_matches:
        # No stylesheet links (already inlined previously); insert before </head>.
        head_close = html.lower().find("</head>")
        if head_close == -1:
            print(f"  unchanged {html_path.name}: no </head> found")
            return
        new_html = html[:head_close].rstrip() + "\n  " + style_block + "\n" + html[head_close:]
    else:
        last_match = link_matches[-1]
        before = html[: last_match.start()]
        after = html[last_match.end() :]

        # Remove earlier matched link tags from the part before the last match
        for m in reversed(link_matches[:-1]):
            before = before[: m.start()] + before[m.end() :]

        new_html = before.rstrip() + "\n  " + style_block + after.lstrip()

    html_path.write_text(new_html, encoding="utf-8")
    print(f"  inlined CSS into {html_path.name} ({len(combined)} bytes)")


def main() -> int:
    print("Regenerating minified JS/CSS...")
    minify.main()

    print("Inlining CSS into HTML pages...")
    for html_path in sorted(DOCS.glob("*.html")):
        inline_css_for(html_path)

    return 0


if __name__ == "__main__":
    sys.exit(main())
