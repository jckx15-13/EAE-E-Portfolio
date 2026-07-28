# Project Conventions & Standards

This document catalogs the naming, syntax, and structural conventions actually used
throughout the EAE Portfolio codebase (`/home/admin/Documents/EAE-Portfolio`). It is a
reference for contributors and AI agents so new code matches existing patterns instead
of introducing inconsistent styles. Governing design/content rules live in
[`CLAUDE.md`](../CLAUDE.md) — this file focuses on concrete syntax conventions observed
in the code.

---

## 1. Repository Layout

```
EAE-Portfolio/
├── index.html            # Page structure & chrome (owns semantic HTML only)
├── data.js                # window.PORTFOLIO_DATA — all editable content
├── script.js               # Rendering, state, Live Editor, accessibility, admin API
├── style.css                # Design tokens + all component styles
├── server.js                 # Static file server + /api/save
├── docs/                       # Documentation (developer guides, design system, this file)
├── tests/                        # Puppeteer-based suites (data, ui, a11y, e2e, security, ...)
├── tools/, assets/, images/, videos/, screenshots/   # Static/media assets
├── opendyslexic-0.92/                                 # Bundled accessible font
└── PROJECT.md, README.md, CLAUDE.md                     # Project-level docs
```

Rule: real portfolio content only ever lives in `data.js`. `index.html` and `script.js`
must not contain hardcoded student copy (see CLAUDE.md §2.1–2.3).

---

## 2. JavaScript Conventions (`script.js`, `data.js`, `server.js`)

### Naming
- **Functions**: `camelCase`, verb-first, descriptive — e.g. `createAchievementCard`,
  `applySectionVisibility`, `buildCommitGraphRows`, `closeModalDialog`.
  - `create*` — builds and returns a DOM node.
  - `apply*` — mutates existing state/DOM based on a setting.
  - `build*` — assembles a data structure (not necessarily DOM).
  - `append*` — adds child nodes/rows to an existing container.
- **Variables**: `camelCase` (`sectionOrder`, `viewMode`, `dyslexicToggle`).
- **Constants**: `UPPER_SNAKE_CASE` for true constants (e.g. config-like values),
  `camelCase` for cached DOM references.
- **Data object keys** (`data.js`, `window.PORTFOLIO_DATA`): `camelCase`, and grouped by
  UI concern — e.g. `achievementCategoryLabel`, `achievementFlowTitle`,
  `applicationCourseLabel`. Label/string fields destined for UI text end in
  `Label`, `Title`, `Lede`, or `Intro` by convention.
- **Admin/global API surface**: exposed under a single namespace,
  `window.eaeAdminAPI.*` (e.g. `insertAssetToSection`, `pushUndoSnapshot`,
  `undoLast`). Do not add new globals outside this namespace or `window.PORTFOLIO_DATA`.

### Structure
- Top-level module wraps content in an IIFE: `(function () { window.PORTFOLIO_DATA = {...}; })();`
- Functions are declared with `function name(...)`, not arrow-function assignment, for
  top-level/hoisted helpers. Arrow functions are used for callbacks and inline handlers.
- DOM creation favors a small local `create(tag, props)`-style helper over repeated
  `document.createElement` boilerplate — reuse existing helpers rather than adding new
  one-off creators.
- State (view mode, theme, section order, accessibility prefs) persists to
  `localStorage` under prefixed keys, e.g. `eaePortfolioTheme`, `eae_a11y_dyslexic`.
  New persisted keys should follow the existing `eae*` / `eae_a11y_*` prefix pattern.

### Server (`server.js`)
- Endpoint responses are flat JSON: `{ "success": true, "message": "..." }` or
  `{ "success": false, "error": "..." }`. Follow this shape for any new endpoint.
- All file serving is bounded by `startsWith(PUBLIC_DIR)` path-traversal checks — never
  remove or weaken this check.

---

## 3. CSS Conventions (`style.css`)

