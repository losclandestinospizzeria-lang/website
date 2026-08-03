# AI Context — Los Clandestinos Website

Use this file when an AI assistant (Cursor, Windsurf, ChatGPT, Claude, etc.) needs to understand or modify the project.

---

## Project identity

- **Name:** Los Clandestinos Pizzería Italiana
- **Type:** Static bilingual marketing website for a restaurant
- **Location:** Calle Carboneros 5, La Línea de la Concepción, Cádiz, Spain
- **Domain:** `www.losclandestinospizzeria.es`
- **Domain registrar / DNS provider:** Hostinger
- **Hosted on:** GitHub Pages from the `main` branch `/docs` folder
- **Repo:** `https://github.com/Albertohd88/LosClandestinospizzeria`

---

## Architecture at a glance

| File | Responsibility |
|------|----------------|
| `docs/index.html` | Homepage: hero, about, dishes, cocktails, reviews, location, footer |
| `docs/productos.html` | Product/ingredients page: flours, olive oil, DOP cheeses, cured meats |
| `docs/css/base.css` | CSS reset, design tokens, brand colours, fluid type scale |
| `docs/css/style.css` | All components, layout and responsive styles |
| `docs/js/main.js` | Animations, language switcher, carousel, fallback logic, i18n dictionary |
| `docs/CNAME` | GitHub Pages custom domain |
| `docs/sitemap.xml` | Search-engine sitemap |
| `docs/robots.txt` | Crawler instructions |
| `docs/images/web/` | Optimized images served by the website |
| `docs/images/` | Original / non-optimised image assets (not referenced by the site) |
| `docs2/` | Project documentation: analytics plan, Lighthouse baseline |
| `README.md` / `AI_CONTEXT.md` / `CONTRIBUTING.md` | Root documentation for humans and AI assistants |

No build step. No package manager. No framework.

---

## Tech stack

- **HTML5** semantic markup
- **CSS3** with custom properties
- **Vanilla JavaScript** (ES6+)
- **GSAP 3 + ScrollTrigger** loaded from jsDelivr CDN
- **Google Fonts:** Work Sans, Bebas Neue
- **Google Maps** embed
- **Hosting:** GitHub Pages + custom domain via `docs/CNAME` (root `CNAME` kept as reference)

---

## Rules for AI edits

### Do not break the stack

- Do **not** introduce React, Vue, Svelte, Angular, Next.js, Nuxt, etc.
- Do **not** add a build tool (Webpack, Vite, Parcel, etc.) unless explicitly requested.
- Do **not** add a CSS preprocessor unless explicitly requested.
- Do **not** move files into a different folder structure unless asked.

### Account for GitHub Pages hosting

- Treat `docs/` as the production web root: files outside it are not published by GitHub Pages.
- Keep production features fully static and browser-side. GitHub Pages cannot run server-side code, application servers, databases or private runtime environment variables.
- HTTP response headers such as `X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options` and `Referrer-Policy` cannot be configured on plain GitHub Pages. The current best available countermeasures are the existing `<meta http-equiv="Content-Security-Policy">` and `<meta name="referrer" content="strict-origin-when-cross-origin">` tags in `docs/*.html`.
- Use URLs and asset paths that work when served by GitHub Pages through the custom domain, including its case-sensitive file paths.
- Remember that pushing changes to `main` publishes the affected files in `docs/` to the live website automatically.

### Preserve the brand

- Brand colours are CSS custom properties in `docs/css/base.css`:
  - `--red: #C8202A`
  - `--cream: #F2EAD8`
  - `--green: #2D7A3A`
  - `--black: #0F0F0E`
- Display font is `Bebas Neue`; body font is `Work Sans`.
- Keep the bilingual Spanish/English support.

### Preserve animations and fallbacks

- GSAP animations live in `docs/js/main.js` inside functions such as `initPizzaOrbit()`, `initWordSwitcher()`, `initProductSection()`.
- Always keep a non-GSAP fallback or graceful degradation.
- Respect `prefers-reduced-motion`.

### Preserve i18n

- Translatable elements have a `data-i18n="key"` attribute.
- Translations live in the `i18n` object in `docs/js/main.js`.
- If you change text in `docs/*.html`, also update both `i18n.es` and `i18n.en` in `docs/js/main.js` unless the change is language-specific.
- HTML values with `<br>` or other markup should remain in the corresponding translation value.

