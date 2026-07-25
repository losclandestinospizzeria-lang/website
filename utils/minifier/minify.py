#!/usr/bin/env python3
"""
Build helper for the Los Clandestinos static site.

- Minifies docs/js/main.js into docs/js/main.min.js.
- Purges and minifies docs/css/style.css into a per-page stylesheet
  for each HTML file in docs/ (e.g. css/index.min.css, css/productos.min.css).

Usage:
    python3 utils/minifier/minify.py

The source files are kept untouched for development; the generated `.min.*`
files are the ones committed and served by GitHub Pages.
"""

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent.parent
DOCS = ROOT / "docs"
CSS_FILE = DOCS / "css" / "style.css"
JS_FILE = DOCS / "js" / "main.js"


def extract_tokens(text: str) -> set:
    """Collect every word-like token (alphanum, dash, underscore) from a file."""
    return set(re.findall(r"[\w-]+", text))


def remove_css_comments(css: str) -> str:
    return re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)


def parse_blocks(text: str):
    """Split CSS into top-level (pre, body) tuples using brace nesting."""
    blocks = []
    i = 0
    n = len(text)
    while i < n:
        brace = text.find("{", i)
        if brace == -1:
            break
        pre = text[i:brace]
        depth = 1
        j = brace + 1
        while j < n and depth > 0:
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
            j += 1
        body = text[brace + 1 : j - 1]
        blocks.append((pre, body))
        i = j
    return blocks


def keep_selector(selector: str, tokens: set) -> bool:
    """Return True if at least one class/id token in the selector matches the page tokens."""
    found = re.findall(r"[\.\#][\w-]+", selector)
    if not found:
        # tag-only, pseudo, universal, attribute selectors without classes -> keep to be safe
        return True
    for tok in found:
        name = tok[1:]
        # exact match or prefix match in either direction (source longer/shorter than CSS)
        if name in tokens:
            return True
        for t in tokens:
            if t.startswith(name) or name.startswith(t):
                return True
    return False


def keep_rule(pre: str, tokens: set) -> bool:
    selectors = [s.strip() for s in pre.split(",")]
    return any(keep_selector(sel, tokens) for sel in selectors)


def purge_css(css: str, html: str, js: str) -> str:
    """Drop rules whose classes/ids are not present in the page or JS."""
    tokens = extract_tokens(html) | extract_tokens(js)
    css = remove_css_comments(css)
    blocks = parse_blocks(css)
    out = []

    for pre, body in blocks:
        pre = pre.strip()
        if pre.startswith("@keyframes") or pre.startswith("@font-face") or pre.startswith("@import"):
            out.append(f"{pre}{{{body}}}")
            continue

        if pre.startswith("@media") or pre.startswith("@supports"):
            inner = parse_blocks(body)
            kept = []
            for p2, b2 in inner:
                p2 = p2.strip()
                if keep_rule(p2, tokens):
                    kept.append(f"{p2}{{{b2}}}")
            if kept:
                out.append(f"{pre}{{{''.join(kept)}}}")
            continue

        if keep_rule(pre, tokens):
            out.append(f"{pre}{{{body}}}")

    return "".join(out)


def minify_css(css: str) -> str:
    """Preserve quoted strings; remove comments; collapse whitespace safely."""
    css = remove_css_comments(css)
    out = []
    i = 0
    n = len(css)
    while i < n:
        c = css[i]
        if c in '"\'':
            quote = c
            out.append(c)
            i += 1
            while i < n:
                ch = css[i]
                out.append(ch)
                if ch == "\\" and i + 1 < n:
                    out.append(css[i + 1])
                    i += 2
                    continue
                if ch == quote:
                    i += 1
                    break
                i += 1
            continue

        if c.isspace():
            j = i
            while j < n and css[j].isspace():
                j += 1
            if out and j < n:
                prev = out[-1]
                nxt = css[j]
                keep = (
                    (prev.isalnum() or prev in "_-")
                    and (nxt.isalnum() or nxt in "_-")
                )
                # Preserve spaces that separate CSS selector tokens
                # (e.g. .parent .child, .parent .child, [attr] .child)
                if nxt in ".#[:" or prev in ".#])":
                    keep = True
                if keep:
                    out.append(" ")
            i = j
            continue

        out.append(c)
        i += 1

    text = "".join(out)
    # Remove spaces around structural punctuation that never needs surrounding space.
    text = re.sub(r"\s*([{}:;,])\s*", r"\1", text)
    # Remove spaces immediately inside parentheses.
    text = re.sub(r"\(\s*", "(", text)
    text = re.sub(r"\s*\)", ")", text)
    return text.strip()


