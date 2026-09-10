# Pixtall AI organic search roadmap

This is a proposal for approval, not an implementation record. It separates work that belongs in the codebase from work that requires the site owner, company details, or third-party accounts.

## Foundation implementation — September 10, 2026

Completed in code:

- Build-generated `robots.txt` and XML sitemap using `VITE_SITE_URL`.
- Unique homepage/Terms/404/private-app metadata, canonical URLs, social cards, and index controls.
- `Organization` and `WebSite` JSON-LD using verified repository facts only.
- Build-time pre-rendering for the homepage, Terms, and 404, including pricing content in initial HTML.
- Empty `noindex` application shell plus `X-Robots-Tag` headers for Studio and password-reset routes.
- Real 404 output, clean URLs, and permanent `/legal/terms` redirect.
- Route-level code splitting for authenticated product surfaces.
- Immutable caching for built assets.
- Removal of placeholder footer and social links.
- Automated unit tests and build assertions for SEO-critical output.

Still requires owner input or a later content phase:

- The canonical production domain is `https://www.pixtall.com`. Keep `VITE_SITE_URL` set to this exact origin in every production build.
- Provide official organization details and social profiles before expanding entity schema.
- Approve a legally accurate Privacy Policy before adding a public Privacy page.
- Create original use-case, marketplace, case-study, and resource pages before expanding the sitemap.
- Connect Search Console, Bing Webmaster Tools, and analytics after deployment.

## Current baseline

- The homepage has one static title and one generic meta description.
- There is no `robots.txt` or XML sitemap in `public/`.
- There is no canonical URL, Open Graph/Twitter metadata, favicon manifest, or JSON-LD structured data.
- The public site is rendered entirely by client-side React. The initial HTML does not contain the landing-page copy.
- Vercel rewrites every path to `index.html`; unknown URLs can therefore appear as successful pages instead of true `404` responses.
- The landing page contains useful, keyword-relevant copy and descriptive gallery alt text, but it has only one indexable marketing URL plus Terms.
- Several footer destinations are placeholders (`#`), including Blog, Tutorials, Help Center, About, Contact, Privacy, and social profiles.
- The production domain, preferred `www`/non-`www` form, company contact details, verified social URLs, and legal image-usage policy are not yet defined in the repository.

## Part A — developer work

### Priority 0: crawlability and correct indexing

- [ ] Confirm the canonical production domain and one preferred host format (`https`, plus either `www` or non-`www`).
- [ ] Add `public/robots.txt` that permits public marketing pages, references the sitemap, and does not use `robots.txt` as a substitute for `noindex`.
- [ ] Add a root XML sitemap containing only canonical, public, indexable URLs. Generate it automatically once content pages become dynamic.
- [ ] Add canonical links and route-specific `<title>` and meta descriptions.
- [ ] Add `noindex, nofollow` to authentication, password-reset, studio/account, billing, settings, and other private utility views where they can be reached by crawlers.
- [ ] Return real `404` status codes for unknown routes and create a useful 404 page. Replace the unconditional catch-all behavior with deliberate routing rules.
- [ ] Add permanent redirects for duplicate forms: HTTP to HTTPS, non-preferred host to preferred host, trailing-slash policy, and `/legal/terms` to the chosen Terms URL.
- [ ] Pre-render or server-render public marketing and content routes so meaningful headings, copy, links, and metadata exist in the initial HTML response. Keep the signed-in studio client-rendered.
- [ ] Verify that Googlebot can load the CSS, JavaScript, fonts, and public images needed to render the page.

### Priority 1: search-result quality and site meaning

- [ ] Rewrite the homepage title and description around the approved primary intent, likely “AI product image generator” / “AI product photography for ecommerce,” while keeping the copy natural.
- [ ] Add Open Graph and Twitter Card metadata with a purpose-built 1200×630 share image.
- [ ] Add JSON-LD for `Organization`, `WebSite`, and—only if all required factual fields are available—`SoftwareApplication`. Do not invent ratings, reviews, prices, addresses, or social profiles.
- [ ] Validate JSON-LD with Google Rich Results Test and Schema Markup Validator.
- [ ] Establish one semantic `<h1>` per public page, descriptive heading order, crawlable `<a href>` internal links, and descriptive anchor text.
- [ ] Replace placeholder footer links with real destinations or remove them until the pages exist.
- [ ] Add a proper Privacy page and accessible contact/about information to improve trust and entity clarity.

### Priority 1: performance and image discovery

- [ ] Measure PageSpeed Insights and real-user Core Web Vitals separately for mobile and desktop. Target LCP ≤2.5s, INP ≤200ms, and CLS ≤0.1 at the 75th percentile.
- [ ] Code-split the public landing page and heavy Three.js/studio code. The current production JavaScript bundle is about 1.67 MB before gzip and triggers Vite’s chunk-size warning.
- [ ] Optimize the hero, gallery, and demo assets: AVIF/WebP variants, responsive `srcset`/`sizes`, explicit width/height or aspect-ratio, correct eager/lazy priority, and compression.
- [ ] Keep meaningful images as `<img>`/`<picture>` elements rather than CSS backgrounds when image-search discovery matters.
- [ ] Rename generic image files to stable, descriptive filenames where doing so will not break external references; retain concise, contextual alt text.
- [ ] Self-host/subset critical fonts or otherwise reduce render blocking; preload only genuinely critical assets.
- [ ] Add caching and immutable headers for fingerprinted assets; verify Brotli/gzip delivery.
- [ ] Consider an image sitemap when the gallery has dedicated, indexable landing pages and image ownership/licensing is clear.

