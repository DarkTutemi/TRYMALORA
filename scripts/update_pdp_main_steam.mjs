import fs from 'fs';

let content = fs.readFileSync('sections/zavelyn-v4-pdp-main.liquid', 'utf8');

// 1. Prod reviews count
const targetReviewCount = `{% elsif product.handle == 'ear-cleaner' %}
              {% assign prod_reviews_count = "5,420" %}
            {% endif %}`;
const replReviewCount = `{% elsif product.handle == 'ear-cleaner' %}
              {% assign prod_reviews_count = "5,420" %}
            {% elsif product.handle == 'eyvelle-steam-therapy' %}
              {% assign prod_reviews_count = "1,615" %}
            {% endif %}`;

if (!content.includes(targetReviewCount)) {
  console.error("targetReviewCount not found");
  process.exit(1);
}
content = content.replace(targetReviewCount, replReviewCount);

// 2. Benefit bullets
const targetBenefits = `{% when 'ear-cleaner' %}
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Dissolves Deep L-Shaped Canal Wax &amp; Hardened Brown Discharge</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Fast 2-Minute Relief: Halts Frantic Head Shaking &amp; Ear Scratching</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>Eliminates Persistent Yeast Odors with Natural Chamomile &amp; Aloe</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span>100% Alcohol-Free &amp; Non-Stinging Formula for Dogs &amp; Cats of All Ages</span>
              </li>`;

const replBenefits = targetBenefits + `
            {% when 'eyvelle-steam-therapy' %}
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                <span>Ultra-Fine Nano Mist Unclogs Meibomian Glands in 60 Seconds</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
                <span>Instant Relief for Tired, Gritty, Screen-Fatigued &amp; Dry Eyes</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Gentle Medical-Grade Silicone Cup for a Soft, Leak-Proof Seal</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="15" x2="15.01" y2="15"></line></svg>
                <span>Safe with Purified Water, Saline, or Preservative-Free Drops</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <span>Rechargeable, Pocket-Sized &amp; Whisper-Quiet for Daily Desk Use</span>
              </li>`;

if (!content.includes(targetBenefits)) {
  console.error("targetBenefits not found");
  process.exit(1);
}
content = content.replace(targetBenefits, replBenefits);

// 3. Bundle Cards
const targetBundleCardEarEnd = `              </div>
            {% else %}
              <!-- DYNAMIC VARIANTS FOR OTHER PRODUCTS -->`;

