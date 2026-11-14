import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-marquee.liquid', 'utf8');

const target = `{% when 'ear-cleaner' %}
            <span class="tm-marquee-item"><span>FAST-ACTING EAR WAX DISSOLVER</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>RELIEVES ITCHING &amp; HEAD SHAKING</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>ELIMINATES YEAST &amp; FOUL ODORS</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>NATURAL BOTANICAL INGREDIENTS</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>VET APPROVED FOR DOGS &amp; CATS</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>30-DAY MONEY-BACK GUARANTEE</span><span class="tm-separator">✦</span></span>`;

const repl = target + `
          {% when 'eyvelle-steam-therapy' %}
            <span class="tm-marquee-item"><span>SOOTHING WARM NANO-MIST</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>UNCLOGS MEIBOMIAN OIL GLANDS</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>INSTANT RELIEF FROM SCREEN FATIGUE</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>ERGONOMIC MEDICAL SILICONE CUP</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>USB-C RECHARGEABLE &amp; PORTABLE</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>30-DAY MONEY-BACK GUARANTEE</span><span class="tm-separator">✦</span></span>`;

if (!content.includes(target)) {
  console.error("target not found in trymalora-pdp-marquee.liquid");
  process.exit(1);
}

content = content.replace(target, repl);
fs.writeFileSync('sections/trymalora-pdp-marquee.liquid', content, 'utf8');
console.log('Successfully updated sections/trymalora-pdp-marquee.liquid');

