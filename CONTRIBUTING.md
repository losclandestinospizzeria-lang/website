# Contributing to Los Clandestinos Website

This guide explains how to set up the project locally, make safe edits and keep the site maintainable. The project is intentionally simple: static HTML, CSS and vanilla JavaScript. No build tools or frameworks are required.

---

## Table of contents

- [Getting started](#getting-started)
- [Project conventions](#project-conventions)
- [Common tasks](#common-tasks)
  - [Update opening hours](#update-opening-hours)
  - [Update the phone number](#update-the-phone-number)
  - [Update the address or map](#update-the-address-or-map)
  - [Edit or add translations](#edit-or-add-translations)
  - [Update menu / featured dishes](#update-menu--featured-dishes)
  - [Update product page ingredients](#update-product-page-ingredients)
  - [Add or replace images](#add-or-replace-images)
- [Commit and pull request guidelines](#commit-and-pull-request-guidelines)
- [Deployment](#deployment)

---

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/Albertohd88/LosClandestinospizzeria.git
   cd LosClandestinospizzeria
   ```

2. Start a local HTTP server:

   ```bash
   python3 -m http.server 8000
   ```

   Then open `http://localhost:8000/docs/`.

3. Edit files with any code editor. There is no build step — refreshing the browser shows the result immediately.

---

## Project conventions

### Keep it static

- Do **not** add a JavaScript framework (React, Vue, Svelte, etc.).
- Do **not** add a CSS preprocessor unless the whole team agrees. Plain CSS with custom properties is enough.
- Do **not** add a build tool unless it solves a real problem.

### CSS

- Brand tokens live in `docs/css/base.css` (`--red`, `--cream`, `--green`, etc.).
- Component styles live in `docs/css/style.css`.
- Use existing CSS custom properties for colours and spacing before adding new values.
- Keep mobile breakpoints around `900px` consistent with the rest of the site.

### JavaScript

- All interactivity is in `docs/js/main.js`.
- Keep animations optional: GSAP is loaded from a CDN, but every feature has a fallback or degrades gracefully.
- Preserve the `i18n` object structure when editing translations (see below).

### Images

- Optimised website images live in `docs/images/web/`.
- Original / non-optimised assets are kept in `docs/images/` for reference but are not served.
- Prefer WebP for website photos.
- Always add an `alt` attribute. Keep it descriptive and, when relevant, mention “Los Clandestinos, La Línea de la Concepción” for local SEO.
- Use `loading="lazy"` for images below the fold.
- When replacing a website image, generate the required 480/768 variants in `docs/images/web/` and update the `srcset` in the corresponding `docs/*.html`.

### Accessibility

- Maintain existing `aria-label`, `role` and `sr-only` patterns.
- Add keyboard support for any new interactive element.
- Respect `prefers-reduced-motion`.

---

## Common tasks

### Update opening hours

1. Open `docs/index.html` and `docs/productos.html`.
2. Find the location section and update the hours text.
3. Update the same text in `docs/js/main.js` inside the `i18n.es['loc-hours-text']` and `i18n.en['loc-hours-text']` keys.
4. Update the JSON-LD `openingHoursSpecification` block in `docs/index.html`.
5. Update `i18n.es['footer-wed-sun']` and `i18n.en['footer-wed-sun']` if the footer text still exists.

### Update the phone number

1. Search `docs/` for the old number.
2. Update:
   - `tel:` links in `docs/index.html` and `docs/productos.html`.
   - The visible phone number text.
   - The JSON-LD `telephone` field in `docs/index.html`.

### Update the address or map

1. Edit the address text in both `docs/*.html` files and in `i18n[lang]['loc-addr-label']` in `docs/js/main.js` (labels) if needed.
2. Generate a new Google Maps embed URL and update the `<iframe>` `src`.
3. Update `geo` coordinates and `address` in the JSON-LD block in `docs/index.html`.
4. Update `docs/sitemap.xml` only if the page URL changes.

### Edit or add translations

Translations are stored in `docs/js/main.js` inside the `i18n` object.

```javascript
const i18n = {
  es: { /* Spanish strings */ },
  en: { /* English strings */ },
};
```

Rules:

- Every translatable element in HTML has a `data-i18n="key"` attribute.
- The JavaScript `setLang()` function reads that key and replaces the element content.
- If a translation value contains HTML (for example `<br>`), use `innerHTML`; otherwise use `textContent`.
- Keep keys identical between Spanish and English objects. If a key is missing, the element keeps its original HTML text.
- To add a new language, add a new top-level key (for example `fr`) and duplicate the object. You must also add a new language button in the navigation of each HTML file.

### Publish a Novedad

1. Add up to two optimised local images to `docs/images/web/`.
2. Add an item to `docs/data/novedades.json` following the schema documented in the README.
3. Provide both `content.es` and `content.en`, including localized image alt text.
4. Use inclusive ISO `startDate` and `endDate` values, or `null` when no boundary is needed.
5. Test before, during and after the configured date range and in both languages.

### Analytics

Analytics is intentionally disabled. Do not add tracking attributes or external analytics scripts ad hoc. Any future reimplementation must follow `docs2/analytics-reimplementation.md`, including privacy review, event naming and verification on both public pages.

### Update menu / featured dishes

1. Open `docs/index.html`.
2. Edit the `.product-row` blocks inside `#products`.
3. If the text is translated, update the matching keys in `docs/js/main.js` (`prod-1-desc`, `prod-2-desc`, etc.).
4. Replace the image file in `docs/images/web/` and update the `src` / `srcset`.

### Update product page ingredients

1. Open `docs/productos.html`.
2. Edit the `.product-row` blocks inside `#products`.
3. Update the matching keys in `docs/js/main.js` under the `prod-p1-*`, `prod-p2-*`, etc. keys.
4. Replace images in `docs/images/web/` if needed.

### Add or replace images

1. Put the optimised image file in `docs/images/web/`.
2. Update the `<img src="images/web/...">` reference in the relevant `docs/*.html`.
3. Add a descriptive `alt` attribute.
4. If the image is a fallback candidate (hero pizza, wood board, etc.), consider adding a CSS gradient fallback in `initFallbackImages()` inside `docs/js/main.js`.

---

## Commit and pull request guidelines

- Write clear, concise commit messages in English, for example:
  - `Update opening hours for summer`
  - `Replace hero images with new photos`
  - `Fix language switcher on product page`
- One logical change per pull request.
- Test the site locally at desktop and mobile widths before opening a PR.
- If the change affects SEO (titles, descriptions, canonical URLs, structured data), mention it in the PR description.

---

## Deployment

The site deploys automatically via GitHub Pages from the `main` branch `/docs` folder. After a merge or direct push:

1. GitHub starts a *Pages build and deployment* workflow.
2. Check **Actions → Pages build and deployment** for the green checkmark.
3. Visit `https://www.losclandestinospizzeria.es/` and hard-refresh (`Ctrl/Cmd + Shift + R`) to verify.

If you change the custom domain, also edit the `docs/CNAME` file and update DNS records. See the **Transferring repository ownership** section in `README.md` for a complete migration checklist.
