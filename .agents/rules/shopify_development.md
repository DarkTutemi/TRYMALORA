# Trymalora Shopify Storefront Development Rules

These workspace rules govern all Shopify theme, storefront, UI/UX, and API development in this repository.

## 1. Shopify Safety & Deployment Guardrails
- **Never deploy to a live/published Shopify theme** without explicit user approval. Always work on a draft theme, local preview (`shopify theme dev`), or isolated branch first.
- **Never modify live product prices, delete products/collections/customer data, change payment settings, or alter shipping/refund policies** without explicit approval.
- **Never install paid Shopify apps**, expose `.env` Admin API tokens/credentials in output or commits, or modify unrelated repositories (never reference external projects).
- Create a rollback path (git commit/backup or theme asset snapshot) before substantial modifications, and never overwrite unrelated theme files.

## 2. Scope Control & Anti-Regression
- **One Product Request:** Modify only that product's template, assets, or explicitly scoped conditionals (`product.handle == '...'`). Never leak one product's bundle rules, upsells, pricing, or promo copy into other products.
- **One Section Request:** Modify only that section and its required assets; keep unrelated sections untouched.
- **Storefront Redesign:** Audit existing architecture (`templates/`, `sections/`, `snippets/`, `assets/`) before implementing changes.
- Preserve compatibility with existing OS 2.0 JSON templates, `settings_schema.json`, and reusable snippets.

## 3. Storefront Design & Truthfulness Standards
- **Architecture:** Prefer Shopify OS 2.0 native `sections/`, `blocks/`, `snippets/`, and `% schema %` settings so merchants can edit content in the Shopify Theme Editor instead of hardcoding.
- **PDP Capabilities:** Support bundle tiers, per-item variant selectors, quantity-based pricing, upsells, gift unlocks, selling plans (subscriptions), reviews, FAQ accordions, how-to-use blocks, sticky mobile Add-to-Cart, trust signals, and shipping info.
- **Integrity Rule (Strict):** Never fabricate reviews, fake live visitor counts, artificial inventory scarcity, unverified certifications, or fake customer testimonials. Promotional copy must remain honest and verifiable.
- **CRO Craft:** Apply visual hierarchy, benefit-first copy, above-the-fold clarity, clean price anchoring, mobile thumb-zone CTAs, and minimal cart friction without sacrificing accessibility, speed, or correctness.

## 4. Chrome DevTools Visual Verification Workflow
Shopify CLI success or HTTP 200 is **not** proof that UI or cart logic works. After meaningful UI or JS changes:
1. Open the preview URL in an isolated headless Chrome / Puppeteer session (`chrome-devtools` skill).
2. Capture both **desktop** and **mobile (`390x844`)** screenshots and inspect them with `read_file`.
3. Inspect DOM layout, font sizes, spacing, and verify zero horizontal overflow on mobile.
4. Check for console errors and failed network requests (`>= 400`).
5. Test interactive controls end-to-end (bundle selection, variant switching, upsells, zoom modals, Add-to-Cart `/cart.js` payload).
6. Spot-check unrelated products/pages to confirm zero regressions.

## 5. Skill Routing Matrix
- **Homepage / Full Storefront Design:** `frontend-design` + `taste-skill` + `shopify-theme-architect`
- **Product Page Redesign / Cloning:** `shopify-theme-architect` + `frontend-design` + `clone-shopify`
- **Bundles, Upsells & Variant Selectors:** `shopify-theme-architect` + `frontend-development` + `debugging`
- **Collections & Filtering / Cards:** `shopify-theme-architect` + `ui-styling`
- **Liquid / JS / CSS Bug Fixing:** `debugging` + `shopify` (for API/Liquid validation)
- **Pre-Deploy Code & Diff Review:** `code-review` + `shopify theme check`
- **Desktop & Mobile UI Verification:** `chrome-devtools`
- **Conversion Optimization (CRO):** `shopify-theme-architect` (`references/cro-playbook.md`) + `frontend-design`

