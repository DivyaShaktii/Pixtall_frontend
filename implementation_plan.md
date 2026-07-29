# Impeccable Layout Refactoring

This plan outlines the layout restructuring for the application (specifically the `DemoPlayback` and related Studio components) to align with the "Minimalist Atelier" brand and explicitly break away from the generic Bootstrap/Material admin dashboard layout.

## Assessment Findings
1. **Output is Boxed In**: The generated images (the hero of the app) are currently squeezed between a 220px left sidebar and a bulky 420px right sidebar.
2. **Generic Dashboard Structure**: The 3-column layout with hard borders feels like a generic SaaS admin panel, not a premium creative tool.
3. **Monotonous Rhythm**: The spacing is standard and uniform, lacking the rhythmic tension of tight groupings paired with generous separations.

## Proposed Changes

### 1. Shift to a "Floating Canvas" Architecture
- Instead of rigid columns, the center canvas will visually span the entire width of the application.
- The UI panels (left nav, right inspector) will float above the canvas with a subtle glassmorphism (backdrop blur) or sit as distinct floating islands to give the generated images maximum breathing room.

### 2. Streamline the Left Navigation
- **[MODIFY] DemoPlayback.jsx**: Convert the 220px bulky text-based left sidebar into a sleek, 64px/80px wide icon-only rail (similar to Figma or Spline). This immediately frees up ~140px of canvas space and removes visual clutter.

### 3. Refine the Right Inspector (StudioSidebar)
- **[MODIFY] StudioSidebar.jsx**: Reduce the width from a massive `420px` to a more refined `320px`. 420px is nearly 30% of a 1440px screen, which contradicts the "Minimalist Atelier" principle.
- Update internal spacing to use tight groupings for related controls (e.g., 8px gap) and generous spacing between distinct sections (e.g., 32px gap), breaking the monotonous 20px padding.

### 4. Enhance the Canvas Grid
- **[MODIFY] StudioCanvasGrid.jsx**: Ensure the generated images have fluid breathing room and aren't trapped in tight borders.

## User Review Required

> [!IMPORTANT]
> This restructuring will change the left sidebar in the Demo playback to be an **icon-only rail** instead of a text-based menu, and will narrow the right inspector panel to give the images more focus. Do you approve of this "floating canvas" approach to make it feel more like a premium creative tool (like Figma/Midjourney)?

