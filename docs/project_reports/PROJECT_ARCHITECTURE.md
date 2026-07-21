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
