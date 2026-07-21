# Jaron Chew EAE Portfolio — Implementation Roadmap

## Purpose

Improve the vanilla HTML/CSS/JavaScript portfolio while preserving existing functionality, responsiveness, accessibility, maintainability, and EAE credibility.

## Implementation Phases

1. **Baseline and safety**
   - Record the current test results and inspect the working tree.
   - Review `index.html`, `style.css`, `script.js`, `data.js`, `server.js`, and existing reports.
   - Confirm protected selectors, APIs, data contracts, and content claims before editing.

2. **Tier 1: Acceptance-critical fixes**
   - Reduce unnecessary `!important` usage in `style.css`.
   - Add defensive data-rendering fallbacks in `script.js`.
   - Safely centralize or guard DOM selectors without renaming protected selectors.
   - Audit responsive layouts at all required viewport widths.
   - Verify modal focus placement, Escape handling, and focus restoration.
   - Check horizontal overflow, header overlap, clipped cards, and stretched grids.

3. **Tier 2: Presentation and accessibility polish**
   - Standardize spacing and typography hierarchy.
   - Verify hover contrast and visible keyboard focus.
   - Audit reduced-motion behavior and animation smoothness.
   - Check Live Editor and sidebar behavior at narrow widths.
   - Replace editor-facing placeholders only with verified content.

4. **Tier 3: Optional enhancements**
   - Improve Story-mode Growth Thread visibility.
   - Verify print and PDF presentation.
   - Optimize project and modal media where appropriate.
   - Defer large CSS refactors, skeleton screens, and breadcrumbs unless time allows.

5. **Final regression and handoff**
   - Run automated checks and complete the regression checklist.
   - Perform manual keyboard, responsive, modal, media, and content checks.
   - Record unresolved environment issues separately from product defects.

## Acceptance Gates

- **Functionality:** Cards, Timeline, and Story modes render and toggle correctly; `eaePortfolioViewModeV2` persists the selected mode after refresh.
- **Layout:** No horizontal overflow or clipped content at `1440`, `1366`, `1280`, `1024`, `820`, `768`, `520`, `430`, `390`, `380`, and `360` pixels.
- **Chrome:** Fixed header and view-mode bar do not obscure content; `--site-chrome-height` stays synchronized.
- **Cards and grids:** No unintended `align-items: stretch`; cards remain readable and aligned.
- **Accessibility:** Skip link, keyboard navigation, focus-visible states, modal focus behavior, Escape handling, ARIA states, image alt text, contrast, and reduced-motion support work correctly.
- **Content:** No invented certificates, awards, course facts, outcomes, or production-security claims.
- **Regression:** Live Editor, Advanced Admin Editor, asset upload, custom sections, insert-asset, and save flows continue working.
- **Security:** `/api/save` and the `filePath.startsWith(PUBLIC_DIR)` traversal check remain unchanged.

## Verification Commands

Run the server separately when required, and do not claim success unless output is observed.

```bash
node server.js
npm test
node responsive-check.js
node tests/verify-cards.js
node tests/verify-all-grids.js
npm run design:lint
```

## Protected Contracts

- Preserve the vanilla HTML5, CSS3, and JavaScript stack.
- Preserve `window.PORTFOLIO_DATA` and its IIFE serialization contract.
- Preserve `eaePortfolioViewModeV2`.
- Preserve Cards, Timeline, and Story modes.
- Preserve `#main`, `#siteNav`, `#brandName`, `#view-cards`, `#view-timeline`, `#view-story`, `#projectsGrid`, `#achievementCards`, `#achievementTimeline`, `#personalMapCards`, `#evidenceDeckCards`, `#achievementModal`, and `#modalContent`.
- Preserve `.site-chrome`, `.site-header`, `.view-mode-bar`, `.view-mode-pill`, `.project-grid`, `.achievement-grid`, `.story-connector`, `.timeline-card-node`, `.live-editor-fab`, and `.live-editor-sidebar`.
- Preserve `/api/save` and `filePath.startsWith(PUBLIC_DIR)`.
- Preserve the required `1280px`, `820px`, `520px`, and `380px` breakpoints.
- Do not add unapproved dependencies, APIs, frameworks, or build systems.

## Known Test Caveats

- `npm test` previously passed the core view-mode and Live Editor E2E flows and ran Axe-Core.
- This does not prove zero accessibility violations unless the current Axe report is rerun and inspected.
- Puppeteer-dependent checks previously encountered Chrome launch and runtime-environment issues.
- `verify-cards.js` previously timed out during Chrome startup.
- `responsive-check.js` previously timed out and therefore does not constitute a complete responsive pass.
- Full verification remains pending at the viewport widths listed above.
- Keep test-environment failures separate from actual product defects.

## Handoff Checklist

- [ ] Check git status and preserve the current baseline.
- [ ] Apply the smallest safe Tier 1 patches.
- [ ] Verify all protected selectors and contracts remain unchanged.
- [ ] Run `npm test` and inspect the generated accessibility report.
- [ ] Repair or document Chrome runtime issues affecting Puppeteer checks.
- [ ] Test Cards, Timeline, and Story modes manually.
- [ ] Test every required responsive viewport.
- [ ] Test keyboard navigation, modal focus, Escape close, and focus restoration.
- [ ] Test Live Editor open/close, upload, custom sections, asset insertion, and save.
- [ ] Review content for unsupported claims and unresolved placeholders.
- [ ] Record commands, observed results, changed files, and remaining risks.
