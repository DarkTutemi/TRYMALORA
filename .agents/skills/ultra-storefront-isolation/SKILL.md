---
name: ultra-storefront-isolation
description: Isolate the ULTRA OVERNIGHT public brand/navigation in a Shopify OS 2.0 single-store storefront while keeping legacy product URLs and purchase flows accessible via ads. Use on homepage, menus, search, collection, cart empty state and recommendation work.
---
# ULTRA OVERNIGHT: Storefront Isolation

## Outcome contract
At the domain root, customers see only ULTRA OVERNIGHT branded content and product discovery. Legacy paid-ad URLs remain unchanged and continue to resolve to their existing PDP and purchase flow. One store/checkout, not a multi-store migration. Legacy pages are not private.

## Before editing
- Identify actual live Shopify theme by Admin read-only query; don't trust historical IDs, branch names or URL guesses.
- Duplicate current live theme as a new unpublished draft, inspect its exact assets and templates, then record rollback ID.
- Inventory legacy ad destination URLs including UTM and `variant=` query params, product handles, product template assignments, and Metafield references.
- Detect existing hardcoded links and generic collections in `sections/header-group.json`, `footer-group.json`, `willa-header.liquid`, `willa-footer.liquid`, `willa-cart-drawer.liquid`, `trymalora-featured-products.liquid`, search, recommendation, category and collection sections.
- Do not alter product sales-channel publication or status without confirming direct versus catalog ads; unlisting may affect third-party feeds.

## Implementation design
1. Use Shopify OS2 native homepage (`templates/index.json`) for ULTRA OVERNIGHT and a flagship-specific product template (e.g. `templates/product.ultra-overnight.json`) with scoped sections/settings. Do **not** replace shared PDP buy box logic across legacy products.
2. Decide intentionally whether legacy product pages keep existing header/footer or new flagship chrome. Owner requires old product PDP design/functions preserved. Global chrome may need a conditional based on `product.handle`/`product.template_suffix` or a scoped alternative; make this testable.
3. Header/footer/menu must be flagship-branded at root and flagship routes. Remove old catalog links and the default Shop All entry. No hidden global fallback link to `/collections/all`.
4. Audit all indirect discovery paths: `/collections/all`, `/collections`, `/search`, predictive results, product recommendations, post-ATC, empty cart CTA, breadcrumbs, 404, sitemap/feed and site search widgets. Choose per-route behavior and document what is technically achievable without disabling old URLs.
5. Keep `track-order`, about, contact and policies coherent with the flagship public brand, but never falsify merchant identity or legal contact terms.
6. Apply no global blanket selectors that change legacy PDP CSS/JS. Namespace custom flagship styles (`.uo-*`) and carefully audit global design tokens.
7. Preview links must retain `preview_theme_id` through navigation when QA-ing a draft; do not rewrite old URL slugs.

## Verification
- Run `python scripts/qa_ultra_isolation.py audit --root .` after copying QA script from patch. The scanner flags obvious leaks, not proof of zero leaks.
- Browser-check 375, 390, 414, 768, 1440 widths. From flagship homepage walk every visible link and CTA; no legacy discoverability.
- Direct-open every legacy ad URL and confirm correct product/price/variant, cart, checkout link and readable landing. Non-destructive checks only.
- Compare network errors, cart drawer and Shopify `cart.js` payloads before/after. Stop if a regression is observed.
- Document unavoidable direct URL search-index access: removing links does not prevent typing an old URL.

## Done only if
Flagship navigation has no accidental legacy links; old ad URLs pass smoke tests; draft only; no product publication change; both desktop/mobile QA evidence linked in run report.
