# Jaron Chew — EAE Portfolio

A static, card-style Early Admission Exercise (EAE) portfolio for Jaron Chew. It presents projects, achievements, certifications, reflections, and target polytechnic applications in a responsive single-page site with three view modes (Cards, Timeline, Story).

## For EAE Evaluators: How to Read This Portfolio

**Start here** → Recommended viewing order:

1. **Load the homepage** — You'll see Jaron's identity and a quick personal snapshot. Pay attention to the focus areas and personal qualities listed.

2. **Featured Projects** (first 3 are strongest evidence):
   - **#1 — SPD Caregiver & Admin Event Portal** — Shows real-world system design for a non-profit organization. Demonstrates UX thinking, user role architecture (admin vs. caregiver), accessibility, and problem-solving for community impact.
   - **#2 — FLL 2026 Unearthed Robot Design** — Shows precision engineering, multi-axis systems thinking, sensor-based feedback loops, and structured planning via flowcharts. These skills transfer directly to cybersecurity infrastructure design.
   - **#3 — PyCon Hackathon & SkillQuest** — Shows ability to gamify cybersecurity education and deliver under pressure. Direct evidence of cybersecurity interest and software engineering teamwork.

3. **View the achievements** — Look for:
   - **SP YCEP Bootcamp Certificate** — Direct evidence of participation in Singapore Polytechnic's flagship cybersecurity outreach program.
   - **Python progression (Basic → Intermediate → Advanced)** — Shows disciplined, long-term technical foundation.
   - **The Lab Coder Programme (Intermediate) — Distinction** — Evidence of systems thinking and structured problem-solving.

4. **Target Applications** — Check why Jaron is applying to Singapore Polytechnic and Ngee Ann Polytechnic.

**View Modes**:
- **Cards** (default) — Fast scan. All projects and achievements in a grid. Use filters to focus on categories.
- **Timeline** — Chronological view of Jaron's journey from 2019 to present. Shows progression over time.
- **Story** — Connected narrative view. Shows how skills from one project directly influenced the next (via "carried forward" threads).

**Key Evidence to Look For**:
- Multi-axis robotics design (systems thinking)
- User flow diagrams for SPD (UX and accessibility)
- Cybersecurity game mechanics (education approach)
- Math growth journey (resilience and discipline)
- 3+ years of consistent technical learning

---

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

| `data.js` | All portfolio content as `window.PORTFOLIO_DATA` |
| `script.js` | Rendering, navigation, view modes, modals |
| `style.css` | Layout, astral theme, fixed chrome, responsive grids |
| `server.js` | Local Node server on port 3000 |
| `images/` | Profile, project, certificate, and robot images |
| `videos/` | Embedded demo videos (e.g. SkillQuest) |
| `docs/source_materials/raw_materials/` | Source documents, diagrams, and reference files (not used at runtime) |
| `tests/` | Automated view-mode and accessibility checks |
| `docs/design_system/DESIGN_GUIDELINES.md` | Design system notes |

## Fixed navigation chrome

The portfolio keeps two controls always visible while scrolling:

- **Top bar** — brand, section navigation, and reading progress
- **View-mode bar** — Cards, Timeline, and Story toggles

Both sit in a fixed header shell (`position: fixed`, full width, high z-index). Main content is offset with `--site-chrome-height` so nothing hides underneath. The height syncs automatically when the nav wraps on smaller screens.

## Editing content

1. **Advanced Admin Editor** — Open `index.html` in your browser, click the 🛠️ Live Editor FAB in the bottom right, and select "Advanced Admin Editor" to modify form fields or the raw JSON directly. Click "Apply Form Edits", and then click "Export data.js" to save changes.
2. **Inline Live Edit** — Open `index.html` in your browser, click the 🛠️ Live Editor FAB, and toggle "Edit Text Inline". Click on any text to modify it. When you click away, your changes are tracked in memory. Click "Export data.js" from the Live Editor sidebar to download your changes.
3. **Direct edit** — Change `data.js` in any text editor. Content is plain JSON inside an IIFE.
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

The site uses an astral space theme with readable contrast: light text on dark section backgrounds, dark text on light cards and form controls, and accent colours reserved for labels and actions. The top navigation bar and Cards/Timeline/Story bar stay fixed while scrolling; content is offset by `--site-chrome-height`, which updates automatically when the header wraps. Typography: Space Grotesk (headings) and Inter (body). See [docs/design_system/DESIGN_GUIDELINES.md](docs/design_system/DESIGN_GUIDELINES.md).

Run automated checks:

```bash
npm test
```

## License & use

Personal portfolio for EAE submission. Content reflects Jaron Chew’s learning journey; do not copy unverified claims for other applications.
