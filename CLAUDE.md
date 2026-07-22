# CLAUDE.md — EAE Portfolio Guardrails, Design System, Test Suite Rules

## Project Identity

This project is a static, data-driven EAE portfolio website for **Jaron Chew Kai Xin**, a student from **Juying Secondary School**, focused on:

- Cybersecurity
- Digital forensics
- Coding
- Robotics
- Engineering
- Project-based learning
- Competition experiences
- Reflective growth
- EAE application readiness for Singapore Polytechnic and Ngee Ann Polytechnic

The portfolio is not a generic student template. It is a personal technical-growth narrative. Any change must preserve the project’s purpose: showing Jaron as a curious, hardworking, reflective, technically capable lifelong learner who wants to use technology to create positive impact.

The design must feel:

- Clean
- Modern
- Technology-focused
- Professional
- Organised
- Minimal but distinctive
- Confident but not arrogant
- Friendly and readable
- Suitable for EAE, DSA, scholarship, internship, academic, and competition applications

The design must not feel:

- Generic
- Childish
- Cluttered
- Excessively wordy
- Too similar to everyone else’s portfolio
- So technical that non-technical reviewers cannot understand it
- Like an MVP skeleton
- Like a placeholder demo after real content already exists

---

# 1. Absolute Guardrails

## 1.1 Never Delete Real Content

Do not delete, replace, flatten, or genericise real content in `data.js` or markdown notes.

Real portfolio content includes, but is not limited to:

- SPD Caregiver & Admin Event Portal Prototype
- FLL 2026 Unearthed Robot Design & Planning
- PyCon Hackathon & SkillQuest
- Personal Student Portfolio Website
- Kodecoon Project Journey
- Mathematics Growth Journey
- Python Advanced
- Python Intermediate
- Python Basic
- YCEP Certificate of Participation
- MIT App Inventor Appathon
- Spark AR / ShopBack project
- Roblox Global Goal Challenge
- NRC Robotics Competition
- Scratch Coder Course
- BuildingBloCS June Jam / Game Jam
- Personal Hobbies & Explorations
- SP and NP Cybersecurity & Digital Forensics application direction

If information is uncertain, use an explicit placeholder or preserve the existing cautious wording. Do not invent.

Correct placeholder style:

```text
[To be confirmed]
[Add reflection here]
[Awaiting confirmation]
[Insert certificate image path here]
```

Incorrect:

```text
Won first place
Led a team of five
Built a deployed production app
Officially ranked 30th
```

unless the supplied data confirms it.

---

## 1.2 Never Invent Achievements or Claims

Do not invent:

- Awards
- Rankings
- Competition results
- Dates
- Organisations
- Team sizes
- Technologies
- Course outcomes
- Deployment status
- Reflections
- Learning outcomes
- Responsibilities
- Leadership claims
- Project completion status

Special caution:

- “30th in SP” must not be described as a ranking unless confirmed.
- “Hackathon” projects must not be described as completed if marked upcoming or uncertain.
- Admin login must not be described as secure authentication.
- Static localStorage image uploads must not be described as permanent backend storage.

---

## 1.3 Do Not Replace Production Features With Skeletons

This project already contains advanced features. Do not simplify it into a basic static page.

Preserve:

- `window.PORTFOLIO_DATA` schema
- dynamic rendering from `data.js`
- project filters
- achievement filters
- achievement search
- achievement modal
- modal focus handling
- cards/timeline/story view modes
- localStorage view mode persistence
- theme toggle
- Live Editor sidebar
- inline editing
- section reorder controls
- asset library
- localStorage image overrides
- version snapshots
- publish snapshot
- print mode
- accessibility drawer
- OpenDyslexic toggle
- `/api/save` endpoint in `server.js`
- CSS responsive layouts
- print styles
- reduced-motion handling

---

# 2. File-Level Responsibilities

## 2.1 `index.html`

`index.html` owns:

- semantic page structure
- persistent site chrome
- navigation containers
- view-mode controls
- primary content section shells
- modal container
- accessibility drawer shell
- external font loading
- script and stylesheet loading

Important IDs/classes used by JavaScript and CSS must not be removed:

```html
<body id="top">
<a class="skip-link" href="#main">
<div class="site-chrome">
<header class="site-header">
<button id="themeToggle" class="theme-toggle-btn">
<nav id="siteNav" class="site-nav">
<div class="scroll-progress">
<span id="scrollProgressBar">
<div class="view-mode-bar">
<button id="view-cards" data-mode="cards">
<button id="view-timeline" data-mode="timeline">
<button id="view-story" data-mode="story">
<main id="main">
<section id="about">
<section id="philosophy">
<section id="why-cybersecurity">
<section id="best-projects">
<section id="timeline">
<section id="reflections">
<section id="projects">
<section id="achievements">
<section id="hobbies">
<section id="applications">
<section id="goals">
<dialog id="achievementModal">
<div id="modalContent">
<button id="a11yToggleFab">
<aside id="a11ySidebar">
<input id="dyslexicToggle">
```

