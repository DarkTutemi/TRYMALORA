import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-marquee.liquid', 'utf8');

const targetMarqueeEye = `          {% when 'eyvelle-steam-therapy' %}
            <span class="tm-marquee-item"><span>SOOTHING WARM NANO-MIST</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>UNCLOGS MEIBOMIAN OIL GLANDS</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>INSTANT RELIEF FROM SCREEN FATIGUE</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>ERGONOMIC MEDICAL SILICONE CUP</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>USB-C RECHARGEABLE &amp; PORTABLE</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>30-DAY MONEY-BACK GUARANTEE</span><span class="tm-separator">✦</span></span>`;

const replMarqueeGnome = targetMarqueeEye + `
          {% when 'christmas-lantern-welcome-gnome' %}
            <span class="tm-marquee-item"><span>WARM-WHITE STARLIGHT GLOW</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>HAND-KNITTED NORDIC STYLE HAT</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>REALISTIC WOODLAND GARLAND</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>STURDY WEIGHTED BASE</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>SHELTERED PORCH &amp; LIVING ROOM</span><span class="tm-separator">✦</span></span>
            <span class="tm-marquee-item"><span>60-NIGHT HOLIDAY HAPPINESS GUARANTEE</span><span class="tm-separator">✦</span></span>`;

if (!content.includes(targetMarqueeEye)) {
  throw new Error('targetMarqueeEye not found in marquee');
}
content = content.replace(targetMarqueeEye, replMarqueeGnome);

fs.writeFileSync('sections/trymalora-pdp-marquee.liquid', content, 'utf8');
console.log('✔ Successfully updated sections/trymalora-pdp-marquee.liquid for christmas-lantern-welcome-gnome!');

