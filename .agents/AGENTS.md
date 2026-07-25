# Project Behavioral Rules & Guardrails

## Preservation of Core Ideas, Logic, and Design

1. **No Destructive Refactoring**: Never delete, comment out, or replace core features, administrative tools (e.g. Live Editor), accessibility options, or visual design signatures with simplified mocks or placeholder code.
2. **Preserve Design Tokens & Aesthetics**: Maintain all CSS design system tokens (variables for dark/light themes, 2.5D SRT styles, glassmorphism, responsive breakpoints) and never introduce plain/generic styling.
3. **Preserve Subsystems & Data Integrity**: Preserve all data schemas (`PORTFOLIO_DATA`), state management features (versioning, asset uploads, API endpoints), and interactive views (`cards`, `timeline`, `story`).
4. **Verification Requirement**: After any code modification, run the full test suite (`npm test`) to verify zero regressions across data integrity, UI navigation, accessibility, E2E flows, security, and responsive layouts.

## Guardrail Self-Interrogation Checklist

Before completing any task or making modifications:
- **Ideas**: Does this change preserve all domain concepts, core narrative, and portfolio signals?
- **Logic**: Are all interactive features (Live Editor, versioning, search/filters, accessibility sidebar) intact and functional?
- **Design**: Are design system tokens, 2.5D styling, typography, and responsive layout boundaries preserved?
- **Verification**: Have automated tests (`npm test`) been executed to prove zero regressions?

## Accessibility Standards & Font Defaults

5. **OpenDyslexic as Default Font**: The site default body font is OpenDyslexic,
   loaded from two CDN sources (`cdnfonts.com` + `jsdelivr`) for resilience.
   Do NOT revert this to Inter or any system font unless explicitly instructed.
   The `--a11y-font-override` CSS variable (set on `:root` by JS) controls the
   active font at runtime. The CSS `body { font-family: var(--a11y-font-override, 'OpenDyslexic', ...) }` pattern must be preserved.

6. **Accessibility Sidebar Architecture**: The `#a11ySidebar` is a multi-section
   drawer with 5 labelled sections: Typography, Visual, Motion & Focus, Input,
   Screen Reader. Never collapse it back to a single toggle. Each section uses:
   - `.a11y-section` + `aria-labelledby` pointing to `.a11y-section-title`
   - `.a11y-control-group` for individual controls
   - `.a11y-hint` for descriptive helper text with `aria-live="polite"` on status elements
   - All controls persist preferences to `localStorage` under keys prefixed `eae_a11y_`
   - The `#a11yResetAll` button clears all keys and restores OpenDyslexic
   - Sidebar closes on Escape key and when clicking outside; focus returns to FAB

7. **WCAG 2.2 AA Checklist**: Before any commit touching HTML/CSS/JS, verify:
   - Logical heading order (h1 → h2 → h3, no skipped levels)
   - All images have meaningful `alt` text (decorative images use `alt=""` + `aria-hidden="true"`)
   - All form inputs have associated `<label for="...">` or `aria-label`
   - Focus-visible ring present: `:focus-visible { outline: 3px solid var(--theme-accent-cyan) }`
   - Skip-to-content `<a class="skip-link" href="#main">` exists at top of `<body>`
   - `aria-expanded`, `aria-hidden`, `aria-label`, `aria-controls` set on interactive controls
   - Tap targets are ≥ 48 × 48 CSS px with sufficient spacing
   - Run `npm test` (includes axe-core audit) — must pass with 0 critical violations

8. **Font Picker Pattern**: The font library grid renders font cards as
   `<button role="radio" aria-checked>` elements inside a `role="radiogroup"`.
   Each card shows the font name rendered in its own typeface via inline `style="font-family: ..."`.
   Recommended fonts carry a `.a11y-font-card-badge` overlay.
   The Google Fonts search dynamically injects a `<link rel="stylesheet">` tag
   (idempotent — checks for existing href before inserting) and applies the font
   via `applyFont()` which sets `--a11y-font-override` on `:root`.