Any test suite should fail if these critical nodes are missing.

---

## 2.2 `data.js`

`data.js` owns all student-editable content.

The site should load content dynamically from:

```js
window.PORTFOLIO_DATA
```

Do not move real portfolio content into HTML.

The schema contains important narrative objects:

```js
meta
philosophy
whyCybersecurity
profile
lifeEntry
personalMap
eaeSnapshot
evidenceDeck
targetApplications
about
achievementFlow
projects
achievements
competitionJourney
coding
robotics
reflections
futureGoals
certifications
hiddenSections
hobbies
sectionVisibility
uiLabels
```

Tests should verify these top-level keys exist or are safely handled if optional.

---

## 2.3 `script.js`

`script.js` owns:

- rendering
- state management
- localStorage persistence
- accessibility behavior
- modal behavior
- Live Editor behavior
- asset helpers
- view modes
- filters
- theme toggling
- section ordering
- server save calls

Do not remove exposed admin API:

```js
window.eaeAdminAPI.insertAssetToSection
window.eaeAdminAPI.generateOptimizedImage
window.eaeAdminAPI.openCropModalForAsset
window.eaeAdminAPI.pushUndoSnapshot
window.eaeAdminAPI.undoLast
```

These APIs are useful for automated tests.

---

## 2.4 `server.js`

`server.js` owns:

- static file serving
- MIME types
- `/api/save`
- safe path checks
- CORS for local dev

Preserve endpoint contract:

```http
POST /api/save
Content-Type: application/json
```

Successful response:

```json
{ "success": true, "message": "Saved to data.js successfully!" }
```

Failure response:

```json
{ "success": false, "error": "..." }
```

Do not silently swallow server errors.

---

# 3. CSS Design Philosophy

The CSS is central to the project identity. It must not be treated as a disposable skin.

The design language should communicate:

- technically capable
- futuristic but readable
- bold and confident
- organised and thoughtful
- reflective and personal
- project-based learning
- cybersecurity and robotics interest
- lifelong learning
- engineering discipline
- strong evidence orientation

The visual identity is:

- Deep navy / dark mode foundation
- Sky-blue and purple accents
- Clean professional typography
- Glassmorphism surfaces
- 2.5D card depth
- Astral / technology-inspired backgrounds
- Strong headings
- Neat spacing
- Responsive card grids
- Accessible reading flow
- Reduced clutter
- Restrained motion

---

# 4. CSS Architecture Rules

## 4.1 Use Semantic Tokens First

Prefer design tokens over hardcoded values.

Good:

```css
background: var(--theme-card-bg);
color: var(--theme-text-secondary);
border-color: var(--theme-card-border);
box-shadow: var(--theme-card-shadow);
padding: var(--space-md);
border-radius: var(--radius);
```

Bad:

```css
background: #111b31;
color: white;
padding: 17px;
border-color: #cccccc;
```

Exceptions are allowed only for highly specific decorative gradients, warning colors, or temporary backwards-compatible overrides.

---

## 4.2 Required Token Categories

The design system should contain these token categories.

### Theme tokens

```css
--theme-bg
--theme-bg-soft
--theme-text-primary
--theme-text-secondary
--theme-text-muted
--theme-card-bg
--theme-card-border
--theme-card-shadow
--theme-chrome-bg
--theme-accent-cyan
--theme-accent-purple
```

### Surface tokens

Recommended:

```css
--surface-page
--surface-section
--surface-card
--surface-card-hover
--surface-glass
--surface-media
--surface-modal
--surface-editor
```

### Border tokens

Recommended:

```css
--border-soft
--border-medium
--border-strong
--border-accent
```

### Shadow tokens

Existing:

```css
--shadow-soft
--shadow-card
--shadow-space
```

Recommended additions:

```css
--shadow-hover
--shadow-glow
--shadow-srt
--shadow-modal
```

### Typography tokens

Required / recommended:

```css
--font-body
--font-heading
--font-readable
--font-mono
--font-size-body
--line-height-body
--letter-spacing-body
--word-spacing-body
```

### Spacing tokens

Existing spacing scale must remain:

```css
--space-3xs
--space-2xs
--space-xs
--space-sm
--space-md
--space-lg
--space-xl
--space-2xl
--space-3xl
```

Do not replace spacing with random pixel values unless unavoidable.

---

# 5. Theme System Rules

## 5.1 Light and Dark Must Be True Opposites

The project should support a meaningful dual-theme system:

### Light mode

Light mode should feel:

- warm
- paper-like
- organic
- calm
- professional
- readable
- minimal

Existing light profile:

