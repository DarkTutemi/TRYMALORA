import fs from 'fs';

const raw = fs.readFileSync('sections/trymalora-pdp-faq.liquid', 'utf8');
const lines = raw.split(/\r?\n/);

const insertIndex = lines.findIndex(l => l.trim() === "{% else %}" && lines.slice(0, lines.indexOf(l)).some(x => x.includes("when 'ear-cleaner'")));

const eyeFaqSnippet = `
        {% when 'eyvelle-steam-therapy' %}
          <details class="tm-faq-item" open>
            <summary class="tm-faq-summary">
              <span>How does ultrasonic steam therapy treat dry eyes better than eye drops?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              Over 86% of dry eyes are caused by Meibomian Gland Dysfunction (MGD), where tiny oil glands along your eyelids become clogged by hardened lipids. Liquid eye drops only add temporary moisture that washes away your natural tears and evaporates in 10–15 minutes. Trymalora's 40°C warm ultrasonic nano-mist penetrates directly into the eyelid margins, liquefying hardened oils and restoring your natural protective tear film.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>What kind of water should I use in the reservoir?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              We recommend using distilled water, purified water, or sterile isotonic eye saline. Avoid using tap water or mineral water, as natural minerals can cause scale buildup inside the high-frequency ultrasonic atomizer over time.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>Is the steam temperature safe for sensitive eyes and skin?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              Yes, completely. The wand maintains a gentle, ophthalmologist-calibrated warmth of 40°C (104°F) — the exact therapeutic threshold required to safely melt meibomian wax without burning or irritating delicate eyelid tissue.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>Can I use this device with contact lenses or makeup?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              You can safely use the steam wand with soft or rigid contact lenses — many users find it provides instant comfort from lens-induced dryness. For best hygiene, we recommend removing heavy eye makeup or mascara prior to treatment to allow unobstructed steam access to your lash line.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>How long does a session take and how often should I use it?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              Each session lasts 3 to 5 minutes per eye. For active dry eyes, screen fatigue, or blepharitis, use 1–2 times daily (e.g. during a mid-work screen break and before bedtime). Once symptoms stabilize, 3–4 sessions per week maintain crystal-clear eye comfort.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>How long does the battery last on a single charge?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              The high-capacity lithium battery provides up to 75 minutes of continuous operation — equivalent to approximately 15 full 5-minute therapy sessions. It recharges rapidly in about 60 minutes via any standard USB-C port or charger.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>How do I clean and sanitize the silicone eye cup?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              The eye cup is made of food-grade, hypoallergenic medical silicone. Simply detach it from the wand and rinse under warm running water with mild soap after each use, or wipe with an alcohol-free sanitizing wipe and let air dry.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>What is your 30-Day Money-Back Guarantee policy?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              We stand 100% behind Trymalora. If you do not experience soothing, noticeable relief from chronic dry eyes, computer eye strain, or eyelid irritation within 30 days of delivery, simply email us at support@trymalora.com for a prompt, hassle-free return and full refund.
            </div>
          </details>`;

console.log('insertIndex:', insertIndex);
if (insertIndex === -1) {
  console.error("Could not find insert position");
  process.exit(1);
}

lines.splice(insertIndex, 0, eyeFaqSnippet);
fs.writeFileSync('sections/trymalora-pdp-faq.liquid', lines.join('\n'), 'utf8');
console.log('Successfully updated sections/trymalora-pdp-faq.liquid');