### Priority 2: content architecture for organic growth

- [ ] Create distinct, useful landing pages for real search intents instead of putting every keyword on the homepage. Initial candidates: AI product photography, virtual try-on, fashion/apparel, jewelry, footwear, beauty/skincare, food/packaging, and marketplace-specific workflows.
- [ ] Create use-case pages only where Pixtall genuinely supports the promise; each page needs original examples, process details, limitations, and a clear CTA.
- [ ] Launch a resource center with original tutorials, comparison guides, marketplace image requirements, workflow articles, case studies, and release notes.
- [ ] Build topic clusters and internal links between relevant product, use-case, marketplace, tutorial, and case-study pages.
- [ ] Add author/reviewer information, dates, update history, sources, and first-hand examples to editorial content.
- [ ] Add FAQ content only when it helps users. Do not expect FAQ rich results for a normal SaaS site and do not create thin FAQ pages just for keywords.
- [ ] Create dedicated public gallery/case-study pages with surrounding text, meaningful titles, and shareable canonical URLs instead of relying only on a carousel.
- [ ] Add breadcrumbs and `BreadcrumbList` structured data once the public page hierarchy is deeper than one level.

### Priority 2: measurement and safeguards

- [ ] Add privacy-considered analytics plus conversion events for organic landing, CTA click, sign-up, and paid conversion.
- [ ] Add automated checks in CI for broken internal links, duplicate/missing titles and descriptions, accidental `noindex`, sitemap validity, schema validity, and Lighthouse budgets.
- [ ] Monitor server logs or hosting analytics for Googlebot errors, redirect loops, soft 404s, and unusually slow responses.
- [ ] Set a recurring monthly SEO review using Search Console queries/pages/countries/devices, indexing reports, Core Web Vitals, backlinks, and conversions—not a single “SEO score.”

## Part B — site-owner work

### Setup and verification

- [ ] Decide and provide the canonical production domain and preferred `www`/non-`www` format.
- [ ] Create a Google Search Console **Domain property** and complete DNS verification.
- [ ] Submit the deployed sitemap URL in Search Console, inspect the homepage and top landing pages, run Live Test, and request indexing after the technical release.
- [ ] Review Page Indexing, Enhancements, Core Web Vitals, Manual Actions, and Security Issues after data appears.
- [ ] Create Bing Webmaster Tools, verify the domain, and submit the same sitemap. Optionally import the property from Search Console.
- [ ] Set up GA4 or the approved analytics platform, define conversion events, and link it to Search Console if desired.

### Business truth needed from you

- [ ] Approve the primary countries, customer segments, and search intents. Suggested starting focus: Indian/global ecommerce sellers and fashion/product brands.
- [ ] Provide the official legal business name, logo URL, support/contact details, founding/about copy, and verified social-profile URLs for metadata and Organization schema.
- [ ] Confirm the exact product claims we may publish—supported marketplaces, generation speed, commercial-use rights, image quality, categories, and any compliance statements.
- [ ] Provide written customer permission for case studies, testimonials, logos, before/after images, and measurable results. Never publish fabricated ratings or reviews.
- [ ] Confirm copyright, model releases, and licensing for gallery/generated images before asking search engines to index or license them.

### Authority and ongoing growth

- [ ] Build a content calendar from Search Console evidence and customer questions, with an owner for writing, expert review, and updates.
- [ ] Publish genuinely useful first-hand content consistently; prioritize quality and proof over volume or AI-generated keyword pages.
- [ ] Earn relevant mentions and links through partner integrations, ecommerce communities, customer case studies, original research, directories, podcasts, and product-launch coverage. Do not buy links or participate in link schemes.
- [ ] Maintain real brand profiles and consistent business information where appropriate.
- [ ] Reply to press/partner requests and cultivate relationships in ecommerce, fashion-tech, and seller communities.
- [ ] Review organic conversions and qualified leads—not only impressions, clicks, rankings, or third-party SEO scores.

## Recommended approval sequence

1. Approve **Foundation release**: canonical domain, robots, sitemap, metadata, index controls, real 404s/redirects, pre-rendering, schema, and basic performance work.
2. Provide business facts and approve a keyword/search-intent map.
3. Approve the first 4–6 public use-case/resource pages with real examples.
4. Launch, submit in Search Console/Bing, and establish a 30/60/90-day measurement cadence.

## Important expectations

- A sitemap helps discovery; it does not guarantee crawling, indexing, or ranking.
- `robots.txt` controls crawling, not reliable de-indexing. Use authentication or `noindex` for pages that must not appear in search.
- Structured data can make a page eligible for richer presentation but does not guarantee a rich result.
- Search Console data and indexing take time to appear; organic growth is measured over weeks and months.
- Technical SEO removes blockers. Sustainable reach comes from useful pages, proof, links, brand demand, and a product experience people recommend.

## Primary references

- Google Search Central: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Crawling and indexing: https://developers.google.com/search/docs/crawling-indexing
- Build and submit a sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- JavaScript SEO basics: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Robots meta directives: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
- Image SEO: https://developers.google.com/search/docs/appearance/google-images
- Structured data introduction: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Search Console sitemap report: https://support.google.com/webmasters/answer/7451001
- URL Inspection: https://support.google.com/webmasters/answer/9012289
- Core Web Vitals: https://web.dev/articles/vitals
