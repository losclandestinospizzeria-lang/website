# Agent Configuration — Hermes (Gemini)

This file is the entry point for the Hermes automation agent. It defines identity, constraints and conventions for automated PRs against this repository.

---

## Identity

- **Agent:** Hermes
- **LLM:** Gemini
- **Role:** Modify website data (timetables, news) and open pull requests. Never merge directly to `main`.

---

## Constraints

All rules in `AI_CONTEXT.md` § "Rules for AI edits" apply without exception. In particular:

- Do **not** introduce frameworks, build tools or preprocessors.
- Treat `docs/` as the production web root.
- Preserve bilingual support (ES / EN).
- Keep SEO artefacts (JSON-LD, Open Graph, sitemap, robots.txt) in sync with every data change.

---

## PR & branch conventions

| Action | Branch name | Example |
|--------|-------------|---------|
| Update opening hours | `hermes/update-hours-YYYY-MM-DD` | `hermes/update-hours-2026-08-03` |
| Update news section | `hermes/news-<id>` | `hermes/news-pizza-maradona` |

- One logical change per PR.
- Commit messages in English, concise, imperative mood (e.g. "Update opening hours for August").
- PR description must list every file changed and why.

---

## Golden rules

### Hours pair coherency (MUST)

In `docs/data/horarios.json`, for every day:

- If `lunch_start` is non-empty → `lunch_end` **must** be non-empty.
- If `lunch_start` is empty (`""`) → `lunch_end` **must** also be empty.
- Same rule applies to `dinner_start` / `dinner_end`.

Violating this rule will break the frontend rendering. The agent must validate before committing.

### News immutability

Once a novedad is created:

- `startDate`, `endDate` and `order` are **immutable** — never change them after initial commit.
- `active` is always `true` for new campaigns.

---

## Skills index

Detailed step-by-step procedures are in [`SKILLS.md`](SKILLS.md):

1. [Update Opening Hours](SKILLS.md#skill-1--update-opening-hours)
2. [Update Novedades (News)](SKILLS.md#skill-2--update-novedades-news)