const replBundleCardsEye = `              </div>
            {% elsif product.handle == 'eyvelle-steam-therapy' %}
              <!-- STEAM THERAPY WAND BUNDLES (BUY 1, BUY 2 WANDS [MOST POPULAR], BUY 3 WANDS [BEST VALUE]) -->
              {% assign eye_v1 = product.variants[0] %}
              {% assign eye_v2 = product.variants[1] %}
              {% assign eye_v3 = product.variants[2] %}
              {% assign eye_b1_price = eye_v1.price | default: 3999 %}
              {% assign eye_b2_price = eye_v2.price | default: 6998 %}
              {% assign eye_b3_price = eye_v3.price | default: 9497 %}

              <!-- BUNDLE 1: BUY 1 SINGLE STARTER KIT -->
              <div 
                class="zv-bundle-card zv-eye-bundle-card" 
                data-bundle-tier="1"
                data-bundle-name="Buy 1 — Single Starter Kit"
                data-qty="1"
                data-variant-id="{{ eye_v1.id }}"
                data-price-cents="{{ eye_b1_price }}"
                data-compare-cents="8500"
                data-tier-level="1"
              >
                <div class="zv-bundle-card-body">
                  <div class="zv-bundle-card-left">
                    <div class="zv-bundle-radio"></div>
                    <div class="zv-bundle-card-info">
                      <div class="zv-bundle-card-name">Buy 1 <small style="font-weight: 600; color: var(--zv-pdp-muted);">(Single Starter Kit)</small></div>
                      <div class="zv-bundle-card-sub">1 &times; Ultrasonic Steam Wand + 1 Silicone Cup &middot; Starter Set</div>
                    </div>
                  </div>
                  <div class="zv-bundle-card-pricing">
                    <div class="zv-bundle-card-total" data-role="bundle-total">$39.99</div>
                    <div class="zv-bundle-card-unit">
                      <span class="zv-unit-compare" style="text-decoration: line-through; opacity: 0.6; margin-right: 4px;">$85.00</span>
                      <span class="zv-unit-price" data-role="bundle-unit">$39.99 / wand</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUNDLE 2: BUY 2 WANDS (COUPLE CARE PACK · MOST POPULAR) - DEFAULT SELECTED -->
              <div 
                class="zv-bundle-card selected zv-eye-bundle-card" 
                data-bundle-tier="2"
                data-bundle-name="Buy 2 Wands — Couple Care Pack"
                data-qty="1"
                data-variant-id="{{ eye_v2.id }}"
                data-price-cents="{{ eye_b2_price }}"
                data-compare-cents="17000"
                data-tier-level="2"
              >
                <span class="zv-bundle-card-badge">🔥 MOST POPULAR &middot; SAVE EXTRA $10</span>
                <div class="zv-bundle-card-body">
                  <div class="zv-bundle-card-left">
                    <div class="zv-bundle-radio"></div>
                    <div class="zv-bundle-card-info">
                      <div class="zv-bundle-card-name">Buy 2 Wands <small style="font-weight: 700; color: #047857;">(Couple Care Pack &middot; Save $100.02)</small></div>
                      <div class="zv-bundle-card-sub">2 &times; Steam Wands + 2 Silicone Cups &middot; Perfect for Home &amp; Office</div>
                    </div>
                  </div>
                  <div class="zv-bundle-card-pricing">
                    <div class="zv-bundle-card-total" data-role="bundle-total">$69.98</div>
                    <div class="zv-bundle-card-unit">
                      <span class="zv-unit-compare" style="text-decoration: line-through; opacity: 0.6; margin-right: 4px;">$170.00</span>
                      <span class="zv-unit-price" data-role="bundle-unit">$34.99 / wand</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUNDLE 3: BUY 3 WANDS (FAMILY SET · BEST VALUE · FREE SHIPPING) -->
              <div 
                class="zv-bundle-card zv-eye-bundle-card" 
                data-bundle-tier="3"
                data-bundle-name="Buy 3 Wands — Family Care Set"
                data-qty="1"
                data-variant-id="{{ eye_v3.id }}"
                data-price-cents="{{ eye_b3_price }}"
                data-compare-cents="25500"
                data-tier-level="3"
              >
                <span class="zv-bundle-card-badge alt">👑 BEST VALUE &middot; FREE SHIPPING &middot; SAVE EXTRA $25</span>
                <div class="zv-bundle-card-body">
                  <div class="zv-bundle-card-left">
                    <div class="zv-bundle-radio"></div>
                    <div class="zv-bundle-card-info">
                      <div class="zv-bundle-card-name">Buy 3 Wands <small style="font-weight: 700; color: #7c2d12;">(Family Set &middot; Free Shipping)</small></div>
                      <div class="zv-bundle-card-sub">3 &times; Steam Wands + 3 Silicone Cups &middot; Complete Family Pack &middot; Highest Savings</div>
                    </div>
                  </div>
                  <div class="zv-bundle-card-pricing">
                    <div class="zv-bundle-card-total" data-role="bundle-total">$94.97</div>
                    <div class="zv-bundle-card-unit">
                      <span class="zv-unit-compare" style="text-decoration: line-through; opacity: 0.6; margin-right: 4px;">$255.00</span>
                      <span class="zv-unit-price" data-role="bundle-unit">$31.66 / wand</span>
                    </div>
                  </div>
                </div>
              </div>
            {% else %}
              <!-- DYNAMIC VARIANTS FOR OTHER PRODUCTS -->`;

if (!content.includes(targetBundleCardEarEnd)) {
  console.error("targetBundleCardEarEnd not found");
  process.exit(1);
}
content = content.replace(targetBundleCardEarEnd, replBundleCardsEye);