```css
body[data-theme="light"] {
 --theme-bg: #fcfbf7;
 --theme-text-primary: #1f2937;
 --theme-text-secondary: #475569;
 --theme-text-muted: #64748b;
 --theme-card-bg: #f7f4ee;
 --theme-card-border: #d8d3c8;
 --theme-card-shadow: 0 10px 25px rgba(15, 23, 42, 0.07);
 --theme-chrome-bg: rgba(252, 251, 247, 0.96);
 --theme-accent-cyan: #0284c7;
 --theme-accent-purple: #8b5cf6;
}
```

### Dark mode

Dark mode should feel:

- deep
- cosmic / astral
- technical
- high contrast
- cybersecurity-inspired
- sky-blue / purple accented
- glassy
- dimensional

Current default dark profile:

```css
:root {
 --theme-bg: #0b1525;
 --theme-text-primary: #ffffff;
 --theme-text-secondary: rgba(255, 255, 255, 0.95);
 --theme-text-muted: rgba(255, 255, 255, 0.82);
 --theme-card-bg: rgba(17, 27, 49, 0.85);
 --theme-card-border: rgba(109, 179, 240, 0.25);
 --theme-card-shadow: 0 10px 30px rgba(3, 8, 18, 0.35);
 --theme-chrome-bg: rgba(11, 21, 37, 0.98);
 --theme-accent-cyan: #38bdf8;
 --theme-accent-purple: #c084fc;
}
```

Dark should not be a random separate skin. It should be the conceptual inverse of light:

| Role | Light | Dark |
|---|---|---|
| Page background | warm paper | deep navy space |
| Card surface | soft cream | translucent navy glass |
| Text | ink slate | clean white / slate-100 |
| Border | warm beige | cyan/purple glass line |
| Accent | deeper blue/purple | brighter cyan/purple |
| Atmosphere | organic daylight | astral/cyber depth |

---

## 5.2 Avoid Hardcoded Theme Breakage

The current CSS contains repeated hardcoded light/dark rules and `!important` overrides. Refactors must reduce them carefully.

Problematic pattern:

```css
.section,
.section *,
.hero,
.hero * {
 color: var(--white);
}
```

This forces all text white and breaks light mode unless overridden later.

Better:

```css
.section,
.hero {
 color: var(--theme-text-primary);
}

.section-lede,
.hero-subtitle {
 color: var(--theme-text-secondary);
}
```

Problematic:

```css
.project-card p {
 color: rgba(255, 255, 255, 0.82) !important;
}
```

Better:

```css
.project-card p {
 color: var(--theme-text-secondary);
}
```

Use `!important` only when preserving legacy behavior from unavoidable cascade conflicts.

---

# 6. Typography and ADHD / Dyslexia Reading System

## 6.1 Required Typography Personality

The typography must feel:

- modern
- technical
- readable
- structured
- confident
- suitable for admissions review

Current font loading:

```html
Inter
Space Grotesk
OpenDyslexic
```

Existing heading family:

```css
h1,
h2,
h3,
h4,
.brand,
.site-nav a,
.button,
.section-label {
 font-family: "Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif;
}
```

This should be retained.

---

## 6.2 ADHD-Friendly Reading Rules

The design must not create dense walls of text.

Use:

- generous line-height
- short paragraph widths
- clear headings
- strong visual hierarchy
- cards and sections instead of long continuous text
- bullets for dense lists
- visible labels and metadata
- good spacing between blocks
- consistent rhythm
- readable contrast

Recommended CSS:

```css
:root {
 --font-body: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
 --font-heading: "Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif;
 --font-readable: "OpenDyslexic", Inter, ui-sans-serif, system-ui, sans-serif;
 --font-mono: "Cascadia Code", "SFMono-Regular", Consolas, monospace;

 --font-size-body: clamp(1rem, 0.96rem + 0.2vw, 1.08rem);
 --line-height-body: 1.72;
 --letter-spacing-body: 0.005em;
 --word-spacing-body: normal;
 --content-measure: 72ch;
}

body {
 font-family: var(--font-body);
 font-size: var(--font-size-body);
 line-height: var(--line-height-body);
 letter-spacing: var(--letter-spacing-body);
 word-spacing: var(--word-spacing-body);
}

p,
li,
dd {
 max-width: var(--content-measure);
}
```

---

## 6.3 OpenDyslexic Mode Must Work

`index.html` includes:

```html
<link href="https://fonts.cdnfonts.com/css/open-dyslexic" rel="stylesheet" />
```

`script.js` toggles:

```js
document.body.classList.toggle('dyslexic-mode', enabled);
```

Therefore CSS must include:

```css
body.dyslexic-mode {
 --font-body: var(--font-readable);
 --font-heading: var(--font-readable);
 --line-height-body: 1.85;
 --letter-spacing-body: 0.025em;
 --word-spacing-body: 0.08em;
}

body.dyslexic-mode,
body.dyslexic-mode h1,
body.dyslexic-mode h2,
body.dyslexic-mode h3,
body.dyslexic-mode h4,
body.dyslexic-mode button,
body.dyslexic-mode input,
body.dyslexic-mode textarea {
 font-family: var(--font-readable);
}
```

