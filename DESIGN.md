---
version: "alpha"
name: "Jaron EAE Portfolio"
description: "A minimalist, card-style EAE portfolio design system with a calm limitless-space opening and honest evidence-first content."
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
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "22px"
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

This portfolio should feel like entering a calm, open personal space, then moving through clear evidence cards. The design should keep Jaron at the centre: his journey, his growth, his projects, and his direction toward EAE.

The site is not a flashy showcase. It is a credible admissions portfolio with personality. Every design choice should help the reader understand the student behind the evidence.

## Colors

Use deep navy and space tones only where they create atmosphere: the hero, life entry, achievement flow, evidence library, and goals. Most evidence-heavy sections should stay light, soft, and readable.

Sky blue is the main interaction and evidence accent. Purple is a secondary depth color, used sparingly in gradients or supporting highlights. Placeholder content must remain visually distinct so unconfirmed facts are never hidden.

## Typography

Use Space Grotesk for headings, card titles, navigation, labels, counters, and compact UI controls. Use Inter for longer reading text. Letter spacing should stay at zero.

Headings should feel confident but not oversized inside cards. Card text must stay readable on mobile and must wrap safely inside its container.

## Layout

The preferred layout is card-based, but not cluttered. Use cards for evidence, projects, applications, interview prompts, achievements, and editable proof points. Keep sections full width with constrained inner content.

Long detail fields should use disclosure controls when they would make scanning difficult. The first visible layer of each card should answer: what is this, what does it show, and why does it matter for EAE?

## Elevation & Depth

Use soft shadows only. Avoid heavy floating panels, harsh glows, or over-decorated effects. Dark sections can use translucent panels and subtle star-like texture, but the reading experience must stay calm.

## Shapes

Cards use an 8px radius. Small controls use 6px. Pills are reserved for filters, chips, and compact status indicators.

Avoid nested card stacks. If a section already sits inside a card, inner details should use dividers, disclosure rows, or light surfaces instead of another heavy card.

## Components

Project cards should show media or an honest placeholder, then the project signal, EAE connection, evidence status, and technologies before deeper case-study details.

Achievement cards should show category, title, date, summary, applicant signal, and evidence chips. Detailed reflections and certificates belong in the modal.

Application cards should support both Singapore Polytechnic and Ngee Ann Polytechnic without inventing school-specific claims. Course and school notes stay editable placeholders until confirmed.

Admin editor fields should prioritise the content most likely to change before submission: personal copy, application notes, project signals, evidence status, and achievement relevance.

## Do's and Don'ts

Do keep Jaron as the focus.
Do use honest placeholders for missing facts, dates, awards, roles, images, and certificates.
Do keep the portfolio calm, light on the eyes, and easy to scan.
Do use card summaries before long details.
Do preserve both live-site and print/PDF readability.

Don't invent outcomes, rankings, organisers, deployment status, certificates, or course-specific claims.
Don't make the page feel like a generic tech template.
Don't overload the header navigation.
Don't use decorative effects that compete with the evidence.
Don't hide important missing-information warnings.
