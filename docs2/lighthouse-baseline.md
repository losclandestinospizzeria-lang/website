# Lighthouse baseline

Baseline captured on 2026-07-21 against the homepage served locally at `http://127.0.0.1:8765/` before visual, SEO, or performance changes.

## Scores

| Profile | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 49 | 87 | 100 | 100 |
| Desktop | 72 | 91 | 100 | 100 |

## Core metrics

| Profile | FCP | LCP | TBT | CLS | Speed Index |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile | 3.4 s | 5.2 s | 60 ms | 0.687 | 4.3 s |
| Desktop | 1.0 s | 1.1 s | 0 ms | 0.766 | 1.0 s |

## Main findings

- Mobile performance is primarily limited by FCP, LCP, and layout shift.
- Desktop performance is primarily limited by layout shift.
- Accessibility failures include prohibited ARIA attributes, color contrast, and the absence of a main landmark; mobile also reports undersized touch targets.
- Lighthouse reported no browser console errors.
- All 34 relative asset references found in `docs/index.html` and `docs/productos.html` resolve locally.

## Reports

The full reports generated during the baseline run are stored outside the repository:

- `/tmp/los-clandestinos-lighthouse-mobile.report.html`
- `/tmp/los-clandestinos-lighthouse-mobile.report.json`
- `/tmp/los-clandestinos-lighthouse-desktop.report.html`
- `/tmp/los-clandestinos-lighthouse-desktop.report.json`

Use the commands in the README to regenerate reports. Scores can vary slightly between runs and machines.

## Post-optimization comparison

Captured on the same machine and local server after the SEO, accessibility and animation changes.

| Profile | Performance | Accessibility | Best Practices | SEO | CLS |
| --- | ---: | ---: | ---: | ---: | ---: |
| Mobile before | 49 | 87 | 100 | 100 | 0.687 |
| Mobile after | 75 | 100 | 100 | 100 | 0 |
| Products mobile after | 66 | 100 | 100 | 100 | 0 |
| Desktop before | 72 | 91 | 100 | 100 | 0.766 |
| Desktop after | 95 | 96 | 100 | 100 | 0.011 |

The final mobile JSON reports are stored at `/tmp/los-clandestinos-lighthouse-mobile-final.report.json` and `/tmp/los-clandestinos-productos-lighthouse-mobile.report.json`. The earlier desktop report is stored at `/tmp/los-clandestinos-lighthouse-desktop-after.report.html`.