// 4. Upsell Box for eyvelle-steam-therapy
const targetUpsellEarEnd = `            <label class="zv-upsell-label" for="zvEarUpsellCheck">
              <input type="checkbox" id="zvEarUpsellCheck" class="zv-upsell-checkbox" data-variant-id="67346173690227" data-price-cents="1499">
              <img src="https://cdn.shopify.com/s/files/1/1043/6630/9718/files/packshot-v2-a.png?v=1787735386" alt="Pet Ear Finger Wipes (60 Wipes)" class="zv-upsell-thumb" width="56" height="56" loading="lazy">
              <div class="zv-upsell-info">
                <div class="zv-upsell-title-row">
                  <span class="zv-upsell-title">Add 60 Finger Wipes</span>
                  <span class="zv-upsell-price">+$14.99 <s class="zv-upsell-compare">$24.99</s></span>
                </div>
                <div class="zv-upsell-desc">The cleaner loosens it. The wipes take it out. Pre-moistened textured wipes for effortless gunk removal.</div>
              </div>
            </label>
          </div>
        {% endif %}`;

const replUpsellEye = targetUpsellEarEnd + `

        {% if product.handle == 'eyvelle-steam-therapy' %}
          <!-- 7c. EYE UPSELL COMPANION BOX: LUMINALIFT RED-LIGHT EYE SCULPTING WAND ($29.99) -->
          <div class="zv-upsell-box" id="zvEyeUpsellBox">
            <label class="zv-upsell-label" for="zvEyeUpsellCheck">
              <input type="checkbox" id="zvEyeUpsellCheck" class="zv-upsell-checkbox" data-variant-id="67346609799539" data-price-cents="2999">
              <img src="https://ae-pic-a1.aliexpress-media.com/kf/Sa2036508456e4e449020a5de57fd474cU.jpg" alt="Trymalora™ LuminaLift Pro Red-Light Eye Rejuvenator" class="zv-upsell-thumb" width="56" height="56" loading="lazy">
              <div class="zv-upsell-info">
                <div class="zv-upsell-title-row">
                  <span class="zv-upsell-title">Add LuminaLift™ Red-Light Eye Sculpting Wand</span>
                  <span class="zv-upsell-price">+$29.99 <s class="zv-upsell-compare">$59.99</s></span>
                </div>
                <div class="zv-upsell-desc">Thermal 42°C vibration + 630nm medical red-light phototherapy instantly de-puffs tired eye bags, fades dark circles, and sculpts delicate facial contours.</div>
              </div>
            </label>
          </div>
        {% endif %}`;

if (!content.includes(targetUpsellEarEnd)) {
  console.error("targetUpsellEarEnd not found");
  process.exit(1);
}
content = content.replace(targetUpsellEarEnd, replUpsellEye);

// 5. Mini Review Quote
const targetMiniReviewEar = `{% elsif product.handle == 'ear-cleaner' %}
            <figure class="zv-pdp-mini-review">
              <div class="zv-mini-avatar">🐾</div>
              <div class="zv-mini-content">
                <div class="zv-stars">★★★★★</div>
                <blockquote>&ldquo;Our golden retriever shook his head constantly and scratched his ears raw. After just two applications with Trymalora, all the dark gunk melted away and he finally slept through the night!&rdquo;</blockquote>
                <figcaption>
                  Sarah &amp; Cooper (Golden Retriever), Seattle WA
                  {% if section.settings.mini_review_verified %}
                    &middot; <span class="zv-verified-buyer">✓ {{ section.settings.mini_review_badge | default: "Verified Buyer" }}</span>
                  {% endif %}
                </figcaption>
              </div>
            </figure>`;

const replMiniReviewEye = targetMiniReviewEar + `
          {% elsif product.handle == 'eyvelle-steam-therapy' %}
            <figure class="zv-pdp-mini-review">
              <div class="zv-mini-avatar">👁️</div>
              <div class="zv-mini-content">
                <div class="zv-stars">★★★★★</div>
                <blockquote>&ldquo;Staring at computer screens 10 hours a day left my eyes burning and gritty by 3 PM. 5 minutes with Trymalora Nano-Steam feels like a warm spa facial for my eyes. Total soothing relief with zero stinging!&rdquo;</blockquote>
                <figcaption>
                  Emily R., UX Designer, Austin TX
                  {% if section.settings.mini_review_verified %}
                    &middot; <span class="zv-verified-buyer">✓ {{ section.settings.mini_review_badge | default: "Verified Buyer" }}</span>
                  {% endif %}
                </figcaption>
              </div>
            </figure>`;