Test suite should verify that enabling the toggle adds `body.dyslexic-mode`.

---

# 7. Core Visual Patterns

## 7.1 2.5D SRT Card Pattern

Cards should retain a distinctive hover style.

Required qualities:

- slight lift
- perspective rotation
- bottom offset shadow / ledge
- cyan/purple glow in dark mode
- beige/soft shadow in light mode
- no extreme motion
- must respect reduced motion

Existing pattern:

```css
transform: translateY(-6px) perspective(1000px) rotateX(1deg);
```

Recommended tokenised pattern:

```css
.card-hover-srt,
.project-card:hover,
.achievement-card:hover,
.personal-map-card:hover,
.snapshot-card:hover,
.evidence-card:hover,
.strength-card:hover {
 transform: translateY(-6px) perspective(1000px) rotateX(1deg);
 border-color: var(--theme-accent-cyan);
 box-shadow: var(--shadow-srt);
}
```

Dark example:

```css
body[data-theme="dark"] {
 --shadow-srt:
  0 8px 0 rgba(56, 189, 248, 0.38),
  0 20px 40px rgba(3, 8, 18, 0.45),
  0 0 24px rgba(56, 189, 248, 0.20);
}
```

Light example:

```css
body[data-theme="light"] {
 --shadow-srt:
  0 8px 0 #d8d3c8,
  0 16px 32px rgba(15, 23, 42, 0.12);
}
```

Tests should verify cards still visibly react on hover/focus.

---

## 7.2 Glassmorphism Pattern

Used in:

- `.site-chrome`
- `.hero-note`
- `.life-entry-intro`
- `.flow-step-body`
- `.live-editor-sidebar`
- story connector callouts
- achievement cards

Required qualities:

```css
background: var(--theme-glass-bg);
border: 1px solid var(--theme-glass-border);
backdrop-filter: blur(var(--glass-blur));
box-shadow: var(--theme-card-shadow);
```

Recommended tokens:

```css
:root {
 --glass-blur: 18px;
 --theme-glass-bg: rgba(17, 27, 49, 0.72);
 --theme-glass-border: rgba(109, 179, 240, 0.22);
}

body[data-theme="light"] {
 --theme-glass-bg: rgba(255, 255, 255, 0.72);
 --theme-glass-border: rgba(15, 23, 42, 0.08);
}
```

Avoid making everything glass. Use it for emphasis and depth.

---

## 7.3 Astral / Cyber Background Pattern

Dark mode identity includes:

- star fields
- radial gradients
- parallax layers
- subtle moving particles
- blue/purple nebula effect

Existing selectors:

```css
[class*="section-astral-"]::before
.parallax-bg--stars
.parallax-bg--nebula
.parallax-bg--dust
.section-astral-7
.section-astral-8
.section-astral-9
.section-astral-hobbies
```

Preserve this style language.

Light mode should reduce or disable heavy star effects:

```css
body[data-theme="light"] [class*="section-astral-"]::before {
 background-image: none;
 opacity: 0;
 animation: none;
}
```

Dark mode should keep the astral identity but not reduce readability.

Test suite should check:

- dark theme has visible astral/cyber backgrounds
- light theme does not show heavy dark starfields
- text remains readable in both themes

---

## 7.4 Organic Light Mode Pattern

Light mode should feel like:

- warm white paper
- cream surfaces
- misty radial gradients
- soft blue/purple tint
- natural daylight

Existing light hero:

```css
body[data-theme="light"] .hero {
 background:
  radial-gradient(circle at 50% -12%, rgba(2, 132, 199, 0.08), transparent 40%),
  linear-gradient(180deg, #fffdf8 0%, #f7f4ee 70%, #f3efe6 100%);
}
```

Preserve this.

---

# 8. Component Style Contracts

## 8.1 Site Chrome / Header

Must remain:

- fixed at top
- high z-index
- blurred/glass surface
- contains brand, theme toggle, nav, scroll progress
- responsive mobile nav
- no content hidden behind header due to `--site-chrome-height`

Required classes:

```css
.site-chrome
.site-header
.site-header.is-elevated
.brand
.brand-mark
.theme-toggle-btn
.site-nav
.nav-toggle
.scroll-progress
```

Tests:

- header is fixed
- body padding-top equals site chrome height behavior
- mobile nav toggle appears below 1080/900 depending CSS
- scroll progress updates transform scaleX
- no horizontal overflow

---

## 8.2 Hero Section

Hero must communicate identity immediately.

Required style qualities:

- prominent name/headline
- strong heading hierarchy
- profile image circle
- action buttons
- focus chips
- dark mode cosmic feel
- light mode organic daylight
- responsive single-column on mobile

Required selectors:

```css
.hero
.hero-centerpiece
.hero-person
.hero-person img
.hero-copy
.hero-name
.hero-identity
.hero-subtitle
.hero-actions
.focus-list
.focus-item
```

Test expectations:

