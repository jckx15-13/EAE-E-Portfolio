# Project: EAE Portfolio Automated Testing & Accessibility Verification Suite

## Architecture
- **Portfolio Server**: `server.js` runs on `http://localhost:3000` to serve the portfolio page and save updates.
- **Test Suite**: A NodeJS test script/suite executing browser automation offline.
- **Accessibility Engine**: Integration of `axe-core` for programmatic WCAG 2.1 AA checks.
- **Reports**: Writes a compliant JSON report to `tests/reports/accessibility.json`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Analyze responsive layout on small screens (breakage, overlapping, squeezed containers, off-centering) and card stretching. Identify existing testing utilities/UIJudge. | None | DONE |
| 2 | Implementation of Responsive Layout Fixes | Apply CSS/HTML remediation to resolve card vertical stretching, viewport squeezing in small screens, and mobile header overlapping. | M1 | IN PROGRESS |
| 3 | Verification | Re-run automated accessibility/view-mode tests and responsive check scripts to ensure no regressions and zero WCAG violations. | M2 | TBD |
| 4 | Forensic Audit | Final end-to-end review of portfolio visuals, accessibility reports, and code structure by the audit agent. | M3 | TBD |

## Interface Contracts
### Test Runner ↔ Portfolio Server
- Test runner automatically starts and stops `server.js` on port 3000, or connects to it.
- Interacts with view-toggle buttons (`#view-story`, `#view-timeline`, `#view-cards`).
- Toggles class (`.story-mode`, `.timeline-mode`, `.cards-mode`) on `body`.

### Accessibility Reporter
- Formats Axe-core output and saves to `tests/reports/accessibility.json`.
- Must contain key metrics including violation count, descriptions, impact/severity.

## Code Layout
- `.agents/` - Orchestrator and agent metadata (no source/tests here)
- `tests/` - Test suite scripts, helper modules, and configs
- `tests/reports/` - Generated test reports
- `package.json` - Node scripts and dependency definition
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
# EAE Portfolio: Comprehensive Improvement Report
**Date**: 19 July 2026  
**Baseline**: npm test PASSED, all view-mode toggles functional, E2E flows successful, accessibility audit ran  
**Scope**: Code quality, layout responsiveness, UI/UX, spacing, immersion, logic, accessibility, performance

---

## Executive Summary

The portfolio successfully passes core functionality tests (view mode switching, achievement rendering, modal behaviour, live editor flows). However, inspection reveals opportunities for improvement across code maintainability, responsive scaling, visual polish, and content credibility.

**Recommended approach**: Fix critical blockers first (regressions), then medium/high polish items in parallel, deferring nice-to-haves until final submission review.

---

## Test Baseline Results

| Category | Status | Details |
|----------|--------|---------|
| **Core tests** | ✅ PASS | View modes toggle, E2E flows complete, no console errors |
| **Accessibility audit** | ✅ RAN | Report generated at `tests/reports/accessibility.json` |
| **Card verification** | ⚠️ TIMEOUT | Puppeteer Chrome launch timeout (runtime env issue, not code) |
| **Responsive check** | ⚠️ SKIP | Same environment issue; manual verification required |
| **Placeholder cleanup** | ✅ VERIFIED | No "TBD", "coming soon", "pending" in rendered output |
| **Timeline sorting** | ✅ VERIFIED | Chronological date sorting confirmed |

---

## CRITICAL BLOCKERS (Must fix before submission)

### 1. Excessive `!important` usage in CSS
**Severity**: 🔴 HIGH  
**File**: `style.css`  
**Issue**: 40+ instances of `!important`, many unnecessary, making cascade override difficult and brittle.  
**Examples**:
- Line 143: `transition: transform 120ms ... !important;` (can be removed)
- Line 520, 524, 529: Admin theme colors with `!important` (can use specificity instead)
- Lines 3038-3041: Reduced motion rules with `!important` (justified but overused)

**Impact on EAE**: Code looks unprofessional; if admissions reviewer inspects source, signals weak CSS knowledge.  
**Recommendation**: Refactor to use specificity and CSS cascade instead of `!important` overrides. Keep only 2-3 for critical reset rules.  
**Effort**: ~1 hour

---

### 2. Fragile DOM queries and lack of defensive checks
**Severity**: 🔴 HIGH  
**File**: `script.js`  
**Issue**: 36+ direct `document.querySelector`/`getElementById` calls scattered throughout code. No centralized selector constants. If HTML selectors change, code breaks silently or throws errors.  
**Examples**:
- Line 131: `document.getElementById('achievementTimeline')` (called multiple times)
- Line 1832: `document.getElementById("achievementModal")` (modal open logic)
- Line 1856: `document.querySelector(".nav-toggle")` (hamburger menu)