if (!content.includes(targetMiniReviewEar)) {
  console.error("targetMiniReviewEar not found");
  process.exit(1);
}
content = content.replace(targetMiniReviewEar, replMiniReviewEye);

// 6. Accordions
const targetAccordionsEar = `            {% when 'ear-cleaner' %}
              <details class="zv-acc-item" open>
                <summary class="zv-acc-summary">
                  <span>How to use</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  1. Shake gently. Squeeze 2–4 drops directly into your pet's ear canal using the soft precision applicator tip.<br>
                  2. Gently massage the base of the ear for 30–60 seconds to break down stubborn wax, yeast, and buildup.<br>
                  3. Allow your pet to naturally shake their head, then gently wipe away loosened debris using a soft cloth or our textured Ear Finger Wipes. Use 2–3 times weekly for healthy maintenance.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>What's inside</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  Includes 1× Bottle (100ml) of Veterinarian-Formulated Pet Ear Cleansing Solution with soft precision applicator nozzle, and step-by-step pet care manual. Formulated with soothing chamomile extract, pure aloe vera, and gentle antiseptic agents. 100% alcohol-free and non-stinging.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>30-day guarantee</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  We stand behind TRYMALORA with our 30-Day Money-Back Guarantee. If your dog or cat doesn't experience cleaner, fresher, itch-free ears within 30 days, simply contact our care team for an effortless full refund.
                </div>
              </details>`;

const replAccordionsEye = targetAccordionsEar + `

            {% when 'eyvelle-steam-therapy' %}
              <details class="zv-acc-item" open>
                <summary class="zv-acc-summary">
                  <span>How to use</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  1. Fill the 15ml reservoir with distilled water, purified water, or sterile eye saline solution.<br>
                  2. Snap the soft medical-grade silicone eye contour cup securely onto the wand nozzle.<br>
                  3. Place the cup gently over your eye, press the power button, and relax as the soothing 40°C ultrasonic nano-mist warms and hydrates for 3–5 minutes. Repeat on the second eye.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>What's inside</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  Includes 1× Trymalora™ Ultrasonic Nano-Steam Therapy Wand, 1× Ergonomic Medical Silicone Eye Cup, 1× Fast USB-C Charging Cable, 1× Precision Refill Dropper, and 1× Illustrated User Care Guide.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>30-day guarantee</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  We stand behind TRYMALORA with our 30-Day Money-Back Guarantee. If you don't experience soothing, lasting relief from dry, fatigued eyes within 30 days, simply contact our care team for an effortless full refund.
                </div>
              </details>`;

if (!content.includes(targetAccordionsEar)) {
  console.error("targetAccordionsEar not found");
  process.exit(1);
}
content = content.replace(targetAccordionsEar, replAccordionsEye);

// 7. Sticky Bar Image
const targetStickyImg = `<img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028173020_6c8c1c4cf7d711cdd5a4d6aa91290eb2_e583f568-e0e8-4c22-9785-6dc4d0eb727b.jpg" alt="{{ prod_title | escape }}" class="zv-sticky-thumb" width="44" height="44">`;
const replStickyImg = `<img src="{{ product.featured_image | image_url: width: 100 | default: 'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173020_6c8c1c4cf7d711cdd5a4d6aa91290eb2_e583f568-e0e8-4c22-9785-6dc4d0eb727b.jpg' }}" alt="{{ prod_title | escape }}" class="zv-sticky-thumb" width="44" height="44">`;

if (content.includes(targetStickyImg)) {
  content = content.replace(targetStickyImg, replStickyImg);
}

fs.writeFileSync('sections/zavelyn-v4-pdp-main.liquid', content, 'utf8');
console.log('Successfully updated sections/zavelyn-v4-pdp-main.liquid for eyvelle-steam-therapy!');

