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
