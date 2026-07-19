# Handoff Report: EAE Portfolio Codebase Responsive Analysis

## 1. Observation

1. **Hardcoded Small Viewport Width Constraints**:
   - Location: `style.css` lines 3100–3105
   - Content:
     ```css
     .hero-copy,
     .hero-visual,
     .hero-centerpiece {
       width: min(100%, 310px);
       margin-inline: auto;
     }
     ```
2. **Static 3-Column Grid Layout for Projects**:
   - Location: `style.css` lines 1801–1805
   - Content:
     ```css
     .project-grid {
       display: grid;
       grid-template-columns: repeat(3, minmax(0, 1fr));
       gap: 22px;
     }
     ```
3. **Double-Column Sub-Grid inside Project Card**:
   - Location: `style.css` lines 2057–2062
   - Content:
     ```css
     .project-insight {
       display: grid;
       grid-template-columns: repeat(2, minmax(0, 1fr));
       gap: 12px;
     }
     ```
4. **DOM Rendering Heights under medium viewport (800px)**:
   - Output from Puppeteer evaluation inside `check_errors.js` (running on `http://localhost:3000/`):
     - Card Index 1: width: `236px`, total card height: `1770.625px`, body height: `1191.625px`, `.project-insight` height: `729.53px`.
     - Card Index 2: width: `236px`, total card height: `1770.625px`, body height: `897.875px`, `.project-insight` height: `541.15625px`.
     - Card Index 3: width: `236px`, total card height: `1770.625px`, body height: `1197.78125px`, `.project-insight` height: `588.25px`, `.project-tech-strip` height: `236.03px`.
5. **Testing Utilities**:
   - `package.json` line 3: `"test": "node tests/run_tests.js"`
   - `responsive-check.js` (uses Puppeteer to write screenshots on ports `1280`, `820`, `520`, `380` on port `8001`).

---

## 2. Logic Chain

1. **Small Screen Squeezing**:
   - By observing (1), `.hero-copy`, `.hero-visual`, and `.hero-centerpiece` are restricted to a max width of `310px` even when the screen is up to `520px` wide.
   - This causes elements to fit poorly on screens like 380px and 520px, squeezing text and creating off-centering with large horizontal margins (e.g., `105px` margin on each side for `520px` viewport).
2. **Extreme Card Vertical Stretching**:
   - Observing (2), the `.project-grid` remains in a 3-column layout down to `680px`.
   - On an `800px` screen (e.g., tablet view), after accounting for page margins, each card is restricted to a width of `236px`.
   - Observing (3), the `.project-insight` sub-grid further splits the card's body content into 2 columns.
   - For a `236px` card, after subtracting body margins (`24px` on each side), the available width is `188px`. Dividing this by 2 yields a width of only `88px` for each insight block.
   - Long text paragraphs (e.g., 20+ words in `portfolioSignal`) wrapping inside an `88px` container wrap aggressively, extending `.project-insight` to heights up to `729px` (Observation 4).
   - In Card 3, the long list of technologies wrapped into multiple rows in the narrow body, stretching `.project-tech-strip` to `236px` height (Observation 4).
   - CSS Grid's default `align-items: stretch` forces all cards in that row to match the height of the tallest card (`1770px`), causing massive empty spaces in shorter cards.

---

## 3. Caveats

- We assumed that the portfolio server has not been modified outside of testing scopes.
- We did not investigate user interaction behaviors under print layout stylesheet adjustments since the focus is on small screen responsiveness.

---

## 4. Conclusion

The small screen off-centering and squeezing are caused by the hardcoded `310px` layout constraints in `@media (max-width: 520px)`. The vertical card stretching is caused by the combination of an inflexible 3-column grid layout on medium/tablet viewports and a nested 2-column sub-grid structure inside each card.

Recommended Fixes:
1. Make column count fluid (`auto-fit` with `minmax(280px, 1fr)`) instead of hardcoded 3-column grids.
2. Remove the hardcoded `310px` width constraints on small screen media queries.
3. Make the card components flex containers to align footers (`.project-details` toggles) to the bottom of the stretched cards.

---

## 5. Verification Method

- Run the test suite: `npm test`
- Run the responsive check utility: `node responsive-check.js` (verifies that images are generated as `responsive-*.png` and check that the layout fits without overflow and text is readable).
- Check the computed height of elements programmatically using a Puppeteer inspector script.
