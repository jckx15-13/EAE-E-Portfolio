# Jaron Chew — EAE Portfolio: Web Development Portfolio Essay & Developer Guide

## 1. Project Overview

The **Jaron Chew — EAE Portfolio** is an interactive, single-page web portfolio designed specifically for Singapore's Early Admission Exercise (EAE). Its primary purpose is to showcase Jaron’s academic progression, self-directed learning, and hands-on projects to admissions officers and evaluators at Singapore Polytechnic (SP) and Ngee Ann Polytechnic (NP). It targets decision-makers seeking evidence of capability in coding, robotics, and cybersecurity.

Evaluators review hundreds of application files that are typically static, text-heavy PDFs or generic, template-driven website pages. This project solves that problem by introducing an immersive, narrative-driven interface. Built entirely with vanilla web technologies, the portfolio offers three custom viewing modes (Cards, Timeline, and Story) to adapt to the evaluator's reading preference. 

As a portfolio showcase, this project demonstrates a strong command of core front-end engineering principles (semantic HTML, responsive layouts, CSS variables, and raw DOM manipulation) without the overhead of heavy JavaScript frameworks. Furthermore, it incorporates a local Node.js administration server to support in-browser live-editing and updates, coupled with a robust browser automation test suite using Puppeteer and Axe-Core to verify layout integrity and WCAG 2.1 AA accessibility compliance.

---

## 2. What Makes This Portfolio Project Strong

### 2.1 Usability, Cognitive Load, and the Aesthetic-Usability Effect
The user experience (UX) is grounded in usability research published by the **Nielsen Norman Group**. Their studies indicate that users rarely read web content line-by-line; instead, they scan pages in patterns like the F-shaped layout. To address this, the portfolio integrates three viewing modes to cater to different scanning behaviors:
* **Cards Mode**: A multi-column grid layout that facilitates rapid visual scanning, filtering, and high-level categorization of evidence.
* **Timeline Mode**: A chronological progression along a vertical spine that visualizes academic and technical milestones over time, providing immediate context on growth.
* **Story Mode**: A sequential narrative that connects projects via "Growth Threads." These threads explain how learnings from a previous build directly influenced the next, mitigating cognitive load by forming a cohesive story of technical maturation.

The page uses an "Astral Space" aesthetic (nebula gradients, drifting star particles, and ambient card glows on hover). According to the **Nielsen Norman Group**, the *Aesthetic-Usability Effect* states that users perceive aesthetically pleasing designs as more usable and credible, which is critical for making a strong first impression on admissions panels.

