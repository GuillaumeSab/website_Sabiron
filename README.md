# Guillaume Sabiron — professional portfolio

Bilingual Flask and static portfolio presenting R&D leadership, applied AI, scientific systems, digital products, mobility and environmental intelligence. The homepage is narrative and project-led; detailed **Skills** and **Publications** pages provide supporting depth.

## Live website

The public portfolio is available at:

<https://guillaumesabiron.github.io/>

GitHub Pages deploys the static site automatically after every push to `main`.

## Local development

```bash
./.venv/bin/python main.py
```

Open `http://127.0.0.1:5000` (French: `http://127.0.0.1:5000/?lang=fr`).

## Build and checks

```bash
./.venv/bin/python -m compileall main.py build_static.py site_content.py utils scripts
./.venv/bin/python build_static.py
./.venv/bin/python scripts/check_site.py
npm run build
```

`build_static.py` generates the GitHub Pages output in `docs/`; `npm run build` packages it in `dist/`. Generated directories must never be edited directly.

## Content sources

- `site_content.py` — public metrics, selected projects, capabilities and selected publications.
- `Guillaume_Sabiron_data.json` — publication source data.
- `data/travel_countries.json` — sole source for the personal travel summary.
- `static/img/projects/` — optimised conceptual project illustrations (AVIF).
- `static/documents/` — public French and English CV PDFs.
- `templates/` — page shells and presentation only.

To add a project, define its bilingual text, image alt text, public links and image path in `site_content.py`; then add the optimised image under `static/img/projects/`. Do not describe conceptual illustrations as product screenshots or experimental results.

## Architecture

- Flask and Jinja for local rendering
- native HTML, CSS and JavaScript
- static export in `docs/`
- no frontend framework or database; the travel map is a lightweight local SVG-style interaction

GitHub Actions runs static checks and deploys GitHub Pages on pushes to `main`.

## Search engines

The static build generates canonical URLs, reciprocal language alternatives, `sitemap.xml`, `robots.txt` and an Open Graph image. Submit `https://guillaumesabiron.github.io/sitemap.xml` in [Google Search Console](https://search.google.com/search-console/) and [Bing Webmaster Tools](https://www.bing.com/webmasters/), then validate the public home page with Google’s Rich Results Test. Do not add verification tokens to the repository unless they are issued for this domain.

## Before publication

Confirm public links, email address, CV versions, project names, videos and quantitative claims. The project illustrations are conceptual; values visible inside them are not asserted as portfolio results.
