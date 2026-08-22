# America's Gun Shop — Website Redesign

A static, production-hardened catalog preview for America's Gun Shop in West Chester, PA.

This site intentionally does not process orders, reserve regulated products, collect personal information, upload files, or publish simulated inventory as live data. Current inventory and secure contact actions route to the established official store at `shop.americasgunshop.us`.

## Structure
- `index.html` — homepage
- `pages/` — shop, product, services, about, contact, privacy, and catalog-process pages
- `css/` — design tokens + per-page stylesheets
- `js/` — device-local pickup list, sample product data, and page modules
- `assets/img/` — imagery and logo
- `_headers` — security and cache policy for hosts that support the standard headers file
- `scripts/check.mjs` — dependency-free release checks

## Run locally
Serve the folder so root-relative metadata and the 404 page resolve correctly:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Validate

Requires Node.js 18 or newer:

```sh
npm run check
```

The check verifies JavaScript syntax, local asset links, required page metadata, duplicate IDs, image dimensions and alt text, external-link isolation, CSS custom properties, and removal of known prototype-only behaviors.

## Deployment notes

- Deploy the repository root as a static site; there is no build step.
- Configure the platform to apply `_headers`, or copy its directives into the platform's header configuration.
- Canonical URLs and the sitemap target `https://americasgunshop.us/`; update them together if the launch hostname or route structure changes.
- The catalog data in `js/data.js` is illustrative. Replace it with a reviewed inventory integration only after server-side authentication, validation, rate limiting, privacy review, and operational ownership are in place.
- Verify business hours, license display, legal copy, service availability, and destination URLs with the shop immediately before launch.

## Social asset

`assets/img/og-social.png` is the generated 1200×630 Open Graph image used by page metadata.
