import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-how-it-works.liquid', 'utf8');

const targetEarEnd = `        <div class="tm-setup-band">
          <h3 class="tm-setup-title">3-Step Easy Home Routine</h3>
          <p class="tm-setup-sub">Just 60 seconds. No traumatic vet visits, no swabbing, and zero mess.</p>
          <div class="tm-setup-grid">
            <div class="tm-setup-col">
              <div class="tm-setup-num">1</div>
              <h4 class="tm-setup-step-title">Apply 2–4 Drops</h4>
              <p class="tm-setup-step-desc">Insert the soft precision tip gently into the ear canal and squeeze 2–4 drops.</p>
            </div>
            <div class="tm-setup-col">
              <div class="tm-setup-num">2</div>
              <h4 class="tm-setup-step-title">Massage 30–60s</h4>
              <p class="tm-setup-step-desc">Gently massage the base of the ear to let the solution break down deep wax and yeast.</p>
            </div>
            <div class="tm-setup-col">
              <div class="tm-setup-num">3</div>
              <h4 class="tm-setup-step-title">Shake &amp; Wipe</h4>
              <p class="tm-setup-step-desc">Let your pet shake naturally, then easily wipe away loosened gunk with wipes or cloth.</p>
            </div>
          </div>
        </div>`;

const replEyeSection = targetEarEnd + `

      {% when 'eyvelle-steam-therapy' %}
        <div class="tm-hiw-header">
          <span class="tm-hiw-chip">✦ OPHTHALMOLOGIST-RECOMMENDED THERAPY</span>
          <h2 class="tm-hiw-title">Soothing Warm Nano-Steam: The True Cure for Dry, Burning Eyes</h2>
          <p class="tm-hiw-subtitle">Over 86% of chronic dry eye cases are caused by blocked meibomian oil glands. Traditional drops wash away your natural tears in minutes. Trymalora's ultrasonic 40°C warm nano-mist gently unplugs glands to restore all-day natural eye moisture.</p>
        </div>

        <div class="tm-story-blocks">
          <!-- STORY ROW 1: VIDEO 2 (SOOTHING STEAM APPLICATION) -->
          <div class="tm-story-row">
            <div class="tm-story-media">
              <span class="tm-story-badge">Direct Thermal Mist</span>
              <video 
                src="https://cdn.shopify.com/videos/c/o/v/208a6954a3124440b2448beb2a475bfc.mp4" 
                class="tm-story-img tm-story-video"
                autoplay 
                loop 
                muted 
                playsinline
                controls
                preload="metadata"
                style="width: 100%; height: auto; border-radius: 12px; display: block; object-fit: cover;"
              ></video>
            </div>
            <div class="tm-story-content">
              <span class="tm-story-eyebrow">TARGET THE ROOT CAUSE</span>
              <h3 class="tm-story-heading">Unclogs Blocked Meibomian Glands in 60 Seconds</h3>
              <p class="tm-story-desc">Your eyelids contain microscopic oil glands that produce the lipid layer protecting your eyes from evaporation. Excessive screen use and dry indoor air cause this essential oil to thicken and harden into waxy plugs. Trymalora produces gentle 40°C ultrasonic steam that liquefies blockages and stimulates natural tear production.</p>
              <ul class="tm-story-checks">
                <li><span class="tm-story-check-ic">✓</span><span><strong>40°C Controlled Warmth:</strong> Safely dissolves hardened oils without overheating delicate eye tissue</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Ergonomic Silicone Cup:</strong> Contours comfortably to eye sockets for zero steam leakage</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>100% Pure &amp; Drug-Free:</strong> Works with distilled water or saline — no chemicals or preservatives</span></li>
              </ul>
            </div>
          </div>

          <!-- STORY ROW 2: ANIMATED STEAM WEBP (NANOMIST PENETRATION) -->
          <div class="tm-story-row reverse">
            <div class="tm-story-media">
              <span class="tm-story-badge">0.3μm Micro-Droplets</span>
              <img 
                src="https://cdn.shopify.com/s/files/1/0759/4072/4979/files/ezgif-218f793e491b04.webp" 
                alt="Ultrasonic Nano Steam Particles" 
                class="tm-story-img" 
                width="600" 
                height="400" 
                loading="lazy"
                style="width: 100%; height: auto; border-radius: 12px; display: block; object-fit: cover;"
              >
            </div>
            <div class="tm-story-content">
              <span class="tm-story-eyebrow">ULTRASONIC ATOMIZATION</span>
              <h3 class="tm-story-heading">Why Eye Drops Evaporate &amp; How Nano-Mist Lasts All Day</h3>
              <p class="tm-story-desc">Standard liquid drops flood the eye with massive water droplets, flushing away the delicate lipid layer and evaporating within 15 minutes. Trymalora's ultrasonic core atomizes moisture into 0.3-micron nanoparticles that seamlessly integrate into your natural tear film without blurriness or stinging.</p>
              <ul class="tm-story-checks">
                <li><span class="tm-story-check-ic">✓</span><span><strong>10× Finer Than Liquid Drops:</strong> Rapid microscopic absorption into ocular surface</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Long-Lasting Hydration Shield:</strong> Locks in moisture to prevent afternoon screen fatigue</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Contact Lens Compatible:</strong> Comfortably rehydrates tired eyes without removing lenses</span></li>
              </ul>
            </div>
          </div>

          <!-- STORY ROW 3: VIDEO 3 (BEFORE & AFTER / RELIEF RESULTS) -->
          <div class="tm-story-row">
            <div class="tm-story-media">
              <span class="tm-story-badge">Clinical Results</span>
              <video 
                src="https://cdn.shopify.com/videos/c/o/v/934310fce2034a8b91f79f5d5d403f2e.mp4" 
                class="tm-story-img tm-story-video"
                autoplay 
                loop 
                muted 
                playsinline
                controls
                preload="metadata"
                style="width: 100%; height: auto; border-radius: 12px; display: block; object-fit: cover;"
              ></video>
            </div>
            <div class="tm-story-content">
              <span class="tm-story-eyebrow">CLINICALLY PROVEN COMFORT</span>
              <h3 class="tm-story-heading">Just 5 Minutes A Day for Crystal-Clear, Rested Eyes</h3>
              <p class="tm-story-desc">Whether battling long hours behind dual monitors, dry winter heating, or chronic blepharitis, this whisper-quiet wand brings clinical thermal relief directly to your desk or bedside table.</p>
              <ul class="tm-story-checks">
                <li><span class="tm-story-check-ic">✓</span><span><strong>Minute 1:</strong> Stinging, redness, and gritty "sand in eyes" sensation melts away</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Day 3:</strong> Significant decrease in digital eyestrain, blurred vision, and light sensitivity</span></li>
                <li><span class="tm-story-check-ic">✓</span><span><strong>Week 2:</strong> Meibomian oil flow stabilized, maintaining fresh, comfortable vision all day</span></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 3-STEP SETUP BAND WITH COMPETITOR STEP INFOGRAPHICS -->
        <div class="tm-setup-band">
          <h3 class="tm-setup-title">3-Step Easy Eye Spa Routine</h3>
          <p class="tm-setup-sub">Just 3–5 minutes a day. Completely effortless, soothing, and mess-free.</p>
          <div class="tm-setup-grid">
            <div class="tm-setup-col">
              <img src="https://cdn.shopify.com/s/files/1/0759/4072/4979/files/ss_1_c30f66af-16b0-4285-a61d-ce8f16d89f1a.png?v=1747869158" alt="Step 1: Fill Reservoir" style="width: 100%; max-width: 200px; height: auto; border-radius: 12px; margin: 0 auto 16px; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" loading="lazy">
              <div class="tm-setup-num">1</div>
              <h4 class="tm-setup-step-title">Fill Reservoir</h4>
              <p class="tm-setup-step-desc">Open silicone stopper and add distilled water or saline using the included precision dropper.</p>
            </div>
            <div class="tm-setup-col">
              <img src="https://cdn.shopify.com/s/files/1/0759/4072/4979/files/ss_2_703c5f20-63f5-4f76-ac16-854c0dcc4bde.png?v=1747869158" alt="Step 2: Attach Silicone Cup" style="width: 100%; max-width: 200px; height: auto; border-radius: 12px; margin: 0 auto 16px; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" loading="lazy">
              <div class="tm-setup-num">2</div>
              <h4 class="tm-setup-step-title">Attach Soft Cup</h4>
              <p class="tm-setup-step-desc">Snap the ergonomic silicone contour cup onto the nozzle and position gently over your eye.</p>
            </div>
            <div class="tm-setup-col">
              <img src="https://cdn.shopify.com/s/files/1/0759/4072/4979/files/ss_3.png?v=1747869145" alt="Step 3: Power On & Enjoy" style="width: 100%; max-width: 200px; height: auto; border-radius: 12px; margin: 0 auto 16px; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.06);" loading="lazy">
              <div class="tm-setup-num">3</div>
              <h4 class="tm-setup-step-title">Power On &amp; Relax</h4>
              <p class="tm-setup-step-desc">Press the button and enjoy 3–5 minutes of continuous warm nano-mist soothing your eyes.</p>
            </div>
          </div>
        </div>`;

if (!content.includes(targetEarEnd)) {
  console.error("targetEarEnd not found in how-it-works");
  process.exit(1);
}

content = content.replace(targetEarEnd, replEyeSection);
fs.writeFileSync('sections/trymalora-pdp-how-it-works.liquid', content, 'utf8');
console.log('Successfully updated sections/trymalora-pdp-how-it-works.liquid');