### Keep SEO / accessibility intact

- Do **not** remove the JSON-LD, Open Graph, canonical, sitemap, or `docs/robots.txt` files.
- Maintain `aria-label`, `role` and `sr-only` patterns.
- Keep image `alt` attributes descriptive and locally relevant.

### External links and contact details

- Phone number: `+34 856 94 12 95`
- Address: `Calle Carboneros 5, La Línea de la Concepción, 11300 Cádiz, España`
- Online ordering: `https://www.losclandestinos.turbopos.es/`
- Instagram: `https://www.instagram.com/losclandestinospizzeria/`
- Facebook: `https://www.facebook.com/p/Los-Clandestinos-Pizzeria-Italiana-100057105144302/`
- Google Maps: `https://www.google.com/maps/place/Pizzeria+Los+Clandestinos/@36.1606325,-5.3491208,17z`

When any of these change, update every occurrence across `docs/index.html`, `docs/productos.html`, `docs/js/main.js` and the JSON-LD block.

---

## Common AI tasks

### Change opening hours

- Update `docs/data/horarios.json`:
  - `weekly`: object with fixed keys `monday`…`sunday`, each with four fields: `lunch_start`, `lunch_end`, `dinner_start`, `dinner_end` (24h strings, e.g. `"12:30"`). Empty string = closed.
  - `schemaLd`: reference copy of the Schema.org `openingHoursSpecification` for Google.
- The site combines the two 24h strings into a range (e.g. `"12:30–15:30"`), translates day names, and converts 24h times to 12h for English automatically.
- Keep the fallback paragraph in `docs/index.html` and `docs/productos.html` in sync with the JSON (used when JS/fetch fails).
- Update the static `openingHoursSpecification` JSON-LD in `docs/index.html` whenever the effective hours change.
- Exceptions/holidays are no longer managed dynamically; update the weekly JSON directly or the static JSON-LD.

### Change phone number

- Search `docs/` for the old number.
- Update visible text, `tel:` links and JSON-LD `telephone` in `docs/index.html`, `docs/productos.html` and `docs/js/main.js`.

### Change address or map

- Update address text in both `docs/*.html` files.
- Update the Google Maps iframe `src` and Google Maps link.
- Update JSON-LD `address`, `geo` and `hasMap` in `docs/index.html`.

### Add/change menu item

- Edit the relevant `.product-row` in `docs/index.html`.
- Update the matching `prod-*` keys in `i18n.es` and `i18n.en` in `docs/js/main.js`.
- Add/replace the image in `docs/images/web/` and update the `src`.

### Add/change ingredient on product page

- Edit the relevant `.product-row` in `docs/productos.html`.
- Update the matching `prod-p*` keys in `i18n.es` and `i18n.en` in `docs/js/main.js`.

### Add a new language

- Duplicate the `i18n.en` object in `docs/js/main.js` with a new key (for example `fr`).
- Add a new language button in the `<nav>` of every `docs/*.html` page.
- Update `og:locale` and `html lang` logic if needed.

### Change the custom domain

- Edit `docs/CNAME` (and the root `CNAME` if kept for reference).
- Update canonical links, Open Graph URLs, JSON-LD URLs and `docs/sitemap.xml`.
- Update DNS records.

---

## Agent automation

For automated (Hermes) workflows, see:

- [`AGENT.md`](AGENT.md) — agent identity, constraints and PR conventions.
- [`SKILLS.md`](SKILLS.md) — step-by-step procedures the agent follows for timetable and news updates.

---

## Deployment context

- Pushing to `main` triggers GitHub Pages to rebuild and redeploy from the `/docs` folder.
- The `docs/CNAME` file maps the custom domain.
- The domain and its DNS records are managed in Hostinger.
- DNS must point to GitHub Pages:
  - Apex domain A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `www` CNAME: `<owner>.github.io`

## Ownership migration reminder

If the repository is transferred to another GitHub account or organisation:

1. Transfer ownership in GitHub settings.
2. Re-enable Pages from `main` in the new account.
3. Update DNS if the owner changed.
4. Search the whole repo for the old owner name and old domain, then update all references.
5. Verify the live site and submit a new sitemap if the domain changed.

For full details, see `README.md` → *Transferring repository ownership* and `CONTRIBUTING.md`.
