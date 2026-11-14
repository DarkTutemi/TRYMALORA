# ULTRA OVERNIGHT™ — Shopify Admin Activation Manifest

## Executive Summary
This document specifies the exact Shopify Admin configuration required to transition the **ULTRA OVERNIGHT™** Draft Theme (`197625381235`) into a fully functional, live-commerce flagship experience.

Under strict safety protocols, **no live catalog items, product variants, selling plans, or Shopify Admin records were modified automatically**. The Draft Theme source code has been engineered to operate gracefully in a pending state until the store operator creates the designated records below.

---

## 1. Flagship Commercial Product Specification

| Configuration Field | Target Value | Notes & Verification Requirements |
|---|---|---|
| **Product Title** | `FULL-SPINE ULTRA OVERNIGHT™ — High-Capacity Period Underwear` | Displayed across buy box, order confirmations, and invoices |
| **Product Handle** | `full-spine-ultra-overnight` | **MANDATORY**: The Draft Theme buy box and cart drawer link directly to `/products/full-spine-ultra-overnight` |
| **Theme Template** | `ultra-overnight` | In Shopify Admin > Product > Online Store > Theme template, select `ultra-overnight` (corresponds to `templates/product.ultra-overnight.json`) |
| **Product Status** | `Active` (Sales Channels: Online Store) | Do not publish until operator is ready |
| **Product Type** | `Period Underwear` | |
| **Vendor** | `ULTRA OVERNIGHT` | Distinct from legacy vendor Trymalora |

### Variant Options & Pricing Matrix

Option 1: **Size** (`XS`, `S`, `M`, `L`, `XL`, `2XL`, `3XL`)  
Option 2: **Color** (`Plum Noir`, `Blush Rose`)  
Base MSRP: **$28.00 USD** per single pair.

| Variant Title | SKU Format | Barcode / GTIN | Unit Price | Compare-At Price | Inventory Policy |
|---|---|---|---|---|---|
| Plum Noir / XS | `UO-FS-PLM-XS` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Plum Noir / S | `UO-FS-PLM-S` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Plum Noir / M | `UO-FS-PLM-M` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Plum Noir / L | `UO-FS-PLM-L` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Plum Noir / XL | `UO-FS-PLM-XL` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Plum Noir / 2XL | `UO-FS-PLM-2XL` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Plum Noir / 3XL | `UO-FS-PLM-3XL` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / XS | `UO-FS-BLS-XS` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / S | `UO-FS-BLS-S` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / M | `UO-FS-BLS-M` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / L | `UO-FS-BLS-L` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / XL | `UO-FS-BLS-XL` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / 2XL | `UO-FS-BLS-2XL` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |
| Blush Rose / 3XL | `UO-FS-BLS-3XL` | Optional | $28.00 | $35.00 | Track inventory (Shopify) |

### Bundle Tiers Architecture (Multi-Pack Strategy)
The storefront offers 3 tiers in the buy box:
1. **1 Pair**: Quantity = 1. Price = $28.00 ($28.00/each).
2. **3 Pairs (Most Popular)**: Quantity = 3. Bundle Price = $78.00 ($26.00/each, ~7% savings).
3. **5 Pairs (Best Value)**: Quantity = 5. Bundle Price = $125.00 ($25.00/each, ~11% savings).

*Operator Setup Option A (Automatic Shopify Discounts)*:  
Create an automatic discount rule in Shopify Admin > Discounts:
- Rule: Buy 3 items of product `full-spine-ultra-overnight`, get total at $78.00.
- Rule: Buy 5 items of product `full-spine-ultra-overnight`, get total at $125.00.

*Operator Setup Option B (Shopify Bundles App / Draft Orders)*:  
If multi-pack SKUs are preferred at fulfillment, create dedicated Bundle products:
- `full-spine-ultra-overnight-3pack` ($78.00)
- `full-spine-ultra-overnight-5pack` ($125.00)

---

## 2. Content Pages Setup in Shopify Admin

Navigate to **Online Store > Pages** in Shopify Admin. Create the following 3 missing pages:

| Page Title | Required Handle | Target URL | Theme Template Suffix | Required Content / Action |
|---|---|---|---|---|
| **About Us** | `about-us` | `/pages/about-us` | `about-us` | Leave body blank or brief summary; layout renders `sections/ultra-about-story.liquid` automatically. |
| **Track Order** | `track-order` | `/pages/track-order` | `track-order` | Leave body blank; layout renders `sections/ultra-track-order.liquid` with authentic lookup guidance. |
| **FAQ & Support** | `faq` | `/pages/faq` | `faq` | Leave body blank; layout renders `sections/ultra-faq.liquid` with sanitized accordion FAQ. |
| **Contact Us** | `contact` | `/pages/contact` | `contact` | *Already exists in Admin*. Verify template suffix is set to `contact` to render native `sections/ultra-contact.liquid`. |

---

## 3. Shipping & Policies Setup

1. **Free Shipping Rate**:
   - Navigate to **Settings > Shipping and delivery > General shipping rates**.
   - Create or verify a shipping rate rule:
     - Name: `Standard Free Shipping (Orders $49.00+)`
     - Condition: Minimum price `$49.00 USD`
     - Rate: `$0.00 USD`
   - This aligns 100% with the announcement bar, buy box badges, and cart drawer threshold ($49.00).
2. **Store Policies**:
   - Navigate to **Settings > Policies**.
   - Verify and publish:
     - `Refund Policy` (including the 30-Day Money-Back Guarantee terms)
     - `Privacy Policy`
     - `Terms of Service`
     - `Shipping Policy`

---

## 4. Authentic Review App Integration

To display genuine customer ratings and reviews:
1. Install an approved review app (e.g. Judge.me, Loox, or Okendo) from the Shopify App Store.
2. In Shopify Theme Editor (`Draft Theme 197625381235`):
   - Open section `ultra-reviews.liquid`.
   - Toggle setting `"enable_review_app": true`.
   - Paste the app's widget snippet into `"review_app_snippet"`.
3. Standard Shopify Metafields:
   - When the review app publishes ratings, Shopify automatically populates `product.metafields.reviews.rating.value` and `product.metafields.reviews.rating_count.value`.
   - The buy box rating row will automatically render authentic stars and counts without code changes.

---

## 5. Media & Asset Checklist

The local repository includes high-resolution assets in `assets/`:
- `ultra-pdp-main.jpg` (Garment + Luxury Box packaging)
- `ultra-thumb-front.jpg` (Front view cut)
- `ultra-thumb-box.jpg` (Retail gift packaging)
- `ultra-thumb-texture.jpg` (Macro CloudFlex knit texture)
- `ultra-thumb-lifestyle.jpg` (Lifestyle bedtime sleep)
- `ultra-hero-lifestyle.jpg` (Homepage hero lifestyle)
- `ultra-5-layers-cutaway.png` (NOCTÉRA-5™ 5-layer exploded cutaway)
- `ultra-lifestyle-card-1.jpg`, `ultra-lifestyle-card-2.jpg`, `ultra-lifestyle-card-3.jpg`
- `ultra-logo.svg`, `ultra-logo-white.svg`

Upon creating the product `full-spine-ultra-overnight` in Shopify Admin, upload the 4 PDP images into the product media library so they populate Shopify CDN image URLs.
