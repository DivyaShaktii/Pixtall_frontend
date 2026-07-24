---
name: Pixtall AI Motion Language
description: The official motion and interaction guidelines for Pixtall AI
---

# Motion Language: Pixtall AI

## 1. Overview

**Motion North Star: "Crisp, Physical, and Responsive"**

In keeping with the "Minimalist Atelier" design system, the motion language for Pixtall AI is designed to feel fast, snappy, and physically grounded. Animations should never feel floaty, sluggish, or overly dramatic. They exist purely to provide immediate feedback, clarify spatial relationships, and reward user interactions.

**Key Characteristics:**
- **Snappy Easing:** Fast onset, smooth but quick deceleration.
- **Micro-interactions:** Tactile feedback on clicks and hovers.
- **Unobtrusive:** Motion should get out of the way of the generated images.

---

## 2. Core Timing & Easing Curves

All animations use Framer Motion springs or CSS cubic-bezier curves for a natural, physics-based feel.

### Standard CSS Curves
- **Snappy (Default):** `cubic-bezier(0.16, 1, 0.3, 1)` — Used for UI reveals, modals, and dropdowns. Fast entrance, gentle settle.
- **Linear/Hover:** `ease-out` (duration `150ms`) — Used for color fades, borders, and simple opacity changes.

### Framer Motion Springs
- **Bouncy / Layout (Aspect Ratios, Resizing):** `type: "spring", stiffness: 300, damping: 30`
- **Micro-interaction (Clicks/Presses):** `type: "spring", stiffness: 400, damping: 25`

---

## 3. Component Interactions

### Page Transitions
- **Entrance:** Slight vertical slide up (y: 10px to 0px) combined with a fade-in (opacity: 0 to 1).
- **Duration:** `200ms` using the Snappy cubic-bezier.
- **Intent:** Makes the page feel like it is settling cleanly onto the desk.

### Hover States
- **Buttons & Cards:** Slight elevation increase via `box-shadow` (e.g., Shadow XS to Shadow SM) and a subtle background color shift (e.g., `bg-white` to `bg-cloud`).
- **Timing:** Fast `150ms` `ease-out` transition.
- **Active / Press State:** Instantly scale down slightly (`scale: 0.96`) to feel tactile and physical.

### Modal Animations (e.g., Model Selector)
- **Overlay/Backdrop:** Simple fade-in (opacity 0 to 1) over `150ms`.
- **Modal Panel:** Springs in from a slightly smaller scale (`scale: 0.95`) and fades in simultaneously. 
- **Exit:** Fades out and scales down slightly (`scale: 0.95`, opacity 0) over `150ms`.

### Dropdown Animations (e.g., HoverSelect)
- **Reveal:** Originates from the top-start anchor. Scales up slightly (`scale: 0.95` to `1`) with an opacity fade. 
- **Timing:** `150ms` `ease-out`. 
- **Chevron:** The dropdown arrow rotates `180deg` with a `200ms` smooth transition.
- **Option Hover:** Fast `100ms` color and background highlight.

### Toolbar Interactions
- **Segmented Controls:** The active indicator pill uses a layout animation (`layoutId`) with a bouncy spring (`stiffness: 400, damping: 30`) to fluidly slide between selected options.
- **Floating Toolbar:** If it enters the screen, it slides up from the bottom (y: 20px) with the Snappy curve.

### Canvas Transitions
- **Aspect Ratio Switching:** The main grid container animates its width/height proportionally using a layout spring (`stiffness: 300, damping: 30`). The motion must be perfectly smooth without jittering, calculating the numeric ratio on the fly.
- **Slot Activation:** When a slot becomes active (e.g., switching from 1 to 4 images), empty slots fade in and scale slightly from `0.95` to `1`.

### Upload Interactions
- **Drag & Drop:** The upload zone pulses with a soft accent border and a subtle scale up (`scale: 1.02`) when a file is dragged over it.
- **Image Reveal:** When an image is successfully dropped, it dissolves in (opacity 0 to 1) over `200ms` while scaling down from `1.05` to `1.0` (a subtle "settling" effect).

### Success & Generation States
- **Loading / Generating:** Continuous, smooth, non-distracting motion. A subtle gradient pulse (`opacity: [0.3, 0.8, 0.3]`) or a linear, slow rotation on an icon (`rotate: 360`, `duration: 2s`, `linear`). No frantic flashing.
- **Image Arrival (Success):** 
  - The generated image fades in smoothly over `200ms`.
  - The "Download / Save" overlay appears on hover with a `150ms` backdrop blur and fade-in, sliding up slightly from `y: 5px`.
- **Success Banner:** Slides down from the top or expands inline with a quick `200ms` spring, displaying the green checkmark.