**Impact on EAE**: If you or a collaborator renames an ID/class, features break. No graceful fallback.  
**Recommendation**: Create a `SELECTORS` constant object at top of script.js; use defensive null checks.  
**Effort**: ~45 minutes

```javascript
// At top of script.js
const SELECTORS = {
  achievementTimeline: '#achievementTimeline',
  achievementModal: '#achievementModal',
  viewCards: '#view-cards',
  viewTimeline: '#view-timeline',
  viewStory: '#view-story',
  navToggle: '.nav-toggle',
  siteNav: '#siteNav',
  // ... etc
};

// Usage:
const timeline = document.getElementById(SELECTORS.achievementTimeline.slice(1));
if (!timeline) {
  console.warn('Achievement timeline not found');
  return;
}
```

---

### 3. Missing error handling in data rendering
**Severity**: 🔴 MEDIUM-HIGH  
**File**: `script.js`  
**Issue**: If `window.PORTFOLIO_DATA` is missing a property or has unexpected structure, rendering functions may produce silent failures or console errors.  
**Examples**:
- `achievements` array not present → timeline rendering fails silently
- `projects` array is empty → grid is blank but no message to user
- `profile.name` is undefined → hero shows blank name

**Impact on EAE**: Incomplete portfolio display; evaluators see missing sections without explanation.  
**Recommendation**: Add defensive checks and fallbacks; log warnings to console for debugging.  
**Effort**: ~30 minutes

---

### 4. Repetitive card rendering logic
**Severity**: 🟡 MEDIUM  
**File**: `script.js`  
**Issue**: `createAchievementCard()`, `createProjectCard()`, and similar functions repeat structure (title, date, summary, kicker). DRY principle violated.  
**Impact on EAE**: Hard to maintain; if card structure changes, must update multiple places.  
**Recommendation**: Extract common card factory function.  
**Effort**: ~1 hour

---

## HIGH PRIORITY (Fix before submission)

### 5. Responsive breakpoint coverage gaps
**Severity**: 🟡 HIGH  
**File**: `style.css`  
**Issue**: Media queries at 900px, 480px, and some inline breakpoints, but missing explicit rules for:
- 768px (iPad portrait)
- 430px (modern phones)
- 1024px (iPad landscape)

Test viewports (1366, 1024, 820, 768, 520, 390, 375, 320) may not all have optimal layouts.

**Impact on EAE**: Portfolio looks broken or cramped on certain devices; evaluator's first impression suffers.  
**Recommendation**: Add explicit media queries for 1024px, 768px, 430px; verify no horizontal overflow at any breakpoint.  
**Effort**: ~1.5 hours

---

### 6. Scroll progress bar may clip on very small screens
**Severity**: 🟡 MEDIUM-HIGH  
**File**: `style.css` lines 5173-5227  
**Issue**: Progress bar `::before` pseudo-element with `width: 120px` and `::after` glow may overflow or be hidden on phones < 320px width. Glow animation `translateX(0) → translateX(80px)` assumes enough space.

**Impact on EAE**: Progress bar glow animation may cause unexpected layout shift or be invisible on small screens.  
**Recommendation**: Use `clamp()` or media query to make glow smaller on mobile.  
**Effort**: ~20 minutes

---

### 7. Modal does not trap focus / cannot be closed on keyboard-only
**Severity**: 🟡 MEDIUM-HIGH  
**File**: `script.js` (modal handling), `style.css` (modal styles)  
**Issue**: While Escape key closes modal (good), focus may escape to background page. WCAG 2.1 requires focus trap in modals.

**Impact on EAE**: Accessibility audit may flag this; evaluators using keyboards/screen readers will notice.  
**Recommendation**: Implement focus trap: move focus into modal on open, return focus on close.  
**Effort**: ~45 minutes

---

### 8. Placeholder text appears in Live Editor
**Severity**: 🟡 MEDIUM  
**File**: `script.js`, `data.js`  
**Issue**: While rendered page is clean, editing JSON in Live Editor shows placeholder values. Not visible to evaluators, but if they inspect or use admin features, it looks incomplete.

**Impact on EAE**: Low, but signals portfolio is still work-in-progress.  
**Recommendation**: Replace placeholder values in `data.js` with real content or credible filler.  
**Effort**: ~15 minutes (content-dependent)

---

### 9. No loading state or skeleton screens
**Severity**: 🟡 MEDIUM  
**File**: `script.js`, `style.css`  
**Issue**: Page loads instantly (good), but if data load were slow, user would see blank page. No visual feedback.