def minify_js(js: str) -> str:
    """Preserve strings, template literals and regexes; strip comments; collapse whitespace."""
    out = []
    i = 0
    n = len(js)

    def last_nonspace():
        for k in range(len(out) - 1, -1, -1):
            if out[k] not in " \t\n\r":
                return out[k]
        return ""

    while i < n:
        c = js[i]

        # Strings and template literals
        if c in '"\'`':
            quote = c
            out.append(c)
            i += 1
            while i < n:
                ch = js[i]
                out.append(ch)
                if ch == "\\" and i + 1 < n:
                    out.append(js[i + 1])
                    i += 2
                    continue
                if ch == quote:
                    i += 1
                    break
                if quote == "`" and ch == "$" and i + 1 < n and js[i + 1] == "{":
                    # keep template interpolation verbatim up to matching }
                    out.append(js[i + 1])
                    i += 2
                    depth = 1
                    while i < n and depth > 0:
                        if js[i] == "{":
                            depth += 1
                        elif js[i] == "}":
                            depth -= 1
                        out.append(js[i])
                        i += 1
                    continue
                i += 1
            continue

        # Comments and regex
        if c == "/":
            if i + 1 < n and js[i + 1] == "/":
                while i < n and js[i] != "\n":
                    i += 1
                continue
            if i + 1 < n and js[i + 1] == "*":
                i += 2
                while i < n - 1 and not (js[i] == "*" and js[i + 1] == "/"):
                    i += 1
                i += 2
                continue
            # Possibly a regex literal
            prev = last_nonspace()
            regex_starters = "(,=:[!&|?{};~+-*/%<>"
            if prev in regex_starters or not prev:
                out.append(c)
                i += 1
                while i < n:
                    ch = js[i]
                    out.append(ch)
                    if ch == "\\" and i + 1 < n:
                        out.append(js[i + 1])
                        i += 2
                        continue
                    if ch == "/":
                        i += 1
                        while i < n and js[i] in "gimuy":
                            out.append(js[i])
                            i += 1
                        break
                    i += 1
                continue
            out.append(c)
            i += 1
            continue

        if c.isspace():
            j = i
            while j < n and js[j].isspace():
                j += 1
            if out and (
                (out[-1].isalnum() or out[-1] in "_$")
                and j < n
                and (js[j].isalnum() or js[j] in "_$" or js[j] in "(`[{")
            ):
                out.append(" ")
            i = j
            continue

        out.append(c)
        i += 1

    return "".join(out).strip()


def main():
    css = CSS_FILE.read_text(encoding="utf-8")
    js = JS_FILE.read_text(encoding="utf-8")

    # JS minify
    js_min = minify_js(js)
    (DOCS / "js" / "main.min.js").write_text(js_min, encoding="utf-8")
    print(f"wrote docs/js/main.min.js ({len(js_min)} bytes, -{len(js) - len(js_min)})")

    # Per-page CSS
    html_files = [p for p in DOCS.glob("*.html")]
    for html_file in html_files:
        html = html_file.read_text(encoding="utf-8")
        purged = purge_css(css, html, js)
        min_css = minify_css(purged)
        out_name = html_file.stem + ".min.css"
        out_path = DOCS / "css" / out_name
        out_path.write_text(min_css, encoding="utf-8")
        print(
            f"wrote {out_path.relative_to(ROOT)} ({len(min_css)} bytes, "
            f"original {len(css)}, purged {len(purged)})"
        )


if __name__ == "__main__":
    main()