- hero image loads from data/profile path
- hero text injected from `data.profile`
- mobile layout becomes single-column
- action buttons remain touch-friendly
- text is not clipped at 320–375px

---

## 8.3 Cards

Core card types:

```css
.project-card
.achievement-card
.snapshot-card
.personal-map-card
.evidence-card
.application-card
.reflection-card
.small-card
.cert-card
.hobby-card
.learning-path-card
.skill-alignment-card
.profile-panel
```

All cards should:

- use semantic theme tokens
- use consistent border radius
- have readable text
- have hover/focus states
- avoid overflow
- support `min-width: 0`
- support long text wrapping
- preserve 2.5D hover pattern
- not rely on pure hardcoded white text

Required guardrail:

```css
.project-card,
.achievement-card,
.snapshot-card,
.personal-map-card {
 min-width: 0;
 overflow-wrap: break-word;
}
```

Test expectations:

- all card types exist
- cards render in dark and light themes
- card text contrast is acceptable
- cards hover/focus visibly
- long text does not overflow

---

## 8.4 Project Cards

Project cards are the strongest evidence presentation.

Required style/structure:

- media area
- project body
- category kicker
- title
- status
- portfolio signal
- EAE connection
- technology chips
- details disclosure
- case rows
- optional Canva iframe
- optional video
- supporting thumbnails
- highlighted project badge

Required selectors:

```css
.project-grid
.project-grid.featured-only
.project-card
.project-card--highlighted
.project-highlight-badge
.project-media
.project-media.has-slides
.project-media-iframe-wrap
.project-slides-link
.project-media-thumbnails
.project-media-thumb
.project-body
.project-insight-card
.project-evidence-status
.project-tech-chip
.project-details
.project-details-summary
.case-row
```

Tests:

- highlighted project spans full grid in card mode
- embedded slides iframe keeps 16:9 ratio
- thumbnails do not overflow
- details can open
- project card still works in cards/timeline/story view modes

---

## 8.5 Achievement Cards and Modal

Achievement cards must support admissions review quickly.

Required selectors:

```css
.achievement-grid
.achievement-card
.achievement-empty
.achievement-signal
.achievement-evidence-strip
.evidence-chip
.evidence-chip-ready
.featured-achievement
.modal
.modal-card
.modal-close
.modal-header
.modal-summary
.modal-media-grid
.modal-detail-grid
.modal-detail
.modal-detail-highlight
.media-block
.image-placeholder
```

Required behavior:

- cards show summary
- modal shows deeper evidence
- missing image shows placeholder
- missing certificate shows placeholder
- modal supports focus management
- modal supports click outside close
- modal supports Escape
- modal supports Tab trap

Tests:

- click achievement opens modal
- modal has title/category/date/summary
- certificate image renders when present
- placeholder appears when absent
- focus returns after close

---

## 8.6 Timeline and Story Modes

View modes are a signature feature.

Required selectors:

```css
.view-mode-bar
.view-mode-bar.is-active
.view-mode-bar-inner
.view-mode-indicator
.view-mode-pill
body[data-view-mode="cards"]
body[data-view-mode="timeline"]
body[data-view-mode="story"]
.timeline-card-node
.story-card-node
.story-connector
.story-connector-line
.carried-forward-callout
.carried-forward-badge
.carried-forward-text
.story-track-spacer
#achievementTimeline.timeline
#achievementTimeline .timeline-item.left
#achievementTimeline .timeline-item.right
.timeline-filter-bar
.filter-pill
```

Tests:

- clicking Cards sets `body.dataset.viewMode = "cards"`
- clicking Timeline sets `body.dataset.viewMode = "timeline"`
- clicking Story sets `body.dataset.viewMode = "story"`
- active tab has `.is-active`
- story connectors appear where carriedForward matches
- timeline alternates left/right on desktop
- timeline collapses to single column on mobile

---

## 8.7 Live Editor

Live Editor is a core admin subsystem.

Required selectors:

```css
.live-editor-fab
.live-editor-fab.is-active
.live-editor-sidebar
.live-editor-sidebar.is-open
.sidebar-header
.sidebar-close-btn
.sidebar-content
.editor-control-group
.editor-workflow-card
.editor-status-pill
.editor-status-pill[data-tone="active"]
.editor-status-pill[data-tone="success"]
.switch-container
.switch-slider
.section-edit-controls
body.live-editing-active [contenteditable="true"]
.template-select
.asset-list
.asset-thumb
.asset-actions
.versions-list
.version-row
.crop-modal
.crop-card
```

Tests:

- FAB exists after render
- clicking FAB opens sidebar
- sidebar gets `.is-open`
- inline edit mode applies `contenteditable`
- edited text saves through data object path
- reorder controls show in reorder mode
- version list can render
- asset upload creates asset thumbnail
- exported data.js modal contains `window.PORTFOLIO_DATA`

---

## 8.8 Accessibility Drawer

HTML and JS include accessibility drawer.

