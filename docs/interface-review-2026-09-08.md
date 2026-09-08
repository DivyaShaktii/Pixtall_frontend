# Interface review: landing navigation and authentication

Mode: **full**, using `make-interfaces-feel-better`.

Scope: landing navigation (including its use on Terms), Enterprise entry points in the navbar/footer, and login/signup Google-button and input behavior. Framework: React 18/Vite; existing Tailwind utilities, shared CSS tokens, Phosphor icons, and established Motion imports. No new styling system or dependency was introduced.

Boundary: not a redesign of the landing page, not a WebGL performance audit, and not a live OAuth/payment test. Other pre-existing placeholder footer destinations were left alone. Currency work is recommendations only; middleware and payment behavior were not changed.

## Coverage

| Category | Evidence inspected | Result |
| --- | --- | --- |
| Typography | Existing font/smoothing rules in styles.css; Enterprise heading/body at desktop/mobile sizes; auth labels | Existing type system retained; balanced heading and pretty-wrapped notice copy |
| Surfaces | Navbar controls; Enterprise card and dismiss target; auth back button, logo, and form at 390px | Fixed mobile overlap and relevant small targets; reused shared primary-button styling |
| Animations | Auth resize/render effect; navbar transitions; hover/focus with DOM animations slowed to 10% using Chrome DevTools Protocol | Removed redundant Google redraws; explicit navbar transitions and reduced-motion behavior |
| Icons | Existing navbar Phosphor icons; Enterprise close icon; auth back icon | Clear within scope: no new library; close icon uses currentColor and an accessible button label |
| Performance | Google ResizeObserver, effect dependencies, callback lifecycle; navbar transition properties; production build | Width-only Google redraws and stable handler ref; no speculative will-change hints |

## Findings and changes

### Motion restraint and stable interactions

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| HIGH | [AuthPage.jsx:181](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/AuthPage.jsx:181) | Every ResizeObserver notification replaced the Google button; changing parent callbacks could initialize it again | Remember rendered width, ignore zero/unchanged widths, and use a ref for the current callback | Rebuilding an interactive iframe can interrupt hover/focus and produce flicker; high-frequency interactions should stay stable |
| MEDIUM | [marketingNavigation.js:3](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/lib/marketingNavigation.js:3), [Navbar.jsx:35](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/Navbar.jsx:35), [Footer.jsx:69](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/Footer.jsx:69), [MarketingPage.jsx:14](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/MarketingPage.jsx:14) | Regular Features/Pricing/Gallery clicks added URL fragments; mobile section menu stayed open | Programmatic scroll with sticky-header clearance and focus transfer; no fragment added; clear an existing fragment; close mobile menu. Session storage preserves section navigation when returning from Terms | Predictable same-page navigation follows the requested URL behavior while retaining keyboard access and reduced-motion support |
| LOW | [Navbar.jsx:26](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/Navbar.jsx:26) | Broad transition-all on the header and primary CTA | Explicit header properties at 150ms; color-specific CTA transition; reduced-motion header override | Transition only intended properties; avoid unintended layout/hover animation |

### Surfaces, hit areas, and clear feedback

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | [EnterpriseButton.jsx:5](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/EnterpriseButton.jsx:5), navbar and footer Enterprise entries | Enterprise pointed to an absent section or placeholder fragment | Shared non-modal coming-soon notice with readable copy, balanced heading, expanded-state semantics, status announcement, 44px dismiss button, outside-click dismissal, Escape and focus return | A control must provide useful feedback; information-only notices should not trap focus or imply a release date |
| MEDIUM | [AuthPage.jsx:243](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/AuthPage.jsx:243) | Mobile back control overlapped the logo; its requested solid background was overridden by the global button reset | Reserve top space when the control exists and enforce its solid background using Tailwind | Prevent overlap and keep a functional control readable against the moving backdrop |
| LOW | [Navbar.jsx:35](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/Navbar.jsx:35), [Navbar.jsx:87](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/Navbar.jsx:87), [AuthPage.jsx:250](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/AuthPage.jsx:250), auth tabs | Several navbar/auth controls were below the preferred touch target size | Minimum 44px height for relevant nav links, logo, login/CTA, auth back/tabs; 44px mobile menu toggle | Minimum hit-area principle, without adding press motion to frequent interactions |
| LOW | [Navbar.jsx:77](/Users/rajashekarhs/Documents/Projects/virtual_tryon_frontend/src/components/marketing/Navbar.jsx:77), mobile Start Creating | Primary CTA relied on utility backgrounds overridden by the existing global reset, plus decorative glow | Reuse the existing auth-primary-button surface for desktop/mobile with a restrained color transition | Keep primary actions recognizable and use the established styling system |

Focused regression tests were added for fragment-free section navigation, mobile menu closing, Enterprise opening/dismissal in navbar/footer, Google width-only redraws, mode changes, and retained input focus.

## Considered but rejected

| Location | Candidate | Rejected because |
| --- | --- | --- |
| Auth inputs | Hide the blinking text caret | Native caret blinking is normal and conveys text-entry focus. Preserve it; fix abnormal component redraws instead |
| Auth background | Replace or remove the moving 3D background | That would change the visual identity and expand this bug-fix task; no evidence established it as the Google redraw cause |
| Enterprise notice | Add a full-screen modal or entrance animation | A short availability notice does not require protected focus, a blocking overlay, or extra motion |
| Pricing/billing | Change currency symbols immediately based on region | Current middleware explicitly charges and validates INR. A display-only symbol change would misrepresent the payment |

## Verification

- `npm test`: 24 tests passed after functional changes and auth spacing fix.
- `npm run build`: passed. Existing large-bundle warning remains; no bundle redesign attempted.
- `git diff --check`: passed.
- Isolated Chromium desktop (1440×1000) and mobile (390×844): section navigation leaves the URL without a fragment; sections receive focus; mobile menu closes on section selection; Enterprise opens and dismisses; mobile auth has no horizontal overflow and back control no longer overlaps the logo.
- Google test button: remained at one initial render across repeated hover-induced height changes and input edits; actual width changes redraw it. Login/signup switching and an authentication error response were exercised. Real OAuth credentials were not submitted.
- Focus/hover/active states were exercised. Loading/empty rendering paths were inspected in source and regression tests; every transient loading frame was not captured visually.
- Chrome DevTools Protocol set DOM animation playback to 0.1 during auth hover/focus checks. This does not slow the WebGL animation loop. No custom auth entrance animation was added.
- No middleware, database, environment-variable, or billing changes. Nothing pushed for this task.

## Verdict

**Approve for the reviewed local frontend scope.** No actionable findings remain in that scope. Not verified: real Google OAuth popup/completion, production deployment, Safari/Firefox, physical-device behavior, and WebGL motion at 10% speed. The final mobile primary-CTA class uses the same shared surface checked on desktop; its final state was source/build verified rather than separately screenshot-tested.
