# Agent Skills

Step-by-step procedures for the Hermes agent. Each skill is a complete checklist — the agent must execute **every** step before opening a PR.

---

## Skill 1 — Update Opening Hours

**Trigger:** User asks to change the restaurant timetable.

### Pre-flight validation

Before writing any file, verify:

- Every day object has exactly four keys: `lunch_start`, `lunch_end`, `dinner_start`, `dinner_end`.
- **Pair rule:** if `*_start` is non-empty, the matching `*_end` must be non-empty. If `*_start` is `""`, the matching `*_end` must also be `""`.
- Times use 24-hour `HH:MM` format (e.g. `"19:30"`).

### Steps

1. **Edit `docs/data/horarios.json`** — update the `weekly` object with the new schedule.

2. **Regenerate JSON-LD `openingHoursSpecification`** in `docs/index.html` (inside the `<script type="application/ld+json">` block, around line 65).
   - Group consecutive days sharing identical open/close times into a single `OpeningHoursSpecification`.
   - Use Schema.org English capitalised day names: `Monday`, `Tuesday`, …, `Sunday`.
   - If a day has both lunch and dinner, emit two separate specs for that group.
   - Omit days that are fully closed (all four fields empty).

   Example with lunch + dinner:
   ```json
   { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday", "Sunday"], "opens": "12:30", "closes": "15:30" },
   { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "19:30", "closes": "23:30" }
   ```

3. **Update fallback paragraph** (`data-i18n="loc-hours-text"`) in both:
   - `docs/index.html`
   - `docs/productos.html`

   Format pattern (Spanish): `Lun: Cerrado<br>Mar–Dom: 19:30–23:30`
   Adapt to actual schedule; group days with identical hours using en-dash ranges.

4. **Update footer i18n keys** in `docs/js/main.js`:
   - `i18n.es['footer-mon-tue']` — closed days summary (e.g. `"Lun: Cerrado"`)
   - `i18n.es['footer-wed-sun']` — open days summary (e.g. `"Mar–Dom: 19:30–23:30"`)
   - `i18n.en['footer-mon-tue']` — English equivalent (e.g. `"Mon: Closed"`)
   - `i18n.en['footer-wed-sun']` — English equivalent (e.g. `"Tue–Sun: 7:30–11:30 pm"`)

5. **Update `loc-hours-text` i18n** values if they exist in `docs/js/main.js` (fallback for JS-off visitors).

6. **Create branch** `hermes/update-hours-YYYY-MM-DD` and open PR.

---

## Skill 2 — Update Novedades (News)

**Trigger:** User provides an idea/text and 1–2 photos for a new or updated news entry.

### Interactive phase (before any code change)

The agent must propose and get user confirmation for:

| Field | Notes |
|-------|-------|
| `id` | Lowercase, kebab-case, descriptive (e.g. `pizza-maradona`) |
| `title` (es + en) | Short, catchy |
| `subtitle` (es + en) | One line, contextual |
| `description` (es + en) | 1–3 sentences |
| `alt` text per image (es + en) | Descriptive, locally relevant, mention "Los Clandestinos" when natural |
| CTA active/inactive | **Always ask the user** |

Immutable fields (user provides once):
- `startDate`, `endDate` (ISO `YYYY-MM-DD`)
- `order` (integer, lower = shown first)

Always set:
- `active`: `true`

### Image processing

Run from the repo root with the `utils/imageChanger/` virtualenv active.

For each provided photo (1 or 2), produce two responsive variants:

```bash
# 480px variant
python utils/imageChanger/convert_to_webp.py --quality 75 --max-width 480 <source_file>

# 768px variant
python utils/imageChanger/convert_to_webp.py --quality 75 --max-width 768 <source_file>
```

Naming convention for outputs: `<id><N>-480.webp` and `<id><N>-768.webp` where N is `1` or `2`.

Move/rename the outputs to `docs/images/web/`.

Record the **width × height** of the 768-variant (use `python utils/imageChanger/inspect_image.py <file>` or read from Pillow output).

### JSON entry

Add or update the entry in `docs/data/novedades.json` following this template:

```json
{
  "id": "<id>",
  "active": true,
  "startDate": "<YYYY-MM-DD>",
  "endDate": "<YYYY-MM-DD>",
  "order": <int>,
  "images": [
    {
      "src": "images/web/<id>1-480.webp",
      "srcset": "images/web/<id>1-480.webp 480w, images/web/<id>1-768.webp 768w",
      "sizes": "(max-width: 900px) calc(100vw - 3rem), 420px",
      "width": <768_variant_width>,
      "height": <768_variant_height>,
      "alt": {
        "es": "<alt_es>",
        "en": "<alt_en>"
      }
    }
  ],
  "content": {
    "es": {
      "title": "<title_es>",
      "subtitle": "<subtitle_es>",
      "description": "<description_es>"
    },
    "en": {
      "title": "<title_en>",
      "subtitle": "<subtitle_en>",
      "description": "<description_en>"
    }
  },
  "cta": {
    "active": <true|false>,
    "url": "https://losclandestinos.turbopos.es/",
    "label": {
      "es": "Haz tu pedido",
      "en": "Order now"
    }
  }
}
```

If two images are provided, add a second object to the `images` array with the same structure using `<id>2-480.webp` / `<id>2-768.webp`.

### SEO coherency

- News items are rendered dynamically by `docs/js/main.js` — no static HTML or additional JSON-LD is required.
- Alt texts must be descriptive and mention "Los Clandestinos, La Línea de la Concepción" when natural (per `CONTRIBUTING.md`).
- No changes to `sitemap.xml` or `robots.txt` are needed for news updates.

### Branch & PR

Create branch `hermes/news-<id>` and open PR. PR description should include a preview of the proposed content in both languages.
