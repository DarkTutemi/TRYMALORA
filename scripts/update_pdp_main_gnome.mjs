import fs from 'fs';

let content = fs.readFileSync('sections/zavelyn-v4-pdp-main.liquid', 'utf8');

// 1. prod_hero_desc
const targetHeroDesc = `  {% when 'eyvelle-steam-therapy' %}
    {% assign prod_hero_desc = "Ophthalmologist-recommended ultrasonic warm nano-steam therapy that gently unblocks meibomian oil glands, restores natural tear film, and eliminates dry, burning, tired eyes in just 5 minutes." %}`;

const replHeroDesc = targetHeroDesc + `
  {% when 'christmas-lantern-welcome-gnome' %}
    {% assign prod_hero_desc = "Charming handcrafted woodland gnome with a warm-white illuminated star lantern, festive knitted hat, and lush evergreen boughs that bring cozy holiday magic to your home." %}`;

if (!content.includes(targetHeroDesc)) {
  throw new Error('targetHeroDesc not found');
}
content = content.replace(targetHeroDesc, replHeroDesc);

// 2. Variants initialization
const targetVarsInit = `{% elsif product.handle == 'eyvelle-steam-therapy' %}
  {% assign eye_v1 = product.variants[0] %}
  {% assign eye_v2 = product.variants[1] %}
  {% assign eye_v3 = product.variants[2] %}
  {% assign default_v = eye_v2 | default: product.variants[0] %}
  {% assign t1_id = default_v.id %}
  {% assign t1_price = default_v.price | default: 6998 %}
  {% assign t1_compare = default_v.compare_at_price | default: 17000 %}
  {% assign t1_savings = t1_compare | minus: t1_price %}
  {% assign t2_id = eye_v3.id %}
  {% assign t2_price = eye_v3.price | default: 9497 %}
  {% assign t2_compare = 25500 %}
  {% assign t3_id = eye_v1.id %}
  {% assign t3_price = eye_v1.price | default: 3999 %}
  {% assign t3_compare = 8500 %}`;

const replVarsInit = targetVarsInit + `
{% elsif product.handle == 'christmas-lantern-welcome-gnome' %}
  {% assign gnome_v1 = product.variants[0] %}
  {% assign gnome_v2 = product.variants[1] %}
  {% assign gnome_v3 = product.variants[2] %}
  {% assign default_v = gnome_v2 | default: product.variants[0] %}
  {% assign t1_id = default_v.id %}
  {% assign t1_price = default_v.price | default: 11998 %}
  {% assign t1_compare = default_v.compare_at_price | default: 27996 %}
  {% assign t1_savings = t1_compare | minus: t1_price %}
  {% assign t2_id = gnome_v3.id %}
  {% assign t2_price = gnome_v3.price | default: 15998 %}
  {% assign t2_compare = 41994 %}
  {% assign t3_id = gnome_v1.id %}
  {% assign t3_price = gnome_v1.price | default: 6999 %}
  {% assign t3_compare = 13998 %}`;

if (!content.includes(targetVarsInit)) {
  throw new Error('targetVarsInit not found');
}
content = content.replace(targetVarsInit, replVarsInit);

// 3. Image Badge
const targetImageBadge = `            {% when 'eyvelle-steam-therapy' %}
              {% assign image_badge = "TOP RATED · EYE HEALTH & WELLNESS" %}`;

const replImageBadge = targetImageBadge + `
            {% when 'christmas-lantern-welcome-gnome' %}
              {% assign image_badge = "TOP RATED · HOLIDAY & HOME" %}`;

if (!content.includes(targetImageBadge)) {
  throw new Error('targetImageBadge not found');
}
content = content.replace(targetImageBadge, replImageBadge);

// 4. Prod reviews count
const targetReviewCount = `            {% elsif product.handle == 'eyvelle-steam-therapy' %}
              {% assign prod_reviews_count = "1,615" %}
            {% endif %}`;

const replReviewCount = `            {% elsif product.handle == 'eyvelle-steam-therapy' %}
              {% assign prod_reviews_count = "1,615" %}
            {% elsif product.handle == 'christmas-lantern-welcome-gnome' %}
              {% assign prod_reviews_count = "2,840" %}
            {% endif %}`;

if (!content.includes(targetReviewCount)) {
  throw new Error('targetReviewCount not found');
}
content = content.replace(targetReviewCount, replReviewCount);

