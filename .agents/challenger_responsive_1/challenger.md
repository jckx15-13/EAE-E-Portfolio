## Challenge Summary

**Overall risk assessment**: MEDIUM

While the responsive layout fixes successfully eliminated horizontal scrolling/overflow across all viewports (1280px, 820px, 520px, and 380px) and the view-mode toggle test passed successfully, there are critical style overrides and semantic HTML design flaws that violate the specified constraints.

Specifically:
1. **Vertical Stretching Violation**: The Future Goals section card layout (`.goals-layout`) explicitly uses `align-items: stretch` (style.css:2622), overriding `align-items: start;` (style.css:1295), causing card containers to stretch vertically and create empty space.
2. **Accessibility Landmark Violations**: The accessibility test suite results in `tests/reports/accessibility.json` reveal 3 active violations related to HTML semantics and landmarks (e.g., using `role="tabpanel"` on `<main>` element).

---

## Challenges

### [Medium] Challenge 1: Future Goals Layout Card Stretching

- **Assumption challenged**: The layout fixes applied in Milestones 2 successfully resolved all card vertical stretching issues.
- **Attack scenario**: When the user views the "Future Goals" section on desktop/tablet devices, if one column (e.g., "Short-term goals") has significantly fewer items than the other (e.g., "Long-term goals"), the card container of the shorter column stretches vertically to match the taller column's height. This leaves a noticeable, unstyled empty space at the bottom of the shorter card, violating the design requirement of using natural container height.
- **Blast radius**: The "Future Goals" card boxes look unevenly padded, creating awkward visual gaps.
- **Mitigation**: Remove `align-items: stretch;` from `.goals-layout` in `style.css:2622` and allow it to fall back to `align-items: start;` as declared in `style.css:1295`.

### [High] Challenge 2: Improper ARIA Role on `<main>` Element

- **Assumption challenged**: The page structure is fully accessible and conforms to WCAG 2.1 AA guidelines.
- **Attack scenario**: The `<main>` element has been assigned `role="tabpanel"` (`<main id="main" role="tabpanel" aria-labelledby="view-cards">`). This overrides the default semantic meaning of the `<main>` tag, causing the screen reader and accessibility engines (like Axe) to report that the page lacks a `main` landmark. Additionally, some page elements (like the view-mode bar and main content) are left floating outside any valid landmark region.
- **Blast radius**: 3 WCAG AA violations are reported by `axe-core`:
  - `aria-allowed-role` (role="tabpanel" is not allowed on `<main>`)
  - `landmark-one-main` (no main landmark present on page)
  - `region` (page content not contained within landmarks)
- **Mitigation**: Move the `role="tabpanel"` and related ARIA attributes to a wrapper `div` element inside `<main>` rather than applying them directly to the `<main>` element, or restructure the page navigation tabs using standard semantic patterns.

---

## Stress Test Results

- **Horizontal scroll check** → Page scrollWidth <= clientWidth for 1280px, 820px, 520px, and 380px viewports → Verified via `responsive-check.js` → **PASS** (Zero horizontal overflow)
- **View-mode toggle test** → Clicking `#view-cards`, `#view-timeline`, `#view-story` correctly toggles class and dataset attributes on body → Verified via `run_tests.js` → **PASS**
- **Accessibility validation** → Run Axe-core WCAG audits → Verified via `run_tests.js` generating `tests/reports/accessibility.json` → **FAIL** (3 violations found: `aria-allowed-role`, `landmark-one-main`, `region`)
- **Card container vertical stretch** → Card containers do not use `align-items: stretch` → Verified by analyzing `style.css` → **FAIL** (`.goals-layout` uses `align-items: stretch` at line 2622)

---

## Unchallenged Areas

- **Visual Rendering of Images/Media** — Not challenged due to lack of programmatic visual regression tests for media overlays.
- **Dynamic Data Loading** — Not challenged as the test data loads fine and there are no functional javascript exceptions thrown.
