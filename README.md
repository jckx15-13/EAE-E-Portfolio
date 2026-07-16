# Jaron Chew — EAE Portfolio

A static, card-style Early Admission Exercise (EAE) portfolio for Jaron Chew. It presents projects, achievements, certifications, reflections, and target polytechnic applications in a responsive single-page site with three view modes (Cards, Timeline, Story).

## Quick start

Open `index.html` in a browser, or serve the folder locally:

```bash
npm start
# or
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:3000` (with `npm start`) or the port shown by your static server.

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Main portfolio page |
| `admin.html` | Local content editor (draft + export to `data.js`) |
| `data.js` | All portfolio content as `window.PORTFOLIO_DATA` |
| `script.js` | Rendering, navigation, view modes, modals |
| `style.css` | Layout, astral theme, fixed chrome, responsive grids |
| `server.js` | Local Node server on port 3000 |
| `images/` | Profile, project, certificate, and robot images |
| `videos/` | Embedded demo videos (e.g. SkillQuest) |
| `materials/` | Source documents, diagrams, and reference files (not used at runtime) |
| `tests/` | Automated view-mode and accessibility checks |
| `materials/DESIGN.md` | Design system notes |

## Fixed navigation chrome

The portfolio keeps two controls always visible while scrolling:

- **Top bar** — brand, section navigation, and reading progress
- **View-mode bar** — Cards, Timeline, and Story toggles

Both sit in a fixed header shell (`position: fixed`, full width, high z-index). Main content is offset with `--site-chrome-height` so nothing hides underneath. The height syncs automatically when the nav wraps on smaller screens.

## Editing content

1. **Admin tool** — Open `admin.html`, edit fields or JSON, then export and replace `data.js`.
2. **Direct edit** — Change `data.js` in any text editor. Content is plain JSON inside an IIFE.
3. **Images** — Add files under `images/` (e.g. `images/projects/`, `images/certificates/`) and set paths in `data.js`.
4. **Slides** — For embedded presentations, set `slidesEmbedUrl` on a project (Canva embed URLs work best). Optional `slides` can hold the public view link.

Placeholders marked with `[...]` or “to be confirmed” are intentional until details are verified.

## View modes

- **Cards** — Multi-column grid for scanning and filtering (default).
- **Timeline** — Chronological layout with a central spine.
- **Story** — Narrative flow with carried-forward links between projects.

The choice is stored in `localStorage` under `eaePortfolioViewModeV2`.

## Featured projects

Projects with `"highlighted": true` in `data.js` appear first in every view mode (Cards, Timeline, Story), span the full grid width in Cards mode, and show a **Featured Project** badge. The SPD Caregiver portal embeds its Canva slide deck via `slidesEmbedUrl` (with `slides` as the public fallback link).

## Design & accessibility

The site uses an astral space theme with readable contrast: light text on dark section backgrounds, dark text on light cards and form controls, and accent colours reserved for labels and actions. The top navigation bar and Cards/Timeline/Story bar stay fixed while scrolling; content is offset by `--site-chrome-height`, which updates automatically when the header wraps. Typography: Space Grotesk (headings) and Inter (body). See [materials/DESIGN.md](materials/DESIGN.md).

Run automated checks:

```bash
npm test
```

## License & use

Personal portfolio for EAE submission. Content reflects Jaron Chew’s learning journey; do not copy unverified claims for other applications.