// 5. Benefit bullets
const targetBenefits = `            {% when 'eyvelle-steam-therapy' %}
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

const replBenefits = targetBenefits + `
            {% when 'christmas-lantern-welcome-gnome' %}
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>Warm 5-Pointed Star Lantern Adds a Gentle Atmospheric Glow After Dark</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>Festive Hand-Knitted Style Red-and-Cream Pointed Hat &amp; Snowy Beard</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                <span>Lush Evergreen Branches, Natural Pinecones &amp; Crimson Winter Berries</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Sturdy Weighted Base Ideal for Porches, Entryways, Consoles &amp; Trees</span>
              </li>
              <li>
                <svg class="zv-benefit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span>Nordic Woodland Folklore Styling Brings Warm Festive Cheer to All Guests</span>
              </li>`;

if (!content.includes(targetBenefits)) {
  throw new Error('targetBenefits not found');
}
content = content.replace(targetBenefits, replBenefits);

// 6. Bundle Cards
const targetBundleCardEyeEnd = `              </div>
            {% else %}
              <!-- DYNAMIC VARIANTS FOR OTHER PRODUCTS -->`;

const replBundleCardsGnome = `              </div>
            {% elsif product.handle == 'christmas-lantern-welcome-gnome' %}
              <!-- CHRISTMAS GNOME BUNDLES (SINGLE, BUY 2 DUO [MOST POPULAR], BUY 3 TRIO [BEST VALUE]) -->
              {% assign g_v1 = product.variants[0] %}
              {% assign g_v2 = product.variants[1] %}
              {% assign g_v3 = product.variants[2] %}
              {% assign g_b1_price = g_v1.price | default: 6999 %}
              {% assign g_b2_price = g_v2.price | default: 11998 %}
              {% assign g_b3_price = g_v3.price | default: 15998 %}

              <!-- BUNDLE 1: BUY 1 SINGLE GNOME -->
              <div 
                class="zv-bundle-card zv-gnome-bundle-card" 
                data-bundle-tier="1"
                data-bundle-name="Buy 1 — Single Christmas Gnome"
                data-qty="1"
                data-variant-id="{{ g_v1.id }}"
                data-price-cents="{{ g_b1_price }}"
                data-compare-cents="13998"
                data-tier-level="1"
              >
                <div class="zv-bundle-card-body">
                  <div class="zv-bundle-card-left">
                    <div class="zv-bundle-radio"></div>
                    <div class="zv-bundle-card-info">
                      <div class="zv-bundle-card-name">Buy 1 Gnome <small style="font-weight: 600; color: var(--zv-pdp-muted);">(Single Starter)</small></div>
                      <div class="zv-bundle-card-sub">1 &times; Handcrafted Gnome + 1 LED Star Lantern &middot; Save $69.99</div>
                    </div>
                  </div>
                  <div class="zv-bundle-card-pricing">
                    <div class="zv-bundle-card-total" data-role="bundle-total">$69.99</div>
                    <div class="zv-bundle-card-unit">
                      <span class="zv-unit-compare" style="text-decoration: line-through; opacity: 0.6; margin-right: 4px;">$139.98</span>
                      <span class="zv-unit-price" data-role="bundle-unit">$69.99 / ea</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUNDLE 2: BUY 2 DUO SET (MOST POPULAR) - DEFAULT SELECTED -->
              <div 
                class="zv-bundle-card selected zv-gnome-bundle-card" 
                data-bundle-tier="2"
                data-bundle-name="Buy 2 — Woodland Duo Set"
                data-qty="1"
                data-variant-id="{{ g_v2.id }}"
                data-price-cents="{{ g_b2_price }}"
                data-compare-cents="27996"
                data-tier-level="2"
              >
                <span class="zv-bundle-card-badge">🔥 MOST POPULAR &middot; SAVE EXTRA $160 &middot; FREE SHIPPING</span>
                <div class="zv-bundle-card-body">
                  <div class="zv-bundle-card-left">
                    <div class="zv-bundle-radio"></div>
                    <div class="zv-bundle-card-info">
                      <div class="zv-bundle-card-name">Buy 2 Gnomes <small style="font-weight: 700; color: #047857;">(Woodland Duo &middot; Save $159.98)</small></div>
                      <div class="zv-bundle-card-sub">2 &times; Gnomes + 2 LED Lanterns &middot; Perfect for Porch &amp; Hearth</div>
                    </div>
                  </div>
                  <div class="zv-bundle-card-pricing">
                    <div class="zv-bundle-card-total" data-role="bundle-total">$119.98</div>
                    <div class="zv-bundle-card-unit">
                      <span class="zv-unit-compare" style="text-decoration: line-through; opacity: 0.6; margin-right: 4px;">$279.96</span>
                      <span class="zv-unit-price" data-role="bundle-unit">$59.99 / ea</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BUNDLE 3: BUY 3 FAMILY TRIO (BEST VALUE) -->
              <div 
                class="zv-bundle-card zv-gnome-bundle-card" 
                data-bundle-tier="3"
                data-bundle-name="Buy 3 — Holiday Family Trio"
                data-qty="1"
                data-variant-id="{{ g_v3.id }}"
                data-price-cents="{{ g_b3_price }}"
                data-compare-cents="41994"
                data-tier-level="3"
              >
                <span class="zv-bundle-card-badge alt">👑 BEST VALUE &middot; FREE GIFT BOX &middot; SAVE EXTRA $260</span>
                <div class="zv-bundle-card-body">
                  <div class="zv-bundle-card-left">
                    <div class="zv-bundle-radio"></div>
                    <div class="zv-bundle-card-info">
                      <div class="zv-bundle-card-name">Buy 3 Gnomes <small style="font-weight: 700; color: #7c2d12;">(Holiday Trio &middot; Free Gift Box)</small></div>
                      <div class="zv-bundle-card-sub">3 &times; Gnomes + 3 LED Lanterns &middot; Highest Savings &middot; Collector Box</div>
                    </div>
                  </div>
                  <div class="zv-bundle-card-pricing">
                    <div class="zv-bundle-card-total" data-role="bundle-total">$159.98</div>
                    <div class="zv-bundle-card-unit">
                      <span class="zv-unit-compare" style="text-decoration: line-through; opacity: 0.6; margin-right: 4px;">$419.94</span>
                      <span class="zv-unit-price" data-role="bundle-unit">$53.33 / ea</span>
                    </div>
                  </div>
                </div>
              </div>
            {% else %}
              <!-- DYNAMIC VARIANTS FOR OTHER PRODUCTS -->`;

if (!content.includes(targetBundleCardEyeEnd)) {
  throw new Error('targetBundleCardEyeEnd not found');
}
content = content.replace(targetBundleCardEyeEnd, replBundleCardsGnome);

// 7. Mini review quote
const targetMiniReviewEye = `          {% elsif product.handle == 'eyvelle-steam-therapy' %}
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