CSS must include styles for:

```css
.a11y-toggle-fab
.a11y-sidebar
.a11y-sidebar.is-open
.a11y-sidebar-header
.a11y-close-btn
.a11y-control-group
.a11y-control-row
.a11y-control-label
.a11y-switch
.a11y-slider
body.dyslexic-mode
```

If absent, add them.

Tests:

- accessibility FAB exists
- clicking opens drawer
- close button closes drawer
- OpenDyslexic toggle adds `body.dyslexic-mode`
- preference persists in localStorage key `eae_a11y_dyslexic`
- drawer is usable in light and dark themes
- drawer does not overlap Live Editor in a way that blocks both controls permanently

---

# 9. Responsive Design Contract

Supported widths:

- 320px
- 340px
- 375px
- 480px
- 520px
- 680px
- 768px
- 820px
- 900px
- 1080px
- 1200px
- 1280px+
- 1400px+

Required responsive principles:

```css
overflow-x: hidden;
min-width: 0;
overflow-wrap: break-word;
grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
```

Do not remove:

```css
html,
body {
 overflow-x: hidden;
}
```

Do not create fixed-width cards wider than viewport.

Mobile requirements:

- header remains usable
- brand may shrink/hide at very small widths
- nav toggle remains visible
- cards become single-column
- hero actions become full-width buttons
- modals fit viewport
- Live Editor sidebar becomes full viewport width
- no horizontal scroll at 320px

Tests:

```text
viewport 320x800: no horizontal overflow
viewport 375x812: no horizontal overflow
viewport 768x1024: grids readable
viewport 1280x800: desktop grid active
```

---

# 10. Motion and Animation Rules

Animations should support, not distract.

Allowed:

- subtle reveal
- gentle star drift
- light organic float
- card hover lift
- scroll progress glow
- story connector pulse

Must respect:

```css
@media (prefers-reduced-motion: reduce)
```

Reduced motion must disable or effectively remove:

- long-running star animations
- reveal transforms
- hover transitions where possible
- connector pulse
- parallax transforms

Test expectations:

- with reduced motion emulation, animations are disabled or near-instant
- content remains visible
- no functionality depends on animation completing

---

# 11. Print Style Contract

Print mode must produce a readable admissions-friendly document.

Required print behavior:

- hide interactive chrome
- hide nav
- hide view mode controls
- hide modal
- hide filters
- expand project details
- remove dark backgrounds
- force black text on white background
- avoid card splitting where possible

Existing print styles must be preserved and improved only carefully.

Tests:

- `beforeprint` opens `.project-details`
- print CSS hides `.site-chrome`
- printed text is dark on white
- cards have simple borders
- no dark background consumes ink unnecessarily

---

# 12. CSS Test Checklist

Use this as a test-suite checklist.

## 12.1 Token Tests

- [ ] `:root` defines all theme tokens.
- [ ] `body[data-theme="light"]` defines light theme tokens.
- [ ] `body[data-theme="dark"]` or default dark defines dark theme tokens.
- [ ] Spacing tokens exist from `--space-3xs` to `--space-3xl`.
- [ ] Radius token exists.
- [ ] Header height tokens exist.
- [ ] No component depends only on hardcoded white text.
- [ ] Major cards use `var(--theme-card-bg)`, `var(--theme-card-border)`, and `var(--theme-card-shadow)`.

## 12.2 Theme Tests

- [ ] Default theme loads as dark if no localStorage value exists.
- [ ] Theme button toggles `body[data-theme]`.
- [ ] Theme persists to `localStorage`.
- [ ] Light theme shows warm paper background.
- [ ] Dark theme shows deep navy/astral background.
- [ ] Text remains readable in both themes.
- [ ] Editor opposite theme classes still work:
  - `.editor-opposite-light`
  - `.editor-opposite-dark`

## 12.3 Typography Tests

- [ ] Body uses Inter or tokenised body font.
- [ ] Headings use Space Grotesk or tokenised heading font.
- [ ] OpenDyslexic font file is loaded.
- [ ] Toggling dyslexic mode changes body font.
- [ ] Dyslexic mode increases readability spacing.
- [ ] Paragraphs do not become overly wide.

## 12.4 Card Tests

- [ ] `.project-card` renders with border, background, shadow.
- [ ] `.achievement-card` renders with border, background, shadow.
- [ ] `.personal-map-card` renders correctly.
- [ ] `.snapshot-card` renders correctly.
- [ ] `.hobby-card` renders correctly.
- [ ] Hover/focus creates visible 2.5D lift.
- [ ] Long text wraps and does not overflow.
- [ ] Cards remain readable in light and dark themes.

## 12.5 Grid Tests

- [ ] `.project-grid` auto-fits cards.
- [ ] `.achievement-grid` auto-fits cards.
- [ ] `.personal-map-grid` does not overflow.
- [ ] `.reflection-grid` becomes one column on mobile.
- [ ] `.applications-grid` becomes one column on mobile.
- [ ] `.hobbies-grid` becomes one column on mobile.