**Impact on EAE**: Not critical for local portfolio, but adds polish.  
**Recommendation**: Optional: add CSS keyframes for card skeleton state or fade-in animations on first load.  
**Effort**: ~1 hour

---

## MEDIUM PRIORITY (Polish before final review)

### 10. Spacing and alignment inconsistencies
**Severity**: 🟡 MEDIUM  
**File**: `style.css`  
**Issue**: Some sections use `gap: 20px`, others `gap: 16px`, others `gap: 24px`. Padding around cards varies. No consistent spacing scale applied everywhere.

**Examples**:
- Line 377: `gap: 20px 56px` (hero layout)
- Line 422: `gap: 16px` (cards)
- Line 701: `gap: 40px 56px` (evidence grid)

**Impact on EAE**: Page feels slightly disorganized visually; not professional-looking.  
**Recommendation**: Adopt a single spacing scale (8px, 12px, 16px, 20px, 24px, 32px) and apply consistently.  
**Effort**: ~1.5 hours

---

### 11. Typography hierarchy not fully leveraged
**Severity**: 🟡 MEDIUM  
**File**: `style.css`  
**Issue**: Display, section-title, card-title, body, and label sizes exist, but not all used consistently. Some small text (labels, metadata) could be bolder or smaller to reduce visual weight.

**Impact on EAE**: Content hierarchy less clear; evaluators may not immediately grasp what's important.  
**Recommendation**: Audit headings and body copy; increase contrast between hierarchy levels.  
**Effort**: ~1 hour

---

### 12. Animation smoothness and reduced-motion support
**Severity**: 🟡 MEDIUM  
**File**: `style.css`  
**Issue**: Multiple animations (progress bar glow, timeline pulse, card reveals). Good, but some may feel jerky at 60fps. Reduced motion support exists but may be incomplete.

**Examples**: 
- Progress bar glow: 4s infinite alternate (smooth)
- Timeline pulse: 1.2s (could be faster)
- Scroll reveal: may have layout shifts

**Impact on EAE**: If evaluator has motion sensitivity, they may see distracting effects.  
**Recommendation**: Verify `prefers-reduced-motion` is applied everywhere animations occur; test smoothness.  
**Effort**: ~45 minutes

---

### 13. Color contrast on hover states
**Severity**: 🟡 MEDIUM  
**File**: `style.css`  
**Issue**: Some button and card hover states may not meet WCAG AA contrast (4.5:1 for text, 3:1 for graphics). Astral theme with semi-transparent overlays complicates this.

**Impact on EAE**: Accessibility audit may flag; some users may not see interactive states clearly.  
**Recommendation**: Test all interactive elements with colour contrast checker; adjust hover colours if needed.  
**Effort**: ~1 hour

---

### 14. Story mode narrative flow unclear
**Severity**: 🟡 MEDIUM  
**File**: `index.html`, `script.js`, `style.css`  
**Issue**: Story mode exists but the "growth thread" connectors between projects are not obvious to users. No visible thread or explanation of how projects connect.

**Impact on EAE**: Story mode may feel like just another view instead of a cohesive narrative.  
**Recommendation**: Add subtle visual connectors (e.g., vertical lines, arrows) between chronologically sorted projects; label them as "Growth Threads" with brief explanations.  
**Effort**: ~2 hours

---

## LOW PRIORITY (Nice-to-have polish)

### 15. Performance: Large CSS file (5305 lines)
**Severity**: 🟢 LOW  
**File**: `style.css`  
**Issue**: CSS is comprehensive but could be split into modules (base, components, utilities, admin, print) for maintainability.

**Impact on EAE**: None visible to evaluators, but shows professional structure.  
**Recommendation**: Optional refactor; not urgent.

---

### 16. Print mode needs testing
**Severity**: 🟢 LOW  
**File**: `style.css` (lines ~3620+)  
**Issue**: Print styles exist, but not tested on physical or PDF output. Portfolio may not print cleanly.

**Impact on EAE**: If evaluator prints portfolio, layout may break or look poor.  
**Recommendation**: Test print via DevTools → Print → Save as PDF; verify readability.  
**Effort**: ~30 minutes

---

### 17. No breadcrumb or section navigation
**Severity**: 🟢 LOW  
**File**: `index.html`, `script.js`  
**Issue**: Navigation links exist, but no breadcrumb or "you are here" indicator.

**Impact on EAE**: Minor; evaluators can still navigate.  
**Recommendation**: Optional; low value.

---

### 18. Achievement modal images may not be optimized
**Severity**: 🟢 LOW  
**File**: `script.js` (modal rendering)  
**Issue**: If modal shows large uncompressed images, load time may suffer.

