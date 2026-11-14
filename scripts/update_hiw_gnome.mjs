import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-how-it-works.liquid', 'utf8');

const targetEyeEnd = `        <!-- 3-STEP SETUP BAND -->
        <div class="tm-setup-band">
          <h3 class="tm-setup-title">3-Step Easy Eye Spa Routine</h3>
          <p class="tm-setup-sub">Just 3–5 minutes a day. Completely effortless, soothing, and mess-free.</p>
          <div class="tm-setup-grid">
            <div class="tm-setup-col">
              <div class="tm-setup-num">1</div>
              <h4 class="tm-setup-step-title">Fill Reservoir</h4>
              <p class="tm-setup-step-desc">Open silicone stopper and add distilled water or saline using the included precision dropper.</p>
            </div>
            <div class="tm-setup-col">
              <div class="tm-setup-num">2</div>
              <h4 class="tm-setup-step-title">Attach Soft Cup</h4>
              <p class="tm-setup-step-desc">Snap the ergonomic silicone contour cup onto the nozzle and position gently over your eye.</p>
            </div>
            <div class="tm-setup-col">
              <div class="tm-setup-num">3</div>
              <h4 class="tm-setup-step-title">Power On &amp; Relax</h4>
              <p class="tm-setup-step-desc">Press the button and enjoy 3–5 minutes of continuous warm nano-mist soothing your eyes.</p>
            </div>
          </div>
        </div>`;

