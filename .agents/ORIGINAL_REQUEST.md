# Original User Request

## Initial Request — 2026-07-16T17:20:39Z

Implement an automated testing and accessibility verification suite for the EAE Portfolio to ensure all layouts, view-mode transitions, and color contrast profiles meet WCAG AA standards.

Working directory: /home/admin/Documents/EAE Materials/tests

## Requirements

### R1. Automated View-Mode Testing
Develop automated script tests that navigate to the portfolio server (`http://localhost:3000`), interact with the view-mode toggle bar (Cards, Timeline, Story modes), and verify that the correct CSS classes are toggled on the body and that key sections are displayed or hidden as expected.

### R2. Programmatic Accessibility Verification
Integrate automated accessibility checks (e.g., axe-core or Lighthouse APIs) within the test suite to programmatically verify that all page elements adhere to WCAG 2.1 Level AA requirements (including color contrast, tap target sizes, and image alt texts).

## Acceptance Criteria

### Execution & Reports
- [ ] Running `npm test` runs all verification suites and output passes.
- [ ] A generated report is saved to `tests/reports/accessibility.json` showing zero high-severity accessibility violations.

## Follow-up — 2026-07-17T13:25:32Z

Fix responsive layout on small window sizes so elements don't overlap or get squeezed to one side, and optimize card components so they don't take up unnecessary vertical space by stretching artificially.

Working directory: /home/admin/Documents/EAE Materials
Integrity mode: development

## Requirements

### R1. Prevent layout breakage on small screens
Containers and elements must not stick to a certain side, squeeze content awkwardly, or overlap out of bounds when viewed on small window sizes (e.g. phones).

### R2. Optimize vertical space on cards
Card containers (especially in grid/flex layouts) must not artificially stretch to match the tallest item in a row, leaving awkward empty vertical space.

### R3. Optimize horizontal space on small screens
Internal margins and paddings for main containers and cards must be reduced on small screens so they do not squeeze the primary content.

## Verification Resources
The user has provided a custom Python `UIJudge` script utilizing Playwright to extract DOM state (display, position, margin, padding, width, align-items). This script can be utilized for Agent-as-Judge programmatic verification. 

## Acceptance Criteria

### Responsive Integrity Baseline
- [ ] Card containers do not use `align-items: stretch` (or default stretch) in Grid/Flexbox layouts.
- [ ] Small screen media queries (e.g. <=680px) explicitly reduce padding/margins inside main containers and cards.
- [ ] Small screen media queries use `width: 100%` or similar fluid sizing to prevent elements from sticking to one side.