## 12.6 Navigation Tests

- [ ] `#siteNav` renders links dynamically.
- [ ] nav links point to valid section IDs.
- [ ] active section gets `.is-active`.
- [ ] mobile nav toggle opens/closes nav.
- [ ] Escape closes more menu.
- [ ] clicking nav link closes mobile menu.
- [ ] header does not get covered by story/timeline elements.

## 12.7 View Mode Tests

- [ ] Cards button sets card mode.
- [ ] Timeline button sets timeline mode.
- [ ] Story button sets story mode.
- [ ] View mode stored in localStorage.
- [ ] `body[data-view-mode]` updates.
- [ ] `.view-mode-indicator` moves.
- [ ] timeline cards stack correctly.
- [ ] story connectors render when appropriate.

## 12.8 Modal Tests

- [ ] clicking achievement opens modal.
- [ ] modal has `role="dialog"` and `aria-modal`.
- [ ] focus moves into modal.
- [ ] Escape closes modal.
- [ ] clicking backdrop closes modal.
- [ ] Tab cycles inside modal.
- [ ] focus returns to opening element.
- [ ] image placeholders render when missing.
- [ ] certificate placeholders render when missing.

## 12.9 Live Editor Tests

- [ ] `.live-editor-fab` appears.
- [ ] clicking FAB opens `.live-editor-sidebar`.
- [ ] closing sidebar works.
- [ ] inline editing adds contenteditable.
- [ ] blur updates nested data path.
- [ ] section reorder controls appear.
- [ ] section order updates `data.sectionOrder`.
- [ ] export modal produces valid `data.js`.
- [ ] version snapshot stored.
- [ ] uploaded asset renders thumbnail.
- [ ] asset helper APIs exist on `window.eaeAdminAPI`.

## 12.10 Accessibility Tests

- [ ] skip link visible on focus.
- [ ] focus-visible outline is obvious.
- [ ] accessibility FAB visible.
- [ ] accessibility sidebar opens/closes.
- [ ] OpenDyslexic toggle persists.
- [ ] reduced motion is respected.
- [ ] buttons have accessible labels.
- [ ] images have meaningful alt text where possible.
- [ ] decorative SVGs are `aria-hidden`.

## 12.11 Server/API Tests

- [ ] `node server.js` starts server on port 3000.
- [ ] GET `/` returns `index.html`.
- [ ] GET `/style.css` returns CSS MIME type.
- [ ] GET `/script.js` returns JS MIME type.
- [ ] POST `/api/save` with valid JSON rewrites `data.js`.
- [ ] POST `/api/save` with invalid JSON returns error.
- [ ] path traversal attempt returns 403 or does not serve outside root.

---

# 13. Style Refactor Rules for Claude / AI

When modifying CSS:

1. Preserve all existing class names used by HTML and JS.
2. Prefer adding tokens and consolidating repeated selectors over deleting large blocks blindly.
3. Replace hardcoded colors with semantic variables.
4. Keep light and dark profiles conceptually opposite.
5. Keep glassmorphism, 2.5D hover, astral backgrounds, and organic light mode.
6. Do not remove `@media print`.
7. Do not remove `@media (prefers-reduced-motion: reduce)`.
8. Do not remove mobile breakpoints unless replacing with better equivalent behavior.
9. Do not remove Live Editor styles.
10. Do not remove accessibility drawer or dyslexic-mode styles.
11. Do not break view-mode selectors.
12. Avoid new `!important` unless resolving unavoidable legacy conflicts.
13. If adding `!important`, document why.
14. Keep CSS readable and sectioned.
15. Keep comments that explain design-system layers.

---

# 14. Recommended CSS Layering Model

Future CSS should be organised approximately like this:

```css
/* 1. Tokens */
:root {}
body[data-theme="light"] {}
body[data-theme="dark"] {}

/* 2. Reset/Base */
* {}
html {}
body {}
img {}
a {}
button,input,textarea {}

/* 3. Typography */
h1,h2,h3,h4 {}
.section-label {}
.section-lede {}
body.dyslexic-mode {}

/* 4. Layout */
.site-chrome {}
.site-header {}
.section {}
.hero {}
.grid utilities {}

/* 5. Components */
.button {}
.card base {}
.project-card {}
.achievement-card {}
.modal {}
.nav {}
.view-mode {}
.live-editor {}
.a11y-sidebar {}

/* 6. Effects */
.astral backgrounds {}
.reveal {}
.hover depth {}
.progress bar {}

/* 7. States */
[data-theme] {}
[data-view-mode] {}
.live-editing-active {}
.is-open {}
.is-active {}

/* 8. Responsive */
@media (max-width: ...) {}

/* 9. Accessibility */
@media (prefers-reduced-motion: reduce) {}

/* 10. Print */
@media print {}
```

---

# 15. Design Language Description for Documentation

