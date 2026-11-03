# Product Page V2 Architectural Specification

> **Theme**: Trymalora OS 2.0 (`ikwh1h-fx.myshopify.com`)  
> **Development Theme ID**: `197111906675`  
> **Design Benchmark**: [https://shopsidek.com/templates/t01/](https://shopsidek.com/templates/t01/) (Kaching Supply Packs Pattern)  
> **Target Template**: [`templates/product.v2.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/product.v2.json)  
> **Status**: Ready for Implementation  

---

## 1. Design Benchmark Analysis (ShopSideK T01)

| Element / System | ShopSideK T01 Benchmark | Trymalora V2 Implementation |
| :--- | :--- | :--- |
| **Color Direction** | Warm organic canvas (`#FFF8F5`, `#2B1B24`, `#6B1E46`, `#3F8F6B`) | Trymalora Tokens: Forest Green (`#17352B`), Electric Lime (`#BCE76A`), Natural Off-White (`#FAFAF6`), Slate (`#454F49`). |
| **Typography** | Editorial Serif (`Fraunces`) + Clean Sans (`Inter`) | Editorial Authority: `Plus Jakarta Sans` (800-weight headings) + `Inter` (500/600-weight body). |
| **Desktop Layout** | 54% Gallery (Sticky) / 46% Buy Box | 52% Sticky Gallery / 48% CRO Buy Box with clamped vertical boundaries. |
| **Mobile Layout** | Single column swipe gallery &rarr; Buy Box &rarr; Sticky buy bar | 100% full-width swipe gallery, touch-friendly radio bundle cards, sticky footer CTA. |
| **Bundle Architecture** | 3-Tier Kaching Cards (Buy 1, Buy 2, Buy 3) | 3-Tier Bundle Selector with active savings badges and unit price calculations. |
| **Tiered Gift Perks** | Dynamic unlock bar (`.kc-prog`) with mystery gift | Dynamic Gift & Priority Shipping Unlock Progress Bar (`#zvGiftUnlock`). |
| **Variant Controller** | Pill buttons with active state border | Adaptive Controller: Pills (&le; 4 options) vs styled compact select (> 4 options). |

---

## 2. Information Hierarchy & Required Sections

The `PRODUCT PAGE V2` is assembled from 9 specialized, reusable sections:

```
[ PRODUCT PAGE V2 CANVAS ]
  │
  ├── 1. HERO BUY BOX (zavelyn-v4-pdp-main.liquid)
  │      ├── Sticky 1:1 Aspect Gallery + Thumbnail Strip
  │      ├── Eyebrow, Title, Verified Rating (4.9/5.0)
  │      ├── Dynamic Shopify Price + Savings Badge
  │      ├── Factual Bullet Points with Checkmarks
  │      ├── Adaptive Variant Selector (Pills or Select)
  │      ├── 3-Tier Kaching Bundle Engine (Buy 1, Buy 2, Buy 3)
  │      ├── Tiered Gift & Shipping Unlock Meter
  │      ├── Dual Action CTAs: 'CLAIM OFFER' & '⚡ BUY NOW'
  │      ├── 3-Step Delivery Progress Stepper
  │      └── Security & Trust Badge Row
  │
  ├── 2. WHAT'S IN THE BOX (zavelyn-v2-package-contents.liquid)
  │      └── Grid breakdown of included hardware, accessories & batteries
  │
  ├── 3. HOW IT WORKS & MODES (zavelyn-v2-how-it-works.liquid)
  │      └── Step-by-step game setup (Target mode vs Multiplayer battle)
  │
  ├── 4. PROBLEM VS. SOLUTION (zavelyn-v4-pdp-story.liquid)
  │      └── Addressing screen addiction with physical, active infrared play
  │
  ├── 5. TECHNICAL SPECIFICATIONS (zavelyn-v2-specs-table.liquid)
  │      └── Dimensions, infrared safety certifications, range, battery requirements
  │
  ├── 6. DELIVERY, RETURNS & GUARANTEE (zavelyn-pdp-shipping.liquid)
  │      └── US regional fulfillment timelines, 30-day money-back guarantee
  │
  ├── 7. FREQUENTLY ASKED QUESTIONS (zavelyn-v2-faq.liquid)
  │      └── Accessible accordion FAQ addressing parental safety, eye safety, multiplayer rules
  │
  ├── 8. VERIFIED CUSTOMER REVIEWS (saker-reviews-widget.liquid)
  │      └── Visual photo review cards with verified buyer tags
  │
  └── 9. STICKY MOBILE ADD TO CART BAR (#zvStickyBar)
         └── Appears when scrolling past the main buy box
```

---

## 3. Pricing & Savings Formula Matrix

For any imported product (e.g. Laser Battle Toy at `$99.99` base price):

| Bundle Option | Display Title | Quantity Multiplier | Pack Price | Compare-At Price | Unit Price Equivalent | Badge | Customer Reward |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| **Tier 1** | Single Pack (1 Projector + 2 Pistols) | 1 | **$99.99** | $149.99 | $99.99 / set | Standard | Starter Set |
| **Tier 2** | Duo Team Pack (Double Blasters) | 2 | **$169.99** | $299.98 | $85.00 / set | `🔥 MOST POPULAR` | Save 43% + Free Tracked US Shipping |
| **Tier 3** | Ultimate Family Arena Pack | 3 | **$229.99** | $449.97 | $76.66 / set | `👑 BEST VALUE` | Save 49% + Free Shipping + Free Target Card Deck |

---

## 4. Truth in Advertising & Compliance Guidelines

In strict accordance with the project directives:
- **No False Claims**: The infrared laser toy emits Class 1 certified eye-safe infrared light (similar to TV remote controls). It must be described accurately as infrared technology, never claiming dangerous laser wattage.
- **Clear Battery Disclosure**: The package does not include standard AAA/AA batteries; this must be explicitly noted in the specifications and package contents section to prevent customer disappointment.
- **Realistic Shipping Timelines**: Delivery is stated as 24–48h warehouse processing followed by 3–5 business days carrier transit.
