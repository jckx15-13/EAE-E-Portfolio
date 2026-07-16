# Project: EAE Portfolio Automated Testing & Accessibility Verification Suite

## Architecture
- **Portfolio Server**: `server.js` runs on `http://localhost:3000` to serve the portfolio page and save updates.
- **Test Suite**: A NodeJS test script/suite executing browser automation offline.
- **Accessibility Engine**: Integration of `axe-core` for programmatic WCAG 2.1 AA checks.
- **Reports**: Writes a compliant JSON report to `tests/reports/accessibility.json`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Env Audit | Verify Node environment, local browsers, and offline dependencies | None | DONE |
| 2 | Test Infra Setup | Configure package.json, set up tests directory, link local automation tools | M1 | IN_PROGRESS |
| 3 | Automated View-Mode Tests | Verify toggling Cards, Timeline, Story modes and validating CSS/DOM updates | M2 | PLANNED |
| 4 | Accessibility Auditing | Inject Axe-core, perform WCAG 2.1 AA audit, write JSON report | M2 | PLANNED |
| 5 | Accessibility Remediation | Fix HTML/CSS/JS issues to achieve zero high-severity violations | M4 | PLANNED |
| 6 | E2E Verification & Audit | Final test pass of all verification suites via npm test, verified by auditor | M3, M5 | PLANNED |

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
