---
name: shopify-theme-architect
description: >-
  Design, architect, and optimize Shopify OS 2.0 storefronts, Liquid themes, product detail pages (PDPs),
  collections, homepages, product bundles, upsells, and e-commerce conversion flows. Pairs with the official
  `shopify` skill (GraphQL Admin API, Shopify CLI, Liquid validation) without duplicating API schemas.
  Use when architecting Shopify OS 2.0 sections/blocks/JSON templates, building PDP bundles and variant
  selectors, optimizing storefront conversion rate (CRO), or editing Trymalora theme files safely.
---

# Shopify Theme Architect & Conversion Playbook

This skill governs Shopify Online Store 2.0 theme engineering, storefront UX architecture, merchandising, and conversion rate optimization (CRO).

> **Companion Skill:** For Shopify GraphQL Admin/Storefront API lookups, Shopify CLI validation, and `.liquid` syntax checks, activate the preserved official `shopify` skill alongside this skill.

## 1. OS 2.0 Theme Architecture & Maintainability

- **Native OS 2.0 Structure:** Organize features into reusable `sections/*.liquid`, `blocks/*.liquid`, `snippets/*.liquid`, `templates/*.json`, `assets/*`, and `locales/*.default.json`.
- **Schema-Driven Merchandising:** Expose headings, badges, images, pricing tiers, FAQs, and layout toggles inside `{% schema %}` blocks/settings so merchants can manage content from the Shopify Theme Editor without editing Liquid code.
- **Avoid Duplication & Hardcoding:** Reuse existing snippets/CSS design tokens before creating single-product overrides. When product-specific logic is required (e.g., custom bundle pricing or companion upsell), scope it strictly by `product.handle == '...'` or a metafield/block setting so other products remain untouched.
- **Modern Liquid Standards:**
  - Prefer `image_tag` + `image_url: width: ...` over legacy `img_url`.
  - Always guard optional fields (`{% if ... != blank %}`), escape attributes cleanly (`| escape`), and output `{{ block.shopify_attributes }}` on block containers.
  - Keep expensive nested loops out of Liquid; precompute or delegate interactive variant matrix calculation to clean vanilla JS + Cart APIs.

## 2. Shopify CLI & Safe Workflow

```bash
# Inspect version & check syntax errors before pushing
shopify version
shopify theme check

# Local development preview (non-destructive)
shopify theme dev --store <store-domain>

# Push to unpublished/draft theme ONLY (requires user approval before publishing live)
shopify theme push --store <store-domain> --unpublished
```

**Deployment & Data Safety Rules:**
1. **Never push to the live theme or alter live product prices** without explicit user confirmation.
2. **Never delete products, collections, customer records, or alter store billing/shipping policies.**
3. **Never expose `.env` credentials** (Client ID, Secret, Admin tokens) in committed files, screenshots, or chat output.
4. Always test on a **draft preview theme** (`?preview_theme_id=<id>`) with `chrome-devtools` before reporting completion.

## 3. High-Converting Product Page (PDP) & Bundle Standards

Essential conversion architecture for Trymalora PDPs:
- **Above-the-Fold Hierarchy:** High-resolution gallery with clear aspect ratio + variant/lifestyle thumbnails, concise benefit bullets, clear price anchoring (compare-at vs bundle price & real dollar/percent savings), and friction-free primary CTA (`ADD TO CART · $XX.XX`).
- **Bundle & Variant Selectors:** Support multi-tier quantity bundles (`Buy 1 / Buy 2 / Buy 3`), per-item variant pickers (color/size/edition), shipping-threshold progress indicator, and optional companion upsells whose checkboxes never collide with image-zoom modals.
- **Decision-Support Sections:** What's in the Box, How-to-Use steps, authentic Customer Reviews, Shipping/Guarantee assurances, and Objection-preempting FAQ accordions.
- **Mobile-First Commerce:** Sticky mobile Add-to-Cart bar anchored cleanly in the thumb zone without overlapping cookie banners or product media; tap targets >= `44px`; zero horizontal scroll overflow.
- **Strict Honesty Standard:** Never invent fake reviews, fabricated live visitor counters ("28 people looking right now" unless backed by real analytics), fake countdown timers, or unverified certifications. Persuasive merchandising must stay truthful.

## 4. Scope Control & Anti-Regression Protocol

1. **Modifying 1 Product:** Touch only that product's template (`templates/product.<handle>.json`) or cleanly isolated `{% if product.handle == '...' %}` blocks and isolated JS/CSS hooks.
2. **Modifying 1 Section:** Do not modify shared headers, footers, or unrelated collection/home templates.
3. **Storefront-Wide Changes:** Audit all dependent templates first (`templates/*.json`), document affected sections, and verify key flagship PDPs alongside the modified page.

## 5. Reference Guides

- **Theme Liquid & OS 2.0 Basics:** [references/themes.md](./references/themes.md)
- **Conversion Rate Optimization (CRO) Playbook:** [references/cro-playbook.md](./references/cro-playbook.md)
- **Shopify Extensions (Checkout, Admin, POS, Functions):** [references/extensions.md](./references/extensions.md)
- **Shopify App & GraphQL/OAuth Patterns:** [references/app-development.md](./references/app-development.md)

