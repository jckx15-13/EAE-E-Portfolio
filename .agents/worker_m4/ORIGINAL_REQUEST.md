## 2026-07-16T17:51:42Z

Identity: You are teamwork_preview_worker for Milestone 4: Accessibility Auditing.
Working Directory: /home/admin/Documents/EAE Materials/.agents/worker_m4
Project Root: /home/admin/Documents/EAE Materials

Your task is to:
1. Check if `axe-core` can be installed in the project (either it's already available, or can be installed via `npm install axe-core`).
2. If `axe-core` is available, update `tests/run_tests.js` to:
   - Read the content of `node_modules/axe-core/axe.min.js`.
   - Inject the `axe-core` script into the page context using the CDP WebSocket (via `Runtime.evaluate` or similar).
   - Execute `axe.run()` in the page context.
   - Retrieve the audit results, filter them, format them, and write the report to `tests/reports/accessibility.json`.
3. If `axe-core` CANNOT be installed (e.g. npm throws ENOTCACHED), implement a custom, robust programmatic checker in `tests/run_tests.js` that evaluates accessibility rules inside the browser context via CDP:
   - **Color Contrast**: Verify all visible text nodes and check if their contrast ratio is at least 4.5:1 (or 3:1 for large text).
   - **Tap Target Sizes**: Verify all clickable elements (buttons, links, `.view-mode-pill`) are at least 48x48px or have equivalent touch spacing.
   - **Image Alt Texts**: Check all `<img>` tags for non-empty `alt` attributes or alternative label techniques.
   - **ARIA/Landmark Semantics**: Check that `<main id="main">` has `role="tabpanel"`, tooltip hints have proper associations (`aria-describedby` or similar), and logo links announce correctly.
   - Write the audit report containing any violations to `tests/reports/accessibility.json`.
4. Ensure the report structure in `tests/reports/accessibility.json` is a valid JSON document and contains a list of violations with their severity/impact.
5. Run the updated `npm test` script to execute the test suite and verify that it writes the initial accessibility report showing the current violations.
6. Write a detailed `handoff.md` in your directory detailing:
   - Whether `axe-core` was installed or a custom checker was used.
   - The changes made to `tests/run_tests.js`.
   - The path to the generated `tests/reports/accessibility.json` report and a summary of the violations it found.
   - Verifiable test run output.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
