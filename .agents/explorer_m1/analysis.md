# Environment and Codebase Exploration Report

## Overview
This report summarizes the system environment audit and codebase inspection of the EAE Portfolio project, conducted to support the automated testing and accessibility suite design.

---

## 1. System Environment Audit

### Node.js & npm Versions
- **Node.js**: `v26.4.0` (provides native `fetch` and `WebSocket` APIs).
- **npm**: `11.18.0`.

### npm Packages (Global and Cache)
- **Global Packages**: Only `openclaw@2026.6.6` is installed globally (under `/home/admin/.npm-global/lib/node_modules/openclaw`).
- **Local npm Cache**: Located at `/home/admin/.npm`.
  - **Offline Installation Support**: Running `npm install --dry-run --offline` succeeds and resolves all 92 packages for the `@google/design.md` package declared in `package.json`.
  - **No Testing Libraries Cached**: Common testing frameworks like `mocha`, `chai`, `jest`, `cypress`, `playwright`, `vitest`, or `puppeteer` are **not** present in the local npm cache (attempting to dry-run install them offline throws `ENOTCACHED`).

### Local Browsers
- **Google Chrome**: Installed at `/home/admin/.config/Antigravity/bin/google-chrome`, version `150.0.7871.114`.
  - **How to Launch Headless**: 
    ```bash
    /home/admin/.config/Antigravity/bin/google-chrome --headless=new --remote-debugging-port=9222 --disable-gpu --no-sandbox
    ```
    *Note: The new headless mode (`--headless=new`) is required. The legacy `--headless` flag fails to bind the remote debugger port.*
- **Mozilla Firefox**: Installed at `/usr/bin/firefox`, version `152.0.5`.

---

## 2. Codebase View-Mode Toggle Mechanism

### Selectors, Storage, and Lifecycle
- **Toggle Elements**: Selected by `.view-mode-pill` elements representing three view modes: `cards`, `timeline`, and `story`.
- **Mode Storage**: Stored in `localStorage` under the key `eaePortfolioViewModeV2` (defaults to `cards`).
- **DOM Integration**:
  - Sets the `data-view-mode` attribute on the `<body>` element (via `document.body.dataset.viewMode = mode`).
  - Sets the `is-active` class and `aria-selected="true/false"` attributes on the matching pills.
- **Section Styling & Rendering**:
  - Layout adjustments are applied via CSS selectors matching `body[data-view-mode="..."]` or `[data-view-mode="..."]`.
  - Dynamically triggers re-rendering of sections by calling:
    1. `renderProjects()`
    2. `renderAchievements()`
    3. `renderCertifications()`
    4. `renderCoding()`

### 🚨 Critical View-Mode Toggle Bug
- **The Issue**: Clicking any view-mode toggle pill crashes the Javascript runtime.
- **Root Cause**: In `script.js` (lines 416-417), the event listener calls `renderCertifications()` and `renderCoding()`. However, **neither of these functions is defined** anywhere in `script.js` or in the project.
- **Impact**: Changing the view mode throws a `ReferenceError`, stopping subsequent JS execution in the click handler.

---

## 3. Accessibility (a11y) Violations

A static audit of the codebase against WCAG 2.1 AA and web.dev standards revealed the following issues:

### 1. Contrast Violations
- **Section Labels on Light Backgrounds**: `.section-label` uses `var(--blue-500)` (`#3ca9e8`). On light backgrounds (e.g. white `#ffffff`), the contrast ratio is only **2.61:1**, which is far below the WCAG AA minimum of **4.5:1** (or **3:1** for large text).
- **Secondary Text**: Elements utilizing `var(--grey-500)` (`#718093`) over white background result in a contrast ratio of **4.07:1**, falling short of the **4.5:1** requirement.

### 2. Tap Target Violations
- **View-Mode Pills**: `.view-mode-pill` elements have a rendering height of approximately **36px** (based on font size and vertical padding). This is significantly smaller than the standard minimum of **48px** required for reliable touch target sizes.

### 3. Broken ARIA & Landmark Semantics
- **Missing Tabpanel Roles**: The view-mode toggles use `role="tab"` and `aria-controls="main"`, but the target `<main id="main">` landmark lacks the required `role="tabpanel"` role, breaking screen reader navigation.
- **Disconnected Tooltip / Hints**: The `.hint-trigger` button (`?`) appends a dynamic `.hint-tooltip` div directly to the `<body>` on focus/hover. There is no `aria-describedby` association or `role="tooltip"` used, meaning screen reader users will not hear the tooltip content.
- **Logo Link Over-ride**: The brand logo `<a class="brand" href="#top" aria-label="Back to top">` contains the text "EAE Portfolio". The `aria-label="Back to top"` overrides this text, preventing screen readers from announcing the logo text to users.
