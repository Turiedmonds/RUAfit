# RUAfit Static PWA

This repository now runs as a **framework-free static Progressive Web App** designed for GitHub Pages hosting.

## Architecture

- Multi-page HTML app (`*.html` at repo root)
- ES module JavaScript in `/js`
- Shared CSS in `/css/styles.css`
- Web app manifest at `/manifest.webmanifest`
- Service worker at `/service-worker.js`
- JSON content files remain in `/src/data`
- GitHub Pages workflow deploys static files only (no Next.js build)

## Content Editing

Event content still lives in `/src/data`:

- `event.json`
- `programme.json`
- `sports.json`
- `announcements.json`
- `gallery.json`

## Local Preview

Use any static file server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages Deployment

The workflow at `.github/workflows/pages.yml` packages and deploys static assets directly.
No Node runtime is required after deployment.
