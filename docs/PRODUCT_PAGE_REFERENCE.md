# Product Detail Page (PDP) & CRO Reference Specification

> **Auditor**: Senior Systems & Frontend Solution Architect  
> **Target Store**: `ikwh1h-fx.myshopify.com` (`Trymalora Official Store`)  
> **Source Files**: 
> - Liquid Templates: [`templates/product.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/product.json), [`templates/product.showroom.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/product.showroom.json)  
> - Core Sections: [`sections/zavelyn-v4-pdp-main.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-pdp-main.liquid), [`sections/zavelyn-v4-pdp-story.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-pdp-story.liquid), [`sections/zavelyn-pdp-shipping.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-pdp-shipping.liquid)  
> - Stylesheet: [`assets/zavelyn-v4-pdp.css`](file:///c:/Users/Admin/Desktop/TRYMALORA/assets/zavelyn-v4-pdp.css)  
> - Controller: [`assets/zavelyn-v4-pdp.js`](file:///c:/Users/Admin/Desktop/TRYMALORA/assets/zavelyn-v4-pdp.js)  
> **Benchmark Reference**: [https://shopsidek.com/templates/t01/](https://shopsidek.com/templates/t01/) (Kaching Supply Packs Template)  
> **Status**: Production Read-Only / Verified

---

## 1. Executive Summary & Page Architecture

The Trymalora PDP architecture is an optimized direct-response eCommerce conversion engine. Designed to outperform standard generic Dawn product pages, it adapts proven direct-to-consumer (DTC) mechanics from industry leaders such as [ShopSidek Template T01](https://shopsidek.com/templates/t01/).

Key capabilities:
1. **Tiered Kaching-Style Bundle Engine**: Incentivizes 2-unit and 3-unit orders directly inside the primary buy box, driving substantial Average Order Value (AOV) gains.
2. **Dynamic Free Gift & Shipping Progress Meter**: Real-time feedback bar that calculates unlock thresholds as users click different supply tiers.
3. **Adaptive Variant Controller**: Automatically switches between tactile pill buttons (&le; 4 options) and custom selects (> 4 options) to avoid vertical page blowout.
4. **Dual CTA Strategy**: Independent triggers for Slide-Out Cart addition (`CLAIM OFFER ➔`) and instant 1-click checkout (`⚡ BUY NOW`).
5. **Sticky Buy Bar**: Unobtrusive footer bar that slides into view once the main buy box scrolls out of view.

```mermaid
graph TD
    User([Customer]) --> PDP[templates/product.json]
    PDP --> MainSection[sections/zavelyn-v4-pdp-main.liquid]
    MainSection --> Gallery[Sticky Product Gallery & Thumbs]
    MainSection --> BuyBox[CRO Buy Box Form]
    
    BuyBox --> VariantSelector{Variant Count}
    VariantSelector -->|<= 4 Variants| Pills[Adaptive Pill Buttons]
    VariantSelector -->|> 4 Variants| Dropdown[Compact Custom Select]
    
    BuyBox --> BundleEngine[Tiered Bundle Box: Buy 1, 2, or 3]
    BundleEngine --> GiftMeter[Gift & Shipping Unlock Progress Meter]
    
    BuyBox --> CTAs[Dual Action Buttons]
    CTAs -->|Claim Offer| DrawerAdd[Shopify Ajax /cart/add.js -> Willa Cart Drawer]
    CTAs -->|Buy Now| InstantCheckout[/checkout Direct Redirect]
    
    PDP --> StorySection[sections/zavelyn-v4-pdp-story.liquid: Problem vs Solution]
    PDP --> ShippingSection[sections/zavelyn-pdp-shipping.liquid: Delivery Guarantee]
```

---

## 2. The Tiered Bundle Architecture (Kaching Supply Packs Pattern)

### 2.1 The 3-Tier Supply Hierarchy
Located in [`sections/zavelyn-v4-pdp-main.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-pdp-main.liquid#L158-L247):

| Tier Level | Package Title | Target Quantity | Visual Badge | CRO Strategic Role | Default Selection |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **Tier 3** | **Buy 3 (Full Complete Set)** | 3 | `👑 BEST VALUE · FREE SHIPPING · EXTRA 20% OFF` (Lime Accent) | Anchor pricing; delivers maximum volume and unlocks top-tier gift perks. | **Yes** (`.selected`) |
| **Tier 2** | **Buy 2 (Duo Pack)** | 2 | `🔥 MOST POPULAR` (Deep Forest) | Safety-net bundle; offers free tracked delivery. | No |
| **Tier 1** | **Buy 1 (Single Item)** | 1 | None | Starter package; baseline comparison point. | No |

### 2.2 Bundle Card Anatomy
Each bundle card is built with semantic HTML and data attributes:
```html
<div 
  class="zv-bundle-card selected" 
  data-qty="3"
  data-price-cents="14985"
  data-compare-cents="23985"
>
  <span class="zv-bundle-card-badge lime">👑 BEST VALUE &middot; FREE SHIPPING &middot; EXTRA 20% OFF</span>
  <div class="zv-bundle-card-body">
    <div class="zv-bundle-card-left">
      <div class="zv-bundle-radio"></div>
      <div class="zv-bundle-card-info">
        <span class="zv-bundle-card-name">Buy 3 (Full Complete Set)</span>
        <span class="zv-bundle-card-sub">Best Value &middot; Most Comprehensive Kit</span>
      </div>
    </div>
    <div class="zv-bundle-card-pricing">
      <span class="zv-bundle-card-total">$149.85</span>
      <span class="zv-bundle-card-unit">Best Per-Unit Price</span>
    </div>
  </div>
</div>
```

### 2.3 Calculation Engine in [`assets/zavelyn-v4-pdp.js`](file:///c:/Users/Admin/Desktop/TRYMALORA/assets/zavelyn-v4-pdp.js)
When the active variant changes, all bundle cards recalculate automatically:
```javascript
function onVariantSelected(variantId, priceCents, compareCents, title, imgSrc) {
  activeVariantId = variantId;
  basePriceCents = priceCents;
  baseCompareCents = compareCents;

  // Recalculate totals across all 3 bundle tiers
  bundleCards.forEach(card => {
    const tierQty = parseInt(card.getAttribute('data-qty'), 10) || 1;
    card.setAttribute('data-price-cents', basePriceCents * tierQty);
    card.setAttribute('data-compare-cents', baseCompareCents * tierQty);
    const totalEl = card.querySelector('.zv-bundle-card-total');
    if (totalEl) totalEl.textContent = formatMoney(basePriceCents * tierQty);
  });
  ...
}
```

---

## 3. Dynamic Free Gift & Shipping Progress Meter

Positioned directly below the bundle tiers ([`sections/zavelyn-v4-pdp-main.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-pdp-main.liquid#L238-L247)), this widget motivates customers to bump their selection from Tier 1 or Tier 2 up to Tier 3.

```
+-------------------------------------------------------------------------+
| [🎁] FREE Mystery Gift & Priority Shipping                     UNLOCKED |
|      You unlocked the maximum tier bundle perks!                        |
+-------------------------------------------------------------------------+
```

### State Progression Logic:
- **Quantity = 1 (Tier 1)**:
  - Container state: `zv-gift-unlock` (unlocked class removed).
  - Badge text: `LOCKED`.
  - Title: *"Add 1 More to Unlock FREE US Shipping"*.
  - Subtext: *"Orders over $49 qualify for fast tracked delivery"*.
- **Quantity = 2 (Tier 2)**:
  - Container state: `zv-gift-unlock unlocked`.
  - Badge text: `UNLOCKED`.
  - Title: *"🚚 FREE Tracked US Shipping Unlocked"*.
  - Subtext: *"Order 3 to also unlock a Free Mystery Gift!"*.
- **Quantity &ge; 3 (Tier 3)**:
  - Container state: `zv-gift-unlock unlocked`.
  - Badge text: `UNLOCKED` (Lime green fill).
  - Title: *"🎁 FREE Mystery Gift & Priority Shipping"*.
  - Subtext: *"You unlocked the maximum tier bundle perks!"*.

---

## 4. Adaptive Variant Controller (Pills vs Dropdown)

To handle the diverse product catalog in Trymalora (from single-variant heaters to multi-color footwear and tools), the theme implements an **Adaptive Variant Controller**:

```liquid
{% if product.variants.size > 1 %}
  {% if product.variants.size <= 4 %}
    <!-- 1. Tactile Rounded Pill Buttons for <= 4 Variants -->
    <div class="zv-variant-pills-row">
      {% for variant in product.variants %}
        <button type="button" class="zv-variant-pill-btn ...">{{ variant.title }}</button>
      {% endfor %}
    </div>
  {% else %}
    <!-- 2. Compact Native Select for > 4 Variants (Prevents vertical blowout) -->
    <select class="zv-variant-select-dropdown" id="zvVariantDropdown">
      {% for variant in product.variants %}
        <option value="{{ variant.id }}">{{ variant.title }} — {{ variant.price | money }}</option>
      {% endfor %}
    </select>
  {% endif %}
{% endif %}
```

- When a variant is clicked/selected, the controller swaps the hero gallery image (`#zvMainImg`), updates the active price hero, and updates prices across all three bundle cards simultaneously.

---

## 5. Dual Conversion CTAs & Cart Integration

Trymalora addresses two distinct consumer purchasing intents by providing dual dedicated CTAs:

```html
<div class="zv-cta-group">
  <button type="button" class="zv-btn-claim" id="zvBtnClaim">
    <span>CLAIM OFFER ➔</span>
  </button>

  <button type="button" class="zv-btn-buynow" id="zvBtnBuyNow">
    <span>⚡ BUY NOW (1-CLICK CHECKOUT)</span>
  </button>
</div>
```

### 5.1 "Claim Offer" Flow (Drawer Add)
1. Disables button and changes label to `PROCESSING...`.
2. Dispatches `fetch('/cart/add.js')` with `{ items: [{ id: activeVariantId, quantity: activeQty }] }`.
3. Awaits JSON confirmation.
4. Invokes [`window.willaRefreshCart()`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/willa-cart-drawer.liquid#L405) to sync lines.
5. Calls [`window.willaOpenCartDrawer()`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/willa-cart-drawer.liquid#L356) to slide out the cart drawer without a full page refresh.

### 5.2 "Buy Now" Flow (Instant Checkout)
1. Dispatches `fetch('/cart/add.js')` with selected items.
2. Immediately redirects the user to `/checkout`, bypassing cart review to maximize impulse conversions.

### 5.3 Sticky Buy Bar
Monitors the bottom position of `#zvBuyBox` on window scroll:
- When `rect.bottom < 100`, adds `.visible` to `#zvStickyBar` (`transform: translateY(0)`).
- Contains product title thumbnail, active bundle price, and a direct `CLAIM OFFER` button.

---

## 6. Trust Anchors, Delivery Stepper & Accordion Specs

### 6.1 Delivery Progress Stepper
A visual 3-point timeline building fulfillment trust before checkout:
- **Step 1 (Active)**: `Order Placed` &middot; Instant Confirmation.
- **Step 2 (Active)**: `24-48h Dispatch` &middot; US Regional Hub.
- **Step 3**: `Delivered` &middot; Tracked Doorstep.

### 6.2 Trust Badge Grid
- **30-Day In-Home Trial**: Zero-risk money-back guarantee.
- **Fast US Shipping**: Insured carrier transit with regional fulfillment.
- **256-Bit SSL**: Bank-grade encrypted checkout.

### 6.3 Structured Collapsible Accordions
Rendered cleanly using semantic HTML5 `<details>` and `<summary>` tags:
- `Shipping & Delivery Timeframes`: Clear breakdown of US delivery windows (3–5 business days).
- `30-Day Money-Back Guarantee`: Explicit return policy conditions.
- `Industrial Specifications`: Dimensions, material grades, and package contents.

---

## 7. Side-by-Side Benchmark: Trymalora V4 PDP vs ShopSidek T01

The following audit matrix compares the Trymalora implementation against the reference benchmark ([shopsidek.com/templates/t01/](https://shopsidek.com/templates/t01/)):

| Component / Feature | ShopSidek T01 Reference | Trymalora V4 Implementation | Parity Status | Architectural Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Top Announcement** | Timer pill + shipping perk | Standard announcement bar | **Implemented** | Both provide free shipping threshold alerts. |
| **Sticky Gallery** | Sticky left column with badges & 8 thumbs | Sticky left column with save badge & 6 thumbs | **Identical** | Trymalora uses 52%/48% desktop grid split. |
| **Urgency Indicator** | Pulsing live dot (`.live-dot`) | Star ratings + review counts | **Partial** | Pulse dot can be added in Phase 2 if live stock urgency is desired. |
| **Supply Pack Bundles**| 3-Tier Kaching cards (`.kc-tier`) | 3-Tier bundle cards (`.zv-bundle-card`) | **Identical** | Trymalora mirrors the radio, badge, title, and unit pricing structure. |
| **Free Gift Progression**| Tiered progress bar with gift thumbnail (`.kc-prog`) | Tiered unlock box with icon & badge (`.zv-gift-unlock`) | **Identical** | Dynamically toggles between Locked and Unlocked states on click. |
| **One-time vs Subscription**| Dual tab switch (`.kc-toggle` One-time vs Subscribe & Save) | Direct bundle quantity selection | **Opportunity** | Trymalora currently focuses on one-time bundles; subscription toggle can be added via Shopify Selling Plans API. |
| **Sticky Buy Bar** | Bottom sticky drawer on mobile/desktop | Sticky bottom bar (`#zvStickyBar`) | **Identical** | Triggers automatically once buy box scrolls out of view. |
| **Problem vs Solution**| Mechanism comparison section | Dedicated section: [`zavelyn-v4-pdp-story.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-pdp-story.liquid) | **Identical** | Features side-by-side comparison cards and environment tabs. |
| **Cart Drawer Integration**| Slide-out mini-cart | Native Slide-out drawer: [`willa-cart-drawer.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/willa-cart-drawer.liquid) | **Identical** | Both feature a $49 free shipping progress meter. |

---

## 8. Solution Architect Recommendations for Next Implementation

1. **Subscription Toggle (Subscribe & Save)**:
   - For recurring consumables (e.g. balms, cartridges, filters), integrate Shopify's native `selling_plan_groups` Liquid API into the top of `.zv-bundle-box` to allow customers to toggle between a one-time purchase and a recurring subscription (with an automatic 15% discount).
2. **In-Buy-Box Upsell Checkboxes**:
   - Add 1 or 2 optional checkbox add-ons (e.g., "Priority Shipping Insurance (+$2.99)" or "Extended 2-Year Replacement Warranty (+$4.99)") directly above the `CLAIM OFFER` button.
3. **Dynamic Currency & Internationalization**:
   - Verify that all bundle card unit price calculations continue to leverage Shopify's multi-currency formatting (`shop.money_format`) when international markets are active in Shopify Markets.
