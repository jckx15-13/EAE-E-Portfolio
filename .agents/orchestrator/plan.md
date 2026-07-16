# Implementation Plan: EAE Portfolio Automated Testing & Accessibility Verification

## Objective
Implement an automated test and accessibility verification suite for the EAE Portfolio that runs via `npm test`, validates view-mode transitions on `http://localhost:3000`, performs WCAG 2.1 Level AA checks, and outputs an accessibility report to `tests/reports/accessibility.json` showing zero high-severity violations.

## High-Level Execution Phases

### Phase 1: Environment & Codebase Exploration
- Spawn an Explorer agent to:
  - Check local npm/Node environment (versions, global packages, offline install capabilities).
  - Verify if local Chromium/Chrome is installed and its path.
  - Analyze the portfolio HTML/JS/CSS structure (view-mode toggles, CSS classes, sections).
  - Check how to run `server.js` and if it is fully functional.

### Phase 2: Design and Decompose
- Define the test infrastructure and plan details based on Phase 1 exploration.
- Create `TEST_INFRA.md` at the project root (E2E Testing Track).
- Write `PROJECT.md` at the project root with concrete milestones.

### Phase 3: Setup Test Infrastructure (E2E Testing Track)
- Create the test runner and install/configure necessary testing dependencies (offline-friendly).
- Initialize the `tests/` directory and configure `npm test` script in `package.json`.

### Phase 4: Implement Test Suites (Dual Track)
- **E2E Testing Track**:
  - Implement Tier 1-4 test cases covering view-mode transitions, element visibility, and accessibility checks.
  - Implement automated accessibility report generation to `tests/reports/accessibility.json`.
- **Implementation Track**:
  - Fix any accessibility violations found (contrast ratio, alt texts, tap targets).
  - Ensure view-mode CSS classes toggle correctly on the body.

### Phase 5: Final Validation & adversarial Coverage Hardening
- Run the full suite to verify 100% pass rate.
- Conduct adversarial checks (Challenger and Auditor validation) to ensure integrity and no hardcoded outputs.
- Deliver completion report.
