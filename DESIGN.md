---
name: Pixtall AI
description: Turn any product photo into a marketplace-ready creative
colors:
  ink: "#f5f5f5"
  paper: "#09090b"
  cloud: "#18181b"
  line: "#27272a"
  accent: "#84CC16"
typography:
  display:
    fontFamily: "\"Instrument Serif\", Georgia, serif"
  body:
    fontFamily: "\"Inter\", -apple-system, sans-serif"
  mono:
    fontFamily: "\"IBM Plex Mono\", monospace"
rounded:
  sm: "6px"
  base: "10px"
  lg: "16px"
components:
  generate-btn:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
  generate-primary:
    backgroundColor: "{colors.accent}"
---

# Design System: Pixtall AI

## 1. Overview

**Creative North Star: "The Minimalist Atelier"**

The design is sharp, high-contrast, and deliberately steps out of the way of the generated images. Every element is elegant, refined, and spacious, allowing the AI output to be the true hero. We explicitly avoid generic Bootstrap/Material layouts and overly technical or cluttered configurations.

**Key Characteristics:**
- High contrast and focused
- Minimalist and elegant
- Output-driven

## 2. Colors

The color palette follows a "Monochrome Dark with Lime Accent" strategy (inspired by Flair.ai and FASHN.ai). The UI is built on a foundation of restrained, deep monochrome neutrals, using a single punchy lime/chartreuse accent to drive interactions.

### Primary
- **Lime Accent** (#84CC16): Used strictly for the primary CTA, active tabs, the "ready" pulse state, and single hero-text highlight words.
- **Dark Lime** (#65A30D): Used for pressed/hover states of primary actions.

### Structural Chrome
- **Graphite** (#18181B): Used for sidebars, top headers, card chrome, and the bottom control bar. It provides structural depth.
- **Line / Muted** (#27272A / #A1A1AA): Neutral greys for captions, labels, disabled states, and structural lines/borders.
- **Off-White / Light Grey** (#F5F5F5 / #D4D4D8): Body text and primary ink. Off-white that sits comfortably against the dark canvas without being stark #FFF.

### Canvas
- **Near-Black Base** (#09090B): The studio canvas and page background. A deep near-black that makes generated product photography appear more premium and boosts apparent contrast/color.

### Named Rules
**The Single Accent Rule.** The Lime Accent (#84CC16) is the single splash of color. It appears only on the primary CTA, key active indicators, and hero highlights. Everything else relies on Graphite and Near-Black.

## 3. Typography

**Display Font:** "Instrument Serif", Georgia, serif
**Body Font:** "Inter", -apple-system, sans-serif
**Label/Mono Font:** "IBM Plex Mono", monospace

**Character:** Technical precision paired with elegant display moments.

### Hierarchy
- **Display**: Used for hero moments, italicized emphasis, and editorial moments.
- **Body**: Standard UI text, legible and clean.
- **Label**: Monospaced precision for technical metadata, tags, and small eyebrows.

## 4. Elevation

Shadows are layered and deliberate, used for structural hierarchy to lift active elements above the canvas.

### Shadow Vocabulary
- **Shadow XS** (`0 1px 2px rgba(14,14,16,0.04)`): Subtle lift for buttons and interactive controls.
- **Shadow SM** (`0 2px 8px rgba(14,14,16,0.06)`): Hover states for buttons.
- **Shadow LG** (`0 24px 64px rgba(14,14,16,0.14)`): Deep structural elevation for major floating elements or modals.

## 5. Components

Components feel tactile and crisp with distinct interactive boundaries.

### Buttons
- **Shape:** Rounded SM (6px)
- **Primary:** Vibrant Tangerine background, Paper text.
- **Standard (Generate):** Ink background, Paper text.
- **Hover / Focus:** Box-shadow elevation and slight color darkening.

### Pills / Tags
- **Style:** Cloud background, Line border, Ink text. Monospaced font for technical precision.
- **Shape:** Fully rounded (100px).

## 6. Do's and Don'ts

### Do:
- **Do** let the generated images be the hero of the interface.
- **Do** use Vibrant Tangerine (#ff4d2e) sparingly for primary actions.
- **Do** maintain high contrast and keyboard navigation capabilities.

### Don't:
- **Don't** use a generic Bootstrap/Material admin dashboard layout.
- **Don't** clutter the UI with overly technical sliders or unnecessary structural boxes.
