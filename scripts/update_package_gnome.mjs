import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-package.liquid', 'utf8');

// 1. Subtitle
const targetSub = `          {% when 'eyvelle-steam-therapy' %}
            Every package arrives securely boxed with your ultrasonic steam therapy wand, medical silicone eye cup, USB-C rapid charging cable, precision dropper, and eye wellness guide.`;

const replSub = targetSub + `
          {% when 'christmas-lantern-welcome-gnome' %}
            Every package arrives securely protected in collector's holiday gift packaging, featuring your handcrafted woodland gnome, warm-white LED star lantern, and pre-fitted evergreen garland.`;

if (!content.includes(targetSub)) {
  throw new Error('targetSub not found in package');
}
content = content.replace(targetSub, replSub);

// 2. 4 Cards
const targetCardsEye = `<h3 class="tm-pkg-name">Precision Dropper &amp; Guide</h3>
            <p class="tm-pkg-desc">Spill-proof filling pipette with comprehensive instructions for screen fatigue, dry eye syndrome, and daily care.</p>
          </div>`;

const replCardsGnome = targetCardsEye + `

        {% when 'christmas-lantern-welcome-gnome' %}
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
              <span class="tm-pkg-count-badge">IN SELECTED BUNDLE</span>
            </div>
            <h3 class="tm-pkg-name">Handcrafted Welcome Gnome</h3>
            <p class="tm-pkg-desc">Artisan resin body featuring a festive red-and-cream knitted-style cap, plush snowy beard, and sturdy weighted base.</p>
          </div>
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
              <span class="tm-pkg-count-badge">ATMOSPHERIC GLOW</span>
            </div>
            <h3 class="tm-pkg-name">Warm-White LED Star Lantern</h3>
            <p class="tm-pkg-desc">Five-pointed illuminated lantern that casts an enchanting warm glow without harsh glare or dangerous open flames.</p>
          </div>
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg></div>
              <span class="tm-pkg-count-badge">NATURAL TEXTURE</span>
            </div>
            <h3 class="tm-pkg-name">Pre-Fitted Woodland Garland</h3>
            <p class="tm-pkg-desc">Lush botanical evergreen sprigs, frosted natural pinecones, and vibrant crimson winter berries hand-arranged on the body.</p>
          </div>
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>
              <span class="tm-pkg-count-badge">GIFT READY</span>
            </div>
            <h3 class="tm-pkg-name">Collector's Gift Box &amp; Guide</h3>
            <p class="tm-pkg-desc">Heavy-duty foam-lined holiday storage box ensuring safe doorstep transit and convenient off-season preservation.</p>
          </div>`;

if (!content.includes(targetCardsEye)) {
  throw new Error('targetCardsEye not found in package');
}
content = content.replace(targetCardsEye, replCardsGnome);

fs.writeFileSync('sections/trymalora-pdp-package.liquid', content, 'utf8');
console.log('✔ Successfully updated sections/trymalora-pdp-package.liquid for christmas-lantern-welcome-gnome!');

