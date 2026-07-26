# Jaron Chew Kai Xin — EAE Portfolio

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Custom%20Design%20System-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA-008080?style=for-the-badge&logo=w3c&logoColor=white)
![VibeSec](https://img.shields.io/badge/Security-VibeSec%20Hardened-green?style=for-the-badge&logo=shield&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Testing-Puppeteer%20Suite-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)

> A static, high-performance, fully accessible Early Admission Exercise (EAE) technical portfolio for **Jaron Chew Kai Xin** (Juying Secondary School). Built to showcase real-world software engineering, cybersecurity bootcamp achievements, robotics system engineering (FIRST LEGO League / National Robotics Competition), interactive in-app document viewers, and an embedded accessibility engine.

---

## 📋 Table of Contents

- [For EAE Evaluators: Recommended Reading Order](#-for-eae-evaluators-recommended-reading-order)
- [✨ Key Features & Highlights](#-key-features--highlights)
  - [🖼️ Interactive In-App Document Viewers](#️-interactive-in-app-document-viewers)
  - [♿ Built-in Accessibility Engine (WCAG 2.2 AA / WAI-ARIA)](#-built-in-accessibility-engine-wcag-22-aa--wai-aria)
  - [🛡️ VibeSec Security & OWASP Hardening](#️-vibesec-security--owasp-hardening)
- [🚀 Featured Projects & Achievements](#-featured-projects--achievements)
- [🎓 Target Polytechnic Diplomas](#-target-polytechnic-diplomas)
- [📁 Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [⚡ Quick Start (Local Server)](#-quick-start-local-server)
- [🧪 Automated Testing Suite](#-automated-testing-suite)
- [📜 License & Verification Notice](#-license--verification-notice)

---

## 🎯 For EAE Evaluators: Recommended Reading Order

Welcome to Jaron's EAE Portfolio. To evaluate technical capabilities, problem-solving, and engineering discipline effectively, we recommend the following 4-step sequence:

1. **Homepage & Profile Overview**
   - Review Jaron's secondary school Applied Learning Programme (ALP) achievements, core values, and target polytechnic application paths.
2. **Featured System Engineering Projects**
   - **SPD Caregiver & Admin Event Portal**: Real-world system design for a non-profit organization. Highlights UX research, user role security architecture, and community-driven impact.
   - **FLL 2026 Unearthed Robot Design & Planning**: Multi-axis robotics engineering, sensor feedback loops, strategy optimization, and structured system flowcharts.
   - **PyCon Hackathon & SkillQuest**: Gamified cybersecurity education, algorithm design, and rapid delivery under hackathon pressure.
3. **Verified Credentials & Evidence Library**
   - Inspect authentic certificates including **Singapore Polytechnic YCEP Cybersecurity Bootcamp**, Python certifications (Basic, Intermediate, Advanced), MIT App Inventor Appathon, and robotics competitions.
4. **Target Diplomas & Future Career Pathway**
   - Discover structured goals for **Singapore Polytechnic (S54)** and **Ngee Ann Polytechnic (N94)** Diploma in Cybersecurity & Digital Forensics, leading to national defense service in the Digital and Intelligence Service (DIS).

---

## ✨ Key Features & Highlights

### 🖼️ Interactive In-App Document Viewers

Unlike static web portfolios that redirect users to third-party file downloads, this portfolio includes custom, zero-dependency, modal-wide interactive renderers:

- **SVG / Draw.io Flowchart Renderer**: Renders engineering architecture flowcharts directly in the browser with pan, zoom, and SVG vector scaling.
- **CSV Data Spreadsheet Viewer**: Parses and displays tabular CSV data in a clean, searchable, responsive data table.
- **Embedded Presentation Slide Viewer**: Displays project decks and design slides seamlessly within an embedded viewer.
- **Video & Media Player**: Integrated video playback for robotics demonstrations and project walk-throughs.
- **Image Lightbox**: High-resolution zoomable viewer for certificates and evidence artifacts.

### ♿ Built-in Accessibility Engine (WCAG 2.2 AA / WAI-ARIA)

Designed with inclusion at its core, featuring a dedicated multi-section Accessibility Drawer:

- **OpenDyslexic Default Font**: Resilient, high-readability typeface enabled out of the box with toggleable fallback to Inter/Space Grotesk.
- **Typography & Layout Controls**: Adjust font size, line spacing, and letter spacing dynamically.
- **Color Blindness Filters**: Real-time SVG matrix filters supporting Protanopia, Deuteranopia, Tritanopia, and Achromatopsia.
- **High Contrast & Custom Themes**: Instant toggle between high contrast dark mode, classroom light paper mode, and custom color presets.
- **Reduced Motion & Focus Rings**: `prefers-reduced-motion` compliance, `:focus-visible` high-visibility indicators, and custom touch targets ($48\text{px} \times 48\text{px}$).

### 🛡️ VibeSec Security & OWASP Hardening

Built adhering to VibeSec web application security best practices:

- **Strict Content Security Policy (CSP)** preventing unauthorized script execution and cross-site scripting (XSS).
- **DOM XSS Sanitization**: All dynamic rendering from `data.js` undergoes strict HTML entity escaping and sanitization.
- **Secure Transport & Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.
- **HMAC Administrative Protection**: Cryptographic HMAC verification for administrative actions and data editing endpoints.

---

## 🚀 Featured Projects & Achievements

| Project / Achievement | Category | Tech Stack / Focus | Key Highlights |
| :--- | :--- | :--- | :--- |
| **SPD Caregiver & Admin Portal** | Full-Stack Web | HTML5, CSS3, JS, User Access Control | Designed a caregiver event management system for non-profit SPD with role-based security. |
| **FLL 2026 Unearthed Robot Design** | Robotics Engineering | LEGO Spike Prime, Python, Flowcharts | Engineering flowchart design, multi-sensor attachment mechanisms, strategy optimization. |
| **PyCon Hackathon & SkillQuest** | Cybersecurity & Coding | Python, Gamified Learning, Cryptography | Built interactive coding challenges and cybersecurity puzzles under timed hackathon conditions. |
| **SP YCEP Cybersecurity Bootcamp** | Certification | Ethical Hacking, Forensics, Network Security | Completed Singapore Polytechnic's Youth Cyber Exploration Programme (YCEP) bootcamp. |
| **Python Certification Series** | Academic / Coding | Python (Basic, Intermediate, Advanced) | Verified progression from core programming concepts to complex data structures and algorithms. |
| **BuildingBloCS & Competition Portfolio**| Hackathons / Competitions | Game Development, App Inventor, Spark AR | Participated in BuildingBloCS June Jam, MIT App Inventor Appathon, and Roblox Global Goals Challenge. |

---

## 🎓 Target Polytechnic Diplomas

Jaron is applying via EAE for admission into the following specialized diploma programmes:

1. **Singapore Polytechnic (SP)**
   - **Diploma in Cybersecurity & Digital Forensics (S54)**
   - *Focus*: Network security, penetration testing, digital forensics, incident response, and secure software development.
2. **Ngee Ann Polytechnic (NP)**
   - **Diploma in Cybersecurity & Digital Forensics (N94)**
   - *Focus*: Malware analysis, cloud security, cyber threat intelligence, and defensive security operations.

---

## 📁 Project Architecture & Directory Structure

```text
EAE-E-Portfolio/
├── index.html              # Main single-page application entry point & semantic HTML structure
├── script.js               # Client-side web application logic, modal viewers, a11y engine
├── data.js                 # Authoritative structured portfolio dataset (projects, evidence, reflections)
├── style.css               # Comprehensive CSS custom properties design system & themes
├── server.js               # Node.js development server with VibeSec security headers
├── validate-portfolio.sh   # Integrity validation script for pre-commit checks
├── CLAUDE.md               # Project guardrails, design system rules, and developer guidance
├── docs/                   # Design guidelines and architecture documentation
│   └── design_system/
│       └── DESIGN_GUIDELINES.md
├── tests/                  # Headless Puppeteer automated test suite
│   ├── run_tests.js        # Master test runner
│   ├── suite_data.js       # Schema & data integrity tests
│   ├── suite_ui.js         # Navigation & modal viewer tests
│   ├── suite_a11y.js       # WCAG 2.2 AA & axe-core accessibility audit
│   ├── suite_security.js   # VibeSec security & XSS sanitization tests
│   └── suite_responsive.js # Multi-device viewport layout tests
├── screenshots/            # Visual evidence assets & project screenshots
├── videos/                 # Demonstration recordings & robotics videos
└── package.json            # Node.js dependencies & npm test scripts
```

---

## ⚡ Quick Start (Local Server)

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### Running the Development Server

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jckx15-13/EAE-E-Portfolio.git
   cd EAE-E-Portfolio
   ```

2. **Start the local server**:
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000` (or `http://localhost:8080` if using alternative HTTP servers).

---

## 🧪 Automated Testing Suite

The repository includes an extensive headless **Puppeteer test suite** to ensure data integrity, UI reliability, accessibility compliance, security, and responsive viewports.

Run the entire test suite:
```bash
npm test
```

Run specific test modules:
```bash
npm run test:data        # Data integrity & schema validation
npm run test:ui          # UI navigation & modal viewer rendering
npm run test:a11y        # WCAG 2.2 AA axe-core accessibility audit
npm run test:security    # VibeSec security & XSS sanitization audit
npm run test:responsive  # Mobile, tablet, and desktop layout audit
```

---

## 📜 License & Verification Notice

Personal EAE portfolio submission for **Jaron Chew Kai Xin**. All content reflects authentic technical projects, verified competition participation, and personal reflections. All rights reserved.

---
*For inquiries or further information regarding this portfolio, please reach out via the target polytechnic EAE submission channels.*
