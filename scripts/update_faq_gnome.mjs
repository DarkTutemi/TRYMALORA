import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-faq.liquid', 'utf8');

const targetFaqEyeEnd = `          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>What is your 30-Day Money-Back Guarantee policy?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              We stand 100% behind Trymalora. If you do not experience soothing, noticeable relief from chronic dry eyes, computer eye strain, or eyelid irritation within 30 days of delivery, simply email us at support@trymalora.com for a prompt, hassle-free return and full refund.
            </div>
          </details>`;

const replGnomeFaq = targetFaqEyeEnd + `

        {% when 'christmas-lantern-welcome-gnome' %}
          <details class="tm-faq-item" open>
            <summary class="tm-faq-summary">
              <span>Can I place this gnome outside on my front porch?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              Yes! The Christmas Lantern Welcome Gnome is ideally suited for covered front porches, sheltered entryways, verandas, and all indoor living areas. While the resin body and weighted base are sturdy and weather-tolerant, we recommend keeping him under a covered roof protected from direct driving rain and heavy snow to keep the knitted cap and botanical pinecones in pristine condition.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>What type of batteries does the star lantern use and how long do they last?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              The star lantern is powered by standard, easily replaceable batteries located inside a discreet compartment on the base. Thanks to energy-efficient warm-white LED diodes, a single set of batteries provides over 120 hours of continuous ambient starlight—easily lasting through the entire holiday season.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>What are the exact dimensions and weight of the gnome?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              The gnome stands approximately 14 inches (35 cm) tall with a base diameter of 6 inches (15 cm), weighing approximately 2.8 lbs (1.3 kg). The weighted composite base ensures he stands securely upright without easily tipping over from indoor drafts or playful pets.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>How are the pinecones, greenery, and knitted hat constructed?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              Each piece is crafted with meticulous attention to detail. The cap features a cozy ribbed red-and-cream knitted-style texture, the flowing snowy white beard is soft and plush, and the surrounding garland combines realistic frosted evergreen branches, genuine natural pinecones, and bright crimson winter berries for an authentic woodland feel.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>How do I store the gnome after the holidays?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              Your gnome arrives in a custom collector's storage box with protective foam inserts. When the holiday season concludes, simply remove the batteries and place the gnome back into the box to keep him clean, pristine, and ready for next year's celebrations.
            </div>
          </details>

          <details class="tm-faq-item">
            <summary class="tm-faq-summary">
              <span>What is your 60-Night Holiday Happiness Guarantee?</span>
              <span class="tm-faq-ic" aria-hidden="true">+</span>
            </summary>
            <div class="tm-faq-body">
              We want this gnome to bring true joy and warmth to your holiday home. If you or your family aren't 100% delighted with the craftsmanship, starlight glow, and festive charm of your Christmas Lantern Welcome Gnome within 60 days of delivery, simply contact our concierge team at support@trymalora.com for a hassle-free return and full refund.
            </div>
          </details>`;

if (!content.includes(targetFaqEyeEnd)) {
  throw new Error('targetFaqEyeEnd not found in faq');
}
content = content.replace(targetFaqEyeEnd, replGnomeFaq);

fs.writeFileSync('sections/trymalora-pdp-faq.liquid', content, 'utf8');
console.log('✔ Successfully updated sections/trymalora-pdp-faq.liquid for christmas-lantern-welcome-gnome!');

