import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-package.liquid', 'utf8');

// 1. Package subtitle
const targetSub = `{% when 'ear-cleaner' %}
            Every package arrives secured with veterinarian-formulated ear wash, precision soft applicator nozzle, and complete care handbook.`;

const replSub = targetSub + `
          {% when 'eyvelle-steam-therapy' %}
            Every package arrives securely boxed with your ultrasonic steam therapy wand, medical silicone eye cup, USB-C rapid charging cable, precision dropper, and eye wellness guide.`;

if (content.includes(targetSub)) {
  content = content.replace(targetSub, replSub);
}

// 2. 4 Cards
const targetGuide = `<h3 class="tm-pkg-name">Pet Ear Care Handbook</h3>
            <p class="tm-pkg-desc">Illustrated routine covering the 3-step massage technique, dosage chart, and preventive care tips.</p>
          </div>`;

const replCardsEye = targetGuide + `

        {% when 'eyvelle-steam-therapy' %}
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg></div>
              <span class="tm-pkg-count-badge">IN SELECTED BUNDLE</span>
            </div>
            <h3 class="tm-pkg-name">Ultrasonic Steam Wand</h3>
            <p class="tm-pkg-desc">High-frequency ultrasonic transducer produces 40°C nano-droplets that instantly penetrate clogged tear glands.</p>
          </div>
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
              <span class="tm-pkg-count-badge">MEDICAL GRADE</span>
            </div>
            <h3 class="tm-pkg-name">Soft Silicone Eye Cup</h3>
            <p class="tm-pkg-desc">Hypoallergenic contoured silicone creates a gentle, leak-proof seal around the orbital area for focused mist.</p>
          </div>
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
              <span class="tm-pkg-count-badge">RAPID RECHARGE</span>
            </div>
            <h3 class="tm-pkg-name">Fast USB-C Cable</h3>
            <p class="tm-pkg-desc">Universal rapid charging cable powers the wand for up to 15 relaxing 5-minute sessions per single charge.</p>
          </div>
          <div class="tm-pkg-card">
            <div class="tm-pkg-card-top">
              <div class="tm-pkg-icon-wrap"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
              <span class="tm-pkg-count-badge">COMPLETE GUIDE</span>
            </div>
            <h3 class="tm-pkg-name">Precision Dropper &amp; Guide</h3>
            <p class="tm-pkg-desc">Spill-proof filling pipette with comprehensive instructions for screen fatigue, dry eye syndrome, and daily care.</p>
          </div>`;

if (!content.includes(targetGuide)) {
  console.error("targetGuide not found in package");
  process.exit(1);
}

content = content.replace(targetGuide, replCardsEye);
fs.writeFileSync('sections/trymalora-pdp-package.liquid', content, 'utf8');
console.log('Successfully updated sections/trymalora-pdp-package.liquid');