const replGnomeHIW = targetEyeEnd + `

      {% when 'christmas-lantern-welcome-gnome' %}
        <div class="tm-hiw-header">
          <span class="tm-hiw-chip">✦ HANDCRAFTED WOODLAND HOLIDAY ARTISTRY</span>
          <h2 class="tm-hiw-title">Bring Home the Warmth of Traditional Holiday Starlight</h2>
          <p class="tm-hiw-subtitle">From the cozy knit of his red-and-cream hat to the gentle atmospheric glow of his five-pointed star lantern, the Christmas Lantern Welcome Gnome brings joyful warmth, nostalgic togetherness, and timeless holiday magic into your home.</p>
        </div>

        <div class="tm-story-blocks">
          <!-- STORY ROW 1: ILLUMINATED STAR LANTERN -->
          <div class="tm-story-row">
            <div class="tm-story-media">
              <span class="tm-story-badge">Warm Starlight</span>
              <img 
                src="https://ncrovoprime.com/cdn/shop/files/51ec8bc9-19e1-4750-81e9-716b9f443448.png?v=1793673600&width=800" 
                alt="Christmas Lantern Welcome Gnome Porch Glow" 
                class="tm-story-img" 
                width="600" 
                height="400" 
                loading="lazy"
                style="width: 100%; height: auto; border-radius: 12px; display: block; object-fit: cover;"
              >
            </div>
            <div class="tm-story-content">
              <span class="tm-story-eyebrow">ATMOSPHERIC ILLUMINATION</span>
              <h3 class="tm-story-heading">A Magical Evening Welcome for Your Family &amp; Guests</h3>
              <p class="tm-story-desc">As daylight fades into evening, the five-pointed star lantern illuminates with a soft, warm-white glow. Positioned beside your front entryway or in a cozy living room nook, it creates a magical greeting that turns every homecoming into a festive holiday celebration.</p>
              <ul class="tm-story-checks">
                <li><span class="tm-story-check-ic">✓</span><span><strong>Warm-White LED Glow:</strong> Gentle ambient starlight with no harsh glare or heat</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Safe Battery Power:</strong> Concealed bottom compartment with effortless on/off switch</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Weighted Stable Base:</strong> Stays firmly in place on porches, mantels, and tables</span></li>
              </ul>
            </div>
          </div>

          <!-- STORY ROW 2: ARTISAN FOLKLORE CRAFTSMANSHIP -->
          <div class="tm-story-row reverse">
            <div class="tm-story-media">
              <span class="tm-story-badge">Nordic Folklore Design</span>
              <img 
                src="https://ncrovoprime.com/cdn/shop/files/7a2a339d-5869-4893-bdbc-a646d5370aba.png?v=1793673602&width=800" 
                alt="Gnome Handcrafted Textures & Hat" 
                class="tm-story-img" 
                width="600" 
                height="400" 
                loading="lazy"
                style="width: 100%; height: auto; border-radius: 12px; display: block; object-fit: cover;"
              >
            </div>
            <div class="tm-story-content">
              <span class="tm-story-eyebrow">ARTISAN CRAFTSMANSHIP</span>
              <h3 class="tm-story-heading">Rich Woodland Textures &amp; Handcrafted Folklore Charm</h3>
              <p class="tm-story-desc">Every detail is thoughtfully sculpted and textured. From the cozy ribbed knitting pattern on his festive tall cap to his flowing snowy white beard and botanical evergreen garland, this piece looks equally stunning under natural daylight as it does glowing at night.</p>
              <ul class="tm-story-checks">
                <li><span class="tm-story-check-ic">✓</span><span><strong>Knitted-Style Pointed Hat:</strong> Traditional Scandinavian red-and-cream holiday pattern</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Woodland Pine &amp; Berries:</strong> Realistic frosted pinecones and vibrant red winter berries</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Durable Polyresin Core:</strong> Built to bring joy and festive cheer for decades to come</span></li>
              </ul>
            </div>
          </div>

          <!-- STORY ROW 3: VERSATILE PLACEMENT -->
          <div class="tm-story-row">
            <div class="tm-story-media">
              <span class="tm-story-badge">Versatile Display</span>
              <img 
                src="https://ncrovoprime.com/cdn/shop/files/41b23eb3-e0f1-48f2-bf80-ea57b5122a81.png?v=1793673601&width=800" 
                alt="Gnome beside Christmas Tree" 
                class="tm-story-img" 
                width="600" 
                height="400" 
                loading="lazy"
                style="width: 100%; height: auto; border-radius: 12px; display: block; object-fit: cover;"
              >
            </div>
            <div class="tm-story-content">
              <span class="tm-story-eyebrow">HOLIDAY TRADITIONS</span>
              <h3 class="tm-story-heading">From the Front Door to Beside the Christmas Tree</h3>
              <p class="tm-story-desc">Create an enchanting holiday focal point wherever your loved ones gather. Place him next to your front entrance wreath, tuck him under the lower branches of your Christmas tree alongside wrapped gifts, or showcase him upon a festive fireplace hearth.</p>
              <ul class="tm-story-checks">
                <li><span class="tm-story-check-ic">✓</span><span><strong>Sheltered Porch Ready:</strong> Perfect for covered entryways, foyers, and hallways</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Tree Display Harmony:</strong> Blends seamlessly with existing tree lights and garlands</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Delightful Gift Presentation:</strong> Ships securely boxed in collector holiday packaging</span></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 3-STEP SETUP BAND -->
        <div class="tm-setup-band">
          <h3 class="tm-setup-title">Simple 60-Second Setup</h3>
          <p class="tm-setup-sub">No complicated wires or tools. Instant holiday magic straight out of the box.</p>
          <div class="tm-setup-grid">
            <div class="tm-setup-col">
              <div class="tm-setup-num">1</div>
              <h4 class="tm-setup-step-title">Unbox &amp; Fluff</h4>
              <p class="tm-setup-step-desc">Remove your gnome from the protective packaging and gently arrange the pine sprigs and berries.</p>
            </div>
            <div class="tm-setup-col">
              <div class="tm-setup-num">2</div>
              <h4 class="tm-setup-step-title">Switch On Magic</h4>
              <p class="tm-setup-step-desc">Insert standard batteries into the hidden bottom compartment and slide the switch to ON.</p>
            </div>
            <div class="tm-setup-col">
              <div class="tm-setup-num">3</div>
              <h4 class="tm-setup-step-title">Place &amp; Enjoy</h4>
              <p class="tm-setup-step-desc">Position on your porch, hearth, or beside the tree and bask in the warm, cozy holiday starlight.</p>
            </div>
          </div>
        </div>`;

if (!content.includes(targetEyeEnd)) {
  throw new Error('targetEyeEnd not found in how-it-works');
}
content = content.replace(targetEyeEnd, replGnomeHIW);

fs.writeFileSync('sections/trymalora-pdp-how-it-works.liquid', content, 'utf8');
console.log('✔ Successfully updated sections/trymalora-pdp-how-it-works.liquid for christmas-lantern-welcome-gnome!');

