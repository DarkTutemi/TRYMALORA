---
name: ultra-visual-qa
description: Run end-to-end visual, accessibility, storefront navigation, cart and regression QA for an ULTRA OVERNIGHT draft Shopify theme while protecting all old ad landing URLs.
---
# ULTRA OVERNIGHT: Visual and Checkout QA

Pair with existing `chrome-devtools`, `code-review`, `debugging`, `shopify-theme-architect` and ECC `e2e-testing`, `module-regression`, `change-impact`. Do not copy ECC test runners and auto-execute hooks.

## Preconditions
- Record Git HEAD, clean/dirty state, draft theme ID, exact live theme ID and known ad URLs.
- Capture baseline screenshots and cart ledger for legacy product URLs on live theme **read-only**. Never execute a live purchase.
- `shopify theme check` and static scanner run before Chrome QA.

## Route matrix
Flagship: `/`, flagship `/products/...`, `/pages/about-us`, `/pages/track-order`, FAQ/Contact, `/cart`, checkout link, `/search`, `/collections/all`, `/collections`, 404, policy URLs. Legacy: all ad destinations with query/variant/UTM and checkout. Check whether routes exist—do not mark missing pages PASS.

## Browser matrix
375, 390, 414, 768, 1024, 1440, 1920 pixels; at least one real mobile browser/viewport and desktop screenshot, keyboard/focus, no overflow, no carousel trapping, readable labels and sufficient contrast.

## Functional assertions
- From any flagship-facing navigation or CTA, no reachable old catalog link/recommendation. Search, cart-empty CTA, breadcrumb, related products and footer are frequently missed.
- Old ad product exact URL remains reachable and displays correct image/variant/price/reviews and intended template.
- Bundle selector numbers, subscription `selling_plan`, gifts and upsells correlate with `cart.js` total; changing options updates CTA and cart; no double add.
- Tracking pixel events only fire for genuine user interaction; avoid test purchase events and customer data logging.
- No JS exceptions/network 4xx/5xx caused by new theme, no accidental old brand copy in flagship routes.
- Cache, theme preview params and platform limitations documented; checkout merchant descriptor cannot be promised hidden.

## Signoff
Produce evidence table: `TEST`, `URL`, `LIVE BASELINE`, `DRAFT RESULT`, `PASS/FAIL/NOT_TESTED`, screenshot/link, issue. Do not publish unless all critical checks pass AND owner explicitly approves.
