## 2026-07-17T01:55:32+08:00
Identity: You are teamwork_preview_worker for Milestone 6: Final Tabpanel Landmark Refactoring.
Working Directory: /home/admin/Documents/EAE Materials/.agents/worker_m6
Project Root: /home/admin/Documents/EAE Materials

Your task is to refactor the tabpanel implementation to achieve 100% compliant landmarks and role semantics (reaching zero total violations in the accessibility report):

1. Modify `index.html`:
   - Revert `<main id="main" role="tabpanel" aria-labelledby="view-cards">` to just `<main id="main">`.
   - Wrap the main sections inside `<main>` with `<div id="viewModeTabpanel" role="tabpanel" aria-labelledby="view-cards">...</div>`. Specifically:
     - The `<div id="viewModeTabpanel" ...>` tag should open right after the view mode bar container `</div>` (around line 83).
     - The corresponding closing `</div>` tag should close right before `</main>` (around line 242).
   - In `index.html` (lines 70-80), update the `aria-controls` attribute of the three view mode button pills (`#view-cards`, `#view-timeline`, `#view-story`) from `"main"` to `"viewModeTabpanel"`.

2. Modify `script.js`:
   - Update `setupViewModeToggleOnce()` click handler to update the `aria-labelledby` attribute on the wrapper `#viewModeTabpanel` instead of `#main`. Find the line where it was setting `mainEl` and change it to target `viewModeTabpanel`:
     `const tabpanel = document.getElementById("viewModeTabpanel"); if (tabpanel) tabpanel.setAttribute("aria-labelledby", "view-" + mode);`

3. Verification:
   - Run `npm test` to execute the full E2E and accessibility test suite.
   - Verify that all tests pass.
   - Verify that `/home/admin/Documents/EAE Materials/tests/reports/accessibility.json` is updated and shows `violationCount` is `0` (or `violations` is empty).

4. Write a detailed `handoff.md` in your directory detailing:
   - The changes made to `index.html` and `script.js`.
   - The test run output.
   - Confirmation that the final accessibility report contains zero violations.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
