# Jaron Chew — EAE Portfolio

A static, card-style Early Admission Exercise (EAE) portfolio for Jaron Chew. It presents projects, achievements, certifications, reflections, and target polytechnic applications in a responsive single-page site with three view modes (Story, Timeline, Cards).

## Quick start

Open `index.html` in a browser, or serve the folder locally:

```bash
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:8080` (or the port shown).

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | Main portfolio page |
| `admin.html` | Local content editor (draft + export to `data.js`) |
| `data.js` | All portfolio content as `window.PORTFOLIO_DATA` |
| `script.js` | Rendering, navigation, view modes, modals |
| `style.css` | Layout, astral theme, responsive grids |
| `images/` | Profile, project, certificate, and robot images |
| `videos/` | Embedded demo videos (e.g. SkillQuest) |
| `materials/` | Source documents, diagrams, and reference files (not used at runtime) |
| `DESIGN.md` | Design system notes (in `materials/`) |

## Editing content

1. **Admin tool** — Open `admin.html`, edit fields or JSON, then export and replace `data.js`.
2. **Direct edit** — Change `data.js` in any text editor. Content is plain JSON inside an IIFE.
3. **Images** — Add files under `images/` (e.g. `images/projects/`, `images/certificates/`) and set paths in `data.js`.

Placeholders marked with `[...]` or “to be confirmed” are intentional until details are verified.

## View modes

- **Story** — Narrative flow with carried-forward links between projects (default).
- **Timeline** — Chronological layout with a central spine.
- **Cards** — Multi-column grid for scanning and filtering.

The default is **Cards** so new visitors see the multi-column overview first. The choice is stored in `localStorage` under `eaePortfolioViewModeV2`.

## Design

The site uses an astral space theme with light evidence cards for contrast. Typography: Space Grotesk (headings) and Inter (body). The design reference is [materials/DESIGN.md](materials/DESIGN.md).

## License & use

Personal portfolio for EAE submission. Content reflects Jaron Chew’s learning journey; do not copy unverified claims for other applications.
