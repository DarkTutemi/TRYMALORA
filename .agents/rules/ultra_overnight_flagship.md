# TRYMALORA → ULTRA OVERNIGHT | Flagship rules

Scope: Any task involving ULTRA OVERNIGHT, Trymalora homepage, navigation, storefront exposure, or product page changes.

## Decisions locked by owner (2026-11-14)
- Full replacement of *public brand presentation* at `trymalora.com` with **ULTRA OVERNIGHT**, visual direction **Premium Feminine**. This is not a second Shopify store.
- Keep one Shopify Admin, one checkout and the existing domain.
- Preserve **all existing product URLs**, live products, bundle/variant/subscription/upsell behavior, review assets, cart and checkout logic. Old paid Meta ads must continue to land on the correct old product pages.
- Legacy products are removed from discovery/navigation on the flagship storefront, not deleted. **Do not change Shopify product publication, SEO visibility, product status, feeds, channels, collections, or catalog synchronization until Meta ad types are verified by owner.** Hiding a link is not access control; do not promise that direct URLs are inaccessible.
- Work against a **new duplicate of the actual current Shopify live theme** (draft/unpublished), after getting exact IDs and validating source parity. Do not confuse a blank draft theme with a duplicate, and do not infer current live theme IDs from historical chat backups.
- No live-theme publish/deploy, store mutation, price changes, paid app setup, API charges or new subscriptions without explicit scoped owner approval. GitHub changes on isolated branch only when write permission is available.

## Flagship engineering target — NOT claims verified by testing
- V4 FULL-SPINE ULTRA OVERNIGHT; 5 layers; **150–160 mL target**; 360° coverage direction; **50–100 washes target**.
- Seven pillars: Ultra-Lock Core, Full-Spine Shield, SideSeal Guard, DryTouch, Odor Control, CloudFlex, WashGuard.
- Factory concept reported agreed by owner. Physical sample, laboratory data, wash durability, leakage tests and real commercial prices remain unverified until evidence is provided.
- No “100% leakproof”, medical, antimicrobial or superior-to-competitor statement without methodologically compatible evidence.

## Required delivery gates
1. `git status` + exact current live theme ID + new draft theme ID; create rollback snapshot before theme changes.
2. Capture baseline of legacy PDP files and current ad landing URLs; compare before/after.
3. Rebuild public homepage, brand header/footer and flagship PDP in isolated templates/sections/assets. Shopify theme editor settings/blocks must control content.
4. Flag `/collections/all`, `/search`, predictive search, recommendations, footer links, cart empty-state CTAs and collection cards as discovery leaks; use explicit design and QA to prevent legacy discovery.
5. Preserve direct legacy ads entry and money flow; test one-time bundles, subscription selling_plan, gift/upsell prices, cart drawer and checkout redirect with test cart, no purchase.
6. Validate desktop and mobile, accessibility, speed, metadata, and policies. **No publish** without approval and demonstrated regression evidence.

## Skill routing
- `ultra-storefront-isolation` + `ultra-legacy-ads-guard` for routing/discovery/ads.
- `ultra-premium-cro` + `ultra-brand-voice` for flagship design/content.
- `ultra-product-claims` for product science, comparison and USP.
- `ultra-media-performance` + `ultra-visual-qa` before visual QA and release.
- Combine with existing `shopify-theme-architect`, `shopify`, `chrome-devtools`, `frontend-design`, `debugging`, `code-review` skills. Do not copy or auto-execute ECC hooks/MCP configuration.
