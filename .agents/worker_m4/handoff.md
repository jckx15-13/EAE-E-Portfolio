# Handoff Report — Milestone 4: Accessibility Auditing

## 1. Observation
- **axe-core Availability**: Successfully installed `axe-core` via `npm install axe-core --no-audit --no-fund` in the project root directory.
  - File path to the axe script: `node_modules/axe-core/axe.min.js`.
- **Test Execution**: Ran `npm test` successfully. Below is the verbatim output of the test run:
  ```
  > test
  > node tests/run_tests.js

  === EAE Portfolio Test Suite ===
  Starting portfolio server (node server.js)...
  [Server]: EAE Portfolio server is running at http://localhost:3000
  Launching headless Chrome...
  Creating new tab in Chrome...
  Created tab: id=E0EDF547D6A21B6298943EE916AFA8FD
  Connected to Tab WebSocket.
  Navigating to http://127.0.0.1:3000/...
  Page loaded. Running view-mode toggle test...
  Evaluation script returned: SUCCESS
  View-mode toggle tests PASSED successfully!
  Injecting axe-core...
  Running axe-core accessibility audit...
  Accessibility report written to /home/admin/Documents/EAE Materials/tests/reports/accessibility.json
  Cleaning up chrome process...
  Stopping portfolio server...
  ```
- **Accessibility Report**: Generated report is located at `/home/admin/Documents/EAE Materials/tests/reports/accessibility.json`. Verbatim content of the file:
  ```json
  {
    "timestamp": "2026-07-16T17:52:18.403Z",
    "url": "http://127.0.0.1:3000/",
    "violationCount": 4,
    "violations": [
      {
        "id": "color-contrast",
        "impact": "serious",
        "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
        "help": "Elements must meet minimum color contrast ratio thresholds",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/color-contrast?application=axeAPI",
        "nodes": [
          {
            "target": [
              "#applications > .section-heading > .section-label"
            ],
            "html": "<p class=\"section-label\">Applications</p>",
            "failureSummary": "Fix any of the following:\n  Element has insufficient color contrast of 2.56 (foreground color: #3ca9e8, background color: #fbfdff, font size: 10.3pt (13.76px), font weight: bold). Expected contrast ratio of 4.5:1"
          }
        ]
      },
      {
        "id": "frame-title",
        "impact": "serious",
        "description": "Ensure <iframe> and <frame> elements have an accessible name",
        "help": "Frames must have an accessible name",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/frame-title?application=axeAPI",
        "nodes": [
          {
            "target": [
              "iframe"
            ],
            "html": "<iframe src=\"https://www.canva.co...\" loading=\"lazy\" allowfullscreen=\"\" allow=\"fullscreen\" style=\"position: absolute; ...\">",
            "failureSummary": "Fix any of the following:\n  Element has no title attribute\n  aria-label attribute does not exist or is empty\n  aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty\n  Element's default semantics were not overridden with role=\"none\" or role=\"presentation\""
          }
        ]
      },
      {
        "id": "heading-order",
        "impact": "moderate",
        "description": "Ensure the order of headings is semantically correct",
        "help": "Heading levels should only increase by one",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/heading-order?application=axeAPI",
        "nodes": [
          {
            "target": [
              ".snapshot-card.reveal:nth-child(1) > h3"
            ],
            "html": "<h3>What I enjoy</h3>",
            "failureSummary": "Fix any of the following:\n  Heading order invalid"
          }
        ]
      },
      {
        "id": "region",
        "impact": "moderate",
        "description": "Ensure all page content is contained by landmarks",
        "help": "All page content should be contained by landmarks",
        "helpUrl": "https://dequeuniversity.com/rules/axe/4.12/region?application=axeAPI",
        "nodes": [
          {
            "target": [
              ".scroll-progress"
            ],
            "html": "<div class=\"scroll-progress\" role=\"progressbar\" aria-label=\"Reading progress\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"0\">\n      <span id=\"scrollProgressBar\" style=\"transform: scaleX(0);\"></span>\n    </div>",
            "failureSummary": "Fix any of the following:\n  Some page content is not contained by landmarks"
          },
          {
            "target": [
              ".sidebar-header > h3"
            ],
            "html": "<h3>Portfolio Editor</h3>",
            "failureSummary": "Fix any of the following:\n  Some page content is not contained by landmarks"
          },
          {
            "target": [
              ".editor-control-group:nth-child(1) > .switch-container > span:nth-child(1)"
            ],
            "html": "<span>Edit Text Inline</span>",
            "failureSummary": "Fix any of the following:\n  Some page content is not contained by landmarks"
          },
          {
            "target": [
              ".editor-control-group:nth-child(1) > .control-description"
            ],
            "html": "<p class=\"control-description\">Click and edit text directly on the page. Changes save automatically when you click away.</p>",
            "failureSummary": "Fix any of the following:\n  Some page content is not contained by landmarks"
          },
          {
            "target": [
              ".editor-control-group:nth-child(2) > .switch-container > span:nth-child(1)"
            ],
            "html": "<span>Shift Sections</span>",
            "failureSummary": "Fix any of the following:\n  Some page content is not contained by landmarks"
          },
          {
            "target": [
              ".editor-control-group:nth-child(2) > .control-description"
            ],
            "html": "<p class=\"control-description\">Use Up/Down controls on sections to swap their layout sequence.</p>",
            "failureSummary": "Fix any of the following:\n  Some page content is not contained by landmarks"
          }
        ]
      }
    ]
  }
  ```

## 2. Logic Chain
1. **axe-core Integration**: Based on finding that `npm install axe-core` succeeds, the project uses the preferred `axe-core` library.
2. **File Injection**: `tests/run_tests.js` reads `node_modules/axe-core/axe.min.js` and sends it to the browser context using `Runtime.evaluate`. This dynamically declares the global `axe` object in the page context.
3. **Execution**: The test runner executes `axe.run()` using `Runtime.evaluate` with `awaitPromise: true` and `returnByValue: true` to wait for the Promise to resolve and get the full results.
4. **Filtering and Formatting**: The results are mapped to filter only essential properties (`id`, `impact`, `description`, `help`, `helpUrl`, and target elements in `nodes`), then saved into a clean JSON structure under `tests/reports/accessibility.json`.
5. **Validation**: The script creates `tests/reports/` if it does not exist, and writes valid JSON. The output contains 4 distinct types of violations.

## 3. Caveats
- No custom fallback checker was implemented because `axe-core` was successfully installed and verified. If the environment is completely offline and does not contain `axe-core` in `node_modules`, `npm test` will fail because `axe.min.js` is not found, unless `npm install` is run beforehand.

## 4. Conclusion
Milestone 4 is complete. The automated test runner `tests/run_tests.js` successfully runs WCAG 2.1 AA audits on the portfolio page using injected `axe-core` and writes the violations report to `tests/reports/accessibility.json`.

## 5. Verification Method
- Execute the test suite using `npm test`.
- Verify that `tests/reports/accessibility.json` is created/updated and contains a valid JSON array of violations.
