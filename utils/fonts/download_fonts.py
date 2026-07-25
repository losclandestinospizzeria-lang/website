#!/usr/bin/env python3
"""Download Google Fonts woff2 files and generate a self-hosted fonts.css."""

import re
import sys
from pathlib import Path
from urllib import request

ROOT = Path(__file__).resolve().parent.parent.parent
FONTS_DIR = ROOT / "docs" / "fonts"
CSS_OUT = ROOT / "docs" / "css" / "fonts.css"

GOOGLE_FONTS_URL = (
    "https://fonts.googleapis.com/css2?"
    "family=Work+Sans:wght@400;500;600;700;800;900"
    "&family=Bebas+Neue"
    "&display=swap"
)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)

FACE_RE = re.compile(r"@font-face\s*\{([^}]+)\}", re.DOTALL)
FAMILY_RE = re.compile(r"font-family:\s*['\"]?([^';]+)['\"]?\s*;")
STYLE_RE = re.compile(r"font-style:\s*([^;]+);")
WEIGHT_RE = re.compile(r"font-weight:\s*([^;]+);")
DISPLAY_RE = re.compile(r"font-display:\s*([^;]+);")
SRC_RE = re.compile(r"src:\s*url\(([^)]+)\)\s*format\(['\"]?(\w+)['\"]?\);")
RANGE_RE = re.compile(r"unicode-range:\s*([^;]+);")


def fetch_css(url: str) -> str:
    req = request.Request(url, headers={"User-Agent": USER_AGENT})
    with request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def filename_for_url(url: str, index: int) -> str:
    base = Path(url).name
    if not base or "." not in base:
        return f"font-{index}.woff2"
    return base


def main() -> int:
    FONTS_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Fetching Google Fonts CSS from {GOOGLE_FONTS_URL}")
    try:
        css = fetch_css(GOOGLE_FONTS_URL)
    except Exception as exc:
        print(f"Failed to fetch font CSS: {exc}", file=sys.stderr)
        return 1

    url_to_filename: dict[str, str] = {}
    faces: list[str] = []

    for i, match in enumerate(FACE_RE.finditer(css), start=1):
        block = match.group(1)
        family = FAMILY_RE.search(block)
        style = STYLE_RE.search(block)
        weight = WEIGHT_RE.search(block)
        display = DISPLAY_RE.search(block)
        src = SRC_RE.search(block)
        rng = RANGE_RE.search(block)

        if not (family and style and weight and src):
            print(f"  skipping incomplete @font-face block #{i}", file=sys.stderr)
            continue

        url = src.group(1).strip('"\'')
        fmt = src.group(2)

        if url in url_to_filename:
            filename = url_to_filename[url]
        else:
            filename = filename_for_url(url, i)
            out_path = FONTS_DIR / filename
            if not out_path.exists():
                print(f"  downloading {filename} ({family.group(1).strip()}, {weight.group(1).strip()})")
                try:
                    request.urlretrieve(url, out_path)
                except Exception as exc:
                    print(f"  failed to download {url}: {exc}", file=sys.stderr)
                    return 1
            url_to_filename[url] = filename

        parts = [
            f"  font-family: '{family.group(1).strip()}';",
            f"  font-style: {style.group(1).strip()};",
            f"  font-weight: {weight.group(1).strip()};",
            f"  src: url('../fonts/{filename}') format('{fmt}');",
        ]
        if display:
            parts.append(f"  font-display: {display.group(1).strip()};")
        if rng:
            parts.append(f"  unicode-range: {rng.group(1).strip()};")

        faces.append("@font-face {\n" + "\n".join(parts) + "\n}")

    if not faces:
        print("No @font-face blocks found in the fetched CSS.", file=sys.stderr)
        return 1

    CSS_OUT.parent.mkdir(parents=True, exist_ok=True)
    CSS_OUT.write_text("\n\n".join(faces) + "\n", encoding="utf-8")
    print(f"Wrote {CSS_OUT}")
    print(f"Downloaded {len(url_to_filename)} font file(s) to {FONTS_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
