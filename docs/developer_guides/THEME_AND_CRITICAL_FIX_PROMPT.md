# Theme Repair + Critical Fixes Prompt (20 Issues)

Use this prompt when you want an automated coding agent to patch the EAE portfolio without rewriting architecture.

## Execution Prompt

```markdown
CRITICAL DIRECTIVE: PATCH THEME TOGGLE + TOP 20 CODE RISKS

Project rules:
- Preserve vanilla HTML/CSS/JS architecture.
- Keep IDs/selectors/contracts: #main, #siteNav, #brandName, #view-cards, #view-timeline, #view-story, #projectsGrid, #achievementCards, #achievementTimeline, #personalMapCards, #evidenceDeckCards, #achievementModal, #modalContent, window.PORTFOLIO_DATA.
- Do not remove Live Editor, A11y drawer, Cards/Timeline/Story, /api/save.

Files to update:
- style.css
- script.js
- server.js
- index.html (only if required for labels/meta links)

PHASE 1: Theme consistency and token architecture
1. Replace hardcoded dark backgrounds/borders in media-heavy components (Draw.io, spreadsheet panels, FLL graph, slides wrappers) with semantic tokens:
   - var(--theme-bg)
   - var(--theme-surface)
   - var(--theme-surface-soft)
   - var(--theme-card-bg)
   - var(--theme-border)
2. Ensure light mode has explicit overrides for astral section backgrounds so sections do not stay dark after toggle.
3. In applyThemeTokens(), write user color picks to semantic tokens:
   - --theme-accent-cyan
   - --theme-accent-purple
   - --theme-bg
4. Keep legacy aliases in sync for backward compatibility only:
   - --blue-500
   - --purple-700
   - --paper
5. Remove any !important inside theme root profile blocks if present.

PHASE 2: Security, A11y, and reliability (20 critical issues)
6. Eliminate tooltip XSS: replace innerHTML injection with document.createElement/textContent rows.
7. Eliminate story connector HTML injection: build connector nodes via create() helper.
8. Restrict CORS in server.js to localhost origins used by project.
9. Add byte-size guard to pushUndoSnapshot() to avoid sessionStorage QuotaExceededError.
10. Ensure thumbnail alt text is descriptive and contextual.
11. On modal open, set aria-hidden="true" on #main; remove on close.
12. Add transition for focus-highlight-mode outlines to reduce flashing artifacts.
13. Ensure Live Editor color pickers have labels bound by htmlFor + matching input ids.
14. Ensure data.theme and data.theme.colors are initialized before assignment.
15. Remove duplicate-id creation in evidence rendering flows.
16. Harden resolveSlidesEmbedUrl() with URL parsing and query/hash stripping for Canva embed URLs.
17. Ensure FLL graph SVG scales on mobile: max-width:100%, height:auto.
18. Normalize z-index hierarchy using tokens (header/editor/modal/overlay/tooltip).
19. Ensure snapshot cards have hover elevation parity with other cards.
20. Enable momentum scrolling for table wrappers on iOS: -webkit-overflow-scrolling: touch.
21. Add safe fallback font stack in dynamic font preview code.
22. Make print mode monochrome-safe: force black text and transparent backgrounds.
23. Remove stale commented legacy blocks in JS where they can cause maintenance confusion.

Verification:
- Run npm test
- Run node tests/verify-cards.js
- Run node tests/verify-all-grids.js
- If available, run node responsive-check.js

Output format:
- List patched files only
- Then list any blockers with exact file and reason
```

## Solution Notes (What each fix should do)

1. Theme desync:
- Root cause: component-level hardcoded dark colors bypass data-theme.
- Fix: move those values to semantic tokens and add light-theme overrides.

2. Tooltip XSS:
- Root cause: HTML string injection into tooltip container.
- Fix: render rows as nodes with textContent.

3. Story connector injection:
- Root cause: dynamic markup assembled as raw HTML.
- Fix: construct connector/callout using create('div', ...) and create('p', ...).

4. CORS hardening:
- Root cause: wildcard origin or loose allow-list.
- Fix: allow only localhost dev origins.

5. Undo quota stability:
- Root cause: snapshot growth in sessionStorage.
- Fix: byte-based guard (TextEncoder) + trim oldest snapshots.

6. A11y image text:
- Root cause: empty/non-descriptive alt attributes.
- Fix: use title-aware alt text, include index.

7. Modal a11y trap:
- Root cause: background still visible to screen readers.
- Fix: apply/remove aria-hidden on main content around modal lifecycle.

8. Focus flashing:
- Root cause: abrupt outline jumps in focus-highlight mode.
- Fix: add short transition for outline + box-shadow.

9. Live editor labels:
- Root cause: missing explicit form associations.
- Fix: bind htmlFor to explicit ids for each color input.

10. Theme object crash:
- Root cause: writes into undefined nested object.
- Fix: initialize data.theme and data.theme.colors defensively.

11. Duplicate IDs:
- Root cause: cloning/rendering path can duplicate ids.
- Fix: ensure dynamic blocks do not duplicate #personalMapCards or related ids.

12. Canva URL normalization:
- Root cause: tracking params and malformed embed suffixes.
- Fix: normalize origin/path and append exactly one /embed.

13. SVG responsiveness:
- Root cause: fixed dimensions overflow on small viewports.
- Fix: keep viewBox but set CSS width:100%, max-width:100%, height:auto.

14. Z-index scale:
- Root cause: arbitrary high z-index values causing overlay fights.
- Fix: use tokens (header/editor/modal/overlay/tooltip) consistently.

15. Snapshot parity:
- Root cause: inconsistent interaction feel across card families.
- Fix: apply subtle hover translateY + shadow.

16. iOS table scrolling:
- Root cause: inertial scrolling disabled in overflow wrapper.
- Fix: add -webkit-overflow-scrolling: touch.

17. Font fallback safety:
- Root cause: dynamic preview assumes selected webfont loads instantly.
- Fix: include robust fallback chain.

18. Print ink optimization:
- Root cause: residual dark backgrounds and colored text in print mode.
- Fix: enforce black text and transparent backgrounds in print media query.

19. Legacy comments cleanup:
- Root cause: stale commented blocks hide active behavior intent.
- Fix: remove or relocate obsolete blocks into docs.

20. Theme root specificity:
- Root cause: root blocks with !important prevent runtime overrides.
- Fix: remove !important in root theme variable declarations.