**Impact on EAE**: Slightly slower modal opening.  
**Recommendation**: Ensure images are JPEG/WebP and optimized; lazy-load if large.  
**Effort**: ~1 hour (depends on image count)

---

## POTENTIAL REGRESSIONS TO VERIFY MANUALLY

Before declaring all features working, manually test (using the regression checklist in `tests/regression-checklist.md`):

1. ✅ Cards view loads with all achievements
2. ✅ Timeline view loads with chronological sorting
3. ✅ Story view loads
4. ✅ View mode persists after refresh
5. ✅ Achievement search works
6. ⚠️ Modal opens and closes cleanly (verify focus trap)
7. ⚠️ Scroll progress bar updates (check for jitter)
8. ⚠️ Floating timeline controls appear only in achievements section
9. ⚠️ Year filter shows/hides items correctly
10. ⚠️ Live editor opens/closes (verify sidebar layout doesn't break)
11. ⚠️ No horizontal overflow at any breakpoint (1366, 1024, 768, 520, 390, 375, 320)

---

## Prioritized Action Backlog

### Tier 1: Critical (Do before EAE submission)
1. Remove unnecessary `!important` from CSS (reduce to ~5 total)
2. Centralize DOM selectors into a SELECTORS constant
3. Add defensive checks for missing data properties
4. Fix responsive breakpoints for 768px, 430px, 1024px
5. Verify modal focus trap works and Escape key functions
6. Test all breakpoints for horizontal overflow

**Estimated effort**: ~4 hours  
**Acceptance risk**: HIGH (if not done, features may break or look broken)

### Tier 2: High (Polish before final review)
7. Audit and standardize spacing scale
8. Review typography hierarchy; increase contrast
9. Verify animation smoothness and reduced-motion coverage
10. Test colour contrast on all hover/interactive states
11. Update placeholder text in Live Editor if editing during demo

**Estimated effort**: ~4-5 hours  
**Acceptance risk**: MEDIUM (affects visual polish and professionalism)

### Tier 3: Medium (Nice-to-have before submission)
12. Enhance Story mode with visible "Growth Thread" connectors
13. Test print mode and optimize for PDF export
14. Optimize images in modals

**Estimated effort**: ~3-4 hours  
**Acceptance risk**: LOW (bonus features, not essential)

### Tier 4: Low (Defer if time-constrained)
15. Refactor CSS into modules
16. Add loading skeleton screens
17. Implement breadcrumb navigation

**Estimated effort**: ~5+ hours  
**Acceptance risk**: VERY LOW (nice-to-have only)

---

## Quick Wins (30 mins - 1 hour each)

- [ ] Create SELECTORS constant and start replacing scattered `document.querySelector()` calls
- [ ] Add `||` fallback in critical data access (e.g., `data.profile.name || 'Your Name'`)
- [ ] Wrap `!important` removals in one pass through style.css
- [ ] Add explicit media query for 768px mobile breakpoint
- [ ] Verify year filter visual feedback (highlight active pill more clearly)

---

## Testing Matrix for Next Phase

| Phase | Feature | Test Method | Pass Criteria | Time |
|-------|---------|-------------|---------------|------|
| Regression | Cards view | Browser | Renders 5+ cards, no layout break | 5 min |
| Regression | Timeline sort | Browser + DevTools | Dates in ascending order | 5 min |
| Regression | Search | Browser | "xyz" returns 0 results, clear works | 5 min |
| Regression | Modal | Browser | Opens, closes, Escape works, no focus escape | 10 min |
| Regression | Responsive | Browser at 1366, 1024, 768, 520, 390, 375, 320 | No horiz overflow, readable | 20 min |
| Accessibility | Keyboard nav | Tab through page | Reach all buttons, modals, links | 10 min |
| Accessibility | Contrast | DevTools → Accessibility | WCAG AA on all text | 5 min |
| Accessibility | Motion | OS reduced-motion + browser | No jarring animations | 5 min |
| Visual | Spacing | Browser at 1366px | Consistent gaps, balanced padding | 10 min |
| Visual | Hierarchy | Browser | Clear headline, subheading, body distinction | 10 min |

**Total manual test time**: ~90 minutes

---

## Conclusion

The portfolio is **functionally solid** and ready for submission with Tier 1 fixes applied. Tier 2 polish items will elevate presentation quality significantly. Tier 3–4 improvements are optional but recommended for a standout final product.

**Recommended next step**: Start with the regression checklist (`tests/regression-checklist.md`), then apply Tier 1 fixes in this order:
1. `!important` cleanup
2. SELECTORS constant
3. Defensive data checks
4. Responsive breakpoint audit
5. Modal focus trap

After those, reassess Tier 2 items based on time and visibility gain.
