---
name: ultra-legacy-ads-guard
description: Preserve old Trymalora paid-ad product experiences while rebranding public website into ULTRA OVERNIGHT. Use before any theme, product state, menu, cart, catalog, selling plan or URL change.
---
# ULTRA OVERNIGHT: Legacy Ads Regression Guard

## Treat existing ad landing revenue path as protected
Legacy pages may be isolated by direct product handle conditionals; NEVER delete, redirect or change canonical URLs, variant IDs, selling-plan IDs, product/collection publication, order flows, pricing, tracking pixels or ad destination query strings as part of a visual rebrand.

## Evidence inventory
Capture source URL, handle, UTM/variant params, Shopify template suffix, current product title, displayed price, bundle tiers, selected defaults, reviews, gift/upsell identifiers, checkout expected total, and relevant pixel events. Obtain exact current state from actual store; backup chat reports are historical only. Redact API keys and customer data.

Examples to check (not exhaustive, only if still live):
- `/products/ear-cleaner`: 100ml bundles, selling plan 30 days, upsell; historical backup claims it worked, revalidate.
- `/products/eyvelle-steam-therapy`: 3 bundles and LuminaLift checkbox/upsell.
- `/products/metallic-silver-anti-rust-renovation-coating`, `/products/tile-refinishing-paint-restoration-kit`, `/products/car-metal-rust-repair-paste`.
- `kids-infrared-battle-blaster-set-with-target-projector` and other currently advertised handles from live Meta Ads Manager export.

## Regression gates (read-only tests, draft preview)
1. Preserve exact HTML content where expected, product media, variant availability, button state and discount tier labels.
2. Confirm buy box total matches native Shopify cart via `/cart.js` and calculated line final price; check one-time vs subscription correctly forwards `selling_plan`.
3. Open cart drawer and compare line-item count, quantities, gift properties, shipping threshold, AJAX events (`cart:updated`, `willa:cart:refresh`), and checkout handoff without placing an order.
4. Verify tracking only when test events are allowed: no duplicate Meta Purchase/ATC pixel, no firing checkout events on a page render. Never send fake purchases.
5. Preserve SEO canonical and redirects. Check all live ad URLs including `?variant=...` and UTM strings; verify return 200 or documented expected route.
6. Confirm product discoverability decisions do NOT remove an old product from Meta Catalog without owner consent. Query admin channel membership first.

## Failure response
If an ad URL, bundle, subscription, cart or checkout breaks: do not publish. Capture screenshot, URL, console/network log, expected vs observed, commit/draft theme ID, and file diff. Revert only the isolated draft change, never alter live store to fix an unconfirmed regression.

## Acceptance artifacts
- `docs/run_reports/legacy_ad_url_matrix.csv` with source evidence (can be generated when real URLs are provided).
- Browser screenshots desktop/mobile and a before/after cart-price ledger.
- Written `PASS`/`FAIL`/`NOT_TESTED` by handle (no invented passes).