### 2.2 Accessibility and Inclusive Design
Accessibility is a core architectural pillar of the project, designed to meet **W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards. Rather than treating accessibility as an afterthought, the codebase implements the following:
* **Keyboard Navigation**: Proper focus management and a prominent "Skip to content" link (complying with WCAG 2.4.1) allow non-mouse users to navigate the site seamlessly.
* **Semantic HTML**: Structural landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`) are used systematically. **MDN Web Docs** emphasizes that semantic markup is the foundation of digital accessibility, allowing screen readers to interpret page structure accurately.
* **ARIA Attributes**: Tablists and view toggles use dynamic ARIA states (`role="tab"`, `aria-selected`, `aria-controls`) to inform assistive technologies of interactive state changes.
* **Color Contrast**: Text and surface combinations are selected to exceed the minimum contrast ratio of 4.5:1 for normal text (WCAG 1.4.3), ensuring readability across different monitors and lighting conditions.

### 2.3 Layout Integrity and Responsive Calculations
In responsive design, layouts often break when headers wrap on smaller viewports, causing content to slide underneath fixed menus. To prevent this, the project implements a dynamic layout system. The portfolio's vanilla JavaScript detects header wraps and recalculates the `--site-chrome-height` custom property, offsetting the main content area dynamically.

Furthermore, **MDN Web Docs** warns that `align-items: stretch` in CSS Flexbox and Grid layouts can cause card containers to stretch vertically, creating distorted card heights and empty spaces within elements. The layout guidelines forbid `stretch` alignments for card displays, maintaining uniform card heights or custom alignment configurations, which are programmatically verified by layout checks.

### 2.4 Back-End Security and API Contracts
To facilitate content maintenance, the local Node.js server (`server.js`) exposes a static serving system and a JSON data persistence endpoint (`POST /api/save`). To defend against security vulnerabilities, the server includes robust input and path validations:
* **Path Traversal Defense**: The server verifies that all file paths start with the public root directory (`!filePath.startsWith(PUBLIC_DIR)`). This aligns with **OWASP Top 10** guidelines regarding Broken Access Control (A01:2021), preventing attackers from reading or overwriting system files.
* **JSON Serialization**: Updates submitted via the Live Editor are sanitized, structured, and serialized back to `data.js` safely.

### 2.5 Test Automation and Quality Assurance
In modern software engineering, automated testing is essential to prevent regressions. The project utilizes a test runner (`tests/run_tests.js`) that automates headless Chrome via **Puppeteer**:
* **Integration Tests**: Simulates user interactions by clicking view toggles and verifying class assignments on the `<body>` element.
* **Accessibility Auditing**: Automates Axe-Core to run WCAG audits in the browser sandbox, writing detailed compliance reports to `tests/reports/accessibility.json`.
* **Layout Audits**: Runs Puppeteer-based audits (`verify-cards.js`) to check for alignment bugs and ensure that no card container uses `align-items: stretch`.

---

## 3. Customization for This Specific Web Development Project

### 3.1 Recommended Project Structure
The folder architecture is structured as a clean static site with a supporting Node.js testing and administration layer:

```
eae-portfolio/
├── .agents/                 # Orchestrator and agent metadata
├── images/                  # Profile, project, and certificate images
├── videos/                  # Embedded demo videos
├── materials/               # Source documents and design system guidelines
│   └── DESIGN.md            # Styling tokens, colors, and typography rules
├── tests/                   # Automated browser testing suites
│   ├── reports/             # Generated accessibility and testing reports
│   │   └── accessibility.json
│   ├── run_tests.js         # Puppeteer and Axe-Core execution script
│   ├── verify-all-grids.js  # flex/grid alignment audit tool
│   └── verify-cards.js      # Card stretch verification test
├── index.html               # Main single-page portfolio layout
├── style.css                # Astral theme CSS and responsive grid styles
├── script.js                # View-mode navigation, modals, and dynamic offsets
├── data.js                  # Structured portfolio database (window.PORTFOLIO_DATA)
├── server.js                # HTTP static server and JSON save API
├── package.json             # Scripts, linter rules, and dependencies
└── CLAUDE.md                # This essay and developer instructions
```

### 3.2 Required Portfolio Sections or Pages
The single-page portfolio requires the following structural zones:
1. **Fixed Header Chrome**: Incorporates the brand signature, primary section navigation links, and a reading progress bar.
2. **View Mode Toggle Bar**: A sticky control container supporting "Cards", "Timeline", and "Story" mode buttons.
3. **Hero & Intro**: Displays Jaron's profile picture, headline, identity line, and introductory bio.
4. **Evidence Overview**: A tabbed interactive layout displaying:
   * **Map of Me**: Six core identity cards showcasing fundamental milestones.
   * **Evidence Deck**: Core portfolio cards with bulleted proof-points.
5. **Technical Portfolios**: Sections dedicated to **Coding Foundations**, **Robotics & Logic**, and **Academic Resilience**.
6. **Live Editor Control**: A floating action button (FAB) in the bottom-right opening the Live Editor sidebar (Inline text toggle, raw JSON input, and save trigger).

### 3.3 Customizable Elements
The following elements can be freely customized to update the portfolio's branding and content:
* **Portfolio Content**: All copy, project titles, summary bullet points, and email/github endpoints should be updated in `data.js`.
* **Color Tokens**: The color palette variables (e.g., `--colors-primary`, `--colors-accent`, `--colors-purple`) in `style.css` and `materials/DESIGN.md`.
* **Slide Decks**: Canva embedded slide presentations linked via the `slidesEmbedUrl` property in `data.js`.
* **Typography**: Font family designations (Space Grotesk for display and Inter for body text) can be swapped in `style.css` imports.

### 3.4 Elements Requiring Permission Before Changing
The following core mechanisms should not be altered without structural review:
* **View Mode Class Listeners**: The script logic in `script.js` that coordinates click events on `#view-cards`, `#view-timeline`, and `#view-story` and binds them to `body` classes.
* **Local Save API Endpoint**: The `/api/save` POST route in `server.js` and the corresponding fetch request in `script.js`.
* **Data Serialization Contract**: The IIFE wrapper in `data.js` that instantiates `window.PORTFOLIO_DATA`.
* **Grid and Flex CSS Rules**: Main class-based layouts (`.project-grid`, `.achievement-grid`) that determine rendering layouts across view modes.