### Custom Properties (Design Tokens)
- All tokens are `--kebab-case`, grouped by category and declared on `:root` (dark
  defaults) then overridden on `body[data-theme="light"]` / `body[data-theme="dark"]`:
  - Theme: `--theme-bg`, `--theme-text-primary`, `--theme-card-bg`, `--theme-accent-cyan`, ...
  - Spacing scale: `--space-3xs` → `--space-3xl` (t-shirt sizing, not raw pixels).
  - Shadows: `--shadow-soft`, `--shadow-card`, `--shadow-space`, `--shadow-srt`.
  - Z-index: `--z-header`, `--z-editor-sidebar`, `--z-modal`, `--z-tooltip` (never use raw
    z-index numbers in components — reference these tokens).
- New colors/spacing/shadows must be added as tokens, not inlined. See CLAUDE.md §4.1–4.2
  for the full required token catalog.

### Selectors
- **Class naming**: lowercase-hyphenated, component-then-element, loosely BEM-like but not
  strict BEM: `.project-card`, `.project-card--highlighted`, `.project-media-thumb`,
  `.achievement-evidence-strip`, `.live-editor-sidebar`.
- **State classes** use `.is-*` (`.is-active`, `.is-open`, `.is-elevated`) or
  `body[data-*]` attributes (`body[data-theme="light"]`, `body[data-view-mode="story"]`)
  rather than new one-off boolean classes.
- **FAB / drawer pattern**: `{feature}-toggle-fab` + `{feature}-sidebar` +
  `{feature}-sidebar.is-open` (see `.a11y-toggle-fab` / `.a11y-sidebar`,
  `.live-editor-fab` / `.live-editor-sidebar`). Reuse this pair-naming for any new
  slide-out panel.

### File Organization
Follow the layering model already documented in CLAUDE.md §14: tokens → reset/base →
typography → layout → components → effects → states → responsive → accessibility →
print. Keep new rules in the section matching their layer instead of appending to the
end of the file.

---

## 4. HTML Conventions (`index.html`)

- IDs are `camelCase` (`#themeToggle`, `#achievementModal`, `#a11yToggleFab`,
  `#scrollProgressBar`).
- Section wrappers use kebab-case IDs matching their content (`#why-cybersecurity`,
  `#best-projects`).
- Every interactive control that JS binds to must keep its existing `id`/class — these
  are treated as a stable contract with `script.js` and the test suite (CLAUDE.md §2.1).
- No inline `style=` attributes for themable properties — use CSS classes/tokens instead.

---

## 5. Git Commit Conventions

Observed commit history follows **Conventional Commits** style, lowercase type prefix
+ colon + imperative/present-tense summary:

```
feat: rebuild Technical Growth Journey as a git-tree timeline
fix: use theme tokens for accessibility button and school portfolio button in light mode
refactor: reduce source code line count, streamline JS/CSS/server
style: add Git learning repository CSS styles and data visibility settings
docs: add comprehensive school portfolio improvement suggestions
```

Types in use: `feat`, `fix`, `refactor`, `style`, `docs`. Keep summaries specific enough
to identify the touched component (e.g. name the section/feature, not just "update code").

---

## 6. Testing Conventions

- Suites live under `tests/` and run via `node tests/run_tests.js --suite=<name>`.
- npm scripts map 1:1 to suites: `test:data`, `test:ui`, `test:a11y`, `test:e2e`,
  `test:security`, `test:responsive`, `test:journey`.
- New tests should be added to the matching suite by concern rather than creating new
  top-level scripts.

---

## 7. Content/Copy Conventions

See CLAUDE.md §16 for full rules. In short: first-person, evidence-based, no invented
outcomes, ethical framing for security/system-exploration topics ("investigated",
"explored", "tested responsibly" — never "hacked"/"exploited").

---

## 8. When Adding Anything New

1. Match the naming pattern of the nearest existing sibling (function/class/token/key),
   don't invent a new pattern.
2. Prefer extending an existing token/selector family over creating a parallel one.
3. Update this file if you introduce a genuinely new convention (new token category, new
   localStorage key prefix, new commit type, etc.).
