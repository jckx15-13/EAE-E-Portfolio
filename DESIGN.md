---
version: "alpha"
name: "Jaron EAE Portfolio"
description: "A minimalist, card-style EAE portfolio design system with an immersive astral space opening, honest evidence-first content, and adaptive view modes."
colors:
  primary: "#0A1222"
  secondary: "#516070"
  accent: "#4AAEDE"
  accent-soft: "#D9F3FF"
  purple: "#6B5BD1"
  space: "#070B16"
  navy: "#111B31"
  paper: "#FBFDFF"
  paper-soft: "#F4F8FC"
  surface: "#FFFFFF"
  border: "#DBE4EE"
  muted: "#718093"
  warning: "#8A5B00"
  on-dark: "#FFFFFF"
  astral-gradients:
    - "linear-gradient(180deg, #070b16 0%, #0d1222 100%)"
    - "linear-gradient(180deg, #0d1222 0%, #12162b 100%)"
    - "linear-gradient(180deg, #12162b 0%, #161936 100%)"
    - "linear-gradient(180deg, #161936 0%, #1a1b41 100%)"
    - "linear-gradient(180deg, #1a1b41 0%, #131230 100%)"
    - "linear-gradient(180deg, #131230 0%, #070b16 100%)"
typography:
  display:
    fontFamily: "Space Grotesk"
    fontSize: "4rem"
    fontWeight: "700"
    lineHeight: "1.05"
    letterSpacing: "0"
  section-title:
    fontFamily: "Space Grotesk"
    fontSize: "2.5rem"
    fontWeight: "700"
    lineHeight: "1.08"
    letterSpacing: "0"
  card-title:
    fontFamily: "Space Grotesk"
    fontSize: "1.22rem"
    fontWeight: "700"
    lineHeight: "1.25"
    letterSpacing: "0"
  body:
    fontFamily: "Inter"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.6"
    letterSpacing: "0"
  label:
    fontFamily: "Space Grotesk"
    fontSize: "0.86rem"
    fontWeight: "800"
    lineHeight: "1.3"
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "8px"
  pill: "999px"
spacing:
  xs: "7px"
  sm: "12px"
  md: "18px"
  lg: "24px"
  xl: "32px"
  section: "82px"
components:
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
  hero:
    backgroundColor: "{colors.space}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display}"
  section-dark:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "rgba(17, 27, 49, 0.45)"
    textColor: "{colors.on-dark}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "22px"
    border: "1px solid rgba(109, 179, 240, 0.15)"
  card-muted:
    backgroundColor: "{colors.paper-soft}"
    textColor: "{colors.secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px"
  button-secondary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px"
  chip:
    backgroundColor: "{colors.paper-soft}"
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px"
  placeholder:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "12px"
  accent-marker:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    size: "38px"
  purple-depth:
    backgroundColor: "{colors.purple}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.md}"
    padding: "18px"
  border-line:
    backgroundColor: "{colors.border}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    height: "1px"
---

## Overview

This portfolio is designed to feel like entering a calm, open personal space, then moving through clear evidence cards. The design keeps Jaron at the center: his journey, his growth, his projects, and his direction toward EAE.

Rather than a static showcase, it is a credible admissions portfolio with personality, adapting to the reader's preferred viewing mode to optimize readability and engagement.

## Global View Modes

The portfolio features three viewing modes selectable via a sticky pill bar at the top:
1. **Story View (Default)**: Combines structured cards with sequential growth-thread connectors showing the learning journey from coding basics into complex engineering.
2. **Timeline View**: Organizes projects and achievements chronologically along a vertical axis with alternating left/right layout blocks.
3. **Cards View**: A classic grid arrangement of detailed panels, perfect for quick search and filtration.

## Colors & Astral Aesthetic

The page uses a flowing "Astral Space" aesthetic:
- **Nebula Gradients**: Linear gradients that blend seamlessly between sections (deep space black ↔ purple nebula ↔ deep blue ↔ navy) to eliminate hard color breaks.
- **Star Fields**: CSS-driven, slowly drifting background particle fields that establish cosmic depth.
- **Glowing Radiance**: Active components and cards feature a subtle ambient glow (`box-shadow`) that intensifies smoothly on hover.

## Growth Threads ("Carried Forward" Links)

In Story View, projects are connected by a vertical axis featuring **carried-forward callouts**. These elements specify how learnings from a previous project (e.g., variables, user interface flow, or tolerance precision) directly influenced the execution of the next build, providing a cohesive narrative of self-directed technical growth.

## Consolidated Evidence Overview

To keep the scanning experience clean, the individual **Personal Map** and **Evidence Deck** are combined into a tabbed "Evidence Overview" container. This lets readers swap views instantly between high-level mapping and deep proof details.

## Do's and Don't's

Do keep Jaron as the focus.
Do use honest placeholders for missing facts, dates, awards, roles, images, and certificates.
Do keep the portfolio calm, immersive, and easy to scan.
Do use card summaries before long details.
Do preserve both live-site and print/PDF readability.

Don't invent outcomes, rankings, organisers, deployment status, certificates, or course-specific claims.
Don't make the page feel like a generic tech template.
Don't overload the header navigation.
Don't use decorative effects that compete with the evidence.
Don't hide important missing-information warnings.
