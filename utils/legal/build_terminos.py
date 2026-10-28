#!/usr/bin/env python3
"""
Build docs/terminos.html from tec.md (single source of truth for the legal text).

Usage:
    python3 utils/legal/build_terminos.py           # regenerate docs/terminos.html
    python3 utils/legal/build_terminos.py --check   # exit 1 if the HTML is out of sync

See docs2/adr/0001-terms-single-source.md.
"""

import argparse
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "tec.md"
TARGET = ROOT / "docs" / "terminos.html"
INDEX = ROOT / "docs" / "index.html"

TEMPLATE = '''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Términos y Condiciones | Los Clandestinos</title>
  <meta name="description" content="Términos y condiciones de contratación de Los Clandestinos Pizzería Italiana: pedidos, pagos, envíos, devoluciones, protección de datos y atención al cliente.">
  <link rel="canonical" href="https://www.losclandestinospizzeria.es/terminos.html">
  <link rel="icon" href="images/web/favicon-96.png" type="image/png" sizes="95x95">
  <link rel="shortcut icon" href="images/web/favicon.ico" type="image/x-icon">
  <meta name="theme-color" content="#C8202A">
  {csp}
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="Términos y Condiciones — Los Clandestinos">
  <meta property="og:description" content="Condiciones de contratación, envío, devoluciones y protección de datos de Los Clandestinos Pizzería Italiana.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.losclandestinospizzeria.es/terminos.html">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="Los Clandestinos Pizzería Italiana">
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/base.css">
  <style>
    body{{font-family:var(--font-body,'Work Sans','Helvetica Neue',sans-serif);background:var(--black);color:var(--cream);line-height:1.7;font-size:var(--text-base);}}
    .legal-header{{background:var(--red);display:flex;justify-content:center;padding:var(--space-4) var(--space-8);}}
    .legal-header img{{width:90px;height:auto;display:block;}}
    .legal{{max-width:820px;margin:0 auto;padding:var(--space-12) var(--space-6) var(--space-24);}}
    .legal__back{{display:inline-block;color:var(--cream);opacity:.75;font-size:var(--text-sm);text-underline-offset:3px;padding:.6rem 0;}}
    .legal__back:hover,.legal__back:focus-visible{{opacity:1;}}
    .legal h1{{font-family:var(--font-display,'Bebas Neue','Impact',sans-serif);font-weight:400;font-size:var(--text-xl);letter-spacing:.04em;line-height:1.05;color:var(--white);margin:var(--space-4) 0 var(--space-2);}}
    .legal__updated{{font-size:var(--text-sm);color:rgba(242,234,216,.6);margin-bottom:var(--space-8);}}
    .legal h2{{font-family:var(--font-display,'Bebas Neue','Impact',sans-serif);font-weight:400;font-size:var(--text-lg);letter-spacing:.05em;line-height:1.15;color:var(--cream);margin:var(--space-12) 0 var(--space-4);padding-top:var(--space-4);border-top:1px solid rgba(242,234,216,.12);scroll-margin-top:var(--space-4);}}
    .legal p,.legal ul,.legal ol{{margin-bottom:var(--space-4);color:rgba(242,234,216,.88);}}
    .legal ul,.legal ol{{padding-left:1.4rem;}}
    .legal li{{margin-bottom:.4rem;padding-left:.2rem;}}
    .legal li::marker{{color:var(--red);}}
    .legal strong{{color:var(--white);font-weight:600;}}
    .legal a{{color:var(--cream);}}
    .legal a:focus-visible,.legal-header a:focus-visible{{outline:3px solid var(--green-mid);outline-offset:3px;}}
    .legal-footer{{text-align:center;padding:1.5rem 2rem;border-top:1px solid rgba(242,234,216,.08);font-size:.72rem;letter-spacing:.08em;color:rgba(237,228,211,.72);}}
  </style>
</head>
<body>
  <header class="legal-header">
    <a href="/" aria-label="Los Clandestinos — Inicio">
      <img src="images/web/logo-white.svg" alt="Los Clandestinos Pizzería Italiana" width="317" height="245" />
    </a>
  </header>

  <main class="legal">
    <a href="/" class="legal__back">&larr; Volver al inicio</a>
    <h1>{title}</h1>
    <p class="legal__updated">{updated}</p>
{body}
  </main>

  <footer class="legal-footer">
    © 2026 Los Clandestinos Pizzería Italiana &nbsp;·&nbsp; Calle Carboneros 5, La Línea
  </footer>
</body>
</html>
'''


def inline(text: str) -> str:
    text = html.escape(text, quote=False)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


def render_body(lines):
    out, title, updated, list_tag = [], "", "", None

    def close_list():
        nonlocal list_tag
        if list_tag:
            out.append(f"    </{list_tag}>")
            list_tag = None

    for raw in lines:
        line = raw.strip()
        if not line:
            close_list()
        elif line.startswith("### "):
            close_list()
            text = line[4:]
            if not title:
                title = text
                continue
            num = re.match(r"(\d+)\.\s", text)
            if not num:
                raise SystemExit(f"Section heading without number: {text!r}")
            out.append(f'    <h2 id="s{num.group(1)}">{inline(text)}</h2>')
        elif line.startswith("Última actualización:"):
            updated = line
        elif line.startswith("- "):
            if list_tag != "ul":
                close_list()
                out.append("    <ul>")
                list_tag = "ul"
            out.append(f"      <li>{inline(line[2:])}</li>")
        elif re.match(r"\d+\.\s", line):
            if list_tag != "ol":
                close_list()
                out.append("    <ol>")
                list_tag = "ol"
            out.append(f"      <li>{inline(re.sub(r'^\d+\.\s+', '', line))}</li>")
        else:
            close_list()
            out.append(f"    <p>{inline(line)}</p>")
    close_list()
    return title, updated, "\n".join(out)


def build() -> str:
    title, updated, body = render_body(SOURCE.read_text(encoding="utf-8").splitlines())
    csp = re.search(r'<meta http-equiv="Content-Security-Policy"[^>]*>', INDEX.read_text(encoding="utf-8"))
    if not (title and updated and csp):
        raise SystemExit("Missing title, 'Última actualización:' line or CSP meta in index.html.")
    return TEMPLATE.format(csp=csp.group(0), title=html.escape(title), updated=html.escape(updated), body=body)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate docs/terminos.html from tec.md")
    parser.add_argument("--check", action="store_true", help="Only verify that the HTML matches tec.md.")
    args = parser.parse_args()

    new = build()
    current = TARGET.read_text(encoding="utf-8") if TARGET.exists() else ""
    if args.check:
        if new != current:
            print("docs/terminos.html is out of sync with tec.md. Run: python3 utils/legal/build_terminos.py")
            return 1
        print("docs/terminos.html is in sync with tec.md")
        return 0
    if new == current:
        print("unchanged docs/terminos.html")
    else:
        TARGET.write_text(new, encoding="utf-8")
        print("updated docs/terminos.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
