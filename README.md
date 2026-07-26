# Jaron Chew — EAE Portfolio

A static, high-performance Early Admission Exercise (EAE) portfolio for Jaron Chew. It presents projects, achievements, certifications, reflections, and target polytechnic applications (Singapore Polytechnic & Ngee Ann Polytechnic Diploma in Cybersecurity & Digital Forensics) in a fully responsive, highly accessible single-page layout with interactive vertical tab accordions and an embedded accessibility engine.

---

## For EAE Evaluators: How to Read This Portfolio

**Start here** → Recommended viewing order:

1. **Load the homepage** — Review Jaron's background, secondary school ALP achievements, and target diplomas.
2. **Featured Projects**:
   - **SPD Caregiver & Admin Event Portal** — Real-world system design for a non-profit organization. Demonstrates UX thinking, user role architecture, accessibility, and community impact.
   - **FLL Unearthed Robot Design** — Precision engineering, multi-axis systems thinking, sensor feedback loops, and structured planning via flowcharts.
   - **PyCon Hackathon & SkillQuest** — Gamified cybersecurity education, software engineering teamwork, and rapid delivery under pressure.
3. **Achievements & Evidence Library** — Verified credentials including SP YCEP Cybersecurity Bootcamp, Python certifications, and ALP competitions.
4. **Target Applications & Future Roadmap** — Structured pathway into polytechnic specialization, DIS national defense service, and higher education.

---

## Technical Stack & Architecture

- **Core**: Semantic HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Custom properties design system).
- **Layout & Structure**: Interactive Collapsible Vertical Accordions (Tabs) for main content sections.
- **Accessibility (WCAG 2.2 AA / WAI-ARIA)**:
  - **OpenDyslexic Default Font** loaded via resilient CDNs.
  - Multi-section Accessibility Drawer with typography controls, font library grid, Google Fonts search, color-blind filters, saturation boost, high contrast, reduce motion, and custom cursor sizes.
  - 48px × 48px touch targets for buttons and interactive controls.
  - Keyboard navigation, `:focus-visible` ring styling, screen-reader landmark roles, and WCAG AA contrast compliance.
- **Security & Privacy (VibeSec / OWASP Top 10)**:
  - Strict Content Security Policy (CSP), `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - External link hardening (`rel="noopener noreferrer"`).
  - DOM XSS sanitization and secure input handling.

---

## Quick Start

Serve the project locally using Node.js:

```bash
npm start
# or
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or `http://localhost:8080`) in your browser.

---

## Running Automated Tests

Run the full headless automated test suite (Data Integrity, UI Navigation, WCAG 2.2 AA axe-core audit, Live Editor E2E workflows, VibeSec Security, and Responsive Viewports):

```bash
npm test
```

---

## License & Usage

Personal EAE portfolio submission for Jaron Chew. Content reflects authentic technical projects, certifications, and reflections. All rights reserved.

