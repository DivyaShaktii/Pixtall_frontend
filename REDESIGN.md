# StallPix AI — Redesign Notes

## Design direction
Clean SaaS, in the vein of Vercel / Stripe — but built around this product's
own subject matter (photography) rather than generic template defaults.

**Palette — "Ink & Safelight"**
- `--ink #0e0e10` / `--paper #fff` — a near-black-on-white base, no purple gradients, no glass.
- `--accent #ff4d2e` ("safelight") — the one colour in the system, used only for the primary
  action, active states, and the eyebrow dot. It's named after a darkroom safelight: the one
  light you can work under without ruining the print.

**Type**
- **Inter** — all UI, body copy, headings.
- **Instrument Serif** (italic) — used only inside `<em>` in headlines, an editorial accent
  reserved for one phrase per page.
- **IBM Plex Mono** — eyebrows, pills, form labels, stat numbers. Treats metadata (category,
  scene, size, credits) like camera EXIF data, which is literally what it is.

**Signature element — the compare slider**
`src/components/BeforeAfterSlider.jsx` is a new, real, draggable before/after comparison,
built from your own three images:
- `public/examples/raw-product.png` — the raw jewellery-in-hand photo
- `public/examples/studio-output.png` — the generated model photo
It sits at the top of the hero on the login/landing page and *is* the pitch — no stock
photography, no explaining-in-words what the product does.

**Recurring motif — viewfinder corners**
Small L-shaped brackets (`.vf-corners`, and the pseudo-elements on `.gen-placeholder-area`)
echo a camera's autofocus box. Used sparingly: the empty generation canvas in the studio.

## What changed
| File | Change |
|---|---|
| `src/styles.css` | Full rewrite — new tokens, type, and every component's styling. |
| `src/components/BeforeAfterSlider.jsx` | New. The hero's signature interaction. |
| `src/components/AuthPage.jsx` | Restyled landing + login; slider replaces the old floating-photo showcase; copy tightened. |
| `index.html` | Swapped the Poppins font link for Inter / Instrument Serif / IBM Plex Mono. |
| `src/App.jsx`, `ModelSelector.jsx`, `ProductImageUpload.jsx`, `CategorySelector.jsx`, `SceneSelector.jsx`, `SizeSelector.jsx`, `GenerateButton.jsx`, `MarketingPage.jsx` | Untouched logic — they already targeted class names that the new stylesheet re-skins, so no JSX changes were required. |

## Applying it to your project
1. Unzip `stallpix-redesign.zip`.
2. Copy `src/styles.css`, `src/components/AuthPage.jsx`, `src/components/BeforeAfterSlider.jsx`,
   and `index.html` into your project, overwriting the existing files.
3. Copy `public/examples/` into your `public/` folder (the three showcase photos).
4. `npm install && npm run dev` — verified building cleanly with `vite build` in this environment.

## Notes / next steps
- `MarketingPage.jsx` isn't currently wired into `App.jsx` (only `AuthPage.jsx` renders on
  load) — I left it in place and gave it consistent styling for whenever you use it.
- The studio dashboard's empty canvas and admin rail now match the new system automatically,
  since I kept their existing class names and rewrote what those classes mean.
- Male/female model reference photos referenced in `generationConfig.js` aren't included here
  (they weren't in the project files you shared) — the picker UI is fully restyled and ready
  for them.
