## 2026-07-16T17:25:22Z
<USER_REQUEST>
Identity: You are teamwork_preview_worker for Milestone 2: Test Infra Setup and Codebase Patching.
Working Directory: /home/admin/Documents/EAE Materials/.agents/worker_m2
Project Root: /home/admin/Documents/EAE Materials

Your task is to:
1. Verify if `globalThis.WebSocket` is natively available in the system's Node.js (v26.4.0) environment. Write and run a temporary verification script in your directory, e.g. `check_ws.js`, to check this.
2. Create the `tests/` directory and configure the `"test"` script in `package.json` to execute our test runner (e.g., `node tests/run_tests.js`).
3. Patch `script.js` to resolve the view-mode crash. Specifically, remove or stub the calls to the undefined functions `renderCertifications()` and `renderCoding()` inside `setupViewModeToggleOnce()`.
4. Run `npm install --offline` to ensure the project's offline dependencies (like `@google/design.md`) are installed correctly.
5. Verify your changes. For example, check that the portfolio server starts without errors and that clicking the view-mode toggles does not throw ReferenceErrors in the browser console.
6. Write a detailed `handoff.md` in your directory detailing:
   - What you did (actions taken, files modified/created).
   - The results of your Node WebSocket check.
   - The exact lines modified in `script.js` and `package.json`.
   - Proof that your verification steps succeeded.

MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
</USER_REQUEST>
