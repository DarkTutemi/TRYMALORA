import fs from 'fs';

let content = fs.readFileSync('sections/zavelyn-v4-pdp-main.liquid', 'utf8');

const targetUpsellEye = `        {% if product.handle == 'eyvelle-steam-therapy' %}
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

const replUpsellGnome = targetUpsellEye + `

        {% if product.handle == 'christmas-lantern-welcome-gnome' %}
          <!-- 7c. GNOME UPSELL COMPANION BOX: ARTISAN STARLIGHT PEARL & CRYSTAL ORNAMENTS ($25.99) -->
          <div class="zv-upsell-box" id="zvGnomeUpsellBox">
            <label class="zv-upsell-label" for="zvGnomeUpsellCheck">
              <input type="checkbox" id="zvGnomeUpsellCheck" class="zv-upsell-checkbox" data-variant-id="67361024016755" data-price-cents="2599">
              <img src="https://cdn.shopify.com/s/files/1/1032/4541/4771/t/5/assets/trymalora_jeweled_ornaments_set.png?v=1794389722" alt="Artisan Starlight Pearl &amp; Crystal Mosaic Christmas Ornaments (6-Piece Heirloom Set)" class="zv-upsell-thumb" width="56" height="56" loading="lazy">
              <div class="zv-upsell-info">
                <div class="zv-upsell-title-row">
                  <span class="zv-upsell-title">Add 6-Piece Jeweled Mosaic Ornaments Set</span>
                  <span class="zv-upsell-price">+$25.99 <s class="zv-upsell-compare">$52.00</s></span>
                </div>
                <div class="zv-upsell-desc">Handcrafted wooden medallions adorned with sapphire crystals, winter starlight snowflakes, baroque pearls &amp; shimmering gold cords.</div>
              </div>
            </label>
          </div>
        {% endif %}`;

if (!content.includes(targetUpsellEye)) {
  throw new Error('targetUpsellEye not found in zavelyn-v4-pdp-main.liquid');
}

content = content.replace(targetUpsellEye, replUpsellGnome);
fs.writeFileSync('sections/zavelyn-v4-pdp-main.liquid', content, 'utf8');
console.log('✔ Successfully added Gnome Upsell Box to sections/zavelyn-v4-pdp-main.liquid!');

