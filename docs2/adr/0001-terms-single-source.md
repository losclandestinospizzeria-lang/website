# ADR 0001 — `tec.md` is the single source of truth for the Terms and Conditions

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

The legal text (Términos y Condiciones de Contratación) is edited and reviewed as Markdown in `tec.md`, but the website serves it as `docs/terminos.html`, linked from the footer of every page.

Keeping two hand-edited copies caused drift almost immediately: the clause 3 wording and the allergen list changed in one file and not in the other. For legal text, a published page that differs from the reviewed text is a real risk.

The site is static (GitHub Pages, no build step in production), so the HTML must be committed, and only `docs/` is published.

## Decision

1. **`tec.md` (repo root) is the only file edited by hand.** It is not published (it lives outside `docs/`).
2. **`docs/terminos.html` is generated** by `utils/legal/build_terminos.py` and committed. Do not edit it by hand.
3. The script is dependency-free (Python stdlib only) and deterministic. It holds the page template (head, CSP copied from `docs/index.html`, inline styles) and converts the Markdown subset used in `tec.md`:
   - first `###` heading becomes `<h1>`; later `### N. Title` headings become `<h2 id="sN">`
   - `Última actualización: ...` line becomes the "last updated" paragraph
   - `- ` lists become `<ul>`, `1. ` lists become `<ol>`, `**bold**` becomes `<strong>`, other lines become `<p>`
4. **Workflow for any change to the terms:**
   ```bash
   # 1. edit tec.md (and update the "Última actualización" date)
   python3 utils/legal/build_terminos.py          # regenerate docs/terminos.html
   python3 utils/legal/build_terminos.py --check  # exit 1 if HTML and tec.md differ
   # 2. commit tec.md and docs/terminos.html together
   ```
5. Section headings must keep the `### N. Title` format; the script fails otherwise. Other Markdown features (tables, links, nested lists, italics) are not supported; extend the script before using them.

## Consequences

- One place to edit; the HTML can always be reproduced from `tec.md`.
- `--check` gives a cheap guard to run before every commit/push (or in CI / a git hook if one is added later).
- A change to the page layout means editing the template inside the script, not the HTML.
- `terminos.html` is Spanish only. Translating it would need a second source file and an extension of this ADR.

## Alternatives considered

- **Hand-edit both files:** what we had; it drifted.
- **Render `tec.md` in the browser with a JS Markdown library:** adds a dependency and a runtime fetch, hurts SEO, and conflicts with the "no framework, no build" rules in `AI_CONTEXT.md`.
- **Make `docs/terminos.html` the source and drop `tec.md`:** the Markdown is the format used for review and sharing; editing HTML by hand is error-prone.
