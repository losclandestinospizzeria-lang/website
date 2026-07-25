# Los Clandestinos Pizzería Italiana — Website

A static, bilingual (Spanish / English) marketing website for **Los Clandestinos**, an Italian pizzeria in La Línea de la Concepción, Cádiz, Spain.

The site is intentionally simple: plain HTML, CSS and vanilla JavaScript. It is deployed as a static site via **GitHub Pages** and served from a custom domain.

---

## Table of contents

- [Live site](#live-site)
- [Project overview](#project-overview)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Run locally](#run-locally)
- [How it is deployed](#how-it-is-deployed)
- [Transferring repository ownership](#transferring-repository-ownership)
- [SEO & accessibility notes](#seo--accessibility-notes)
- [Credits & license](#credits--license)

---

## Live site

- **Custom domain:** `https://www.losclandestinospizzeria.es/`
- **GitHub repository:** `https://github.com/Albertohd88/LosClandestinospizzeria`
- **Online ordering (external):** `https://losclandestinos.turbopos.es/`

---

## Project overview

Los Clandestinos is an artisan pizzeria near Gibraltar. The website presents:

- A full-screen animated hero with rotating pizza images.
- An “about” story section.
- Featured dishes (Saltimbocca, lasagne, cheese board, cannoli).
- Cocktail bar menu.
- Customer ratings / social proof.
- Location, opening hours, phone, Instagram and Google Maps.
- A dedicated product page (`productos.html`) showcasing imported Italian ingredients.

All text content is bilingual. The language switcher lives in the top navigation and stores the user's preference in `localStorage`.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Markup | Plain HTML5 (`index.html`, `productos.html`) |
| Styling | CSS3 with custom properties (`css/base.css`, `css/style.css`) |
| Fonts | Google Fonts: Work Sans, Bebas Neue |
| Animation | GSAP 3 + ScrollTrigger (loaded from CDN) |
| Interactivity | Vanilla JavaScript (`js/main.js`) |
| Hosting | GitHub Pages |
| Custom domain | `CNAME` file + DNS records |

No build step, no framework, no package manager. This keeps the project easy to maintain and cheap to host.

---

## Folder structure

```
LosClandestinospizzeria/
├── index.html              # Homepage
├── productos.html          # Ingredients / products page
├── CNAME                   # GitHub Pages custom domain
├── robots.txt              # Search crawler instructions
├── sitemap.xml             # Sitemap for search engines
├── css/
│   ├── base.css            # CSS reset, tokens, brand colours
│   └── style.css           # All component and layout styles
├── js/
│   └── main.js             # Animations, language switcher, carousel, fallbacks
└── images/                 # Photos, logos, favicons
```

### Key files explained

- **`index.html`** — landing page with hero, about, dishes, cocktails, reviews, location and footer.
- **`productos.html`** — product/ingredients page (flours, olive oil, DOP cheeses, cured meats).
- **`js/main.js`** — contains all interactivity and the bilingual `i18n` dictionary.
- **`css/base.css`** — CSS custom properties for colours, typography and spacing.
- **`css/style.css`** — all layout, component and responsive styles.
- **`CNAME`** — tells GitHub Pages which custom domain to serve (`www.losclandestinospizzeria.es`).
- **`sitemap.xml`** — list of public URLs for search engines.
- **`robots.txt`** — allows all crawlers and points to the sitemap.

The pages load only `css/style.css` and `js/main.js`. The similarly named `style.css` and `main.js` files in the repository root are legacy copies and are not authoritative; do not edit them for website changes.

---

## Run locally

The recommended setup uses Python's standard library, so the virtual environment has no packages to install.

```bash
python3 -m venv .venv
source .venv/bin/activate
python scripts/serve.py
```

Then open `http://127.0.0.1:8000`. Use `Ctrl+C` to stop the server. The host and port can be changed when needed:

```bash
python scripts/serve.py --host 0.0.0.0 --port 8080
```

Avoid opening the HTML files directly with `file://` because browser security rules differ from an HTTP server.

### Run Lighthouse locally

Keep the Python server running and execute Lighthouse from another terminal. The first run can ask `npx` to download the Lighthouse CLI.

```bash
npx --yes lighthouse http://127.0.0.1:8000/ --output html --output-path /tmp/los-clandestinos-lighthouse-mobile.html --chrome-flags="--headless"
npx --yes lighthouse http://127.0.0.1:8000/ --preset desktop --output html --output-path /tmp/los-clandestinos-lighthouse-desktop.html --chrome-flags="--headless"
```

The generated reports stay outside the repository in `/tmp`.

## Manage Novedades

Homepage news is stored in `data/novedades.json`. The section stays hidden when the array is empty or no item is valid for the current local date.

```json
[
  {
    "id": "summer-special",
    "active": true,
    "startDate": "2026-07-01",
    "endDate": "2026-08-31",
    "order": 10,
    "images": [
      {
        "src": "images/example.jpg",
        "alt": {
          "es": "Descripción de la imagen",
          "en": "Image description"
        }
      }
    ],
    "content": {
      "es": {
        "title": "Título",
        "subtitle": "Subtítulo",
        "description": "Descripción"
      },
      "en": {
        "title": "Title",
        "subtitle": "Subtitle",
        "description": "Description"
      }
    },
    "cta": {
      "active": true,
      "url": "https://example.com/",
      "label": {
        "es": "Más información",
        "en": "Learn more"
      }
    }
  }
]
```

Use ISO dates in `YYYY-MM-DD` format. Both date boundaries are inclusive and use the visitor's local date. Set either date to `null` for no boundary. Each item accepts zero, one or two images; `cta` is optional. Set the item-level `active` to `false` to hide the whole item. Set `cta.active` independently to `true` or `false` to show or hide only its button.

## Analytics

Analytics tracking is intentionally disabled: the site does not load Umami and does not attach analytics event attributes to TurboPOS or telephone links. See [`docs/analytics-reimplementation.md`](docs/analytics-reimplementation.md) for the reviewed event matrix, privacy requirements and reimplementation checklist.

---

## How it is deployed

The site is deployed with **GitHub Pages**:

1. The repository `Albertohd88/LosClandestinospizzeria` is public on GitHub.
2. In **Settings → Pages**, the source is set to deploy from the `main` branch (root folder `/`).
3. GitHub builds and serves the static files at a `*.github.io` URL.
4. The **`CNAME`** file in the repository root contains `www.losclandestinospizzeria.es`, so GitHub Pages serves the site from that custom domain.
5. The domain registrar has DNS records pointing to GitHub Pages:
   - **A records** for the apex domain (if used): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **CNAME record** for `www`: `<user>.github.io` (or the organisation name)

When you push to `main`, GitHub Pages automatically redeploys the site (usually within a minute).

### How to verify the current setup

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Check the source branch and the published URL.
4. Look for the green checkmark in **Actions → Pages build and deployment** to confirm the last build succeeded.

---

## Transferring repository ownership

To move the project from one GitHub account (or organisation) to another, follow these steps. The goal is to keep the existing custom domain working or to switch to a new one cleanly.

### 1. Transfer the repository on GitHub

- Go to **Settings → General → Danger Zone → Transfer ownership**.
- Choose the new owner (user or organisation).
- Confirm the repository name. The new URL will be `https://github.com/<new-owner>/LosClandestinospizzeria`.

> GitHub redirects the old web URL and git clone URL to the new one automatically for a while, but do not rely on this forever.

### 2. Update Pages settings in the new account

- In the transferred repo, go to **Settings → Pages**.
- Re-select the source: `Deploy from a branch → main`.
- Wait for the build to complete. The site will now be served from the new owner's GitHub Pages URL.

### 3. Update DNS if the domain changes

- If you are **keeping** `www.losclandestinospizzeria.es`, make sure the DNS CNAME for `www` points to the new GitHub Pages hostname (`<new-owner>.github.io`).
- If you are **changing** the domain, update the DNS records for the new domain and edit the `CNAME` file accordingly.

### 4. Update hard-coded URLs in the project

Search the repository for the old owner name and the old domain. Common places:

- `CNAME` — custom domain.
- `index.html` and `productos.html` — canonical links, Open Graph URLs, JSON-LD `@id`/`url`/`image`, favicon raw GitHub URLs.
- `sitemap.xml` — `<loc>` URLs.
- `robots.txt` — sitemap URL.
- `js/main.js` — any absolute links or social URLs.

After editing, commit and push to `main`. GitHub Pages will redeploy automatically.

### 5. Verify after migration

- Visit the live site and confirm it loads without SSL errors.
- Check the browser console for mixed-content or 404 errors.
- Confirm the language switcher, map, online-order button and contact links still work.
- Submit the updated sitemap to Google Search Console if the domain changed.

---

## SEO & accessibility notes

The project already includes several best practices:

- **Schema.org JSON-LD** in `index.html` describing the restaurant, address, phone, opening hours and social profiles.
- **Open Graph** and **Twitter Cards** meta tags.
- **Canonical URLs** on both pages.
- **Sitemap** and **robots.txt**.
- **Responsive design** with mobile breakpoints around `900px`.
- **Reduced-motion** media query in `css/base.css`.
- **ARIA labels** on navigation, language switcher, carousel and sections.
- **Language switcher** stores preference in `localStorage` and updates `document.documentElement.lang`.

When adding new sections, preserve these patterns.

---

## Credits & license

- Design, copy and photography belong to Los Clandestinos.
- Fonts: Google Fonts (Work Sans, Bebas Neue).
- Animation library: GSAP by GreenSock.

For contribution guidelines, see [`CONTRIBUTING.md`](CONTRIBUTING.md).