const replMiniReviewGnome = targetMiniReviewEye + `
          {% elsif product.handle == 'christmas-lantern-welcome-gnome' %}
            <figure class="zv-pdp-mini-review">
              <div class="zv-mini-avatar">🎄</div>
              <div class="zv-mini-content">
                <div class="zv-stars">★★★★★</div>
                <blockquote>&ldquo;This little gnome is hands down the sweetest holiday decoration we’ve ever bought! The star lantern produces such a gentle, cozy glow on our porch every evening. Everyone who visits stops to take a picture!&rdquo;</blockquote>
                <figcaption>
                  Hannah M., Aspen CO
                  {% if section.settings.mini_review_verified %}
                    &middot; <span class="zv-verified-buyer">✓ {{ section.settings.mini_review_badge | default: "Verified Buyer" }}</span>
                  {% endif %}
                </figcaption>
              </div>
            </figure>`;

if (!content.includes(targetMiniReviewEye)) {
  throw new Error('targetMiniReviewEye not found');
}
content = content.replace(targetMiniReviewEye, replMiniReviewGnome);

// 8. Accordions
const targetAccordionsEye = `            {% when 'eyvelle-steam-therapy' %}
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

const replAccordionsGnome = targetAccordionsEye + `

            {% when 'christmas-lantern-welcome-gnome' %}
              <details class="zv-acc-item" open>
                <summary class="zv-acc-summary">
                  <span>How to use &amp; Placement</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  1. Unbox your gnome and gently fluff the realistic evergreen branches, pinecones, and red berries.<br>
                  2. Insert standard batteries into the hidden bottom compartment and slide the toggle to ON.<br>
                  3. Place on your sheltered porch, entryway console, living room mantle, or beside the Christmas tree for a warm, magical holiday ambiance.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>What's inside</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  Includes 1&times; Handcrafted Christmas Lantern Welcome Gnome with red-and-cream knitted cap and snowy beard, 1&times; Warm-White LED Star Lantern, realistic woodland garland with pinecones &amp; crimson berries, and protective holiday collector packaging.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>60-night holiday guarantee</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  We stand behind TRYMALORA with our 60-Night Holiday Happiness Guarantee. If this charming gnome doesn't bring warmth, togetherness, and festive smiles to your family, simply contact our concierge team for an effortless full refund.
                </div>
              </details>
              <details class="zv-acc-item">
                <summary class="zv-acc-summary">
                  <span>Dimensions &amp; Materials</span>
                  <span class="zv-acc-ic" aria-hidden="true">+</span>
                </summary>
                <div class="zv-acc-body">
                  <strong>Height:</strong> Approx. 14 inches (35 cm) | <strong>Base Width:</strong> 6 inches (15 cm)<br>
                  <strong>Materials:</strong> Weighted resin &amp; natural stone composite base, artisan knitted-style cap, plush faux snow beard, PE botanical evergreen branches, energy-efficient warm LED star lantern.
                </div>
              </details>`;

if (!content.includes(targetAccordionsEye)) {
  throw new Error('targetAccordionsEye not found');
}
content = content.replace(targetAccordionsEye, replAccordionsGnome);

fs.writeFileSync('sections/zavelyn-v4-pdp-main.liquid', content, 'utf8');
console.log('✔ Successfully updated sections/zavelyn-v4-pdp-main.liquid for christmas-lantern-welcome-gnome!');