### 3.5 Elements That Must Not Be Changed Without Direct Instruction
The following constraints are non-negotiable for project compliance:
* **Pure Web Technologies**: The project must remain built on vanilla HTML5, CSS3, and JavaScript. No migration to frameworks (e.g., React, Vue) or CSS utility packages (e.g., Tailwind) is permitted.
* **Directory Traversal Verification**: The `filePath.startsWith(PUBLIC_DIR)` validation check inside `server.js` must remain intact.
* **Accessibility Baseline**: The site must maintain zero violations under Axe-Core auditing.
* **Layout Breakpoints**: CSS media queries matching `1280px`, `820px`, `520px`, and `380px` must be preserved.

---

## 4. Guardrails Against AI Hallucinations and Model Mistakes

### AI Agent Rules Checklist
- [ ] **Verify Stack Rules**: Confirm that you are writing vanilla JavaScript, HTML5, and CSS3. Do not suggest importing external packages or libraries (e.g., React hooks, Vue components, or Tailwind styles).
- [ ] **Confirm File Paths**: Always check that files are written to the appropriate path under `/home/admin/Documents/EAE Materials/` rather than temporary folders.
- [ ] **Verify Selectors**: Do not rename or delete HTML elements used in testing and layout automation (e.g., `#view-cards`, `#view-timeline`, `#view-story`, `#brandName`, `#siteNav`).
- [ ] **Run Layout and Accessibility Tests**: Execute `npm test` after modifying any CSS, HTML structure, or JavaScript render logic to ensure layout and WCAG compliance.
- [ ] **Enforce Path Traversal Check**: Do not alter the directory boundaries (`startsWith(PUBLIC_DIR)`) in `server.js`.
- [ ] **Maintain Code Separation**: Do not place page copy or text directly into `index.html` or `script.js`. All portfolio data must remain decoupled inside `data.js` under `window.PORTFOLIO_DATA`.
- [ ] **No Stretched Card Heights**: Avoid using `align-items: stretch` in grid layout setups.

---

## 5. Developer Guidelines

### 5.1 Environment Prerequisites
* **Runtime**: Node.js (v18 or higher recommended).
* **Browsers**: Headless Chrome (or Google Chrome installed at `/home/admin/.config/Antigravity/bin/google-chrome` for Puppeteer execution).

### 5.2 Build & Start Commands
No build compilation step is required since the project runs on native HTML/CSS/JS.

* **Install dependencies**:
  ```bash
  npm install
  ```