Use this wording when describing the portfolio design:

> The portfolio uses a modern technical design language built around deep navy, sky blue, and purple. Its dark mode uses an astral/cybersecurity-inspired visual system with subtle star fields, glassmorphism surfaces, and dimensional 2.5D card shadows. Its light mode acts as the conceptual inverse: warm paper backgrounds, soft organic gradients, restrained shadows, and accessible slate typography. The design is intentionally bold but not childish, technical but not overwhelming, and structured around admissions-friendly evidence cards, project case studies, and reflective growth narratives.

---

# 16. Content Style and Language Rules

The writing style should be:

- specific
- honest
- reflective
- first-person where appropriate
- evidence-based
- not exaggerated
- admissions-friendly
- understandable to non-technical readers

Avoid:

- buzzwords without evidence
- pretending all projects are complete
- claiming awards not provided
- overusing “passion” without examples
- making cybersecurity sound unethical
- describing device exploration as malicious hacking
- overly long paragraphs

When discussing system exploration, use ethical framing:

Good:

```text
I became curious about how operating systems, permissions, and policies work. I explored documentation and system behaviour to understand restrictions responsibly and connect that learning to cybersecurity.
```

Risky:

```text
I exploited my device.
```

For EAE and public portfolio language, prefer:

- investigated
- explored
- analysed
- traced
- debugged
- studied
- tested responsibly
- learned ethically

---

# 17. Red Flags That Should Fail Review

A change should fail review if it:

- removes real student content
- replaces real content with generic placeholders
- removes `PORTFOLIO_DATA`
- hardcodes portfolio content into HTML
- deletes Live Editor
- deletes accessibility drawer
- breaks `/api/save`
- removes view modes
- removes modal behavior
- removes print styles
- removes responsive protections
- creates horizontal scroll on mobile
- makes text unreadable in either theme
- disables OpenDyslexic toggle
- claims unverified awards/rankings
- describes localStorage login/upload as secure or permanent backend storage
- turns the site into an MVP skeleton

---

# 18. Minimum Manual Regression Checklist

Before approving any change, manually check:

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

Then verify:

- [ ] Page loads without console errors.
- [ ] Hero content renders.
- [ ] Navigation links render.
- [ ] Theme toggle works.
- [ ] Cards/timeline/story modes work.
- [ ] Project cards render.
- [ ] Featured project renders.
- [ ] Achievement cards render.
- [ ] Achievement modal opens and closes.
- [ ] Achievement search works.
- [ ] Filters work.
- [ ] Hobbies section renders.
- [ ] Applications section renders.
- [ ] Future goals render.
- [ ] Live Editor opens.
- [ ] Inline edit mode applies.
- [ ] Export data modal opens.
- [ ] Accessibility drawer opens.
- [ ] OpenDyslexic toggle works.
- [ ] Print button works.
- [ ] 375px mobile view has no horizontal scroll.
- [ ] 768px tablet view is readable.
- [ ] 1280px desktop view preserves design.
- [ ] Light mode is readable.
- [ ] Dark mode is readable.
- [ ] Reduced motion does not hide content.

---

# 19. Automated Test Suggestions

If using Playwright, Cypress, Vitest + JSDOM, or similar, include tests for:

## DOM smoke tests

- `#main` exists
- all primary sections exist
- `#siteNav` populated after render
- `#achievementCards` contains cards
- `#projectsGrid` contains project cards
- `#hobbiesGrid` contains hobby cards

## Theme tests

- click `#themeToggle`
- assert `body[data-theme]` changes
- assert localStorage key `eaePortfolioTheme`

## View-mode tests

- click each `.view-mode-pill`
- assert `body.dataset.viewMode`
- assert `.is-active`

## Modal tests

- click first `.achievement-card .text-button`
- assert dialog open
- press Escape
- assert dialog closed

## Accessibility tests

- click `#a11yToggleFab`
- assert `#a11ySidebar.is-open`
- check `#dyslexicToggle`
- assert `body.dyslexic-mode`
- assert localStorage key `eae_a11y_dyslexic`

## Live editor tests

- assert `.live-editor-fab`
- click it
- assert `.live-editor-sidebar.is-open`
- toggle inline edit
- assert editable elements have `contenteditable`

## Server tests

- GET `/`
- GET `/style.css`
- POST `/api/save`

---

# 20. Final Instruction to Claude / AI Agents

When working on this repository:

- Treat the website as a real EAE portfolio, not a toy project.
- Preserve the student’s voice, evidence, and technical growth narrative.
- Prioritise CSS design-system consistency, theme correctness, responsive fidelity, and accessibility.
- Make dark and light modes intentional opposites using semantic tokens.
- Keep the visual identity: deep purple, sky blue, dark navy, glassmorphism, 2.5D cards, clean typography, and restrained cyber/astral patterns.
- Preserve all production features.
- Never fabricate content.
- Always prefer scalable, modular, token-based styling over hardcoded one-off fixes.