* **Start local development server**:
  ```bash
  node server.js
  ```
  The website will be served at [http://localhost:3000](http://localhost:3000). The server handles static asset delivery and hosts the JSON API for saving modifications made in the Live Editor.

### 5.3 Automated Testing
The verification scripts run in headless Chrome and check layout features, functional view-toggles, and accessibility requirements.

* **Execute test suite**:
  ```bash
  npm test
  ```
  This command starts `server.js`, runs Puppeteer, and invokes the Axe accessibility audit.
* **Run layout checks**:
  ```bash
  node tests/verify-cards.js
  node tests/verify-all-grids.js
  ```
  These audit scripts verify that card alignments are structured correctly and that no container breaks grid rendering guidelines.
* **Lint design specifications**:
  ```bash
  npm run design:lint
  ```
  Lints `materials/DESIGN.md` against styling rules using `@google/design.md`.

### 5.4 Coding & Styling Guidelines
* **Custom Variables**: All colors, fonts, and spacings must use the CSS variables defined in `style.css` derived from the tokens in [DESIGN.md](file:///home/admin/Documents/EAE%20Materials/materials/DESIGN.md).
* **Responsive Layouts**: Use CSS Grid or Flexbox. Avoid absolute width sizing. The main layout is designed to adjust dynamically using fluid grid tracks and CSS flex-wrap configurations.
* **Accessibility**: Always include `alt` attributes on images, `aria-label` declarations on interactive elements lacking textual names, and ensure keyboard focus states (`:focus-visible`) are visually distinct.


Additional refinement from CHATGPT


```markdown
---

# 6. Additive Claude Agent Protocol: Responsive Fixes, EAE Readiness, and Acceptance-Critical Quality

This section is an additive refinement for Claude and other AI coding agents. It must be appended to the bottom of this `CLAUDE.md` file. It does not replace or remove any previous instructions.

## 6.1 Non-Destructive Rule

Do not delete, rewrite, shorten, rename, or restructure existing content, files, selectors, data keys, or project behavior unless explicitly instructed.

Default action order:

1. Preserve existing work.
2. Diagnose the issue.
3. Propose the smallest safe fix.
4. Apply additive or minimal targeted changes.
5. Run verification.
6. Report what changed and what still needs review.

If unsure, stop and ask.

## 6.2 Project Identity Lock

This is not a generic portfolio.

This is **Jaron Chew — EAE Portfolio**, a Singapore EAE web portfolio for SP and NP admissions review.

Preserve:

- Vanilla HTML/CSS/JS stack.
- `index.html`, `style.css`, `script.js`, `data.js`, `server.js`.
- `window.PORTFOLIO_DATA`.
- Cards, Timeline, and Story modes.
- Fixed header chrome and `--site-chrome-height`.
- Live Editor and Advanced Admin Editor.
- Puppeteer and Axe-Core tests.
- EAE narrative for coding, robotics, cybersecurity, academic growth, and reflection.

Do not suggest React, Next.js, Vue, Tailwind, Bootstrap, Firebase, Supabase, CMS migration, or a build system unless explicitly requested.

## 6.3 Anti-Hallucination Rules

Do not invent:

- Test results.
- Accessibility scores.
- Lighthouse scores.
- Deployment status.
- GitHub status.
- Course requirements.
- SP/NP admissions facts.
- Certificates or awards.
- New dependencies.
- New scripts.
- New files.
- New APIs.
- Production security guarantees.

If unknown, write:

> Missing information: [specific item].

If assuming, write:

> Assumption: [specific assumption]. Please verify.

Do not present assumptions as facts.

## 6.4 Acceptance-Critical Priorities

When improving this project, prioritize issues that could hurt EAE evaluation:

1. Broken layouts on different monitor sizes.
2. Horizontal scrolling or clipped content.
3. Header/view-mode bar overlap.
4. Poor mobile readability.
5. Cards stretching or misaligning.
6. Story/Timeline mode visual breakage.
7. Weak accessibility.
8. Missing or unclear evidence.
9. Overstated or unverified course claims.
10. Confusing navigation.
11. Low credibility from placeholder text.
12. Broken media, images, slides, or videos.
13. Inconsistent EAE narrative.
14. Performance issues that make the portfolio feel slow.
15. Any issue that makes the project look unfinished.

Fix visual and usability problems before cosmetic enhancements.

## 6.5 Responsive Debugging Protocol

When asked to fix resizing, monitor-size, or responsiveness problems, inspect these first:

- `html`, `body`
- `.site-chrome`
- `.site-header`
- `.site-nav`
- `.nav-toggle`
- `.view-mode-bar`
- `.view-mode-bar-inner`
- `.hero`
- `.hero-centerpiece`
- `.hero-copy`
- `.journey-markers`
- `.project-grid`
- `.achievement-grid`
- `.personal-map-grid`
- `.evidence-deck-grid`
- `.applications-grid`
- `.timeline-wrap`
- `.story-connector`
- `.story-track-spacer`
- `.project-card--highlighted`
- `.project-media-iframe-wrap`
- `.live-editor-sidebar`
- `--site-chrome-height`

Check these viewport widths at minimum:

- `1280px`
- `820px`
- `520px`
- `380px`

Also consider common monitor widths:

- `1440px`
- `1366px`
- `1024px`
- `768px`
- `430px`
- `390px`
- `360px`

Do not rely only on one screen size.

## 6.6 Responsive Fix Rules

Prefer these safe CSS patterns:

```css
width: min(100%, var(--max-width));
max-width: 100%;
min-width: 0;
grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
overflow-wrap: break-word;
```

Avoid:

```css
width: 100vw;
min-width: large-fixed-value;
fixed card widths without max-width;
absolute positioning for main layout;
align-items: stretch for card grids;
```

Any fix must preserve:

- Cards mode.
- Timeline mode.
- Story mode.
- Fixed chrome.
- Live Editor.
- Print mode.
- Reduced motion support.
- Accessibility states.

## 6.7 Required Verification Commands

After any HTML, CSS, JS, layout, or accessibility change, run or request:

```bash
node server.js
```

Then in another terminal:

```bash
npm test
node responsive-check.js
node tests/verify-cards.js
node tests/verify-all-grids.js
```

For design-doc changes:

```bash
npm run design:lint
```

Do not claim success unless output is observed.

If tests were not run, say:

> Tests have not been run yet. Please run the verification commands before treating this as complete.

## 6.8 EAE Credibility Rules

Admissions reviewers should immediately understand:

- Who Jaron is.
- Why he is interested in cybersecurity/software.
- What he built.
- What evidence supports each claim.
- How each project connects to SP/NP EAE goals.
- What is verified vs still pending.

Do not exaggerate.

Use grounded phrasing:

- “demonstrates progression”
- “supports the EAE narrative”
- “shows applied interest”
- “provides evidence of”
- “suggests readiness to grow”

Avoid:

- “guarantees admission”
- “expert-level”
- “industry-grade”
- “fully secure”
- “perfect accessibility”
- “production-ready enterprise system”

unless proven and verified.

## 6.9 Course-Claim Safety

Before strengthening SP/NP course alignment, verify official facts.

Do not invent:

- Modules.
- Facilities.
- Partnerships.
- Selection criteria.
- Interview expectations.
- Admissions scoring.

If not verified, write:

> Verify this against the latest official SP/NP course page before submission.

## 6.10 Evidence Quality Checklist

Before final EAE submission, ensure each major project has:

- Clear title.
- Problem.
- Solution.
- Jaron’s role.
- Technologies used.
- Evidence image/video/slides/certificate.
- Outcome.
- Reflection.
- EAE connection.
- Applicant signal.

Flag weak items as:

> Needs evidence before submission.

Do not hide weak evidence with fancy design.

## 6.11 Protected Selectors and Contracts

Do not rename or remove:

- `#main`
- `#siteNav`
- `#brandName`
- `#view-cards`
- `#view-timeline`
- `#view-story`
- `#projectsGrid`
- `#achievementCards`
- `#achievementTimeline`
- `#personalMapCards`
- `#evidenceDeckCards`
- `#achievementModal`
- `#modalContent`
- `.site-chrome`
- `.site-header`
- `.view-mode-bar`
- `.view-mode-pill`
- `.project-grid`
- `.achievement-grid`
- `.story-connector`
- `.timeline-card-node`
- `.live-editor-fab`
- `.live-editor-sidebar`
- `window.PORTFOLIO_DATA`
- `eaePortfolioViewModeV2`

If changing one, update all references in HTML, CSS, JS, tests, and docs.

Ask permission first.

## 6.12 Security Rules

Do not weaken `server.js`.

Preserve path traversal protection:

```js
if (!filePath.startsWith(PUBLIC_DIR)) {
  res.writeHead(403);
  res.end('Forbidden');
  return;
}
```

Do not claim the local editor/server is production-secure.

Treat `/api/save` as local development/admin tooling only.

## 6.13 Accessibility Rules

Preserve or improve:

- Skip link.
- Semantic landmarks.
- Keyboard navigation.
- Focus-visible states.
- ARIA state updates.
- Modal close behavior.
- Reduced-motion support.
- Image alt text.
- Color contrast.
- Button/link semantics.

Do not claim WCAG compliance unless Axe-Core and manual checks support it.

## 6.14 Response Format for Claude

For future tasks, respond in this compact structure:

```markdown
## Understanding
[Project-specific restatement]

## Files Affected
- [file]

## Diagnosis
[Root cause]

## Fix Plan
1. [step]
2. [step]

## Patch
[code or precise edit]

## Verification
[commands]

## Notes
[risks, assumptions, remaining issues]
```

Keep responses token-efficient. Do not repeat the full project unless asked.

## 6.15 First Prompt to Start Responsive and EAE-Readiness Fixes

Use this prompt to start a focused Claude repair session:

```markdown
You are working on Jaron Chew’s EAE Portfolio, a vanilla HTML/CSS/JS single-page portfolio for Singapore EAE submission to SP/NP. Do not rewrite the project or migrate frameworks. Preserve existing files, selectors, data contracts, Cards/Timeline/Story modes, Live Editor, and `window.PORTFOLIO_DATA`.

Task: Audit and fix acceptance-critical issues, especially resizing problems across different monitor sizes.

Priorities:
1. Fix horizontal overflow, squeezed layouts, clipped content, header overlap, and view-mode bar issues.
2. Test widths: 1440, 1366, 1280, 1024, 820, 768, 520, 430, 390, 380, 360.
3. Preserve accessibility, keyboard navigation, skip link, reduced motion, and semantic structure.
4. Preserve EAE credibility: do not exaggerate claims, invent results, or add unverified SP/NP facts.
5. Keep changes minimal and explain each file changed.

Inspect:
- `index.html`
- `style.css`
- `script.js`
- `data.js`
- `server.js`
- `responsive-check.js`
- `package.json`

Run or request:
```bash
node server.js
npm test
node responsive-check.js
node tests/verify-cards.js
node tests/verify-all-grids.js
```

Output format:
## Findings
## Root Causes
## Proposed Fixes
## Patch
## Verification Steps
## Remaining Risks

Do not claim tests passed unless you actually see the output.
```

## 6.16 Final Rule

When in doubt:

> Preserve first. Fix only what hurts usability, accessibility, responsiveness, security, or EAE credibility. Never hallucinate.
```
